package expo.modules.notifications.time80

import android.app.ActivityManager
import android.app.AlarmManager
import android.content.Context
import android.os.Build
import android.os.Parcel
import android.os.PowerManager
import androidx.core.app.NotificationManagerCompat
import expo.modules.notifications.notifications.interfaces.SchedulableNotificationTrigger
import expo.modules.notifications.notifications.model.NotificationContent
import expo.modules.notifications.notifications.model.NotificationRequest
import expo.modules.notifications.service.delegates.ExpoSchedulingDelegate
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.text.ParsePosition
import java.util.Date
import java.util.Locale
import java.util.TimeZone
import java.util.concurrent.locks.ReentrantLock
import kotlin.concurrent.withLock

object Time80Runtime {
  private fun utc(ms:Long):String = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",Locale.US).apply {timeZone=TimeZone.getTimeZone("UTC")}.format(Date(ms))
  private fun parseUtc(raw:String):Long {
    require(Regex("\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d{3})?Z").matches(raw))
    val pattern=if(raw.contains('.')) "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'" else "yyyy-MM-dd'T'HH:mm:ss'Z'"
    val parser=SimpleDateFormat(pattern,Locale.US).apply {timeZone=TimeZone.getTimeZone("UTC");isLenient=false}
    val position=ParsePosition(0)
    val parsed=parser.parse(raw,position)
    require(parsed!=null && position.index==raw.length)
    return parsed.time
  }
  private val lock = ReentrantLock()
  fun <T> serialized(block: () -> T): T = lock.withLock(block)
  private fun prefs(c: Context) = c.getSharedPreferences("time80.notification.state.v3", Context.MODE_PRIVATE)
  fun owned(id: String) = id.startsWith("time80-") && !id.startsWith("time80-test-") && !id.startsWith("time80-occ-v3:")
  fun state(c: Context): Map<String, Any?> = serialized {
    val p=prefs(c)
    mapOf("generation" to p.getString("generation",null),"dirty" to p.getBoolean("dirty",true),"epoch" to p.getLong("epoch",0),"recoveryBlocked" to p.getString("blocked",null))
  }
  fun invalidate(c: Context) = serialized {
    val p=prefs(c)
    check(p.edit().putBoolean("dirty",true).putLong("epoch",p.getLong("epoch",0)+1).commit()) {"Could not persist notification invalidation"}
  }
  fun apply(c: Context, requests: List<NotificationRequest>, generation: String, force: Boolean, zone: String, validUntil: String): Map<String, Any?> = serialized {
    require(requests.size<=550 && requests.all {owned(it.identifier)})
    require(TimeZone.getAvailableIDs().contains(zone) || zone=="UTC")
    val until=parseUtc(validUntil)
    val p=prefs(c)
    if(!force && !p.getBoolean("dirty",true) && p.getString("generation",null)==generation) return@serialized state(c)
    invalidate(c)
    val delegate=ExpoSchedulingDelegate(c)
    val desired=requests.map {it.identifier}.toSet()
    delegate.removeScheduledNotifications(delegate.getAllScheduledNotifications().filter {owned(it.identifier) && !desired.contains(it.identifier)}.map {it.identifier})
    for(r in requests) {
      r.content.body?.put("time80Generation",generation)
      delegate.scheduleNotification(r)
    }
    val actual=delegate.getAllScheduledNotifications().map {it.identifier}.toSet()
    check(desired.all {actual.contains(it)}) {"Native scheduling store incomplete"}
    check(p.edit().putString("generation",generation).putString("zone",zone).putLong("validUntil",until).putBoolean("dirty",false).remove("blocked").commit()) {"Could not persist notification acknowledgement"}
    state(c)
  }
  fun canRecover(c:Context):Boolean = serialized {
    val p=prefs(c)
    val reason=when {
      p.getString("generation",null)==null -> null // legacy pre-upgrade replay preserves existing behavior
      p.getBoolean("dirty",true) -> "Pending generation; reopen app to reconcile"
      android.icu.util.TimeZone.getCanonicalID(p.getString("zone",null) ?: "")!=android.icu.util.TimeZone.getCanonicalID(TimeZone.getDefault().id) -> "BLOCKED OI-A01-R: timezone changed without JavaScript"
      p.getLong("validUntil",0)<=System.currentTimeMillis() -> "BLOCKED OI-A01-R: ledger horizon expired without JavaScript"
      else -> null
    }
    if(reason!=null){p.edit().putBoolean("dirty",true).putString("blocked",reason).commit();false}else true
  }
  fun recover(c:Context, work:()->Unit) = serialized { if(canRecover(c)){ invalidate(c);work();check(prefs(c).edit().putBoolean("dirty",false).commit()) {"Could not persist recovery acknowledgement"} } }
  fun triggerMatches(request:NotificationRequest?,expectedEnd:Long,generation:String?):Boolean {
    val d=request?.content?.body?:return false
    if(d.optInt("payloadVersion",2)!=3)return true
    return expectedEnd>0 && d.optLong("time80OccurrenceEnd",0)==expectedEnd && d.optString("time80Generation","")==generation
  }
  fun occurrenceId(id:String,end:Long)="time80-occ-v3:${id.length}:$id:$end"
  fun snapshot(request:NotificationRequest):NotificationRequest {
    val d=JSONObject(request.content.body.toString())
    val end=d.getLong("time80OccurrenceEnd")
    val start=if(d.has("periodStart")) parseUtc(d.getString("periodStart")) else end-d.getLong("intervalMinutes")*60000
    require(end>start && d.getString("scheduleId")==request.identifier)
    val id=occurrenceId(request.identifier,end)
    d.put("occurrenceId",id).put("periodStart",utc(start)).put("periodEnd",utc(end))
    val zone=d.getString("scheduleTimezone")
    require(TimeZone.getAvailableIDs().contains(zone)||zone=="UTC")
    val locale=android.icu.util.ULocale(d.optString("presentationLocale","fa-IR").replace('-','_'))
    val fmt=android.icu.text.SimpleDateFormat("yyyy/MM/dd HH:mm",locale)
    fmt.timeZone=android.icu.util.TimeZone.getTimeZone(zone)
    val text="${fmt.format(java.util.Date(start))} تا ${fmt.format(java.util.Date(end))} — ${request.content.text}"
    val c=request.content as NotificationContent
    val builder=NotificationContent.Builder(c).setText(text).setBody(d).setAutoDismiss(true)
    val parcel=Parcel.obtain()
    try {request.writeToParcel(parcel,0);parcel.setDataPosition(0);val copied=NotificationRequest.CREATOR.createFromParcel(parcel);return NotificationRequest(id,builder.build(),copied.trigger)} finally {parcel.recycle()}
  }
  fun capabilities(c:Context,channelId:String):Map<String,Any> {
    val at=utc(System.currentTimeMillis())
    fun capability(supported:Boolean,value:Boolean?,reason:String?=null)=mapOf("supported" to supported,"value" to value,"checkedAt" to at,"reason" to reason)
    fun safe(work:()->Boolean)=try{capability(true,work())}catch(e:Exception){capability(false,null,e.javaClass.simpleName)}
    val nm=NotificationManagerCompat.from(c)
    return mapOf("displayPermission" to safe{nm.areNotificationsEnabled()},"channelEnabled" to if(Build.VERSION.SDK_INT>=26){val channel=nm.getNotificationChannel(channelId);if(channel==null)capability(false,null,"channel absent")else capability(true,channel.importance!=0)}else capability(false,null,"channel API unavailable"),"exactAlarmAllowed" to safe{Build.VERSION.SDK_INT<31||(c.getSystemService(Context.ALARM_SERVICE) as AlarmManager).canScheduleExactAlarms()},"batteryOptimizationExempt" to safe{(c.getSystemService(Context.POWER_SERVICE) as PowerManager).isIgnoringBatteryOptimizations(c.packageName)},"backgroundRestricted" to if(Build.VERSION.SDK_INT>=28)safe{(c.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager).isBackgroundRestricted}else capability(false,null,"API unavailable"))
  }
  fun map(json:JSONObject):Map<String,Any?> = json.keys().asSequence().associateWith { key -> when(val v=json.get(key)){JSONObject.NULL->null;is JSONObject->map(v);is org.json.JSONArray->(0 until v.length()).map {i->v.get(i)};else->v} }
}

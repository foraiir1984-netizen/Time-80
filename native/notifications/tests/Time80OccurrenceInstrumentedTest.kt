package com.personal.time80
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith
import org.json.JSONObject
import expo.modules.notifications.time80.Time80Runtime
import expo.modules.notifications.notifications.model.NotificationContent
import expo.modules.notifications.notifications.model.NotificationRequest
import expo.modules.notifications.notifications.model.Notification
import expo.modules.notifications.notifications.model.NotificationAction
import expo.modules.notifications.notifications.triggers.DateTrigger
import expo.modules.notifications.service.NotificationsService
@RunWith(AndroidJUnit4::class)
class Time80OccurrenceInstrumentedTest {
 private fun template():NotificationRequest {
  val d=JSONObject().put("kind","time80-checkin").put("payloadVersion",3).put("scheduleId","time80-2-fixture").put("scheduleRevision","2").put("scheduleTimezone","UTC").put("time80OccurrenceEnd",1782903600000L).put("intervalMinutes",30)
  return NotificationRequest("time80-2-fixture",NotificationContent.Builder().setTitle("Time80").setText("ثبت زمان").setBody(d).setAutoDismiss(true).build(),DateTrigger("time80-test",1782903600000L))
 }
 @Test fun nextSchedulingDoesNotMutateOldOccurrenceParcelAndPresentation(){val t=template();val a=Time80Runtime.snapshot(t);val body=a.content.body.toString();t.content.body!!.put("time80OccurrenceEnd",1783508400000L);val b=Time80Runtime.snapshot(t);assertNotEquals(a.identifier,b.identifier);assertEquals(body,a.content.body.toString());assertTrue(a.content.isAutoDismiss);assertEquals(t.trigger.javaClass,a.trigger.javaClass);assertNotEquals(a.content.text,b.content.text)}
 @Test fun independentPendingIntentsDoNotUpdateEachOthersExtras(){val c=InstrumentationRegistry.getInstrumentation().targetContext;val t=template();val a=Time80Runtime.snapshot(t);t.content.body!!.put("time80OccurrenceEnd",1783508400000L);val b=Time80Runtime.snapshot(t);val action=NotificationAction("default","open",true);val pa=NotificationsService.createNotificationResponseIntent(c,Notification(a),action);val pb=NotificationsService.createNotificationResponseIntent(c,Notification(b),action);assertNotEquals(pa,pb);pa.cancel();pb.cancel()}
}

// Narrow Android patch: recurring weekly schedules cannot fire before the transition boundary.
// Uses the existing Expo scheduler and persists its content across reboot. No new alarm service.
const fs = require("fs");
const p =
  "node_modules/expo-notifications/android/src/main/java/expo/modules/notifications/service/delegates/ExpoSchedulingDelegate.kt";
let s = fs.readFileSync(p, "utf8");
if (s.includes("// TIME80_NOT_BEFORE") && !s.includes("// TIME80_OCCURRENCE")) {
  s = s
    .replace(
      "        store.saveNotificationRequest(request)\n        // TIME80_NOT_BEFORE",
      "        // TIME80_NOT_BEFORE",
    )
    .replace(
      "        setupAlarm(scheduledTime,",
      `        // TIME80_OCCURRENCE
        if (request.content.body?.optString("kind") == "time80-checkin") {
          request.content.body?.put("time80OccurrenceEnd", scheduledTime)
        }
        store.saveNotificationRequest(request)
        setupAlarm(scheduledTime,`,
    );
  fs.writeFileSync(p, s);
}
if (!s.includes("// TIME80_NOT_BEFORE")) {
  const needle =
    "setupAlarm(nextTriggerDate.time, NotificationsService.createNotificationTrigger(context, request.identifier))";
  if (!s.includes(needle))
    throw Error("Expo scheduling source changed; review Time80 patch");
  s = s.replace("        store.saveNotificationRequest(request)\n", "");
  s = s.replace(
    needle,
    `// TIME80_NOT_BEFORE
        var scheduledTime = nextTriggerDate.time
        if (request.trigger is expo.modules.notifications.notifications.triggers.WeeklyTrigger) {
          val minimum = request.content.body?.optLong("time80NotBefore", 0L) ?: 0L
          val calendar = java.util.Calendar.getInstance()
          calendar.timeInMillis = scheduledTime
          while (calendar.timeInMillis < minimum) calendar.add(java.util.Calendar.WEEK_OF_YEAR, 1)
          scheduledTime = calendar.timeInMillis
        }
        // TIME80_OCCURRENCE
        if (request.content.body?.optString("kind") == "time80-checkin") {
          request.content.body?.put("time80OccurrenceEnd", scheduledTime)
        }
        store.saveNotificationRequest(request)
        setupAlarm(scheduledTime, NotificationsService.createNotificationTrigger(context, request.identifier))`,
  );
  fs.writeFileSync(p, s);
}

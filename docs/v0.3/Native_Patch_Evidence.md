# Native diff justification — 2026-10-05 (Asia/Tehran)

Baseline a8ef2ce5d818d881e7c0bf368e34642e50f93817; expo-notifications 57.0.20.
Pristine installed files inspected BEFORE applying the v0.3 patch; lock integrity verified in planning.

- ExpoSchedulingDelegate.scheduleNotification/triggerNotification persist and receive the same schedule identifier. Insufficient for independent A/B presentation and immutable dated body. Preserve existing exact/fallback APIs and transition guard; add a deep occurrence copy and shared mutation lock.
- NotificationsService creates per-broadcast threads and alarms carry identifier only. Insufficient for native/JS store coordination and stale trigger rejection. Add common lock and generation/end validation; reuse existing boot/package receiver. Add grant/time/zone signals without promising unresolved timezone recovery.
- NotificationScheduler.definition exposes individual asynchronous operations, not a generation-owned batch nor capability readings. Add narrow methods to existing module, using existing request/trigger constructors. No new runtime dependency/module/foreground service.
- NotificationsEmitter stores only one last response and clears it unconditionally. Insufficient for guarded response acknowledgement; add a native synchronized pending buffer and compare-and-clear.
- NotificationManager.onNotificationResponseFromExtras retains only the first pre-listener extras response. Insufficient for AC-A04's second response; retain distinct early responses, defer replay dedupe to occurrence key.
- Dependency AndroidManifest has boot/package filters but no grant/time/zone signal filters. Add these to the same receiver; no duplicate recovery receiver.

Unmodified: native model serialization, presentation builder, PendingIntent response builder, presentation delegate, exact/fallback implementation, signing and app permissions. Existing response builder receives the new occurrence identifier naturally.

OI-A01-R remains BLOCKED for changing timezone or expired ledger horizon without JS. Unsafe replay is rejected and exposed diagnostically, not reported as delivery recovery. No native SQLite access is introduced.

Additional pre-patch finding: NotificationContent.Builder has no copy constructor and exposes no full sound-URI getter. Rebuilding content from its JS serialization would lose native properties. Add a seven-line Parcel-based copy constructor reusing unchanged serialization, so modifying occurrence text/data retains all native fields.

Pre-build evidence: Gradle `projects` included no `:expo-notifications`, while Expo 57 SettingsManager selected its local Maven publication. Source patches would be silently bypassed. Add `expo.autolinking.android.buildFromSource: ["expo-notifications"]` to package.json, forcing only this already-installed module to compile from source. All other modules retain baseline linking. This configuration change is required for P03-001/002/003 and native proof; it changes no package version or runtime dependency.

Recovery ownership safeguard: a blocked Time80 v3 generation must not prevent replay or triggering of unrelated, diagnostic or legacy v2 requests. The existing receiver/delegate retain those paths; only owned v3 templates are withheld when recovery is unsafe. Non-Android platforms retain the existing Expo v2 scheduling path and report native-only capabilities as unknown; Android occurrence/recovery guarantees are not extrapolated to them.

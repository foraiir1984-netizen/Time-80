# Time80 v0.2 — Implementation Specification

نسخهٔ سند: ۱.۲ یکپارچه؛ ۲۱ سپتامبر ۲۰۲۶.
مرجع طبقه‌بندی: ICATUS 2016. نسخهٔ محصول: v0.2؛ نسخهٔ schema هدف: 3.
وضعیت: ادغام تصمیم‌های تأییدشدهٔ کاربر و handoff بررسی‌شده؛ جزئیات اجرایی انتخاب‌شده در این بازنگری مشخص شده‌اند. این سند به معنی انجام پیاده‌سازی یا موفقیت build نیست.
خروجی این مرحله فقط به‌روزرسانی مشخصات است؛ هیچ migration روی دیتابیس برنامه یا build اجرا نشده است.

## ۱. مبنا و حدود اطمینان

این بازنگری جایگزین اجرایی نسخهٔ ۱.۱ است. متن فعلی فایل اصلی با پیوست ۱.۱ بایت‌به‌بایت برابر بود. منابع این بازنگری: مشخصات ۱.۱، شش اصلاح تأییدشده در همین چت، قاعدهٔ تأییدشدهٔ پایان بازهٔ جاری، و بستهٔ Time80_v0.1_Handoff.zip.

مبنای سورس از این پس 01_Time80_v0.1_Source.zip داخل handoff است. مستندات بسته، مخزن https://github.com/foraiir1984-netizen/Time-80 و commit `5c45240ab1dc967cfbbabcdede73b27bb0f468e8` را معرفی می‌کنند. تطبیق آنلاین این commit در این مرحله انجام نشده است. کدهای App و src بسته با مبنای قبلی یکسان‌اند؛ workflow ساخت با حذف cache npm و دستور نمایش فهرست APK متفاوت است. نبود lockfile تأیید شد.

هش SHA-256 فایل APK همراه محاسبه و با manifest بسته برابر بود: `80a9646705c8a326409816f3deed2208abba8f5d6a4c47f1514eeef6ef91db25`. این بررسی اثبات تطابق binary نصب‌شده روی گوشی نیست. APK همراه خروجی موفق شناخته‌شده است.

تصمیم جدید جایگزین الزام قبلی انتقال داده می‌شود: v0.1 آزمایشی است؛ انتقال داده و تداوم امضای v0.1→v0.2 لازم نیست. v0.2 نصب تازه دارد و نخستین baseline پایدار داده است. از v0.2 به بعد migration سازگار و signing پایدار الزامی است. هیچ حذف خودکاری برای دیتابیس شناخته‌نشده یا v0.1 طراحی نمی‌شود.

اصول پابرجا: ledger مستقل، افق ۳۵ روز، عدم جعل گذشته، ثبت تک‌فعالیتی، autosave معتبر، navigation واقعی، catch-up داخل برنامه، گزارش دوره‌ای و ICATUS 2016. چندفعالیتی، Mood، Energy، Value، Goals و AI coaching خارج از scope هستند. اصلاحات شش‌گانه و رفتار تغییر فاصله تأیید شده‌اند؛ عدد پنجرهٔ فراوانی و مدت Undo در این سند انتخاب اجرایی‌اند، نه نقل تصمیم قبلی.

متن مستقل کامل Technical Design قدیمی در دسترس نیست؛ این سند و تصمیم‌های صریح جدید مبنای ادامه‌اند. سورس برنامه در این مرحله تغییر نکرده است.

## ۲. یافته‌های قطعی از سورس در بررسی مبنا

| بخش | وضعیت فعلی | پیامد برای تغییر |
|---|---|---|
| دیتابیس | `time80.db`؛ چهار جدول activities، time_entries، settings، scheduled_notifications | همین فایل و جداول حفظ شوند |
| نسخهٔ schema | initDatabase هیچ user_version نمی‌نویسد | schema قدیمی باید با ساختار تشخیص داده شود؛ مقدار صفر مساوی دیتابیس خالی نیست |
| شناسهٔ Android | `com.personal.time80`؛ versionCode=1 در بسته | شناسه ثابت؛ versionCode خروجی بیشتر از نسخهٔ واقعاً نصب‌شده |
| ثبت | saveTimeEntry با UNIQUE(period_start) و UPSERT | حفظ id؛ جلوگیری از بازنویسی تصادفی بازهٔ موجود |
| Today | buildDaySlots از تنظیمات جاری استفاده می‌کند | خواندن از ledger، همراه ثبت‌های legacy |
| Check-in | انتخاب فعالیت فوراً ذخیره می‌شود | تأیید هنگام تغییر ثبت قبلی، پیام خطای قابل مشاهده |
| ActivityGrid | View بدون scroll؛ محدودیت عددی ۱۵ ندارد | مشکل دسترسی ناشی از layout است؛ فهرست مجازی اسکرولی |
| فعالیت‌ها | انتخاب emoji وجود دارد؛ Modal بدون مدیریت مناسب keyboard | رفع رفتار لمس، اسکرول و keyboard؛ حفظ آیکون انتخابی |
| navigation | tab و checkInPeriod در state محلی App | stack با بازگشت قابل پیش‌بینی |
| اعلان | WEEKLY؛ حداکثر ۴۵۰؛ cancel پیش از validation | validate پیش از تغییر، reconciliation و مدیریت شکست جزئی |
| خطای startup | catch با setReady(true) | شکست دیتابیس نباید مسیر ورود به برنامه باشد |

## ۳. قواعد حفظ داده و مسیر انتقال

۱. v0.1→v0.2: fresh install پذیرفته شده؛ پیاده‌سازی migration دادهٔ v0.1 و بازیابی signing قدیمی جزء تحویل نیست. نبود این دو مانع شروع نیست.
۲. v0.2→نسخه‌های بعدی: شناسهٔ برنامه، signing پایدار، هویت ثبت‌ها، فعالیت‌ها، طبقه‌بندی و زمینهٔ زمانی باید در upgrade حفظ شوند. reset، reseed روی نصب موجود و حذف فایل DB راه بازیابی خطا نیست.
۳. در صورت مشاهدهٔ دیتابیس v0.1 یا ساختار ناشناخته، برنامه آن را خودکار پاک یا بازتعریف نمی‌کند؛ initialization متوقف و نیاز به نصب تازهٔ مجاز توضیح داده می‌شود. uninstall عملی است که کاربر روی گوشی انجام می‌دهد، نه کاری که migration مخفیانه انجام دهد.
۴. ساخت ledger ثبت فعالیت تولید نمی‌کند. حذف آینده فقط برای pending آغازنشده و فاقد entry مجاز است؛ گذشته، جاری، skipped و ثبت‌شده محفوظ‌اند.
۵. scheduled_notifications cache اجرایی است؛ reconciliation می‌تواند آن را تغییر دهد، بدون حذف تاریخچهٔ زمان.
۶. از اولین release v0.2 کلید امضای پایدار در محل امن نگهداری می‌شود، بدون افزودن رمز یا keystore به سورس/سند. ساخت بعدی باید از همان هویت امضا استفاده کند.
۷. قواعد تحمل دادهٔ ناسازگار و unknown در گزارش پابرجاست؛ نگهداری آن‌ها تعهد انتقال دادهٔ v0.1 ایجاد نمی‌کند.

## ۴. نقشهٔ فایل‌ها

مسیرها نسبت به ریشهٔ پروژه‌اند. «جدید» یعنی فایل هنوز ایجاد نشده است.

| فایل | اقدام | مسئولیت و خروجی |
|---|---|---|
| `App.tsx` | اصلاح | bootstrap؛ صف پاسخ اعلان تا آماده‌شدن DB/navigation؛ نمایش خطای مسدودکننده؛ lifecycle |
| `src/db/database.ts` | اصلاح | connection ثابت؛ queryهای legacy؛ واگذاری migration؛ حفظ APIهای موجود تا انتقال callerها |
| `src/db/migrations.ts` | جدید | تشخیص schema، مهاجرت افزایشی و کنترل نسخه |
| `src/db/backup.ts` | جدید | snapshot سازگار SQLite پیش از migration؛ بررسی سلامت؛ بدون بازیابی خودکار مخرب |
| `src/db/slotRepository.ts` | جدید | SQL ledger، ادغام legacy، upsert بدون تغییر گذشته |
| `src/data/icatus2016.json` | جدید | بستهٔ رسمی سه‌سطحی با نسخه، منشأ و checksum؛ استخراج و validation پیش از استفاده |
| `src/db/classificationRepository.ts` | جدید | گره‌ها، پیش‌فرض‌ها و revisionهای تخصیص با transaction مشترک |
| `src/db/entryContextRepository.ts` | جدید | زمینهٔ زمانی ثبت و provenance معلوم/نامعلوم |
| `src/services/classificationService.ts` | جدید | اعتبارسنجی فرهنگ، تعیین دسته و تشخیص تعارض |
| `src/components/ClassificationPicker.tsx` | جدید | انتخاب دستهٔ کلی و جزئیات اختیاری بدون اجبار در ثبت روزمره |
| `src/db/metaRepository.ts` | جدید | getMeta/setMeta روی connection یا transaction تحویلی |
| `src/services/slotService.ts` | جدید | افق ۳۵ روز، وضعیت slot، backlog و تغییر آینده |
| `src/services/checkInService.ts` | جدید | validation، تشخیص تعارض، ثبت/ویرایش/skip اتمیک |
| `src/services/settingsService.ts` | جدید | ذخیرهٔ serialized، مرز اثرگذاری و dirty شدن schedule |
| `src/services/activityService.ts` | جدید | اعتبارسنجی فعالیت، رتبه‌بندی انتخاب‌ها بر اساس دفعات ثبت |
| `src/services/reportService.ts` | جدید | محاسبهٔ بازه، aggregate، روزانه، مقایسه و coverage |
| `src/notifications/scheduler.ts` | اصلاح | reconcile، next reminder، test و payload سازگار |
| `src/notifications/diagnostics.ts` | جدید | مجوز، channel، برنامهٔ OS، محدودیت‌های قابل تشخیص |
| `src/navigation/AppNavigator.tsx` | جدید | onboarding، tabs و stack صفحات داخلی |
| `src/navigation/types.ts` | جدید | routeها و پارامترهای serializable با ISO string |
| `src/hooks/useAppLifecycle.ts` | جدید | resume، نیمه‌شب، تغییر ساعت/منطقه و refresh |
| `src/screens/TodayScreen.tsx` | اصلاح | روز انتخابی، جاری/ثبت‌شده/ثبت‌نشده، دسترسی به backlog |
| `src/screens/CheckInScreen.tsx` | اصلاح | grid اسکرولی، تاریخ کامل، تأیید تغییر ثبت قبلی، error/retry |
| `src/screens/ActivitiesScreen.tsx` | اصلاح | فرم keyboard-safe، icon picker و حفظ archive |
| `src/screens/SettingsScreen.tsx` | اصلاح | autosave، validation در محل، وضعیت ذخیره و اعلان جدا |
| `src/screens/InsightsScreen.tsx` | اصلاح | انتخاب دوره، قبلی/بعدی، مقایسه و breakdown |
| `src/screens/OnboardingScreen.tsx` | جدید | توضیح اعلان، درخواست مجوز و تست اختیاری |
| `src/screens/NotificationDiagnosticsScreen.tsx` | جدید | وضعیت و اقدام اصلاحی؛ بدون ادعای تشخیص ناممکن |
| `src/screens/BacklogScreen.tsx` | جدید | بازه‌های ثبت‌نشدهٔ روزهای قبل، بدون وابستگی به تحویل اعلان |
| `src/components/ActivityGrid.tsx` | اصلاح | FlatList چندستونه؛ لمس یک‌باره، safe-area و loading |
| `src/components/ScreenShell.tsx` | اصلاح | حالت flex برای فهرست؛ پرهیز از scroll تو در تو |
| `src/components/ActivityEditor.tsx` | جدید | استخراج فرم فعالیت و emoji picker |
| `src/components/ReportPeriodPicker.tsx` | جدید | تقویم، نوع بازه، تاریخ شروع/پایان |
| `src/components/SlotRow.tsx` | جدید | نمایش یکسان بازه و وضعیت |
| `src/types/models.ts` | اصلاح | مدل‌های جدید بدون تغییر معنای فیلدهای قدیمی |
| `src/utils/time.ts` | اصلاح | توابع pure؛ منع تولید تاریخچه از تنظیمات امروز |
| `src/utils/reportPeriods.ts` | جدید | مرزهای تقویمی و دوره‌های ۷/۳۰ روزه |
| `app.json`، `package.json` | اصلاح بعد از تأیید | version، navigation dependencies؛ بدون ارتقای عمدهٔ stack |
| `package-lock.json` | ایجاد/تثبیت بعد از تطبیق مخزن | dependencyهای قابل بازتولید؛ بستهٔ بررسی‌شده lockfile ندارد |
| `scripts/build-android-release.sh` و workflow ساخت | اصلاح بعد از تأیید | نام v0.2، signing پایدار و gate ارتقا از v0.2 به بعد |

## ۵. قرارداد توابع

همهٔ Dateهای ورودی هنگام ورود validate و برای ذخیره به ISO UTC تبدیل می‌شوند. بازه‌ها به صورت `[start,end)` هستند. سرویس‌ها clock قابل تزریق دارند. هر mutation از یک صف مشترک عبور می‌کند؛ transaction تو در تو نداریم.

| تابع | ورودی → خروجی | رفتار و خطا |
|---|---|---|
| `initDatabase(): Promise<InitResult>` | بدون ورودی → schemaVersion، upgraded، firstUsedAt | ready فقط بعد از موفقیت migration؛ خطا به startup error |
| `detectSchema(conn): Promise<SchemaKind>` | conn → empty/current/legacy/unsupported | sqlite_master، table_info، index و user_version؛ ساختار ناشناخته را اصلاح حدسی نمی‌کند |
| `createPreMigrationBackup(conn): Promise<BackupInfo>` | DB → مسیر داخلی snapshot سالم | عدم موفقیت یا کمبود فضا: توقف پیش از تغییر |
| `runMigrations(conn, now): Promise<void>` | empty/current یا مسیر upgrade آینده | ساخت baseline تازه یا migration ثبت‌شده؛ user_version آخرین write؛ v0.1 انتقال داده ندارد |
| `ensureSlotHorizon(now): Promise<SlotSyncResult>` | now → insertedCount، horizonEnd | idempotent؛ ایجاد تا پایان روز محلی now+35؛ حفظ سطرهای موجود |
| `rebuildFutureSlots(tx, settings, effectiveAt)` | transaction و مرز زمانی → تعداد تغییر | فقط آیندهٔ قابل تغییر؛ عدم هم‌پوشانی با جاری/ثبت‌شده |
| `getDayTimeline(day): Promise<SlotView[]>` | روز → union ledger و legacy | deduplicate با period_start؛ ثبت‌های legacy مستقل هم نمایش داده شوند |
| `getBacklog(before, cursor, limit)` | زمان و صفحه‌بندی → items، nextCursor | فقط completed pending بدون logged؛ مرتب‌سازی پایدار start,id |
| `getCheckInContext(period): Promise<CheckInContext>` | بازه → entry فعلی، state و activityها | پایان آینده یا بازهٔ نامعتبر مجاز نیست |
| `commitCheckIn(input): Promise<SaveResult>` | activityId، period، source، expectedEntry، classificationSelection، expectedClassificationRevision و timeContextPatch طبق بخش ۱۵.۱ | saved/unchanged/conflict؛ entry و تخصیص و context در یک transaction؛ قرارداد دقیق بخش ۱۵ |
| `skipSlot(slotId): Promise<void>` | id → void | فقط بازهٔ تمام‌شدهٔ فاقد logged؛ «بعداً» این تابع را صدا نمی‌زند |
| `validateSettings(candidate): ValidationResult` | candidate → valid یا field errors | interval صحیح ۱۵–۲۴۰؛ روزها ۱–۷؛ end>start؛ سقف schedule |
| `applySettingsPatch(patch, now): Promise<SettingsSaveResult>` | patch → saved، effectiveAt، schedulingState | تنظیمات و ledger در transaction؛ OS scheduling پس از commit |
| `getRankedActivities(now): Promise<ActivitySuggestions>` | now → top4 و allActivities | top4 بر اساس COUNT ثبت‌های logged در ۷ روز محلی اخیر شامل امروز؛ سپس آخرین period_start، sort_order، id؛ archive حذف؛ صفر سابقه پیشنهاد نمی‌شود؛ همهٔ فعالیت‌های فعال جدا در دسترس‌اند |
| `resolveReportRange(query, context): ReportRange` | mode، anchor/index، calendar، firstUsedAt → start/end/label/partial | pure؛ lifecycle با روز محلی، بدون ضرب ثابت میلی‌ثانیه |
| `getReport(range, timezone): Promise<ReportResult>` | range و timezone ثابت → totals، pareto، daily، coverage، qualityFlags | داده‌ها از یک read snapshot؛ پردازش پس از آزادکردن آن؛ اجزای گزارش از snapshot مشترک |
| `undoEntryEdit(token, now): Promise<SaveResult>` | token کوتاه‌مدت → saved/conflict/expired | rollback منطقی با write جدید و revision جدید، بدون حذف history؛ بخش ۱۵.۱ |
| `assertNoEntryOverlap(tx, period, excludeEntryId)` | بازهٔ جدید → void یا overlap | برای ایجاد ثبت جدید در همان transaction؛ ویرایش بدون تغییر زمان، ناسازگاری قدیمی را حذف نمی‌کند |
| `compareReports(a,b): ReportComparison` | دو گزارش → تفاوت و وضعیت قابلیت مقایسه | درصد رشد با مبنای صفر = null؛ بازهٔ ناقص مشخص |
| `reconcileNotifications(reason): Promise<ScheduleResult>` | startup/resume/settings → synced/degraded/off | مقایسهٔ OS و DB؛ serialized؛ retry بدون تکثیر |
| `getNextReminder(now): Promise<ReminderPreview|null>` | now → زمان و بازه | روز فعال و وضعیت مجوز لحاظ شود؛ زمان برنامه‌ریزی‌شده، نه تضمین تحویل |
| `resolveNotificationPeriod(notification): Promise<Resolution>` | payload/date → resolved/ambiguous/invalid | سازگاری با v0.1؛ دادهٔ مبهم به انتخاب بازه، نه ثبت خودکار |
| `sendTestNotification(): Promise<string>` | بدون ورودی → notificationId | تست ۱۰ثانیه‌ای با kind مجزا؛ بدون ساخت time_entry |
| `getNotificationDiagnostics(): Promise<Diagnostics>` | بدون ورودی → وضعیت‌های known/unknown | وضعیت battery/background نامعلوم را سالم گزارش نمی‌کند |

`saveTimeEntry` داخلی می‌ماند؛ screens فقط commitCheckIn را فراخوانی می‌کنند. در ویرایش فعالیت فقط activity_id، recorded_at، source و status هدف تغییر می‌کند؛ در ویرایش صرفاً دسته، هیچ فیلد time_entries تغییر نمی‌کند. period_start/end و duration ثبت موجود بازنویسی نمی‌شود. expectedEntry شامل snapshot مقادیر قبلی است تا ویرایش هم‌زمان تشخیص داده شود.

## ۶. database migration — نسخهٔ هدف schema=3

### ۶.۱ مسیرهای ورودی

| ورودی | اقدام |
|---|---|
| دیتابیس واقعاً خالی | ساخت پایهٔ جدید v0.2 شامل چهار جدول سازگار با مدل فعلی، ledger و ICATUS؛ seed فقط اینجا؛ schema=3 |
| schema=3 با fingerprint این baseline | validation؛ بدون reseed یا تغییر نسخه |
| دیتابیس قدیمی v0.1 یا مرحلهٔ طراحی schema=2 | پشتیبانی از انتقال لازم نیست؛ توقف بدون حذف و راهنمای نصب تازه |
| ساختار نامطابق یا نسخهٔ بالاتر | توقف بدون reset و downgrade |
| upgrade آینده از baseline معتبر v0.2 | migration افزایشی ثبت‌شده، backup، transaction و آزمون حفظ داده |

شمارهٔ 3 برای هماهنگی اسناد حفظ می‌شود؛ وجود schema=3 به معنی اجرای دو migration قدیمی نیست. برچسب‌های «مرحلهٔ ۲/۳» در DDL زیر فقط تقسیم منطقی ساخت baseline هستند. fingerprint علاوه بر عدد نسخه بررسی می‌شود؛ جدول‌ها صرفاً با IF NOT EXISTS تأیید نمی‌شوند.

### ۶.۲ DDL بخش پایهٔ ledger در نصب تازه

این SQL مشخصات است و اجرا نشده است. runner هنگام وجود جدول با ساختار ناسازگار نباید با IF NOT EXISTS خطا را پنهان کند.

```sql
CREATE TABLE expected_slots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  period_start TEXT NOT NULL UNIQUE,
  period_end TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK(duration_minutes > 0),
  state TEXT NOT NULL DEFAULT 'pending'
    CHECK(state IN ('pending','skipped')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK(period_end > period_start)
);
CREATE INDEX idx_expected_slots_state_end
  ON expected_slots(state, period_end);
CREATE TABLE app_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
-- این قطعه به همراه چهار جدول پایه و DDL بخش ۱۵.۲، baseline نصب تازه را می‌سازد.
-- فقط runner پس از validation کامل user_version=3 را ثبت می‌کند.
```

در نصب تازه، مدل time_entries از سورس مبنا ساخته می‌شود؛ انتقال یا کپی داده از v0.1 انجام نمی‌شود. ارتباط ledger و entry از UNIQUE period_start برقرار می‌شود. وضعیت logged از time_entries خوانده می‌شود، نه از ستون state در ledger. مقادیر missed/skipped مدل پایه، در صورت وجود در دادهٔ قابل‌خواندن، جدا تفسیر می‌شوند؛ فقط status=logged فعالیت ثبت‌شده محسوب می‌شود.

### ۶.۳ metadata

| کلید | مقدار اولیه/معنا |
|---|---|
| `first_used_at` | زمان شروع موفق baseline تازه؛ یک‌بار ثبت و در upgradeهای بعد حفظ می‌شود |
| `onboarding_completed` | false فقط در نبود کلید؛ onboarding کاربر قدیمی تنظیمات را صفر نمی‌کند |
| `slot_horizon_end` | انتهای افق موفق؛ فقط پس از commit ساخت slotها |
| `notification_schedule_signature` | فقط پس از تأیید هم‌خوانی OS و DB مقدار موفق دریافت می‌کند |
| `ledger_started_at` | زمان شروع ledger؛ مرز دانسته‌های coverage |
| `schedule_dirty` | true تا reconciliation موفق |
| `schedule_revision` | عدد افزایشی برای حذف نتیجهٔ async قدیمی |
| `schedule_effective_at` | مرز آخرین تغییر grid زمانی |
| `schedule_timezone` | منطقهٔ زمانی برنامهٔ فعال برای تشخیص تغییر |
| `schedule_anchor` | JSON شامل effectiveAt، anchorLocalDate، anchorLocalMinute و timezone؛ برای حفظ مبدأ فاصلهٔ جدید |
| `active_classification_scheme_id` | شناسهٔ scheme نصب‌شدهٔ ICATUS 2016؛ پس از validation بسته تعیین می‌شود |
| `icatus_fa_translation_manifest` | JSON شامل locale، version و sha256 واقعی بستهٔ ترجمه؛ مستقل از scheme رسمی |
| `baseline_id` | time80-v0.2-icatus2016-schema3؛ همراه fingerprint ساختار بررسی می‌شود |
| `report_week_start` | 7 = شنبه؛ نگاشت موجود 1=یکشنبه … 7=شنبه |
| `report_calendar` | پیشنهاد: persian پیش‌فرض؛ gregorian قابل انتخاب |

کلیدهای چهار ردیف اول از طراحی بازیابی شده‌اند؛ باقی جزئیات پیشنهادی این specification هستند. تمام مقادیر به شکل string/JSON معتبر ذخیره می‌شوند؛ خواندن metadata نامعتبر خطا یا fallback مشخص دارد، نه حذف داده.

### ۶.۴ ترتیب اتمیک و rollback

۱. تمام writeهای UI/listener تا readiness مسدودند. بازکردن time80.db و تشخیص ساختار، پیش از seed.
۲. روی نصب تازه: validation بستهٔ ICATUS؛ ساخت تمام جداول، indexها، دادهٔ مرجع، فعالیت‌های آغازین، settings و metadata در یک transaction. timestamp شروع برای کل عملیات ثابت است.
۳. کنترل FK، fingerprint و دادهٔ مرجع؛ user_version=3 آخرین write؛ commit. شکست داخل transaction rollback می‌شود و UI عملیاتی باز نمی‌شود.
۴. سپس ensureSlotHorizon و reconciliation. شکست post-commit با retry idempotent حل می‌شود؛ baseline دوباره ساخته نمی‌شود.
۵. برای upgradeهای آیندهٔ v0.2: snapshot سازگار SQLite پیش از تغییر، بررسی integrity و فضای لازم، migration در transaction و کنترل برابری داده‌های محافظت‌شده؛ هیچ restore خودکار روی DB دارای دادهٔ تازه انجام نمی‌شود.
۶. runner تنها مالک transaction و user_version است؛ repositoryها connection تراکنشی را دریافت می‌کنند و transaction تو در تو ندارند.

APIهای transaction و backup در Expo باید با dependency نصب‌شده تطبیق داده شوند. [مستند SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/)

## ۷. قرارداد زمان و ledger

- source of truth ثبت واقعی = time_entries؛ انتظار ثبت از v0.2 به بعد = expected_slots؛ cache اعلان منبع تاریخچه نیست.
- شروع ledger: اولین بازهٔ کامل برنامه که شروعش در/پس از ledger_started_at است. ثبت‌های قبلی حتی خارج این مرز هم نمایش داده می‌شوند؛ برای گذشتهٔ ناشناخته pending جعلی تولید نمی‌شود.
- horizon شامل پایان روز محلی ۳۵ روز بعد است؛ تمدید در startup، resume، تغییر روز و تنظیمات انجام می‌شود. قطع برنامه تا کمتر از این افق، backlog را از بین نمی‌برد.
- اگر برنامه بیش از افق بسته بود، شکاف پس از افق با تنظیمات و timezone معتبر آخر پر می‌شود، تنها وقتی عدم تغییر آن‌ها قابل احراز باشد. در تغییر نامعلوم منطقه/ساعت، پوشش آن بخش unknown است؛ تاریخچه جعل نمی‌شود.
- تغییر interval در لحظهٔ t داخل بازه: بازهٔ جاری و اعلان پایانش حفظ می‌شوند؛ پایان همان بازه مبدأ واقعی فاصلهٔ جدید است. مثال مصوب: تغییر ۳۰→۶۰ در ۱۰:۱۵ داخل ۱۰:۰۰–۱۰:۳۰، بازهٔ بعدی ۱۰:۳۰–۱۱:۳۰ است؛ بازگشت به grid قدیمی مبتنی بر day_start مجاز نیست. schedule_anchor با تنظیمات در همان transaction ذخیره می‌شود. انتخاب اجرایی: این فاز ساعتی در روزهای فعال بعد نیز حفظ شود؛ نخستین شروع هم‌فاز در/پس از day_start انتخاب می‌شود. تغییر صریح day_start مبدأ را از نخستین روز کامل بعد به day_start جدید برمی‌گرداند. فقط بازهٔ کامل با end<=day_end ساخته می‌شود؛ باقیماندهٔ کوتاه به‌اجبار ساخته نمی‌شود. اگر هنگام تغییر interval بازهٔ جاری وجود نداشت، مبدأ نخستین شروع آیندهٔ برنامهٔ موجود است؛ در نبود آن، day_start روز فعال بعد. محدودیت روزها و day_end جدید بر آینده اعمال می‌شود، اما جاری محفوظ است.
- حذف آینده شرط `period_start >= effectiveAt AND state='pending' AND NOT EXISTS(time_entry با همان period_start)` دارد. همهٔ بازه‌های شروع‌شده مستقل از end محفوظ‌اند.
- علامت notification_enabled فقط ارسال اعلان را کنترل می‌کند؛ پیشنهاد حفظ رفتار فعلی: timeline حتی با اعلان خاموش قابل استفاده است. صدای اعلان، لرزش و تنظیمات گزارش grid را عوض نمی‌کنند.
- «بعداً» یا Back، slot را pending نگه می‌دارد. skip تصمیم صریح کاربر است؛ ثبت بعدی روی skipped پس از انتخاب کاربر، در transaction آن را به pending همراه logged تبدیل می‌کند.
- current/future قابل ثبت نیستند؛ missed نمایشی یعنی pending تمام‌شدهٔ فاقد logged. نیمه‌شب باعث حذف هیچ سطری نمی‌شود.
- ساعت محلی برای ساخت/نمایش و ISO UTC برای ذخیره است. تقویم شمسی با timezone یکی نیست. تغییر timezone فقط آینده را بازسازی می‌کند؛ گذشتهٔ UTC تغییر نمی‌کند. گزارش یک timezone صریح دارد که مقدار اولیهٔ آن منطقهٔ فعلی دستگاه است؛ در مقایسهٔ دوره‌ها ثابت می‌ماند و نمایش داده می‌شود. زمینهٔ زمان فعالیت طبق بخش ۱۴ مستقل نگهداری می‌شود.

## ۸. اعلان و تنظیمات

مبنای پیشنهاد: حفظ weekly native scheduling موجود؛ افق ۳۵روز مربوط به ledger است و به معنی ۳۵روز اعلان مجزا نیست. Exact Alarm اختصاصی به scope اضافه نمی‌شود و دقت سر ساعت تضمین نمی‌شود. اثر permission فعلی SCHEDULE_EXACT_ALARM در build و روی گوشی باید بررسی شود؛ صرف وجود یا نبود آن مبنای ادعای کارکرد نیست.

reconcile ابتدا تنظیمات و سقف ۴۵۰ را validate می‌کند، permission/channel را می‌خواند، سپس فهرست واقعی اعلان‌های متعلق به Time80 را با desired plan مقایسه می‌کند. اعلان‌های دیگر/تست با kind مستقل هستند. حذف و ایجاد هدفمند با ذخیرهٔ فوری id، revision و dirty flag انجام می‌شود. شکست جزئی ممکن است، چون OS و SQLite یک transaction مشترک ندارند؛ وضعیت degraded نمایش داده می‌شود و retry از واقعیت OS ادامه می‌یابد. signature فقط پس از verification نهایی موفق ثبت می‌شود. نتیجهٔ revision قدیمی حق overwrite جدید ندارد.

رفتار محصول مصوب است: جاری کامل می‌شود و interval جدید از پایان آن محاسبه می‌شود؛ scheduler از همان slot plan و schedule_anchor استفاده می‌کند. مثال ۱۰:۳۰→۱۱:۳۰ معیار آزمون اجباری است. اعلان بازهٔ جاری در خاموش‌کردن صریح اعلان‌ها ارسال نمی‌شود؛ حفظ بازه مستقل از فعال بودن اعلان است.

مرز فنی باقی‌مانده: trigger هفتگی باید نخستین occurrence مجاز را رعایت کند، بدون تکرار در ساعات گذشتهٔ روز انتقال یا از دست‌دادن استمرار هفته‌های بعد. پیش از implementation scheduler یک بررسی قابلیت محدود روی API نصب‌شده انجام می‌شود: حفظ trigger جاری/exception یک‌باره، آغاز weekly جدید و بازیابی پس از reboot. اگر API نتواند این رفتار را تضمین کند، راهبرد جایگزین با محدودیت‌هایش باید مشخص شود؛ ادعای حل فنی این مورد در سند نمی‌شود. تبدیل ساده به تعداد محدودی اعلان dated بدون پوشش استمرار در بسته‌بودن طولانی اپ پذیرفته نیست. این gate مانع کار روی DB، ثبت، UI و گزارش نیست.

payload جدید شامل kind، payloadVersion، scheduleRevision، weekday، fireHour، fireMinute و intervalMinutes است؛ exceptionها periodStart/periodEnd دقیق دارند. parser قدیمی نگه داشته می‌شود. تأخیر تحویل تا روز بعد یا payload منقضی نباید بی‌صدا به بازهٔ اشتباه تبدیل شود؛ در ابهام UI انتخاب بازه از ledger باز می‌شود. listener هر response را یک‌بار consume می‌کند و تا آماده‌شدن navigation صف می‌کند.

onboarding توضیح کوتاه، ایجاد channel، درخواست مجوز و تست ۱۰ثانیه‌ای دارد. رد مجوز مانع استفادهٔ دستی نیست. diagnostics مجوز، channel و تعداد schedule واقعی را گزارش می‌کند؛ برای محدودیت‌های Samsung که API قابل اتکا ندارد راهنمای دستی همراه unknown نشان می‌دهد. ارسال انبوه اعلان عقب‌افتاده پس از روشن‌شدن گوشی انجام نمی‌شود.

کتابخانه Expo دریافت boot را برای بازیابی اعلان‌ها پشتیبانی می‌کند؛ صحت روی APK و گوشی هدف آزموده می‌شود و با force-stop یکی فرض نمی‌شود. [مستند Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)

autosave: switch/day/sound با تغییر معتبر، interval و ساعت روی پایان ویرایش/blur. فرم draft و settings ذخیره‌شده جدا هستند. patchها serialized؛ مقدار ناقص ذخیره نمی‌شود. متن «تنظیمات ذخیره شد» از «اعلان‌ها هماهنگ شدند» جداست. Back روی draft نامعتبر هشدار دورریختن همان draft را می‌دهد؛ DB قبلی حفظ می‌شود.

## ۹. ثبت، فعالیت‌ها و navigation

- navigation پیشنهادی native stack و tabs با root=Today؛ Back در فرم ابتدا modal/keyboard، سپس صفحهٔ قبلی؛ از tabهای دیگر به Today؛ تنها Today root خروج عادی.
- لمس اعلان cold start و warm start مسیر یکسان دارد. بعد از ثبت موفق refresh تمام مصرف‌کننده‌ها و بازگشت به مبدأ؛ مسیر notification بدون مبدأ به Today.
- ثبت خالی یک‌لمسی می‌ماند. ثبت قبلی ابتدا در حالت مشاهده باز می‌شود؛ دکمهٔ «ویرایش» فعال‌سازی تغییر را صریح می‌کند. تغییر فعالیت/دسته confirmation دارد؛ سپس Undo کوتاه‌مدت مطابق بخش ۱۵.۱ ارائه می‌شود. انتخاب عیناً یکسان no-op و لغو بدون write است.
- save error در همان صفحه با retry نمایش داده شود؛ onSaved فقط پس از commit. لمس مکرر با guard فوری و constraint DB مهار شود.
- فرم فعالیت keyboard-safe و آیکون انتخاب‌شده واضح؛ افزودن/ویرایش و archive بر تاریخچه اثر حذف ندارد. چهار پیشنهاد بر اساس دفعات استفاده در ۷ روز محلی اخیر شامل امروز و زمان period_start انتخاب می‌شوند؛ ویرایش یک ثبت دفعات را زیاد نمی‌کند. پنجرهٔ ۷روزه انتخاب اجرایی این بازنگری است. همهٔ فعالیت‌ها جدا و قابل اسکرول‌اند و ترتیب هنگام لمس ثابت می‌ماند.
- emoji picker جست‌وجو/انتخاب و اسکرول مستقل دارد؛ آیکون دلخواه قبلی حتی خارج مجموعهٔ پیشنهادی قابل نمایش است. فراوانی انتخاب فعالیت با فراوانی انتخاب emoji اشتباه گرفته نمی‌شود؛ پیشنهاد حاضر اولی است.

## ۱۰. گزارش‌ها و فرمول‌ها

| نوع | قرارداد |
|---|---|
| تقویمی | روز، هفته با شروع قابل تنظیم، ماه واقعی شمسی/میلادی؛ قبلی/بعدی |
| هفتهٔ استفاده | روزهای ۱–۷، ۸–۱۴ و … از روز محلی first_used_at |
| ماه استفاده | روزهای ۱–۳۰، ۳۱–۶۰ و …؛ برچسب «دورهٔ ۳۰روزه»، مستقل از ماه تقویمی |
| rolling | ۷ یا ۳۰ روز محلی شامل امروز؛ امروز تا now، مشخصاً ناقص |
| custom | تاریخ ابتدا تا انتهای انتخابی شامل آن روز؛ تبدیل به end-exclusive روز بعد |

برای شروع وسط هفته، اولین هفته تقویمی partial است و هفته بعد از شنبه/روز منتخب شروع می‌شود. بازهٔ نمایش و بازهٔ دادهٔ قابل مشاهده جدا نگهداری می‌شوند. حرکت به آینده محدود به دورهٔ شامل امروز است؛ دورهٔ بدون داده پیام خالی دارد، نه خطا.

مجموع فعالیت‌ها از logged entries، شامل فعالیت‌های archive، محاسبه می‌شود. سهم = minutes/totalLogged؛ Pareto با زمان نزولی و tie-break id؛ total=0 یعنی نسبت null و پیام نبود داده؛ دقیقه می‌تواند صفر نمایش داده شود ولی نسبت تعریف‌نشده صفر درصد نیست. گزارش سهم زمان است؛ بهره‌وری یا ارزش فعالیت استنباط نمی‌شود.

برای بازهٔ مرزی، سهم زمانی از overlap واقعی `[entry.start,entry.end)` با گزارش محاسبه می‌شود؛ اگر duration ذخیره‌شده با طول بازه برابر نبود، سهم از duration ذخیره‌شده به نسبت overlap به دست می‌آید و خود رکورد اصلاح نمی‌شود. daily breakdown باید با total قبل از گردکردن برابر باشد؛ overlapهای ناسازگار موجود علامت کیفیت داده می‌گیرند، حذف نمی‌شوند.

coverage فقط روی slotهای تمام‌شدهٔ معلوم از ledger: matchedLoggedMinutes/expectedMinutes؛ صورت فقط زمان logged منطبق بر همین slotهاست و legacy خارج ledger وارد آن نمی‌شود؛ مخرج صفر نسبت null دارد؛ skippedMinutes و pendingMinutes جدا؛ future/current وارد مخرج نمی‌شوند. expectedMinutes شامل skipped است. بازهٔ شامل دوران قبل از ledger، درصد پوشش کامل ندارد و «پوشش تاریخی نامعلوم» نمایش می‌دهد؛ logged legacy همچنان در مجموع و Pareto هست.

مقایسهٔ دوره‌های ناقص برچسب دارد؛ درصد نسبت به دورهٔ با مقدار صفر null/«قابل محاسبه نیست». دوشنبه با سه‌شنبه از daily breakdown قابل مقایسه است. تبدیل مرز ماه شمسی نیازمند adapter تقویمی آزموده‌شده است، نه صرفاً Intl برای تغییر برچسب؛ dependency دقیق پس از تطبیق نسخه‌ها تثبیت می‌شود.

## ۱۱. آزمون‌های لازم پیش از پذیرش پیاده‌سازی

| فایل آزمون پیشنهادی | معیار قبولی |
|---|---|
| tests/db/migrations.test.ts | نصب تازه schema=3؛ seed یک‌بار؛ تکرار startup no-op؛ rollback خطای تزریقی؛ old/unknown بدون حذف |
| tests/db/preservation.test.ts | baseline v0.2 با دادهٔ واقعی‌نما؛ upgrade آزمایشی افزایشی و مقایسهٔ تمام ستون‌های داده؛ backup failure و rollback؛ بدون استفاده از DB گوشی |
| tests/services/slots.test.ts | افق۳۵روز، نیمه‌شب، pending روز قبل، idempotence، تغییر interval مصوب ۱۰:۳۰–۱۱:۳۰، anchor روز بعد و پایان روز |
| tests/services/checkIn.test.ts | double tap؛ تداخل شروع متفاوت؛ edit همان رکورد؛ conflict در revision دسته؛ حفظ context؛ Undo معتبر، منقضی و پس از ویرایش دیگر |
| tests/services/activitySuggestions.test.ts | top4 اخیر، tie-break پایدار، archive، صفر سابقه، ویرایش بدون افزایش count و دسترسی همهٔ فعالیت‌ها |
| tests/services/settings.test.ts | autosave draft معتبر، rapid patches، anchor اتمیک، خطای OS پس از commit |
| tests/services/reports.test.ts | دوره‌های تقویمی/مصرف/rolling/custom، ماه شمسی کبیسه، مخرج صفر، snapshot مشترک هنگام write هم‌زمان |
| tests/services/classification.test.ts | یک current؛ source_activity_id تاریخی؛ تغییر پیش‌فرض بدون لمس گذشته؛ null صریح؛ supersedes هم‌ثبت؛ no-op و Undo با history |
| tests/data/icatus.test.ts | بستهٔ نهایی ICATUS2016 با ۹/۵۶/۱۶۵ گره؛ parent/level/checksum؛ نسخهٔ ترجمه مستقل |
| tests/services/classificationReports.test.ts | مجموع دسته‌ها+unmapped=total؛ عدم تکثیر join؛ والد با جزئیات نامعلوم؛ وزن مشترک گزارش |
| tests/services/entryContext.test.ts | ایجاد از slot، دیرهنگام پس از سفر unknown؛ edit فعالیت/دسته context را عوض نکند |
| tests/notifications/reconcile.test.ts | permission، crash OS/DB، revision، triggerهای انتقال، تکرار/فقدان، reboot و exception جاری |
| آزمون APK روی S23 FE | fresh install v0.2؛ ۳۰+ فعالیت، keyboard، Back، edit/Undo؛ app closed، reboot، battery restriction؛ ساخت آزمایشی بعدی با همان signing و حفظ دادهٔ v0.2 |

تست انتقال v0.1→v0.2 از معیار انتشار حذف شد. خطای گزارش‌شدهٔ ذخیره از اعلان علت تأییدشده ندارد؛ فقط آزمون عمومی صحت commit باقی می‌ماند. آزمون‌های برنامه و APK در این مرحله اجرا نشده‌اند.

## ۱۲. ترتیب اجرا

۱. تثبیت سورس handoff، dependencies/lockfile، برنامهٔ signing پایدار v0.2 و بررسی محدود قابلیت scheduler.
۲. استخراج و validation بستهٔ ICATUS 2016 و ترجمه؛ ساخت baseline، versioning، backup و تست‌ها.
۳. پیاده‌سازی ledger، ثبت اتمیک، context، طبقه‌بندی و navigation.
۴. Today با آخرین بازهٔ نیازمند ثبت، History/backlog، top4، فرم فعالیت، ویرایش/Undo و autosave.
۵. scheduler، onboarding و diagnostics پس از حل gate API بخش۸.
۶. گزارش‌های دوره‌ای و ICATUS با snapshot مشترک.
۷. typecheck، آزمون‌های هدفمند و integration؛ سپس build APK امضاشده، آزمون گوشی و آزمون upgrade از baseline v0.2 به build آزمایشی بعدی.

Build پس از پیاده‌سازی کد و آزمون‌هاست. داشتن specification یا APK v0.1 به معنی آماده‌بودن APK v0.2 نیست.

## ۱۳. وضعیت تحویل و تغییرات بازنگری ۱.۲

انجام‌شده: خواندن نسخهٔ جاری سند، تطبیق handoff محلی، بررسی hash APK، ادغام ICATUS 2016 و شش اصلاح مصوب، تعیین رفتار interval و مبدأ جدید، top4 اخیر، edit/Undo و سیاست fresh install.

تغییرهای شش‌گانه: ذخیرهٔ منشأ فعالیت دسته؛ revision اجباری تغییر تخصیص موجود؛ حفظ context هنگام edit؛ بررسی overlap در transaction؛ snapshot مشترک گزارش؛ DDL و version metadata مرجع.

کنترل انجام‌شده روی سند: بلوک‌های DDL همراه schema پایه در SQLite حافظه‌ای اجرا شدند؛ ساخت ۱۱ جدول مورد انتظار و نبود خطای foreign_key_check در schema خالی تأیید شد. این کنترل، آزمون رفتار migration یا برنامه روی دستگاه نیست.

هنوز انجام‌نشده: پیاده‌سازی کد برنامه، استخراج فرهنگ رسمی، ساخت lockfile، تأمین signing پایدار، بررسی API انتقال اعلان، build و آزمون APK. متن این سند فقط specification است. جزئیات تازهٔ اجرایی مثل پنجرهٔ ۷روزه و Undo ده‌ثانیه‌ای از تصمیم‌های قبلی تفکیک شده‌اند.

## ۱۴. قراردادهای ICATUS 2016، با اصلاحات بازنگری ۱.۲

### ۱۴ ـ ۱. تصمیم معماری

نسخهٔ ۰.۲ باید ثبت تک‌فعالیتی فعلی را حفظ کند و طبقه‌بندی نسخه‌دار و قابل توسعه را به آن اضافه کند. اعلان، بازهٔ مورد انتظار، فعالیت شخصی، طبقه‌بندی آماری و ارزیابی شخصی مسئولیت‌های مستقل دارند.

ICATUS طبقه‌بندی فعالیت‌هاست؛ معماری زیر پیشنهاد مهندسی Time80 است، نه مدل دیتابیس تجویزشده توسط سازمان ملل. استفاده از کدهای ICATUS به‌تنهایی به معنی انطباق کامل روش گردآوری داده یا قابلیت مقایسهٔ مستقیم با پیمایش‌های ملی نیست.

| لایه | پرسش | محل نگهداری |
|---|---|---|
| برنامهٔ ثبت | انتظار داریم چه بازه‌ای ثبت شود؟ | expected_slots |
| مشاهدهٔ کاربر | چه فعالیتی برای چه بازه‌ای ثبت شد؟ | time_entries موجود |
| فهرست شخصی | کاربر چه عنوان و آیکونی انتخاب می‌کند؟ | activities موجود |
| طبقه‌بندی | این ثبت در استاندارد کجا قرار می‌گیرد؟ | جداول جدید طبقه‌بندی |
| زمینهٔ زمانی | منطقهٔ زمانی بازه با چه اطمینانی معلوم است؟ | entry_time_context جدید |
| معنای شخصی | رضایت، هدف، انرژی و ارزش برای فرد چیست؟ | توسعهٔ آینده، مستقل از ICATUS |

اصطلاح legacy در قواعد تحمل گزارش به دادهٔ قدیمی/ناسازگار داخل دیتابیس قابل‌خواندن اشاره دارد؛ مجوز import یا تعهد انتقال v0.1 نیست.

سه سطح ICATUS، سطوح دسته‌بندی‌اند و نباید با این لایه‌های نرم‌افزاری یکی گرفته شوند.

### ۱۴ ـ ۲. محدودهٔ تحویل ۰.۲

در این نسخه: فرهنگ کامل سه‌سطحی در داده، اتصال اختیاری فعالیت شخصی به دسته، ثبت مستقل طبقه‌بندی هر ورودی، حفظ تغییرات طبقه‌بندی، گزارش در سطح بخش‌های اصلی و زمان طبقه‌بندی‌نشده، و مهاجرت افزایشی.

رابط کاربر می‌تواند انتخاب سطح اول و سپس جزئیات اختیاری را نشان دهد؛ برای ثبت روزمره، پیمایش اجباری تمام طبقات وجود ندارد. انتخاب دستهٔ کلی معتبر است و جزئیات نامعلوم جعل نمی‌شود.

خارج از اجرای ۰.۲: تقسیم بازه، فعالیت هم‌زمان، تکمیل اجباری ۲۴ ساعت، طبقه‌بندی با AI، مقایسه با جمعیت و امتیاز بهره‌وری. مسیر توسعهٔ این موارد در زیربخش «۱۴ ـ ۹» مشخص شده است.

### ۱۴ ـ ۳. قرارداد داده‌های مرجع

منبع کدها نسخهٔ رسمی ICATUS 2016 است. واردکردن داده از اسلایدهای پیش‌نویس مجاز نیست. فهرست نهایی مرجع شامل ۹ بخش اصلی، ۵۶ بخش و ۱۶۵ گروه است؛ جمع ۲۳۰ گره در سه سطح.

بستهٔ مرجع پیش از پیاده‌سازی باید از منبع رسمی استخراج و کنترل شود؛ این سند حاوی آن بستهٔ استخراج‌شده نیست. عنوان انگلیسی و کد رسمی حفظ می‌شوند. عنوان فارسی ترجمهٔ محصول است و نباید ترجمهٔ رسمی سازمان ملل معرفی شود. تعریف و شمول/عدم‌شمول رسمی باید از بستهٔ همراه یا مرجع قابل دسترسی باشد تا انتخاب تنها براساس عنوان انجام نشود.

scheme_id اجرایی ثابت این baseline: ICATUS:2016؛ revision رسمی و URL واقعی از بستهٔ معتبر پر می‌شوند، نه از تاریخ حدسی. شمارهٔ schema دیتابیس، نسخهٔ استاندارد و نسخهٔ بستهٔ ترجمه سه مقدار جدا هستند. نسخهٔ نصب‌شدهٔ فرهنگ رسمی immutable است؛ تغییر واقعی طبقه‌بندی با نسخهٔ جدید انجام می‌شود، نه تغییر معنی کد قبلی.

### ۱۴ ـ ۴. جداول پیشنهادی

نوع idهای activities و time_entries در سورس handoff INTEGER است؛ FKهای این baseline INTEGER هستند. مدل پایه سازگار حفظ می‌شود، اما دادهٔ v0.1 منتقل نمی‌شود. DDL دقیق بخش۱۵ مرجع ساخت است.

#### ۴.۱ classification_schemes

| ستون | معنا |
|---|---|
| scheme_id TEXT PRIMARY KEY | شناسهٔ ثابت استاندارد و بازنگری |
| name، edition، revision | مشخصات رسمی |
| source_url، dataset_sha256 | منشأ و کنترل بستهٔ مرجع |
| installed_at | زمان نصب بسته |

checksum پس از استخراج فایل واقعی محاسبه می‌شود؛ هیچ مقدار فرضی ثبت نمی‌شود.

#### ۴.۲ classification_nodes

| ستون | معنا |
|---|---|
| scheme_id، code | کلید اصلی مرکب |
| parent_code NULLABLE | کد والد در همان scheme |
| level INTEGER | یکی از ۱، ۲، ۳ |
| title_en، title_fa | عنوان رسمی و ترجمهٔ محصول |
| sort_order | ترتیب نمایش پایدار |

کد از نوع متن است. FK مرکب والد به همان scheme اشاره می‌کند. ریشه والد ندارد؛ والد سطح ۲ باید سطح ۱ و والد سطح ۳ باید سطح ۲ باشد. چرخه، کد تکراری و گره یتیم در validation بسته رد می‌شوند. اتصال FKها به حذف CASCADE تاریخچه منجر نمی‌شود؛ حذف دستهٔ استفاده‌شده ممنوع است.

#### ۴.۳ activity_classification_defaults

| ستون | معنا |
|---|---|
| activity_id، scheme_id | کلید اصلی مرکب |
| code NULLABLE | دستهٔ پیش‌فرض؛ NULL یعنی بدون پیش‌فرض |
| revision INTEGER | شمارهٔ تغییر پیش‌فرض برای تشخیص تعارض |
| updated_at | زمان تغییر |

این جدول فقط انتخاب پیش‌فرض ثبت‌های بعدی است. تغییر آن، هیچ entry_classifications قبلی را به‌روزرسانی نمی‌کند. فعالیت مبهم می‌تواند بدون پیش‌فرض باقی بماند. Archive فعالیت نیز دادهٔ طبقه‌بندی گذشته را حذف نمی‌کند.

#### ۴.۴ entry_classifications

این جدول تاریخچهٔ تخصیص دسته به هر ثبت است؛ هر اصلاح یک سطر جدید می‌سازد.

| ستون | معنا |
|---|---|
| id INTEGER PRIMARY KEY | شناسهٔ تخصیص |
| entry_id، scheme_id | ثبت هدف و استاندارد |
| code NULLABLE | دستهٔ انتخاب‌شده؛ NULL یعنی طبقه‌بندی‌نشده |
| revision INTEGER | ترتیب اصلاحات برای همان entry و scheme |
| is_current INTEGER | فقط ۰ یا ۱ |
| supersedes_id NULLABLE | تخصیص پیشین همان ثبت و استاندارد |
| method | inherited_default / user_selected / user_reclassified / unmapped |
| source_activity_id INTEGER NULLABLE | فعالیت منشأ در تخصیص inherited_default؛ FK به activities و در تاریخچه محفوظ |
| default_revision NULLABLE | نسخهٔ پیش‌فرض استفاده‌شده، در صورت وجود |
| assigned_at TEXT NOT NULL، reason TEXT NULLABLE | زمان ثبت تخصیص الزامی؛ علت اختیاری |

قیود ضروری: UNIQUE(entry_id, scheme_id, revision)؛ index یکتای جزئی روی (entry_id, scheme_id) در حالت is_current=1؛ FK مرکب کد به classification_nodes؛ و FK ثبت به time_entries. هر کد غیرNULL باید واقعاً در بسته وجود داشته باشد.

سطر قبلی تنها از current به historical تبدیل می‌شود؛ کد و منشأ آن بازنویسی نمی‌شوند. زنجیرهٔ supersedes باید در همان entry و scheme بماند؛ این قاعده در سرویس تراکنشی و آزمون کنترل می‌شود. index پیشنهادی گزارش: (scheme_id, is_current, code, entry_id).

وضعیت «فاقد اطلاعات» با کدهای رسمی «سایر» یکی نیست. یک کد سطح اول نیز به معنی «دارای دستهٔ کلی» است، نه تخصیص به تمام فرزندان آن.

#### ۴.۵ entry_time_context

| ستون | معنا |
|---|---|
| entry_id PRIMARY KEY | FK به ثبت موجود |
| timezone_id NULLABLE | نام منطقهٔ زمانی IANA، اگر برای بازه معلوم باشد |
| utc_offset_start_minutes NULLABLE | offset در شروع بازه، در صورت معلوم بودن |
| provenance | captured_at_slot_creation / user_confirmed / unknown |
| captured_at | زمان ثبت metadata |

زمان بازکردن برنامه یا زمان تکمیل یک ثبت عقب‌افتاده، به‌تنهایی شاهد منطقهٔ زمانی هنگام فعالیت نیست. برای نگهداری این اطلاعات از زمان تولید بازه، به expected_slots جدید دو ستون nullable با نام timezone_id و timezone_provenance افزوده می‌شود. برای بازه‌های قدیمی، اطلاعات نامعلوم NULL می‌ماند.

### ۱۴ ـ ۵. رفتار هنگام ثبت و ویرایش

۱. commitCheckIn همچنان تنها مسیر نوشتن ثبت توسط UI است و از صف مشترک mutation استفاده می‌کند.

۲. ایجاد ثبت و تخصیص طبقه‌بندی و زمینهٔ زمانی در همان تراکنش انجام می‌شود. ترتیب انتخاب دسته: انتخاب صریح کاربر، سپس پیش‌فرض فعالیت، و در نبود آن unmapped.

۳. مقدار پیش‌فرض در همان تراکنش خوانده می‌شود. ثبت صریح از یک فرم قدیمی با revision مورد انتظار کنترل می‌شود تا ویرایش هم‌زمان نادیده گرفته نشود.

۴. انتخاب همان فعالیت بدون تغییر دسته no-op باقی می‌ماند. تغییر خود فعالیت، طبق طراحی قبلی نیازمند تأیید است؛ پس از تأیید، تخصیص قدیمی historical و تخصیص متناسب با فعالیت جدید current می‌شود. زمان‌ها و مدت همان ثبت حفظ می‌شوند.

۵. ویرایش فقط دسته، فعالیت و مدت را عوض نمی‌کند. تغییر دستهٔ پیش‌فرض فعالیت فقط برای آینده اعمال می‌شود.

۶. طبقه‌بندی گروهی گذشته مسیر جدا دارد: پیش‌نمایش تعداد و بازه و دستهٔ هدف، تأیید صریح کاربر، سپس درج revision جدید. اجرای این رابط گروهی می‌تواند بعد از ۰.۲ باشد. migration به‌جای آن تصمیم نمی‌گیرد.

۷. خواندن ثبت قدیمی بدون سطر طبقه‌بندی باید با LEFT JOIN آن را unmapped تفسیر کند؛ نبود دسته دلیل پنهان‌کردن ثبت نیست.

این تاریخچه، تاریخچهٔ طبقه‌بندی است؛ ثبت کامل تمام ویرایش‌های فعالیت و زمان به سامانهٔ audit جدا نیاز دارد و در این نسخه ادعا نمی‌شود.

### ۱۴ ـ ۶. قرارداد زمان و پوشش

زمان شروع و پایان موجود به ISO UTC و بازهٔ [start,end) حفظ می‌شود. زمان اعلان، زمان انجام فعالیت و زمان recorded_at سه مفهوم متفاوت‌اند. ثبت دیرهنگام به روز زمان انجام فعالیت تعلق دارد.

در نسخهٔ ۰.۲، ثبت یک فعالیت برای کل بازه گزارش کاربر در همان دقت زمانی است؛ نباید به‌عنوان مشاهدهٔ دقیق ثانیه‌به‌ثانیه معرفی شود. تناوب یادآوری از طبقه‌بندی مستقل است.

ثبت جدید نباید با ثبت اصلی دیگر هم‌پوشانی نامعتبر ایجاد کند. ناسازگاری legacy علامت کیفیت داده می‌گیرد و حذف یا تصحیح خودکار نمی‌شود. قاعدهٔ قبلی تقسیم duration ذخیره‌شده به نسبت overlap برای مرز گزارش حفظ می‌شود؛ مغایرت duration با طول واقعی بازه نیز علامت کیفیت دارد.

| شاخص | قرارداد |
|---|---|
| سهم دسته | زمان ثبت‌شدهٔ آن دسته / کل زمان ثبت‌شدهٔ گزارش |
| پوشش طبقه‌بندی | زمان ثبت‌شده با دستهٔ معلوم / کل زمان ثبت‌شده |
| پوشش ثبت | زمان logged منطبق با slotهای کامل و معلوم / زمان همان slotها |
| پوشش روز | مدت اتحاد بازه‌های معتبر ثبت‌شده در روز / طول واقعی روز محلی |

برای پوشش ثبت، صورت و مخرج باید دقیقاً از دامنهٔ یکسان ledger باشند؛ legacy خارج ledger در صورت کسر قرار نمی‌گیرد. زمان skipped و pending جدا گزارش می‌شود. برای مخرج صفر، نسبت null و پیام «قابل محاسبه نیست» نمایش داده می‌شود.

پوشش روز کامل تنها در صورت محاسبهٔ صریح و کنترل کیفیت ارائه می‌شود؛ در ۰.۲ الزامی نیست. روز محلی در مناطق دارای تغییر ساعت الزاماً ۱۴۴۰ دقیقه نیست. timezone و مرز گزارش پارامترهای صریح هستند.

سیاست پیش‌فرض گزارش: یک timezone مشخص برای کل گزارش، با مقدار اولیهٔ منطقهٔ فعلی دستگاه؛ همان مقدار روی گزارش نمایش داده و هنگام مقایسه ثابت نگه داشته شود. metadata منطقهٔ هنگام فعالیت برای تحلیل آینده حفظ می‌شود؛ حالت ترکیبی «هر ثبت با منطقهٔ خودش» در ۰.۲ ارائه نمی‌شود. بازتولید یک گزارش ذخیره‌شده در آینده نیازمند نگهداری بازه، timezone و سیاست طبقه‌بندی آن است.

### ۱۴ ـ ۷. قرارداد گزارش ICATUS

هر entry فقط یک تخصیص current در هر scheme دارد. برای تجمیع سطح اول، از همان گره به یک جد سطح اول می‌رسیم و زمان را فقط یک بار جمع می‌کنیم. join به همهٔ revisionها یا جمع هم‌زمان والد و فرزند ممنوع است.

جمع ۹ بخش اصلی + طبقه‌بندی‌نشده = مجموع زمان logged گزارش، پیش از گردکردن. در گزارش سطح پایین‌تر، زمان دسته‌بندی‌شده فقط در والد با عنوان «جزئیات مشخص نشده» باقی می‌ماند و بین فرزندان توزیع نمی‌شود؛ این عنوان، کد رسمی جدید نیست.

داده‌های legacy با duration نامعتبر یا overlap همراه شاخص کیفیت ارائه می‌شوند؛ تساوی مجموع دسته‌ها تضمین سازگاری محاسبات است، نه اثبات صحت زمان واقعی. پارتوی فعالیت‌های شخصی و پارتوی دسته‌های ICATUS دو نمای جدا هستند.

گزارش معمول از آخرین تخصیص صریح هر ثبت استفاده می‌کند. تغییر پیش‌فرض بر آن اثری ندارد، اما اصلاح صریح دستهٔ همان ثبت می‌تواند گزارش گذشته را تغییر دهد و تاریخچهٔ اصلاح باقی می‌ماند. گزارش «مطابق دسته‌بندی در تاریخ معین» قابلیت آینده است و در رابط ۰.۲ وعده داده نمی‌شود.

### ۱۴ ـ ۸. baseline و ارتقاهای آینده

قاعدهٔ انتقال قبلی از v0.1 در این بازنگری لغو شده است. پنج جدول طبقه‌بندی/context و دو ستون ledger مستقیماً در baseline تازهٔ schema=3 ایجاد می‌شوند. backfill ثبت‌های v0.1 اجرا نمی‌شود؛ بنابراین ایجاد انبوه revision=1 برای گذشته جزء این release نیست.

هر ثبت جدید v0.2 در همان transaction یک context و یک تخصیص current، حتی unmapped، می‌گیرد. readهای دارای LEFT JOIN برای تحمل ناسازگاری و جلوگیری از پنهان‌شدن ثبت باقی‌اند.

از v0.2 به بعد هر تغییر schema migration افزایشی جدید می‌خواهد؛ شمارهٔ منتشرشده بازتعریف نمی‌شود. runner و fingerprint تنها مرجع تشخیص baseline هستند. نصب تازه را با reset نصب موجود یکی نگیریم.

### ۱۴ ـ ۹. مسیر توسعهٔ چندفعالیتی

در ۰.۲ قید UNIQUE(period_start) موجود دست‌نخورده می‌ماند. برای نسخهٔ بعد پیشنهاد افزودن entry_segments به‌عنوان فرزند time_entries با شناسهٔ مستقل، بازهٔ فرعی، activity_id و نقش primary/secondary است. در آن نسخه، طبقه‌بندی segment نیز هویت مستقل خواهد داشت و migration مخصوص خود را می‌خواهد.

تقسیم متوالی: اجزای primary هم‌پوشانی ندارند و مجموع مدت آن‌ها از پوشش واقعی ثبت بیشتر نمی‌شود. فعالیت هم‌زمان: secondary می‌تواند با primary هم‌پوشانی داشته باشد، اما در مجموع زمان سپری‌شده دوباره شمرده نمی‌شود؛ گزارش secondary جداست. گزارش زمان elapsed بر اتحاد بازه‌ها تکیه می‌کند.

این طراحی هزینهٔ توسعه را کاهش می‌دهد، اما ادعای «بدون migration در آینده» ندارد. از همین نسخه، screenها نباید SQL یا فرض یک‌به‌یک slot و فعالیت را پراکنده کنند؛ repository و سرویس ثبت مرز این فرض هستند. شناسهٔ پایدار entry مبنای ارتباطات جدید است؛ period_start صرفاً برای سازگاری ledger فعلی باقی می‌ماند.

### ۱۴ ـ ۱۰. تغییرات سطح فایل و تابع

| فایل پیشنهادی | مسئولیت |
|---|---|
| src/data/icatus2016.json | بستهٔ مرجع، نسخه و منشأ، پس از استخراج و کنترل |
| src/db/classificationRepository.ts | خواندن گره‌ها و نوشتن تخصیص نسخه‌دار |
| src/db/entryContextRepository.ts | زمینهٔ زمانی و provenance |
| src/services/classificationService.ts | validation، پیش‌فرض‌ها و اصلاح دسته |
| src/services/checkInService.ts | ثبت اتمیک entry + classification + context |
| src/services/reportService.ts | rollup، unmapped و پوشش‌های مستقل |
| src/db/migrations.ts | baseline تازه schema=3 و زیرساخت ارتقای حافظ داده از v0.2 به بعد |
| src/types/models.ts | Scheme، Node، Assignment، TimeContext و ReportQuality |
| src/components/ClassificationPicker.tsx | انتخاب کلی با جزئیات اختیاری |
| ActivityEditor / CheckInScreen / InsightsScreen | پیش‌فرض، اصلاح اختیاری دسته و گزارش |

| تابع پیشنهادی | قرارداد |
|---|---|
| validateClassificationDataset(dataset) | کدها، والدها، سطح‌ها، شمارش، نسخه و checksum؛ خطا پیش از نصب |
| setActivityDefault(activityId, schemeId, code, expectedRevision) | تغییر پیش‌فرض بدون لمس تاریخچه؛ تشخیص تعارض |
| assignEntryClassification(tx, input) | کنترل FK و revision؛ historical کردن قبلی و درج current جدید |
| resolveEntryClassification(entryId, schemeId) | تخصیص current یا unmapped؛ بدون حدس |
| resolveEntryTimeContext(slot, userContext) | زمینهٔ معلوم یا unknown؛ بدون استفادهٔ قطعی از timezone زمان تکمیل |
| getClassificationReport(range, timezone, schemeId, level) | totals، unmapped، coverage و qualityFlags |

قرارداد commitCheckIn از classificationSelection، revision مورد انتظار و context مطابق بخش۱۵.۱ پشتیبانی می‌کند. ایجاد ثبت بدون انتخاب دسته به پیش‌فرض یا unmapped می‌رسد؛ ویرایش ثبت موجود بدون revision لازم مجاز نیست. عملیات طبقه‌بندی و context متعلق به یک commitCheckIn نباید خارج تراکنش همان ثبت نوشته شوند؛ تغییر پیش‌فرض فعالیت تراکنش مستقل خود را در صف مشترک mutation دارد.

### ۱۴ ـ ۱۱. معیار پذیرش و آزمون‌های لازم

۱. ساخت تازهٔ baseline یک‌بار و حفظ همهٔ داده‌های v0.2 در آزمون migration افزایشی آینده؛ rollback و startup مجدد بدون reseed.

۲. رد بستهٔ دارای کد تکراری، والد نامعتبر یا شمارش مغایر؛ کنترل ترجمه بدون تغییر کد رسمی.

۳. تغییر پیش‌فرض «مطالعه» هیچ ثبت قدیمی را عوض نکند؛ ثبت بعدی پیش‌فرض جدید را بگیرد.

۴. تغییر صریح دسته، یک current و history معتبر باقی بگذارد؛ خطای میان دو write هیچ وضعیت نیمه‌کاره نسازد.

۵. ثبت جدید بدون دسته، legacy و فعالیت archived در totals باقی بمانند؛ جمع دسته‌ها و unmapped دقیقاً با totals برابر باشد.

۶. تخصیص به والد به فرزندان پخش نشود؛ اصلاحات تاریخی و join سلسله‌مراتبی مدت را تکثیر نکنند.

۷. مرز نیمه‌شب، روز تغییر ساعت، ثبت دیرهنگام پس از سفر، و timezone نامعلوم بدون جعل زمان تاریخی پردازش شوند.

۸. legacy خارج ledger باعث پوشش بیش از ۱۰۰٪ نشود؛ ناسازگاری زمان علامت کیفیت بگیرد.

۹. تغییر فعالیت یک ثبت، تخصیص current قبلی را به فعالیت جدید منتقل نکند؛ لغو تأیید هیچ write نداشته باشد.

۱۰. اولین v0.2 fresh نصب شود؛ build آزمایشی بعدی با همان امضا روی v0.2 نصب و حفظ داده تأیید شود.

این آزمون‌ها معیار طراحی‌اند و در این مرحله اجرا نشده‌اند.


## ۱۵. قرارداد نهایی ثبت، DDL و گزارش

### ۱۵.۱ ثبت، اصلاح و Undo

classificationSelection شامل inherit یا explicit(code|string|null) است. در ایجاد/تغییر activity، نبود selection یعنی inherit؛ در اصلاح همان فعالیت، نبود selection یعنی حفظ current. explicit(null) به معنای درخواست unmapped است و fallback ندارد. scheme فعال از metadata خوانده و اعتبار آن با scheme نصب‌شده کنترل می‌شود.

ایجاد ثبت expectedEntry=null و expectedClassificationRevision=null دارد؛ اگر رکوردی ظاهر شد conflict است. هر ویرایش ثبت موجود، snapshot entry را الزامی دارد. هر عملیاتی که تخصیص را عوض می‌کند، شامل تغییر activity یا inherit صریح، revision تخصیص را نیز الزامی دارد؛ نبود ورودی با null (انتظار نبود تخصیص) متفاوت است. context-only edit snapshot context را نیز کنترل می‌کند. UI متن stale را خودکار روی آخرین داده نمی‌نویسد.

ترتیب transaction: خواندن entry/current/context و تطبیق انتظار؛ validation فعالیت و بازه؛ برای ثبت جدید بررسی هم‌پوشانی با شرط `existing.period_start < new.end AND existing.period_end > new.start AND status='logged'`؛ نوشتن entry؛ سپس تخصیص و context؛ commit و refresh. اصلاح entry بدون تغییر زمان، دادهٔ ناسازگار قدیمی را حذف نمی‌کند و پرچم کیفیت آن باقی می‌ماند. ورودی زمان جدید باید finite، end>start و پایان‌یافته باشد.

تخصیص inherited_default علاوه بر default_revision، source_activity_id را ذخیره می‌کند. تغییر پیش‌فرض فقط آینده را تغییر می‌دهد. هر تغییر واقعی دسته یا منشأ، current قبلی را historical و revision بعدی را current می‌کند. supersedes باید همان entry و scheme و revision قبلی را هدف بگیرد. no-op یعنی یکسانی معنای کد، method، منشأ و نسخهٔ پیش‌فرض؛ نه صرفاً برابر بودن code. source_activity_id گذشته هرگز با activity جدید entry بازنویسی نمی‌شود.

ویرایش فقط دسته نباید activity، period، duration، recorded_at یا source ثبت اصلی را تغییر دهد؛ زمان تغییر دسته در assigned_at است. ویرایش فعالیت، period و duration را حفظ می‌کند و recorded_at/source را مطابق عملیات ثبت تغییر می‌دهد. در همهٔ این موارد context قبلی حفظ می‌شود مگر timeContextPatch صریح و معتبر وجود داشته باشد. context قبلاً user_confirmed به‌دلیل ویرایش عادی به unknown تنزل نمی‌یابد.

Undo انتخاب اجرایی: پس از ویرایش موفق یک ثبت موجود، دکمهٔ «بازگردانی» برای ۱۰ ثانیه نمایش داده می‌شود. فقط ویرایش activity/classification این scope را دارد، نه حذف ثبت تازه، archive یا تنظیمات. token در حافظه شامل before snapshot، after snapshot، entryId، scheme و revision مورد انتظار و deadline است؛ پس از بسته‌شدن برنامه از بین می‌رود. انقضا با ساعت monotonic در همان نشست سنجیده می‌شود.

undoEntryEdit ابتدا snapshot پس از edit را در transaction کنترل می‌کند؛ اگر داده دوباره تغییر کرده conflict است. مقادیر entry به before برمی‌گردند؛ برای تخصیص تغییرکرده، یک revision جدید با معنای تخصیص before و reason=undo ساخته می‌شود؛ تاریخچه حذف یا current قدیمی دوباره فعال نمی‌شود. assigned_at جدید است و method/source_activity/default_revision متناسب با تخصیص بازیابی‌شده حفظ می‌شوند. Undo context را تغییر نمی‌دهد؛ context editor در scope Undo فعلی نیست. شکست هر write کل عملیات را rollback می‌کند. undo entry از notification صف فعلی را به بازه‌ای دیگر هدایت نمی‌کند.

### ۱۵.۲ DDL کامل افزونهٔ ICATUS برای baseline

چهار جدول پایه و مدل idهای آن‌ها از SQL handoff گرفته می‌شوند. DDL ledger بخش۶.۲ پیش از این بلوک اجرا می‌شود؛ این بلوک SQL داخل سند است، نه migration اجراشده روی برنامه. همهٔ زمان‌ها ISO UTC؛ code همیشه TEXT است. سطرهای مرجع پس از validation بسته و والد پیش از فرزند درج می‌شوند.

```sql
ALTER TABLE expected_slots ADD COLUMN timezone_id TEXT;
ALTER TABLE expected_slots ADD COLUMN timezone_provenance TEXT
  CHECK (timezone_provenance IS NULL OR timezone_provenance IN
    ('captured_at_slot_creation','user_confirmed','unknown'));

CREATE TABLE classification_schemes (
  scheme_id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  edition TEXT NOT NULL,
  revision TEXT NOT NULL,
  source_url TEXT NOT NULL,
  dataset_sha256 TEXT NOT NULL CHECK(length(dataset_sha256)=64),
  installed_at TEXT NOT NULL
);
CREATE TABLE classification_nodes (
  scheme_id TEXT NOT NULL,
  code TEXT NOT NULL,
  parent_code TEXT,
  level INTEGER NOT NULL CHECK(level IN (1,2,3)),
  title_en TEXT NOT NULL,
  title_fa TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(scheme_id,code),
  FOREIGN KEY(scheme_id) REFERENCES classification_schemes(scheme_id) ON DELETE RESTRICT,
  FOREIGN KEY(scheme_id,parent_code) REFERENCES classification_nodes(scheme_id,code) ON DELETE RESTRICT,
  CHECK((level=1 AND parent_code IS NULL) OR (level IN (2,3) AND parent_code IS NOT NULL))
);
CREATE TABLE activity_classification_defaults (
  activity_id INTEGER NOT NULL,
  scheme_id TEXT NOT NULL,
  code TEXT,
  revision INTEGER NOT NULL CHECK(revision>=1),
  updated_at TEXT NOT NULL,
  PRIMARY KEY(activity_id,scheme_id),
  FOREIGN KEY(activity_id) REFERENCES activities(id) ON DELETE RESTRICT,
  FOREIGN KEY(scheme_id) REFERENCES classification_schemes(scheme_id) ON DELETE RESTRICT,
  FOREIGN KEY(scheme_id,code) REFERENCES classification_nodes(scheme_id,code) ON DELETE RESTRICT
);
CREATE TABLE entry_classifications (
  id INTEGER PRIMARY KEY,
  entry_id INTEGER NOT NULL,
  scheme_id TEXT NOT NULL,
  code TEXT,
  revision INTEGER NOT NULL CHECK(revision>=1),
  is_current INTEGER NOT NULL CHECK(is_current IN (0,1)),
  supersedes_id INTEGER,
  method TEXT NOT NULL CHECK(method IN
    ('inherited_default','user_selected','user_reclassified','unmapped')),
  source_activity_id INTEGER,
  default_revision INTEGER,
  assigned_at TEXT NOT NULL,
  reason TEXT,
  UNIQUE(entry_id,scheme_id,revision),
  FOREIGN KEY(entry_id) REFERENCES time_entries(id) ON DELETE RESTRICT,
  FOREIGN KEY(scheme_id) REFERENCES classification_schemes(scheme_id) ON DELETE RESTRICT,
  FOREIGN KEY(scheme_id,code) REFERENCES classification_nodes(scheme_id,code) ON DELETE RESTRICT,
  FOREIGN KEY(source_activity_id) REFERENCES activities(id) ON DELETE RESTRICT,
  FOREIGN KEY(supersedes_id) REFERENCES entry_classifications(id) ON DELETE RESTRICT,
  CHECK((code IS NULL AND method='unmapped') OR
        (code IS NOT NULL AND method<>'unmapped')),
  CHECK((method='inherited_default' AND source_activity_id IS NOT NULL
      AND default_revision IS NOT NULL AND default_revision>=1) OR
        (method<>'inherited_default' AND source_activity_id IS NULL
      AND default_revision IS NULL)),
  CHECK((revision=1 AND supersedes_id IS NULL) OR
        (revision>1 AND supersedes_id IS NOT NULL))
);
CREATE UNIQUE INDEX idx_entry_classification_current
  ON entry_classifications(entry_id,scheme_id) WHERE is_current=1;
CREATE INDEX idx_entry_classification_report
  ON entry_classifications(scheme_id,is_current,code,entry_id);
CREATE TABLE entry_time_context (
  entry_id INTEGER PRIMARY KEY,
  timezone_id TEXT,
  utc_offset_start_minutes INTEGER,
  provenance TEXT NOT NULL CHECK(provenance IN
    ('captured_at_slot_creation','user_confirmed','unknown')),
  captured_at TEXT NOT NULL,
  FOREIGN KEY(entry_id) REFERENCES time_entries(id) ON DELETE RESTRICT,
  CHECK((provenance='unknown' AND timezone_id IS NULL AND utc_offset_start_minutes IS NULL)
    OR (provenance<>'unknown' AND timezone_id IS NOT NULL AND utc_offset_start_minutes IS NOT NULL))
);
```

سرویس validation افزون بر CHECKها: رابطهٔ سطح parent، نبود چرخه، تمامیت بسته، اعتبار IANA و offset، تعلق supersedes به همان entry/scheme و revision-1، و دقیقاً یک current را کنترل می‌کند. index حداکثر یک current را تضمین می‌کند؛ سرویس حداقل یک را برای ثبت موفق تأمین می‌کند. برای timezone ledger، جفت NULL/unknown بدون id یا provenance معلوم همراه id معتبر مجاز است؛ حالت ناسازگار رد می‌شود.

default_revision به جدول defaults FK نمی‌شود، زیرا default قابل تغییر است ولی snapshot تخصیص باید باقی بماند. source_activity_id + default_revision + code تصویر منشأ هنگام ثبت است؛ تاریخچهٔ کامل تمام ویرایش‌های default یا نام activity ادعا نمی‌شود.

dataset_sha256 بر bytes canonical محتوای رسمی بسته (بدون فیلد checksum خود و ترجمه) محاسبه می‌شود. نسخهٔ ترجمه و sha256 فایل canonical ترجمه در icatus_fa_translation_manifest است؛ title_fa projection همان ترجمه است و نسخه‌اش به کل بسته تعلق دارد. نبود ترجمه یک گره با title_en نمایش داده می‌شود. تغییر ترجمه معنی کد رسمی را تغییر نمی‌دهد. هیچ sha256 یا revision رسمی حدس زده نمی‌شود؛ نبود بستهٔ معتبر پیش از ایجاد baseline خطاست.

### ۱۵.۳ الگوریتم baseline و migrationهای آینده

در نصب خالی، یک transaction همهٔ جدول‌ها و indexها را می‌سازد، ICATUS:2016 را نصب می‌کند، metadata و فعالیت‌های آغازین را seed می‌کند، fingerprint/FK را کنترل و user_version=3 را ثبت می‌کند. چون دادهٔ گذشته‌ای منتقل نمی‌شود، backfill دسته یا context وجود ندارد. خواندن baseline موجود no-op است. برای upgrade آینده backup و migration نسخه‌دار الزامی است؛ هویت این schema پس از release ثابت خواهد بود.

### ۱۵.۴ زمینهٔ زمانی

timezone slot منطقهٔ برنامه‌ریزی است و اثبات حضور فیزیکی کاربر نیست. در ثبت جدید، resolveEntryTimeContext منشأ را حفظ می‌کند؛ در تعارض سفر، بدون تأیید معتبر unknown ذخیره می‌شود. ثبت روزمره سؤال زمینه‌ای اجباری ندارد. در ویرایش همان entry زمینهٔ قبلی عیناً می‌ماند. اصلاح صریح زمینه، validation و snapshot مورد انتظار خود را می‌خواهد. گذشته برای اصلاح metadata بازتولید نمی‌شود.

### ۱۵.۵ snapshot و گزارش

getReport یک read transaction روی connection خواندن مشخص باز می‌کند و همهٔ entries، current classifications، context، ledger و metadata لازم را از همان snapshot می‌خواند. سپس transaction آزاد و محاسبه روی DTOهای خوانده‌شده انجام می‌شود. queryهای خارج آن connection جزو snapshot نیستند. دو دورهٔ مقایسه نیز با timezone و now ثابت از یک snapshot خوانده می‌شوند؛ تغییر دسته وسط گزارش نباید بین totals و buckets اختلاف بسازد.

ReportResult شامل totals، pareto، daily، coverage، qualityFlags و classificationReport اختیاری با schemeId، level، timezone، buckets، unmappedMinutes و classificationCoverage است. UI سطح۱ را تحویل می‌دهد؛ UI تفصیلی سطح۲/۳ الزامی نیست.

وزن هر entry برای گزارش فعالیت و ICATUS یکسان است؛ join به current و LEFT JOIN نبود دسته؛ جمع buckets+unmapped=total قبل از گردکردن. coverage از اتحاد بازه‌های logged در تقاطع با دامنهٔ slotهای کامل و معلوم محاسبه می‌شود و مدت ناسازگار ذخیره‌شده به‌عنوان elapsed استفاده نمی‌شود. بازهٔ غیرقابل محاسبه/مدت منفی با qualityFlag و excludedEntryIds مشخص و از هر دو تجمیع یکسان کنار گذاشته می‌شود؛ رکورد DB حفظ می‌شود. overlap دادهٔ قدیمی در totals علامت می‌خورد؛ coverage با اتحاد زمان دوباره‌شماری ندارد. مخرج صفر=null. گزارش as-of تاریخی هنوز خارج UI نسخهٔ۰.۲ است.

### ۱۵.۶ gateهای اجرای واقعی

سورس handoff در دسترس و شناسه‌ها INTEGER هستند. پیاده‌سازی بعدی باید dependencyهای واقعی را نصب و lockfile را تثبیت کند؛ signing پایدار را از v0.2 برقرار کند؛ بستهٔ رسمی/ترجمه را استخراج و validate کند؛ و قابلیت انتقال scheduler بخش۸ را بررسی کند. هیچ‌یک از این موارد با نوشتن سند «انجام‌شده» محسوب نمی‌شود. نبود کلید v0.1 یا تطبیق گوشی مانع این مسیر fresh نیست.

## ۱۶. منابع ICATUS

- [تعاریف و کدهای رسمی](https://unstats.un.org/unsd/demographic-social/time-use/icatus-2016/)
- [ساختار و هدف استاندارد](https://unstats.un.org/unsd/classifications/Family/Detail/2083)
- [معرفی رسمی](https://desapublications.un.org/publications/international-classification-activities-time-use-statistics-2016)

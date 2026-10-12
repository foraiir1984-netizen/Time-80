# RC3-ID-01 — checkpoint ناقص، منتظر مرجع تخصیص

تاریخ: 2026-10-11. این سند تحویل کامل یا پذیرش AC-ID نیست.

## مبنا و مانع

HEAD شروع و جاری: `ffa7bfc1dcb18c747611d585553bed4d4e4d5359`، شامل FIX01/FIX02؛ checkout کامل قبلی و working tree شروع clean. نسبت با مبنای دفتر 0/0 و SHA شاخهٔ FIX02 در origin دوباره خوانده شد. شاخهٔ محلی تازه: `rc3-id01-ui-identifiers`؛ هنگام کنترل remote شاخهٔ هم‌نام وجود نداشت. checkout قدیمی work و RC2 مبنای اجرا نیستند.

جدول کامل توافق‌شدهٔ A01…A12، D01…D07 و X01…X98 و متن AC-ID-01…10 در context قابل‌دسترسی، ضمیمه‌های دانلودشده و اسناد موجود پیدا نشد. checkpoint جدید فقط به آن‌ها ارجاع می‌دهد. برای شماره‌ها/معناهای غایب تخصیص حدسی انجام نشد؛ درخواست متن یا مسیر دقیق مرجع برای محصول ارسال شده و پاسخ هنوز دریافت نشده است.

## بخش مستقل انجام‌شده

- `src/components/uiIdentifiers.ts`: registry UI با کلید معنایی، تخصیص صریح، نام/اثر فارسی، نوع، محل و وضعیت. نسخه عمداً `RC3-ID-01-reference-incomplete.1` و `referenceComplete=false` است. فقط پنج تخصیص فعال صریح X69/X70/X71/X72/X75 و چهار رزرو صریح D08/X99/X100/X101 مدخل کامل دارند.
- کدهای ICATUS که پرامپت صریحاً رزرو کرده، همراه چهار رزرو بعدی، guard منع فعال‌سازی دارند؛ برای نام/اثر فردی غایب آن‌ها مدخل ساختگی ایجاد نشد. سابقهٔ تخصیص و کدهای بازنشستهٔ جدول غایب هنوز باید بازیابی شود.
- `App.tsx`: X75 از همان registry گرفته می‌شود. نام، handler، guardها، خطاهای مستقل و route/dismiss/ack قبلی حفظ شدند.
- `NotificationDiagnosticsScreen.tsx`: کد X69/X70/X71/X72 داخل Buttonهای موجود، بدون تغییر عنوان/handler یا چرخهٔ read/action/focus/resume.
- `Ui.tsx`: badge غیرتعاملی 14sp، scaling و LTR مستقل؛ اتصال داخل target مشترک Button و wrap قبلی. opacity کل target کددار حذف شده تا کنتراست کد در pressed/disabled کاهش نیابد؛ disabled با border مشخص و همچنان native-disabled است. Button بدون کد رفتار opacity قبلی را دارد. نوع actionCode به تخصیص فعال registry محدود شد.
- `scripts/generate-ui-code-guide.ts`: راهنمای Markdown و CSV از همان registry؛ خروجی‌های `RC3_UI_Code_Guide_FA.*` صریحاً پیش‌نویس ناقص‌اند. فرمان: `node --import tsx scripts/generate-ui-code-guide.ts docs/v0.3`.
- `tests/v03UIIdentifiers.test.tsx`: شش تست رفتاری/قراردادی تازه، با ماژول واقعی diagnostics و host/native/navigation doubles زیرساخت موجود. حضور کد در UI از renderer بررسی شده؛ وجود مدخل registry به‌تنهایی شاهد نمایش نیست.

130 محل واقعی عنوان/کنترل/پنجره/Alert از AST سورس استخراج شد؛ `rc3-id01/source-controls.json` فهرست محل‌هاست، نه جدول تخصیص توافق‌شده و نه تضمین پوشش runtime کامل. `rc3-id01/coverage.csv` محدودهٔ کدهای درخواست‌شده را با Implemented/Reserved/Pending نشان می‌دهد. موارد Pending به مرجع و اجرای باقی پوشش نیاز دارند؛ coverage کامل در تمام محل‌های تکراری هنوز حاصل نشده است.

## آزمون و حدود شاهد

| مورد | نتیجه | فرمان / شاهد |
| --- | --- | --- |
| TypeScript | Pass | `npm run typecheck`، exit0، rc3-id01/typecheck.log |
| suite کامل UTC | Pass | `TZ=UTC npm test`، 92/92، fail0/skip0؛ 86 تست قبلی +6 تازه؛ rc3-id01/npm-test-UTC.log |
| تست‌های تازه و رگرسیون مرتبط Tehran | Pass | `TZ=Asia/Tehran node --import ./tests/register.mjs --import tsx --test tests/v03UIIdentifiers.test.tsx tests/v03LifecycleUI.test.tsx tests/v03ResponseUI.test.tsx tests/v03Notifications.test.ts tests/v03UI.test.tsx`، 62/62، skip0؛ rc3-id01/related-Asia-Tehran.log |
| pin تخصیص موجود، duplicate/retired collision، نوع و منع رزرو فعال | Pass | تست registry؛ فقط بخش مرجع فعلاً موجود، نه سابقهٔ غایب |
| registry/راهنمای تولیدشده/نمایش X69–72 و X75 | Pass | خروجی واقعی راهنما برابر generator؛ diagnostics در loading/read-failure/success، X75 در حالت‌های FIX01/FIX02 |
| target واحد، callback واحد، label کامل، contrast رنگ، RTL و تنظیم scale1/1.5/2 | Pass | renderer و محاسبهٔ رنگ؛ disabled native prop بررسی شد، native touch dispatch/اندازه‌گیری واقعی اجرا نشد |
| اجرای اولیهٔ تست تازه | Fail، اصلاح زیرساخت تست | 91/92؛ dynamic import پورت AppState نمونهٔ متفاوتی از double ایجاد می‌کرد؛ import ثابت مانند تست‌های موجود جایگزین شد. محصول برای آن تغییر نکرد. npm-test-initial-UTC.log حفظ شد |
| suite با TZ unset / fixture progress تهران | Not run در این checkpoint | Known Issueها و Failهای تاریخی FIX01/FIX02 محفوظ؛ هیچ skip یا تغییر منطق/انتظار تست انجام نشد |
| پوشش تمام صفحات/پنجره‌ها/اقدامات توافق‌شده | Not run / Pending | مرجع کامل غایب؛ handlerها و کدهای نامشخص هنوز وصل نشده‌اند |
| layout گوشی، تصاویر واقعی و اندازه‌گیری48×48 در scale1/1.5/2 | Not run | adb، emulator و پروژهٔ native Android موجود نیست؛ renderer پذیرش بصری گوشی نیست |
| TalkBack و پذیرش دستگاهی P03-015/P03-016 | Not run / Deferred | نیازمند دستگاه و build معلوم؛ دریافت اعلان اثبات نشده است |

کد آزمون‌شده HEAD مبنا **به‌اضافهٔ تغییرات ثبت‌نشدهٔ این checkpoint** است؛ SHA مبنا، SHA commit تحویل این تغییرات نیست. hash فایل‌های source/tests/guide و نتایج فرمان‌ها در `rc3-id01/validation-record.json` ثبت می‌شود. commit تحویل و push هنوز انجام نشده‌اند؛ شاخهٔ جدید فقط محلی است و لینک remote برای آن ارائه نشده است.

## موارد باز

پوشش کامل A/D/X، header/tab/icon/input/switch/Alert و محل‌های تکراری، بررسی تمایز route/scope/autosave با جدول مرجع، جدول پوشش نهایی، سوابق بازنشستگی و متن AC-ID منتظر مرجع‌اند. پذیرش نهایی AC-ID باز است.

ICATUS در سورس میانی **pending hide** است؛ guard رزرو شاهد حذف رابط نیست و این وضعیت برای RC3 نهایی قابل‌قبول نیست. UI طبقه‌بندی، schema/data/default/snapshot/assignment/history، scheduler/manifest/SDK، query/navigation/validation/Undo و وابستگی‌ها تغییر نکردند. چهار بازطراحی، دارایی‌ها، countdown Undo و مراحل بعد اجرا نشدند. گزارش‌های تاریخی FIX01/FIX02 دست‌نخورده‌اند.

کوچک‌ترین قدم بعدی: دریافت متن جدول‌های توافق‌شده و AC-ID-01…10، سپس تکمیل همین شاخه، بازآزمایی تغییرات جدید، بررسی diff/شواهد و commit/push مجاز. این checkpoint ناقص به‌عنوان تحویل کامل منتشر نشده است.

# RC3-FIX-01 — اصلاح محدود بازخورد X75

تاریخ: 2026-10-11، Asia/Tehran. وضعیت: پیاده‌شده و آزمون خودکار انجام‌شده؛ پذیرش روی گوشی باز است. نسخهٔ تحویل Git: rc3-fix01-x75. snapshotهای آزمون در JSONها پیش از commit ثبت شده‌اند؛ SHA نهایی و تأیید مستقل ارسال در پاسخ تحویل ارائه می‌شود. انتشار انجام نشده است.

## درخواست و منابع

پرامپت ۴ِ صریح کاربر درخواست اجرایی این مرحله است. IMPLEMENTATION_STATE_RC3.md پیوست، مرجع وضعیت گزارش‌شدهٔ قبلی است و به‌تنهایی دستور انجام سایر اصلاحات نیست. گزارش RC3-QA-01 و شواهد محلی، Handoff/D03-005، الحاقیهٔ شناسه‌ها و RC2 QA/Triage استفاده شدند. AGENTS.md قابل اعمال در workspace یا tree هدف یافت نشد. Library در دسترس فرض نشده است.

## مبنای Git و checkout

- checkout اصلی /workspace/Time-80: branch work، HEAD شروع و پایان 5c45240ab1dc967cfbbabcdede73b27bb0f468e8؛ clean ابتدا/انتها، بدون تغییر index.
- شاخهٔ remote feat/time80-v0.3-implementation در کنترل تازهٔ ابتدا و انتها: 8e1cef5c0bdf0d471a0ed6cfbd02872b127f7634؛ تغییر جدیدتری روی آن نبود.
- مقایسهٔ تازه: ahead10/behind0؛ merge-base برابر HEAD محلی. این نتیجه مجدداً خوانده شد، صرفاً از گزارش قبل نقل نشد.
- checkout اجرا: /workspace/work/rc3-fix01/repo؛ branch rc3-fix01-x75؛ HEAD شروع و snapshot زمان آزمون برابر RC2 بالا؛ source/tests diff آزمون‌شده همراه این گزارش برای commit آماده است.
- git ls-remote در sandbox اولیه به خطای اتصال proxy8080 رسید. یک clone محلی مجزا ساخته شد؛ همهٔ 300 blob از اتصال GitHub به‌صورت base64 دریافت و hash-verified شدند، treeهای HEAD و 10 commit مسیر ancestry با SHA دقیق وارد شدند. tree نهایی 3321191eb5a23f4dd0bab88220d12258dd15b249؛ تمام 300 فایل tracked، شامل lockfile/dataset/assets/native/scripts حاضر و قبل از ویرایش clean بودند. treeهای تاریخی میانی دانلود نشدند؛ این محدودیت تاریخچه است، نه فقدان فایل‌های checkout جاری.
- dependency با npm ci و lockfile موجود نصب شد (505 package)؛ postinstall patch تأیید شد. package.json و package-lock.json تغییر نکردند. نسخه یا امضا/applicationId تغییر نکرد.
- artifact قابل انتقال source/tests: rc3-fix01/RC3-FIX-01-source-tests.patch؛ SHA256: e8355470be59a57ce878dc7ef95aa8fe242542ccfe9a4ad548572dd8ad5071ca. git apply --check روی worktree دست‌نخوردهٔ همان baseline Pass شد.

## تغییر واقعی

App.tsx: خطای responseError از state مستقل init/reconcile جدا شد؛ X75 به retryResponse متصل است؛ متن فارسی، کد visible X75، بازخورد processing و پایان/عدم امکان retry دارد. موفقیت تنها خطای پردازش پاسخ را پاک می‌کند. version/run guard و guard عمر component، نتیجهٔ قدیمی را از نوشتن روی نتیجهٔ جدید منع می‌کنند. pendingResponses در همان دو محل قبلی خوانده می‌شود؛ X75 fetch یا عملیات جدیدی انجام نمی‌دهد. موفقیت navigation پیام متعلق به نمای قبلی را خاتمه می‌دهد.

src/notifications/notificationResponseService.ts: نتیجهٔ typed شامل status/runId/processed/routed/pending اضافه شد؛ callback اختیاری state، شروع/پایان run واقعی را گزارش می‌کند. enqueue و setReady همان drain را خودکار اجرا می‌کنند و callerهای قدیمی بدون callback همچنان پشتیبانی می‌شوند. ترتیب resolve→route→dismiss→ack و pending/done و علامت مرحله‌های موفق حفظ شد. شکست dismiss همچنان به پاسخ بعدی می‌رود؛ شکست resolve/route/ack همان توقف قبلی را دارد.

فایل‌های تست:
- tests/v03Notifications.test.ts: هفت تست واقعی ماژول برای پنج وضعیت، resolve/route/dismiss/ack failures، حفظ مراحل و دو پاسخ/diagnostic افزوده شد.
- tests/v03ResponseUI.test.tsx: هشت تست actual App/Button handler/coordinator/resolver با React renderer و SQLite آزمون، برای متن فارسی، مالکیت خطا، navigation، no-write و freshness افزوده شد.
- tests/app-navigation.mjs (جدید)، tests/navigation.mjs، tests/register.mjs: hostهای native/navigation برای mount شدن App در زیرساخت Node موجود فراهم شدند؛ screen مقصد در این host double رندر نمی‌شود.
- tests/notifications.mjs، tests/notificationPlatform.mjs، tests/react-native.mjs: listener/IO قابل کنترل و Switch host برای import واقعی App. این تغییرها فقط در tests هستند.

## قبل و بعد X75

| وضعیت | قبل | بعد |
| --- | --- | --- |
| صف خالی و ready | بازگشت بی‌نتیجه و بی‌متن | empty؛ «پاسخ اعلانی برای تلاش دوباره در صف نیست.» |
| not-ready | بی‌نتیجه، صف باقی | not-ready؛ «برنامه هنوز برای بازکردن پاسخ اعلان آماده نیست.»؛ صف/خطای مستقل حفظ |
| running / لمس مکرر | بازگشت خاموش | running؛ «در حال پردازش پاسخ اعلان…»؛ عملیات مضاعف ایجاد نمی‌شود |
| پایان موفق بدون navigation جدید | حذف از صف، خطای UI ممکن بود بماند | success؛ «پاسخ اعلان پردازش شد.»؛ فقط responseError پاک |
| navigation پذیرفته‌شده | feedback تعریف نشده | بازخورد Retry نمای قبلی حذف؛ مسیر مقصد همان CheckIn یا NotificationResolution |
| شکست | callback error در state مشترک | failure و responseError جدا؛ «پردازش پاسخ اعلان کامل نشد؛ دوباره تلاش کنید.»؛ retry مرحله‌های موفق را تکرار نمی‌کند |

متن موفقیت دربارهٔ پردازش پاسخ است؛ تحویل اعلان، permission یا repair را ادعا نمی‌کند. X69 درخواست permission، X70 OS settings و X72 reconcile تغییر نکردند. registry کامل اجرا نشده؛ تنها کد همین کنترل X75 کنار عنوان فعلی دیده می‌شود.

## آزمون‌ها و حدود شاهد

| فرمان/بررسی | نتیجه | شاهد |
| --- | --- | --- |
| npm ci --no-audit --no-fund --fetch-retries=0 --fetch-timeout=10000 --proxy=http://proxy:8080 --https-proxy=http://proxy:8080 --cache=/workspace/work/rc3-fix01/npm-cache | Pass | 505 package؛ Verified expo-notifications57.0.20 patch؛ با دسترسی شبکهٔ محیط، بدون upgrade |
| npm run typecheck | Pass | tsc --noEmit؛ exit0 پس از تکمیل تغییرات |
| npm test، TZ از ابتدا unset | Fail | 58/59 در اجرای اولیه؛ تست قدیمی visualIntegration timezone را به رشتهٔ undefined برمی‌گرداند؛ typecheck اولیه نیز نوع‌های test double جدید را پیدا کرد و با JSDoc اصلاح شد |
| node --import ./tests/register.mjs --import tsx --test tests/visualIntegration.test.tsx در baseline دست‌نخورده، TZ unset | Fail | 6/7؛ همان SQLite parameter2/undefined در migrations؛ baseline-visualIntegration.log |
| TZ=UTC npm test، diff نهایی | Pass | 60/60؛ fail0/cancelled0/skipped0؛ npm-test.log |
| node --import ./tests/register.mjs --import tsx --test tests/v03Notifications.test.ts | Pass | 17/17؛ ماژول واقعی، نه بدنهٔ کپی‌شده |
| node --import ./tests/register.mjs --import tsx --test tests/v03ResponseUI.test.tsx | Pass | اجرای جدا قبل از افزودن تست resolved:7/7؛ اجرای نهایی suite شامل8/8 |
| git diff --check و git apply --check patch روی baseline | Pass | خطای whitespace در diff جدید نیست؛ patch10فایل source/tests قابل اعمال |
| screenshot واقعی / Android / native runtime / upgrade | Not run | adb/emulator/build نصب‌شدهٔ RC3 موجود نیست؛ تصویر ساختگی تولید نشد |

پوشش suite نهایی: v03Notifications17، v03ResponseUI8، v03UI5، visualIntegration7، v03Data9 و14 تست سایر بخش‌ها، جمع60. 15 تست جدید افزوده شده است. فرض TZ=UTC فقط برای بازتولید suite در process آزمون است؛ timezone محصول/دستگاه/داده کاربر تغییر نکرد. تست قدیمی visualIntegration در این task دست‌کاری نشد.

محدودیت: واقعی‌بودن ماژول App و handler به معنای لمس روی گوشی نیست. native ports/navigation hosts double هستند؛ DB دادهٔ آزمون است. خطای init هنگام not-ready حفظ شد؛ در معماری فعلی init شکست‌خورده اجازهٔ run موفق پاسخ را نمی‌دهد. پس از bootstrap retry مستقل، موفقیت X75 حفظ خطای reconcile را اثبات کرد. این نتایج پذیرش دستگاهی P03-016 یا تحویل Android نیستند.

## گزارش و فایل‌های قابل انتقال

- docs/v0.3/RC3_QA_Retest_Report.md: مستقل از RC2؛ device rows همگی Not run، بخش خودکار FIX01 جدا.
- docs/v0.3/IMPLEMENTATION_STATE_RC3.md: checkpoint جدید، baseline/HEAD/diff/tests/limits/next.
- docs/v0.3/rc3-fix01/: patch، validation-record.json، checkout-verification.json، patch-info.json، logها و شواهد قبلی.
- docs/v0.3/rc3-fix01/rc3-qa-01/: run_probes.mjs، probe-results.json، validation-record.json قبلی؛ موجود و کپی بدون تغییر. این probeها در FIX01 جایگزین suite واقعی نشده‌اند و دوباره اجرا نشده‌اند.

## موارد باز و توقف

P03-016 device acceptance باز؛ P03-014/P03-015/P03-019، OI-A01-R/OI-P01/AC-A11 بسته نشده‌اند. چهار UI، registry کامل، ICATUS hide، schema/assignment/history، scheduler، Undo countdown و TalkBack در این مرحله اجرا نشدند. ICATUS تصمیم پنهان‌سازی پابرجا و حفظ سیاست/داده فعلی لازم است؛ هیچ تغییر assignment از گزارش قبلی اجرا نشده است. TalkBack Deferred/Not run.

کوچک‌ترین قدم بعدی: با دستور جدا، چرخهٔ خطای reconcile/resume و refresh diagnostics برای P03-015، با مالکیت خطا و guard پاسخ جدید؛ بدون force عمومی scheduler. تست واقعی X75 روی build شناخته‌شده برای بستن بخش دستگاهی P03-016 لازم است. پیاده‌سازی در همین محدوده توقف کرده است؛ الحاقیهٔ صریح تحویل، commit/push در rc3-fix01-x75 را مجاز کرده است. build/release/اصلاح بعدی انجام نشده است.

## الحاقیهٔ تحویل Git

پیش از ثبت، status/diff و فایل‌های متنی مرتبط بررسی شدند. کنترل تازهٔ origin نشان داد rc3-fix01-x75 موجود نیست و مبنای RC2 همان 8e1cef5c0bdf0d471a0ed6cfbd02872b127f7634 است. تنها source/tests و گزارش‌ها، patch و شواهد متنی مرتبط برای ثبت انتخاب شدند. فایل خام git-preflight.json شامل metadata شخصی commitهای تاریخی است؛ برای حداقل‌سازی اطلاعات به scratch خارج Git منتقل شد و در manifest این تحویل نیست. کلید، token یا credential در فایل‌های انتخاب‌شده یافت نشد. ZIP بسته، APK، node_modules و فایل حساس وارد commit نمی‌شوند. وضعیت تاریخی uncommitted در validation-record.json و patch-info.json عمداً حفظ شده است؛ مرجع تحویل، commit این نسخه است.

شاخهٔ مقصد: https://github.com/foraiir1984-netizen/Time-80/tree/rc3-fix01-x75 . تأیید ارسال باید با خواندن مجدد remote انجام شود؛ این متن به‌تنهایی شاهد موفقیت push نیست.

نسخهٔ npm-test.log برای ثبت Git فقط از whitespace انتهای خطوط پاک‌سازی شد؛ متن نتایج تغییر نکرد و log خام در scratch خارج Git حفظ شد. SHA256SUMS.json هش نسخه‌های همین تحویل را دارد.

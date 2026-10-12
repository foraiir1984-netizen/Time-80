# ساختار شواهد RC3-ICATUS-HIDE-01 — Rev01

مبنای تحویل50a54992a2b28690b73755a7848319b533c12e69؛ سورس آزمون‌شده3ecbd2910f65733b69ac62d6cd32d941062c94e9. commit تحویل بعدی فقط مستندات/شواهد دارد؛ SHA کامل تحویل در پاسخ نهایی و Git commit حاوی این سند خوانده شود. manifest نهایی تفاوت با سورس آزمون را کنترل می‌کند.

- `../RC3_ICATUS_HIDE_01_Report_Rev01_FA.md`: نتیجه، محل‌های قبل/بعد، قرارداد داده، تست، محدودیت و قدم بعدی.
- `../RC3_UI_Code_Guide_FA.md` و CSV: تولید از registry RC3-ID-01-Rev03؛۱۲۲ تخصیص ثابت،۱۰۸ فعال،۱۴رزرو.
- `RC3_UI_Coverage_Rev01_FA.md`، `coverage-Rev01.csv` و `current-source-uses.json`: محل‌های فعلی و status همراه شاهد مستقل؛ جدول قبلی ID01 دست‌نخورده و تاریخی است.
- `rendered-code-evidence-UTC.json` و `rendered-code-evidence-Tehran.json`: جریان‌های واقعی module UI/Alert، با native/OS/navigation doubles؛ هیچ‌کدام تصویر یا layout گوشی نیستند.
- `test-results-Rev01.csv`: نتیجهٔ هر آزمون در اجراهای نهایی و مقایسهٔ مبنا؛ command/SHA/timezone/log/حد شاهد.
- `final-Rev01/validation-record.json`: اجرای نهایی، SHA، تعداد/exit، وضعیت Android و محدودیت‌ها.
- `final-Rev01/tested-source-manifest.json`: hash۹۵ فایل آزمون‌شده و تطابق با source commit؛ `protected-files.json`:۹۱ فایل حفاظت‌شدهٔ برابر با مبنا.
- logهای typecheck/UTC/Tehran/baseline-policy نهایی جدا از initial-new-tests و round2 هستند؛ نتایج اولیه شاهد پایان نیستند.
- baseline/current-core-Asia-Tehran.log شکست یکسان fixture interval را حفظ می‌کنند؛ initial-broad-Asia-Tehran.log اجرای99/100 اولیه است. هیچ skip/تغییر انتظار یا سیاست محصول برای آن اجرا نشده.
- `inputs/IMPLEMENTATION_STATE_RC3_Rev04.md`: ضمیمهٔ دفتر، عیناً حفظ‌شده؛ checkpoint ورودی، نه درخواست اجرایی تازه.
- `screenshot-plan-Rev01.json`: برنامهٔ Android؛ وضعیت Not run، بدون تصاویر تولیدشده. TalkBack Deferred / Not run؛ پذیرش گوشی P03-015/P03-016 همچنان باز و الزامی.

سوابق FIX01/FIX02/ID01/RC2 و history تخصیص‌ها بازنویسی نشده‌اند. فایل‌های حساس/APK/ZIP/node_modules وارد Git نمی‌شوند. logها متن خام stdout/stderr هستند؛ whitespace هشدار قدیمی patch به صورت اصلی حفظ می‌شود و از check قالب سورس مستثنا است.

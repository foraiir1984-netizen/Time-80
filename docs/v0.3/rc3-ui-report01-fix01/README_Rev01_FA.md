# شواهد RC3-UI-REPORT-01-FIX01 — Rev01

گزارش اصلی: [RC3_UI_REPORT_01_FIX01_Report_Rev01_FA.md](../RC3_UI_REPORT_01_FIX01_Report_Rev01_FA.md).

- سورس نهایی آزمون‌شده: `34f215a04cf74c5795da74e5679082c37af71bd2`؛ commit بعدی فقط docs/evidence است.
- `validation-record.json`: فرمان کامل، SHA، clock، exit code و شمارش هر اجرا. `test-results-Rev01.csv`: نتیجهٔ تک‌آزمون و موارد Not run.
- `tested-source-manifest.json`: hash۳۰۸فایل آزمون‌شده. `source-review.json`:۳۰۵فایل حفاظت‌شده عین مبنا،سه فایل تغییرکرده و شناسه‌های ثابت.
- `coverage-delta-Rev01.csv`: قبل/بعد محدودهٔ اصلاح؛ registry،guide/CSV و۱۳۹binding تغییری ندارند.
- `sources-read.json`: مسیر و hash منابع واقعی؛ `runtime-check.json`: نبود Android و شواهد native؛ تصویر گوشی وجود ندارد.
- `initial-*.log` و `initial-results.json`: خطاهای helper تست/typecheck پیش از نسخهٔ نهایی؛ نتیجهٔ draft جای آزمون نهایی نیست.

گروه‌های ساعت جاری **Fail** هستند: X07 با fixture ثابت۱۲اکتبر در روز۱۳اکتبر و hook پوشش وابسته شکست می‌خورند. در archive مبنا نیز همان شکست‌ها دیده شدند. visual Tehran همان Known Issue پیشین progress65≠50 را دارد. تست‌های گزارش۱۳/۱۳ در هر دو timezone و typecheck پاس‌اند؛ کل suite سبز اعلام نمی‌شود.

`freeze-fixture-date.mjs` فقط setup اجرای تکمیلی آزمون است. نسخهٔ استفاده‌شده در work و نسخهٔ این پوشه hash-equal هستند؛ product/TZ/data/expectations را تغییر نمی‌دهد. برای مبنا، همین فایل با مسیر مطلق از checkout نهایی/پوشهٔ شواهد import می‌شود. ۱۷سناریو در ساعت fixture روی مبنا و نسخهٔ اصلاح‌شده در هر دو timezone پاس‌اند؛ این شاهد رفع شکست ساعت جاری نیست.

Asset گزارش40×40/image20/source24 است؛ legacy عرض40 و حداقل ارتفاع40 دارد و با raw چندخطی/font scaling بلندتر می‌شود. پذیرش glyph/layout/RTL/scales1/1.5/2 و targets روی Android،اعلان وارتقا همچنان Not run و الزامی‌اند. فقط TalkBack Deferred است.

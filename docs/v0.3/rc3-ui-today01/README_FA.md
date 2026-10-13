# شواهد RC3-UI-TODAY-01 — Rev01

validation-record.json فرمان دقیق، SHA سورس و شمارش هر اجرا را دارد. test-results.csv هر آزمون نهایی را با Pass/Fail/Not run و حد شاهد جدا ثبت می‌کند؛ log خام مربوط همان کنار آن است. initial-* خطاهای مرحله ساخت fixture/TypeScript هستند و نتیجه سورس نهایی نیستند. known-core-Tehran.log شکست مستقل و شناخته‌شده core در تهران را حفظ می‌کند؛ full-UTC و related-Tehran باید جدا خوانده شوند.

راهنما/CSV در docs/v0.3 از registry با scripts/generate-ui-code-guide.ts تولید شده؛ scripts/sync-ui-identifier-sites.ts محل‌های AST را تازه کرده است. coverage با `node --import tsx scripts/generate-ui-code-coverage.ts docs/v0.3/rc3-ui-today01/rendered-code-evidence-UTC.json docs/v0.3/rc3-ui-today01` ساخته شده است. فقط نام مرحله در تیتر Markdown عمومی generator به TODAY اصلاح شد؛ تخصیص/اثر/جدول تغییر دستی ندارد. هر ۱۱۲ کد فعال در رفتار renderer هر دو timezone دیده شده‌اند؛ ۱۰ رزرو فعال نشده‌اند. وجود binding شاهد target/screenshot گوشی نیست.

design-inputs نسخه بایتی منابع خوانده‌شده و PNG مشاهده‌شده است؛ sources-manifest.json مسیر اصلی، نسخه و hash دارد. ZIP در Git ثبت نشده؛ ۱۲ checksum داخلی دوباره بررسی شدند. تصویر طراحی screenshot برنامه نیست. PNG اجرایی مستقل و منشأ/حقوق آن در assets/illustrations و README آن ثبت است. تصویر شمع هندسهٔ مستقل در DayPassage است؛ زمان و متن در تصویر نیستند.

tested-source-manifest.json بایت‌های سورس دقیق آزمون‌شده را ثابت می‌کند؛ protected-manifest.json فایل‌های محافظت‌شده برابر مبنا را دارد. commit تحویل بعدی فقط docs و evidence اضافه می‌کند؛ SHA آن از Git history گزارش و پاسخ تحویل خوانده شود، با SHA آزمون یکی نیست.

Android/device/build موجود نیست؛ شواهد runtime، RTL و 3 scale و اندازه واقعی targetها Not run هستند. ساعت‌های ۲۰۲۴/۲۰۳۱ فقط کنترل تستِ میزبانند؛ محصول از Date واقعی دستگاه می‌خواند. QA اعلان و ارتقا باز و الزامی، فقط TalkBack Deferred است؛ task بعدی شروع نشده.

# ساختار شواهد RC3-ID-01 — Rev02

مرجع ثابت: ../RC3_UI_Identifiers_Reference_Rev01.md و ../RC3_UI_Identifiers_Addendum_6B_Rev01.md؛ registry RC3-ID-01-Rev02 با۱۲۲ مدخل. گزارش نهایی ../RC3_ID_01_Report_Rev02_FA.md؛ راهنمای Markdown/CSV یک سطح بالاتر.

SHA آزمون نهایی:77ded971005be832233955dbd5df8b52bff99fe4. commit تحویل checkpoint فقط docs است؛ SHA آن از Git همین فایل/پاسخ تحویل مشخص می‌شود. UI/generator/guide تحویل همان snapshot آزمون‌شده‌اند.

- `final-Rev02/`: نتایج و log نهایی۱۰۹/۱۰۹ UTC و۷۹/۷۹ Tehran، typecheck، review و checksum.
- `RC3_UI_Coverage_Rev02_FA.md`, `coverage-Rev02.csv`, `current-source-uses.json`: اتصال فعلی سورس،۱۴رزرو و شاهد مستقل renderer. Source binding به‌تنهایی UI acceptance نیست.
- `rendered-code-evidence-UTC.json` و `rendered-code-evidence-Tehran.json`: هر۱۰۸ کد فعال مشاهده شده، missing=[]؛ فقط renderer/native hosts doubles.
- `screenshot-plan-Rev02.json`: برنامه، نه تصاویر اجراشده؛ Android layout/target/screenshots همگی Not run.
- `allocations-Rev01.json` و `allocations-Rev02.json`: تاریخچهٔ pin تخصیص؛ راهنما-generator آن‌ها را بازنویسی نمی‌کند. Rev02 فقط X102 را افزوده است.
- `iterations-Rev02/`: Failهای اولیهٔ تست تازه و اجرای interim؛ شاهد نهایی نیستند.
- فایل‌های قدیمی root مثل `coverage.csv`, `source-controls.json`, `validation-record.json`, `npm-test-UTC.log`, `related-Asia-Tehran.log` و گزارش ../RC3_ID_01_Report_FA.md، **تاریخیِ مرحلهٔ ناقص** و مربوط به۹۲/۹۲ و۶۲/۶۲ هستند؛ از نتیجهٔ نهایی جدا نگه داشته شده‌اند.

فرمان تولید guide: `node --import tsx scripts/generate-ui-code-guide.ts docs/v0.3`.
inspector: `node --import tsx scripts/inspect-ui-identifiers.ts docs/v0.3/rc3-id01`.
sync محل‌ها (فقط authoring، سپس بازتولید guide و تست): `node --import tsx scripts/sync-ui-identifier-sites.ts`.
coverage: `node --import tsx scripts/generate-ui-code-coverage.ts docs/v0.3/rc3-id01/rendered-code-evidence-UTC.json docs/v0.3/rc3-id01`.

در اجرای تست، TIME80_UI_EVIDENCE_DIR صرفاً مسیر خروجی evidence تست است؛ نمایش کد در محصول به این متغیر یا debug وابسته نیست. CSV جدید UTF-8/LF است.

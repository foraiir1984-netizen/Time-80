# ADR-003-05 — آیکون‌های منتخب و سازگاری داده
نسخهٔ سند: 0.1 | 2026-09-30 | وضعیت: Accepted technical contract؛ اجرا و آزمون Not run
مالک: Architecture | نیازها: P03-006 و حفظ داده | تصمیم بصری: UX-V03-01

## وضعیت موجود و دلیل تصمیم
مبنای بررسی: commit d05d673a34a2c05920de5369ee9e6a3659be463d.
activities.icon در src/db/schema.ts یک TEXT NOT NULL است. ActivityEditor.tsx ورود هر رشتهٔ غیرخالی را مجاز می‌کند؛ بنابراین متن «work» یا حتی رشتهٔ شبیه شناسهٔ نسخه‌دار می‌تواند آیکون قدیمی مشروع باشد. saveActivity در classificationService.ts نام، icon و پیش‌فرض طبقه‌بندی را در یک transaction ذخیره می‌کند. app_meta جدول key/value موجود و metaRepository.ts دارای getMeta/setMeta تراکنشی است. گزارش‌ها آیکون جاری فعالیت را join می‌کنند؛ snapshot تاریخی نداریم. package.json وابستگی مستقیم SVG renderer ندارد.
پس تبدیل خودکار متن، تشخیص asset از prefix رشتهٔ قدیمی، یا نگاشت از نام فعالیت مجاز نیست.

## تصمیم v0.3: مرجع مستقل آیکون جدید در app_meta
activities.icon همواره رشتهٔ legacy باقی می‌ماند و هیچ parser کلید SVG روی آن اجرا نمی‌شود. انتخاب صریح asset تازه، یک رکورد durable در app_meta می‌نویسد:
- key: `activity_icon_ref:v1:<activityId>`؛ activityId عدد صحیح مثبت با نمایش decimal canonical، بدون صفر اضافه.
- value: JSON با شکل زیر؛ ترتیب کلیدها معنایی نیست.
```json
{"v":1,"kind":"asset","set":"time80-a-v1","key":"work","legacyValue":"💼"}
```
legacyValue دقیقاً رشتهٔ فعلی activities.icon است؛ binding برای تشخیص تغییر legacy توسط مسیر قدیمی است، نه snapshot گزارش. key دارایی به فایل دلخواه/URL تبدیل نمی‌شود؛ فقط lookup در registry بسته‌شده. مجموعهٔ فعلی ۱۵ کلید work, study, family, rest, exercise, commute, home, report, grid, settings, edit, archive, plus, more, check دارد. registry فنی، فهرست گزینه‌های picker را تعیین نمی‌کند؛ نقش‌ها و گزینه‌های قابل انتخاب از UX می‌آیند. آیکون‌های ثابت ناوبری/عمل فقط در UI هستند و برای آن‌ها رکورد activity نوشته نمی‌شود.
این namespace دادهٔ پایدار انتخاب کاربر است، نه cache عملیاتی؛ استثنای مستند بر کاربرد صرفاً عملیاتی app_meta در ADR-003-01. بازسازی اعلان و پاکسازی cache حق حذف آن را ندارند.

## قرارداد خواندن
resolveActivityIcon(activityId, legacyRaw, metaRaw) یک تابع pure است:
1. metadata غایب: legacy با همان رشتهٔ دقیق؛ حتی اگر شبیه JSON، URL یا کلید registry باشد.
2. JSON معتبر v=1/kind=asset/set شناخته‌شده، key شناخته‌شده و legacyValue === legacyRaw: asset.
3. نسخه/set/key ناشناخته، JSON خراب یا binding نامطابق: fallback به همان legacyRaw همراه وضعیت unresolved metadata؛ هیچ write، حذف، normalize یا ترمیم خودکار انجام نشود.
4. خطای خواندن DB با نبود metadata یکی نیست؛ وضعیت load/error و retry جدا باشد. ذخیرهٔ ویرایش تا دریافت snapshot معتبر مجاز نیست تا metadata از دست نرود.
خروجی ViewModel شامل kind و raw لازم است؛ icon به string قابل interpolation تبدیل نشود. مقدار metadata ناشناخته هنگام rename و حفظ انتخاب، byte-for-byte باقی بماند.

## قرارداد نوشتن و تراکنش
فرمان ویرایش آیکون tagged است: `keep`، `selectAsset(set,key)`، یا `selectLegacy(raw)`؛ رشتهٔ renderer ورودی write نیست.
- بازکردن فرم، cancel، rename و تغییر طبقه‌بندی با keep: activities.icon و metadata هیچ تغییر نکنند. default جدید به رکورد قدیمی تحمیل نشود.
- selectAsset: فقط انتخاب صریح معتبر؛ activities.icon موجود عیناً حفظ، metadata با binding همان رشته ذخیره شود. انتخاب همان asset معتبر no-op آیکون است.
- فعالیت تازه با asset: legacy fallback برابر مقدار پیش‌فرض موجود «✨»، سپس metadata همان id؛ نام/فعالیت/metadata/default classification در یک transaction. هیچ نام فعالیتی برای حدس legacy استفاده نشود.
- selectLegacy: فقط اگر UX مسیر صریح آن را عرضه می‌کند؛ raw معتبر را در icon بنویس و metadata همان id را در همان transaction حذف کن. این قرارداد قابلیت UI تازه ایجاد نمی‌کند.
- keep برای فعالیت تازه بدون asset همان رفتار پیش‌فرض legacy موجود است.
- کنترل stale داخل transaction: snapshot مقدار اولیهٔ icon و metadata با وضعیت جاری مقایسه شود؛ تفاوت => conflict بدون overwrite، draft حفظ. اعتبارسنجی classification revision موجود مستقل حفظ شود. شکست هر بخش rollback کل فرمان است؛ nested transaction ساخته نشود.
- archive/restore/Undo آرشیو metadata را حذف یا بازنویسی نمی‌کنند؛ id ثابت است. انتخاب آیکون پیش‌فرض طبقه‌بندی را بدون تغییر واقعی آن revision ندهد.
تمام writerها شامل createActivity/updateActivity و saveActivity باید از همین مرز سرویس استفاده کنند یا مسیر قدیمی بدون فراخواننده حذف شود؛ UI حق SQL مستقیم ندارد.

## قرارداد نمایش و دارایی
یک ActivityIcon در مدیریت، picker، ثبت، Backlog/SlotRow و گزارش استفاده شود. loader مربوط به فعالیت‌ها metadata را batch در همان read snapshot بخواند؛ N+1 در هر کارت و read مستقل در هر render نباشد. گزارش، آیکون جاری را با activityId نمایش دهد؛ محاسبات totals/ICATUS تغییر نکنند. پس از commit، view cache فعالیت/گزارش invalid شود. برای نگه‌داشتن انتخاب قبلی در فرم، resolved preview همراه raw حفظ شود.
راه اجرای منتخب بدون وابستگی native تازه: تبدیل build-time دارایی SVG به PNG شفاف foreground با registry استاتیک؛ فایل SVG اصلی و hash نگهداری شود. خروجی‌های density 1x/2x/3x/4x برای اندازه‌های منطقی 24،30،32 و tint تک‌رنگ از توکن UX؛ generator و ابزار نسخه‌قفل‌شده قابل تکرار، نه SVG دانلودشونده یا WebView در runtime.
همهٔ ۱۵ SVG یک rect زمینه به‌عنوان اولین child دارند. تبدیل فقط همان زمینه را جدا کند، نه rectهای بدنهٔ نماد؛ geometry/viewBox/stroke حفظ شود. قاب 52dp و radius16 در کامپوننت UI، foreground 30–32dp؛ کنترل/ناوبری 24dp با target حداقل48dp. این اجرای اندازه‌های خود UX است. استفادهٔ هم‌زمان از SVG دارای قاب و قاب UI ممنوع؛ کل SVG قاب‌دار به52dp کشیده نشود و اندازهٔ نماد را تغییر ندهد. نمادها mirror خودکار نشوند؛ ترتیب و فلش ناوبری تابع RTL موجود. label نام فعالیت/عمل؛ نماد تکراری برای TalkBack decorative باشد.
نمونهٔ تولیدشده با SVG و توکن UX مقایسه شود. این دفتر خروجی PNG اجرایی نساخته و کیفیت دستگاه را تأیید نمی‌کند. اگر رنگ‌های چندگانه داخل foreground در دارایی آینده اضافه شد، قرارداد تک‌رنگ نسخه1 کافی نیست و باید بازبینی شود.

## اثر دیتابیس، migration و compatibility
- DDL، user_version=3، fingerprint، baseline_id، signing و applicationId تغییر نمی‌کنند؛ migration یا backfill هنگام upgrade نداریم.
- تغییر داده داریم: فقط انتخاب صریح، رکورد جدید app_meta می‌نویسد. از نبود migration نباید نبود تغییر مدل منطقی استنتاج شود.
- همهٔ رشته‌های قدیمی، entryها، زمان‌ها، طبقه‌بندی‌ها و روابط حفظ؛ snapshot آیکون تاریخی اضافه نمی‌شود.
- backup/export کامل باید این namespace را با activities نگه دارد؛ cache پاک‌شدنی تلقی نشود. درج در snapshot منطقی آزمون upgrade الزامی است.
- کد v0.2 فقط legacy را می‌بیند و asset جدید را نشان نمی‌دهد. این backward readable fallback است، نه تضمین نصب downgrade. برگشت APK قبلی تأیید نشده. اگر ویرایش قدیمی icon را عوض کند، binding بعدی mismatch شده و legacy جدید نمایش داده می‌شود؛ metadata خودکار حذف نمی‌شود.
- app_meta foreign key ندارد؛ service وجود activity را کنترل کند. فعلاً حذف دائمی خارج Scope است؛ رکورد orphan ناشناخته خودکار پاک نشود.

## گزینه‌های کنارگذاشته‌شده
prefix در icon: برخورد با رشتهٔ آزاد قدیمی و نمایش token در v0.2. تبدیل همگانی به JSON: بازنویسی بی‌دلیل legacy. ستون جدید: DDL/migration برای این Scope لازم نیست. ذخیرهٔ فایل SVG در DB: مخلوط‌کردن دارایی و داده. app_meta منتخب است با هزینهٔ loader/service و لزوم حفاظت به‌عنوان دادهٔ پایدار.

## معیارهای پذیرش — همگی Not run
- AC-ICON-01: upgrade و rename/cancel برای emoji، خانوادهٔ ZWJ، فارسی، work و متن شبیه token/JSON، icon و metadata قبلی را دقیق حفظ کنند.
- AC-ICON-02: selectAsset و create موفق atomic؛ failure injection میان activity/meta/classification هیچ اثر جزئی نگذارد؛ stale form conflict بدهد.
- AC-ICON-03: unknown key/set/version، malformed و legacy binding mismatch fallback بی‌write بدهند؛ نگه‌داشتن و rename raw metadata را حفظ کنند.
- AC-ICON-04: archive/restore/Undo و rebuild notification انتخاب asset را نگه دارند؛ گزارش گذشته آیکون جاری و totals ثابت داشته باشد.
- AC-ICON-05: ۱۵ دارایی در registry، بدون قاب دوبل؛ خروجی density/رنگ و RTL با UX تطبیق؛ هر دو callback مدیریت/ثبت مجزا.
- AC-ICON-06: متن150٪/200٪، آستانهٔ تک‌ستونهٔ UX، target48dp و TalkBack روی S23 FE آزموده شود.
- AC-ICON-07: snapshot پیش/پس ارتقا، backup و reopen همهٔ namespace را حفظ کنند؛ v0.2 صرفاً legacy قابل‌خواندن ببیند، بدون ادعای نصب downgrade.
- AC-ICON-08: هر مسیر نمایش از resolver مشترک استفاده کند؛ token در UI نشت نکند، cache بعد commit تازه شود و read failure به absent تبدیل نشود.

## مراجع
/Time 80/03_UX/Working/Time80_Visual_Icon_Spec_v0.3.md نسخهٔ0.2 و Time80_Icons_Approved_A_v0.3.zip؛ ADR-003-01؛ Architecture_Spec_v0.3.md؛ Architecture_Icon_Review_v0.3.md.

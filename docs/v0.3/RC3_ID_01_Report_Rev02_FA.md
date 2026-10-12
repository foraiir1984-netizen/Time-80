# تحویل RC3-ID-01 — Rev02

تاریخ: 2026-10-12، Asia/Tehran. ادامهٔ پرامپت۶ و الحاقیه‌های ۶-الف/۶-ب؛ تحویل کدگذاری محدودهٔ فعال در رابط موجود. پذیرش نهایی RC3 و AC-ID بصری گوشی بسته نشده است.

## نتیجه و مبنا

Registry نسخهٔ **RC3-ID-01-Rev02**، ۱۲۲ مدخل صریح دارد: ۱۲ صفحه/نما، ۸ پنجره و ۱۰۲ اقدام. ۱۰۸ مدخل فعال در سورس و رفتار UI/Alert مشاهده شده‌اند؛ ۱۴ مدخل رزرو badge یا کنترل تازه ندارند. ۱۲۹ اتصال صریح سورس در جدول پوشش، همراه ۱۴ ردیف رزرو، جدا ثبت است؛ تعداد ۱۴۳ ردیف پوشش تعداد کنترل‌های تکرارشوندهٔ داده نیست.

مبنای دقیق FIX02: `ffa7bfc1dcb18c747611d585553bed4d4e4d5359`؛ checkout کامل قبلی شامل FIX01/FIX02، شاخهٔ `rc3-id01-ui-identifiers` و تغییرات uncommitted مرحلهٔ ناقص حفظ شدند. HEAD شروع همان مبنا و ancestry0/0 بود؛ SHA origin/FIX02 دوباره همان مبنا خوانده شد. checkout قدیمی work و RC2 مبنای اجرا نیستند.

مرجع Rev01 کامل خوانده و با بایت‌های ضمیمه در مخزن حفظ شد. تخصیص تازهٔ X102 از پاسخ مستقیم صاحب محصول در `RC3_UI_Identifiers_Addendum_6B_Rev01.md` ثبت شد؛ این مسیر فقط `navigate("Main", {screen:"Activities"})` دارد و create/restore انجام نمی‌دهد. شماره‌های Rev01 بازشماری نشده‌اند. نام مرجع X69 و X72 با جدول کامل هماهنگ شد؛ برچسب و handler فعلی UI تغییر معنا نکردند.

## تغییرها و حفاظت از رفتار

| فایل / گروه | دلیل و اثر |
| --- | --- |
| src/components/uiIdentifiers.ts | لایهٔ UI کنار Ui.tsx موجود؛ کلید معنایی و code صریح، نام/اثر/نوع/محل/وضعیت؛ تاریخچهٔ تخصیص و منع برخورد/بازاستفاده؛ فعال‌سازی رزروها ممنوع |
| Ui.tsx | badge14sp/scaling/LTR غیرتعاملی برای عنوان؛ target واحد Button، ورودی با focus بومی و بدون commit تازه، سوییچ با یک callback؛ native Alert با همان callback/cancel/options و isolate کد؛ header و tab label مشترک |
| App.tsx | A12/X76 و X75 متصل به registry، چهار تب و header بازگشت X05؛ goBack و backBehavior=firstRoute محفوظ؛ اندازه‌گیری label فقط ارتفاع tab را تنظیم می‌کند؛ opacity کل target کد را کم‌رنگ نمی‌کند |
| TodayOverview / TodayScreen / SlotRow | A01/A05 دو حالت همان Today؛ X07 همان items.find و نام فعلی؛ X09/X11 جدا؛ ردیف آینده disabled و X06 visible؛ در ستون متن بزرگ، نام ردیف ارتفاع طبیعی دارد و Badge روی زمان/نام/تصویر نیست |
| ActivitiesScreen / ActivityEditor / ActivityGrid | هر دو ورودی مدیریت X17، D01/D02، create/edit و archive/restore/Undo جدا؛ نام بلند wrap؛ راهنمای X18 داخل backdrop واقعی و فضای بستن جدا از ارتفاع sheet؛ X39/X40 در گرید ثبت با entry تفکیک شدند |
| CheckInScreen / SaveResultScreen / BacklogScreen / NotificationResolutionScreen | A06 در fresh/view/edit/skipped/loading/error ثابت؛ Alertهای D05/D06/D07 و لغو X38؛ X102؛ replace/navigate و dayScope مربوط X13/X53/X57 ثابت؛ Undo موجود و صفحه‌بندی خودکار تغییر نکردند |
| SettingsScreen / OnboardingScreen / NotificationDiagnosticsScreen / InsightsScreen | عنوان و کنترل‌های واقعی کد دارند؛ X60…62 همان onBlur، D04 فقط draft ناقص؛ X69/70/72/75 مستقل؛ X71 مشترک onboarding/diagnostics؛ هشت mode، usage/rolling، offset و preference/query حفظ |
| scripts/ و راهنما/CSV | generator از registry، inspector اتصال‌های جاری و sync فقط محل‌ها؛ کد از ترتیب/عنوان/فایل تولید نمی‌شود؛ راهنما UTF-8/LF و history مستقل |
| tests/ و native/navigation mocks | ۲۳ تست شناسه (۶ قرارداد/target و۱۷ جریان واقعی)، با App/screens/services/SQLite واقعی و IO/host/navigation doubles؛ mock Alert متن کددار را ثبت می‌کند، callbacks و لغو واقعی بررسی شدند |

پوشش موجود تمام کدهای فعال این task در سورس کامل است و active Pending=0. loading/error/empty/busy/disabled با تست‌های مناسب و عنوان‌های بیرون شرط داده بررسی شدند. صرف وجود registry مدرک نمایش نیست؛ renderer هر۱۰۸ کد فعال را در سناریوهای رفتاری دیده و هیچ رزرو دیده نشده است. نمونه‌های تکراری و owner/label در دو `rendered-code-evidence-*.json` ثبت‌اند.

بستن backdrop همان close است؛ route تازه ندارد. input badge همان field را focus می‌کند، onChange/onBlur فراخوانی مصنوعی ندارد. سوییچ بومی داخل target نمایشی غیرتعاملی است و یک onPress مقدار boolean همان callback قبلی را می‌دهد؛ native child callback دوم ندارد. ترتیب timezone/ensure/reconcile، مالکیت خطا و guardهای FIX01/FIX02 تغییر نکرده‌اند.

## آزمون نهایی و SHA

SHA سورس **آزمون‌شده**: `77ded971005be832233955dbd5df8b52bff99fe4`، پس از commit سورس. در زمان این اجراها فقط مستندات جاری/شواهد uncommitted بودند؛ کد، تست‌ها، generator، مرجع و راهنمایی که تست‌ها می‌خوانند عیناً از این SHA بودند.

commit تحویل بعدی فقط checkpoint/گزارش/پوشش/شواهد متنی دارد؛ SHA تحویل از commit حاوی این سند و پاسخ نهایی خوانده شود. این SHA با SHA آزمون‌شده یکی فرض نمی‌شود. hash سورس/تست/generator/guide و تطبیق snapshot در `rc3-id01/final-Rev02/validation-record.json` ثبت است؛ source commitهای قبلی 4a1767af4f1bd85959218efd67362305ba8b3ed6 و77ded97، هر دو روی همان شاخه و بدون merge هستند.

| مورد | نتیجه | فرمان و شاهد |
| --- | --- | --- |
| TypeScript نهایی در SHA بالا | Pass | `npm run typecheck`، exit0؛ final-Rev02/typecheck.log |
| suite کامل UTC در SHA بالا | Pass | `TZ=UTC npm test`، 109/109، fail0/skip0؛ final-Rev02/npm-test-UTC.log |
| مرتبط Tehran در SHA بالا | Pass | `TZ=Asia/Tehran node --import ./tests/register.mjs --import tsx --test tests/v03IdentifierFlows.test.tsx tests/v03UIIdentifiers.test.tsx tests/v03LifecycleUI.test.tsx tests/v03ResponseUI.test.tsx tests/v03Notifications.test.ts tests/v03UI.test.tsx`،79/79،fail0/skip0؛ final-Rev02/related-Asia-Tehran.log |
| تمام تخصیص‌ها/تاریخچه/رزرو، تطابق guide/CSV/source | Pass | تخصیص Rev01+۶-ب، negative collision/reassignment و source contracts، همراه رفتار UI؛ guide صرفاً inventory نیست |
| target واحد، callback، مدیریت/ثبت/ویرایش، scope/route، autosave و Undo معتبر/منقضی | Pass | UI/service/SQLite واقعی؛ رگرسیون اعلان و guardهای FIX01/FIX02 نیز Pass؛ native interaction واقعی نیست |
| RTL، نام بلند، scale1/1.5/2 و contrast palette در حالت‌ها | Pass در پیکربندی renderer | wrap/scaling/no clipping props، اندازه‌گیری label و قیود فضای backdrop؛ اندازه‌گیری واقعی layout گوشی نیست |
| viewport/فونت/کنتراست/target و Alert روی Android، screenshots | Not run | adb/emulator/native Android project/device/build معلوم وجود ندارد؛ فونت و target Alert تابع native و نیازمند اندازه‌گیری گوشی‌اند |
| TalkBack / P03-015 و P03-016 دستگاهی | Deferred / Not run | source/device acceptance جدا؛ دریافت اعلان اثبات نشده |
| TZ unset و fixture progress تهران | Not run در این مرحله؛ Known Issue باز | سوابق Fail FIX01/FIX02 محفوظ؛ هیچ skip یا تغییر منطق/انتظار تست برای سبزشدن |

نتایج۹۲/۹۲ و۶۲/۶۲ مرحلهٔ ناقص قبلی، شاهد پایان نیستند. آن فایل‌ها و گزارش قبلی در index شواهد «تاریخی ناقص» مشخص‌اند. دور اول تست جریان Rev01 چهار Fail داشت (پیش‌شرط شروع روز برابر default، نام جدول fixture نادرست، نبود pending row در scope و hook پوشش ناشی از همین‌ها)، به‌علاوه خطای type پورت mock؛ فقط fixture/نوع تست جدید اصلاح شد. logها محفوظ؛ محصول/انتظار تست‌های قدیمی تغییر نکردند. بررسی cached diff نخست CRLF CSV را whitespace یافت؛ خروجی جدید به LF تبدیل شد و commit آن تلاش اجرا نشد. بررسی whitespace سورس/مستندات Pass است؛ logهای خام با whitespace اصلی stdout (از جمله هشدار patch قدیمی) عیناً حفظ شدند و از check قالب سورس مستثنا هستند.

## راهنما، پوشش و QA دستگاهی

- `RC3_UI_Code_Guide_FA.md` و CSV از همین registry؛ نمونه گزارش A02/X17 → A02/D01/X19 → A02/D02/X30. برای تکراری‌ها نام فعالیت یا تاریخ/بازه نیز لازم است.
- `rc3-id01/RC3_UI_Coverage_Rev02_FA.md` و `coverage-Rev02.csv`: هر کد و محل صریح همراه وضعیت/شاهد/حد؛ `current-source-uses.json` محل‌های واقعی همین سورس.
- `rc3-id01/screenshot-plan-Rev02.json`: برنامهٔ تصاویر/اندازه‌گیری برای صفحات/پنجره‌های فعال، هر سه scale، RTL و metadata build/device؛ هیچ تصویر واقعی تولید نشده است.
- `rc3-id01/final-Rev02/` فرمان، نتایج مستقل، log، checksum و review؛ old root logs و RC3_ID_01_Report_FA.md فقط سابقهٔ مرحله ناقص‌اند. سوابق FIX01/FIX02 و گزارش RC2 بازنویسی نشده‌اند.

## باز و قدم بعدی

**ICATUS در سورس میانی هنوز pending hide است**؛ D03 و X32…37/X41/X48/X95 رزرو/Deferred بدون badge جدید هستند، ولی UI فعلی‌شان حذف نشده است. این وضعیت برای تحویل نهایی RC3 قابل‌قبول نیست و مرحلهٔ پنهان‌سازی باید جدا اجرا شود. X18/X38 در بخش‌های فعال باقی‌اند.

D08/X99/X100/X101، چهار بازطراحی، دارایی شمع/هدر، date picker تازه، Logout و countdown Undo اجرا نشده‌اند؛ Undo غیرقابل‌دسترسی CheckIn فعال نشد. scheduler، manifest/SDK، schema/data/default/snapshot/assignment/history، signing/applicationId، dependency و workflow تغییر نکردند؛ build/APK/Release/merge/force-push انجام نشد. P03-014/P03-019 بسته نشده‌اند.

پذیرش نهایی AC-ID-01…10 وابسته به پوشش نهایی RC3 و گوشی است. کوچک‌ترین قدم بعدی با بررسی دفتر: QA واقعی scale1/1.5/2 و target/Alert/header/tab، سپس دستور جدا برای pending hide و طرح‌های بعد. این task پس از تحویل Git و تأیید SHA remote متوقف می‌شود.

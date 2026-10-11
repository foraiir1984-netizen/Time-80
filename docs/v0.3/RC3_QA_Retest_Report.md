# Checkpoint خودکار جاری — RC3-FIX-02

تاریخ: 2026-10-11، Asia/Tehran. کد آزمون‌شده: FIX01 22cfac2895e35845382b4f41edfeb171e544f2c7 + diff FIX02 در همان checkout کامل؛ شاخه rc3-fix02-p015-x75. commit نسخهٔ تحویل از Git این فایل و پاسخ تحویل مشخص می‌شود؛ build/APK/device run ID Not Available.

| اجرا / رفتار | نتیجه | فرمان / شاهد و محدودیت |
| --- | --- | --- |
| مالکیت bootstrap/resume/response، denied→granted→resume، پاسخ قدیمی و cleanup | Pass | TZ=UTC npm test و فرمان مرتبط Tehran پایین؛ App/scheduler/SQLite واقعی، IO/native/navigation doubled |
| focus/X70/active refresh، یک listener و بدون repair، read/action مستقل و freshness | Pass | 26 lifecycle tests در دو timezone؛ diagnostics واقعی، رویداد OS/focus تزریقی |
| loading/unknown بدون denied/dirty=false کاذب، display/channel/exact جدا | Pass | خواندن متوقف/ناموفق/موفق و supported=false/value=null؛ OS قابلیت fixture |
| X75 داخل target،14sp/LTR/scaling/wrap، processing و یک handler | Pass | RTL و scale1/1.5/2 در host؛ اندازه‌گیری layout و تصویر گوشی نیست |
| رگرسیون حالت‌های FIX01 و route/dismiss/ack/dedupe/no-write | Pass | 17 module +8 App FIX01، بدون تغییر coordinator تولیدی |
| npm run typecheck نهایی | Pass | rc3-fix02/typecheck.log، exit0؛ log اولیه دو خطای نوع تست Fail و اصلاح آن حفظ شده |
| TZ=UTC npm test | Pass | 86/86،skip0؛ rc3-fix02/npm-test-UTC.log |
| TZ=Asia/Tehran node --import ./tests/register.mjs --import tsx --test tests/v03LifecycleUI.test.tsx tests/v03ResponseUI.test.tsx tests/v03Notifications.test.ts tests/v03UI.test.tsx | Pass | 56/56،skip0؛ related-task-Asia-Tehran.log؛ انتخاب مرتبط، نه suite کامل Tehran |
| انتخاب بالا + tests/visualIntegration.test.tsx در Tehran | Fail | 62/63؛ progress fixture قدیمی65≠50؛ related-Asia-Tehran.log |
| TZ=Asia/Tehran node --import ./tests/register.mjs --import tsx --test tests/visualIntegration.test.tsx روی RC2 دست‌نخورده | Fail | 6/7، همان65≠50؛ baseline-visual-Asia-Tehran.log؛ تست/محصول تغییر نکرد |
| npm test با TZ unset در این مرحله | Not run | Known Issue قبلی و log تاریخی FIX01 حفظ؛ با UTC بسته نشده |
| warning قبل/بعد، diagnostics/X75 و RTL/font scales واقعی1/1.5/2 | Not run | adb/emulator/device/build شناخته‌شده در دسترس نیست؛ renderer شاهد گوشی نیست |

نام هر26 تست، فرمان/نتیجه و محدودیت در rc3-fix02/validation-record.json ثبت است. P03-015/P03-016 پذیرش دستگاهی همچنان باز؛ P03-014/P03-019/OI-P01/AC-A11 بسته نشده‌اند. نتایج RC2 منتقل نشده‌اند. بخش FIX01 زیر، سابقهٔ خودکار آن مرحله است؛ ردیف‌های دستگاهی همچنان Not run و نیازمند اجرای واقعی‌اند.

---

# بازآزمایی مستقل RC3 — به‌روزرسانی RC3-FIX-01

تاریخ: 2026-10-11، Asia/Tehran. Source run ID: RC3-FIX-01-AUTO-20261011-01.
کد آزمون‌شده: baseline 8e1cef5c0bdf0d471a0ed6cfbd02872b127f7634 + source/tests patch شاخهٔ rc3-fix01-x75؛ شناسهٔ patch در checkpoint. آزمون‌ها پیش از commit انجام شده‌اند؛ نسخهٔ تحویل شامل همین کد آزمون‌شده است. Build/APK/device run ID هنوز Not Available.

## آزمون خودکار این مرحله — جدا از قبولی روی گوشی

| مورد | محل/مسئله | نتیجه | شاهد و حد |
| --- | --- | --- | --- |
| X75 پنج حالت و stage retry | App/X75، P03-016 | Pass | v03Notifications17/17؛ actual module با IO آزمون |
| handler واقعی App و متن UI | App/X75، P03-016 | Pass | v03ResponseUI8/8؛ React renderer/native hosts doubles |
| resolve/route/dismiss/ack failure و مراحل موفق | P03-016 | Pass | تست ماژول و retry حفظ route/dismiss |
| دو پاسخ/diagnostic/dedupe | P03-016 | Pass | route diagnostic ندارد، دو پاسخ مستقل حفظ |
| خطای مستقل bootstrap و reconcile | App/X75 | Pass | init هنگام not-ready پاک نشد؛ بعد از bootstrap مستقل، success X75 خطای reconcile را حفظ کرد |
| stale async | App/X75 | Pass | نتیجه empty قدیمی و pending-read failure قدیمی روی run جدید نمی‌نویسند |
| resolved/unresolved tap بدون ledger write | A06/A10 | Pass | resolver/handler واقعی؛ مقایسه time_entries/classifications/time_context/slots در fixture؛ screen مقصد native اجرا نشد |
| typecheck | source diff | Pass | npm run typecheck، exit0 |
| suite کامل با TZ=UTC | source diff | Pass | 60/60؛ npm-test.log؛ شامل v03UI/visualIntegration/v03Data/v03Notifications و8تست App |
| suite با TZ unset | محدودیت fixture قبلی | Fail | شکست تست قدیمی timezone در baseline دست‌نخورده هم بازتولید شد؛ production fix یا dependency upgrade انجام نشد |
| screenshot واقعی و گوشی | P03-016 | Not run | adb/emulator/RC3 APK نصب‌شده موجود نیست |

تمام ردیف‌های دستی/دستگاهی زیر همچنان Not run هستند. نتیجهٔ خودکار را به device Pass تبدیل نکنید. P03-014/015/019 و OI-P01/AC-A11 بازند. هیچ قبولی RC2 منتقل نشده است. Decision ICATUS hide در FIX01 اجرا نشده و assignment policy موجود تغییر نکرده است.

---

# RC3_QA_Retest_Report

نسخهٔ قالب: 2026-10-11. مستقل از گزارش RC2؛ نتیجهٔ RC2 به RC3 منتقل نشده است.
شناسهٔ اجرا: Not Available — هنوز اجرای RC3 انجام نشده است.

## هویت اجرای واقعی

| فیلد | مقدار |
| --- | --- |
| RC / commit / branch | Not Available |
| applicationId / versionName / versionCode | Not Available |
| منشأ APK / APK SHA256 / certificate SHA256 | Not Available |
| مدل دستگاه / Android / One UI | Not Available |
| نصب تازه یا upgrade / مبدأ upgrade | Not Available |
| schema قبل/بعد | Not Available |
| تاریخ / timezone IANA / offset / تنظیم خودکار ساعت | Not Available |
| اعلان برنامه / کانال و importance / exact supported,value,checkedAt | Not Available |
| باتری / background restricted / وضعیت اجرا | Not Available |
| دادهٔ آزمون و مسیر شواهد | Not Available |

برای هر زیرحالت ردیف مستقل تکثیر شود. وضعیت نتیجه فقط Pass / Fail / Not run است؛ Deferred وضعیت دامنه است. نبود لاگ به‌تنهایی اثبات عدم تحویل نیست. Close all و force-stop جدا ثبت شوند.

## موارد بازآزمایی

| شناسه | ارتباط با RC2 / کد محل | پیش‌شرط | انتظار | مشاهده | نتیجه | دامنه | تاریخ/timezone و شاهد |
| --- | --- | --- | --- | --- | --- | --- | --- |
| N14-1 | P03-014، A04/A09؛ X69/X70/X72 مستقل | نمایش اعلان قطع، ثبت دستی ممکن | در رد مجوز خطای صحیح و dirty قابل‌تشخیص؛ هیچ حذف داده | اجرا نشده | Not run | Active | — |
| N14-2 | P03-014، A09 | اعطای مجدد نمایش پیش از موعد؛ ثبت دقیق زمان grant/resume | خواندن تازه و reconcile؛ حفظ همهٔ موعدهای آینده | اجرا نشده | Not run | Active | — |
| N14-3 | P03-014، جدول سه موعد پایین | حداقل سه موعد متوالی بعد از grant؛ هر موعد وضعیت جدا | ثبت زمان عددی دریافت/نمایش و وضعیت؛ بدون نتیجه‌گیری پذیرش OI-P01 | اجرا نشده | Not run | Active | — |
| N14-4 | P03-014، A09/X72 | شکست میانی فقط در fixture آزمون | dirty باقی بماند؛ retry محدود همان عملیات، بدون duplicate/دستکاری ledger | اجرا نشده | Not run | Active | — |
| N14-5 | P03-014، A09 | cache موجود؛ وضعیت سیستم مستقلاً قابل مشاهده | تفاوت cache و AlarmManager و delivery جدا ثبت شود | اجرا نشده | Not run | Active | — |
| N15-1 | P03-015، App banner/A09 | ابتدا رد مجوز سپس اعطا و resume | هشدار permission با خواندن جدید سازگار؛ خطاهای دیگر حفظ | اجرا نشده | Not run | Active | — |
| N15-2 | P03-015، A09/X70 | بازکردن OS settings، تغییر permission و بازگشت | refresh؛ loading/unknown با denied یکسان نمایش داده نشود | اجرا نشده | Not run | Active | — |
| N15-3 | P03-015 | در تست async پاسخ قدیمی پس از جدید | آخرین خواندن معتبر برنده؛ خطای resolve/init با موفقیت permission پاک نشود | اجرا نشده | Not run | Active | — |
| N15-4 | P03-015 | Close all طبق رفتار همان دستگاه | رفتار lifecycle ثبت شود؛ تحویل موعدهای بعدی جدا سنجیده شود | اجرا نشده | Not run | Active | — |
| N16-1 | P03-016، App/X75 | صف پاسخ خالی | پیام روشن صف خالی؛ بدون reconcile یا درخواست مجوز | اجرا نشده | Not run | Active | — |
| N16-2 | P03-016، App/X75 | صف pending و navigation آماده | resolve/route/dismiss/ack فعلی؛ feedback شروع و پایان؛ route تکراری نشود | اجرا نشده | Not run | Active | — |
| N16-3 | P03-016، App/X75 | resolve/dismiss/ack fail جدا | خطای متعلق به عملیات و امکان retry؛ مرحلهٔ موفق تکرار نشود | اجرا نشده | Not run | Active | — |
| N16-4 | P03-016، App/X75 | bootstrap not-ready، running و لمس مکرر | وضعیت انتظار/در حال پردازش روشن؛ بدون اجرای مضاعف | اجرا نشده | Not run | Active | — |
| N19 | P03-019، A09 | build شناخته‌شده و Android ثبت‌شده | declared و capability واقعی و OS-list جدا؛ unsupported=unknown | اجرا نشده | Not run | Active | — |
| T06 | تست ۶، A01/A05 | روز با logged/pending/skipped/future | وضعیت timeline صحیح؛ آینده غیرقابل ثبت؛ ترتیب معکوس صرفاً نمایشی | اجرا نشده | Not run | Active | — |
| T09 | تست ۹، A06/A07/A08 | ثبت گذشته و عبور نیمه‌شب | شمارش/مرور DayScope همان ثبت؛ خطای شمارش موجب commit دوباره نشود | اجرا نشده | Not run | Active | — |
| T12 | تست ۱۲، A06 | fixture هفت‌روزه با tie و نام بلند | رتبه و بخش همه مطابق policy جاری؛ بدنهٔ کارت ثبت همان فعالیت | اجرا نشده | Not run | Active | — |
| T24 | تست ۲۴، A01/A05/A06/A09/D06 | ساعت و timezone قبل/بعد معلوم | تاریخ/بازهٔ دقیق، time context و رفتار recovery مطابق قرارداد؛ بدون تغییر خودکار ثبت | اجرا نشده | Not run | Active | — |
| DATA-1 | تست ۷/۸، A06/A07 | periodStart/periodEnd معلوم؛ لمس سریع | دقیقاً یک ثبت و همان بازه؛ مقایسهٔ DB آزمون قبل/بعد | اجرا نشده | Not run | Active | — |
| DATA-2 | تست ۱۰، A06/D05 | Undo معتبر/منقضی/stale جدا | قبل مهلت موفق؛ بعد مهلت/stale رد؛ بدون شمارش معکوس جدید | اجرا نشده | Not run | Active | — |
| DATA-3 | تست ۱۱/۱۳، A02/D02/A06 | activity default و historical assignment موجود/فاقد/null | rename/icon/edit activity ثبت: حفظ تخصیص و تاریخچه؛ مدل داده باقی | اجرا نشده | Not run | Active | — |
| DATA-4 | تست ۱۳/۱۴، A02/D01 | فعالیت فعال/بایگانی | بدنه و سه‌نقطه هر دو همان پنل؛ archive/Undo/restore مطابق رفتار موجود | اجرا نشده | Not run | Active | — |
| N-TAP | تست ۱۷/۲۰/۲۱، A10/A06 | resolved و unresolved و دو occurrence و تست diagnostic جدا | صرف tap هیچ write/create/delete در ledger؛ تنها occurrence لمس‌شده dismiss؛ unresolved حدس نزند | اجرا نشده | Not run | Active | — |
| UI-1 | M-01، A03/D08/X99/X100 | همهٔ هشت حالت گزارش و custom | همه قابل دسترس؛ امروز absolute، روزقبل absolute، قبلی relative؛ عنوان و داده هماهنگ | اجرا نشده | Not run | Active | — |
| UI-2 | M-04، A03/X101 | گزارش با صفر/کمتر۵/بیشتر۵ فعالیت | کل و درصد و سایر دقیق؛ همه همان query و فهرست شخصی، بدون ICATUS | اجرا نشده | Not run | Active | — |
| UI-3 | M-02، A04/D04/X60–62/X68 | تنظیم تدریجی و draft ناقص | onBlur ذخیره؛ کنارگذاشتن فقط draft؛ sound/vibration/days/diagnostics محفوظ | اجرا نشده | Not run | Active | — |
| UI-4 | M-10، A01/A05 | permission denied و روز نیمه/کامل | ساعت/تاریخ/progress یک مبنا؛ ثبت دستی و تکمیل گذشته قابل دسترس | اجرا نشده | Not run | Active | — |
| ID-ALL | AC-ID-01…10، A01…A12 و Dهای فعال | تک‌تک صفحه/پنجره/اقدام و حالات loading/error | کد پیش‌فرض قابل دیدن؛ فارسی حفظ؛ icon-only کد visible؛ هر placement ثبت | اجرا نشده | Not run | Active | — |
| ID-LAYOUT | AC-ID-01…10 | RTL، فونت پیش‌فرض و بزرگ سیستم، کوچک‌ترین عرض پشتیبانی‌شده | کد LTR خوانا؛ touch حداقل48dp؛ زمان/فعالیت پوشانده نشود؛ wrap بدون truncation | اجرا نشده | Not run | Active | — |
| HIDE-1 | تصمیم جدید، A02/D02/A06/A03/A11 و خطاهای قابل مشاهده | دادهٔ دارای کد/نام ICATUS و UI error | هیچ نام/کد استاندارد/picker/link/coverage ICATUS نمایش ندهد | اجرا نشده | Not run | Active | — |
| HIDE-2 | همان، D03/X32–37/X41/X48/X95 | registry و راهنمای مالک | Deferred/Reserved؛ در فهرست active/مسیر قابل دسترس نباشند؛ reuse نشوند | اجرا نشده | Not run | Active | — |
| HIDE-3 | تست‌های داده/گزارش | fixture تاریخی mapped/unmapped/null/missing | schema/dataset/assignments محفوظ؛ مجموع کل و شخصی و internal buckets درست | اجرا نشده | Not run | Active | — |
| HIDE-NEW | سیاست ثبت جدید | سیاست مالک هنوز مشخص نشده | معیار نهایی پس از تعیین policy؛ وضعیت جاری inherit/null مستند | اجرا نشده؛ policy نامشخص | Not run | Pending policy | — |
| UPGRADE-1 | RC2→RC3 | RC2 و امضای معلوم، دادهٔ fixture قبل | نصب روی قبلی بدون uninstall/reset؛ تمام فعالیت/ثبت/تنظیم/default/history/icon محفوظ | اجرا نشده | Not run | Active | — |
| UPGRADE-2 | v0.2→target | build مبدأ/هدف و دادهٔ مستقل | ارتقای مستقیم و حفظ داده مستقل از RC2→RC3 | اجرا نشده | Not run | Active | — |
| TB | P03-017 | اجرای واقعی TalkBack فعلاً در دامنه نیست | نتیجه منتقل نشود؛ تعویق حفظ | اجرا نشده | Not run | Deferred | — |

## ثبت تشخیصی سه موعد پس از اعطای دوباره

سه موعد حداقل پوشش تشخیصی است، نه معیار پذیرش نهایی OI-P01. زمان‌ها باید تاریخ کامل، IANA timezone و offset داشته باشند. اگر مشاهده/لاگ ابزار مقدور نیست Not Available بنویسید؛ آن را عدم دریافت نخوانید.

| موعد | زمان مورد انتظار و periodStart/End | دریافت قابل سنجش | نمایش قابل سنجش | مجوز نمایش/کانال/exact/باتری و checkedAt | foreground/background/cold/locked | generation/epoch/dirty/cache و شواهد سیستم در صورت دسترسی | مشاهده/شاهد | نتیجه |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ۱ | Not Available | Not Available | Not Available | Not Available | Not Available | Not Available | اجرا نشده | Not run |
| ۲ | Not Available | Not Available | Not Available | Not Available | Not Available | Not Available | اجرا نشده | Not run |
| ۳ | Not Available | Not Available | Not Available | Not Available | Not Available | Not Available | اجرا نشده | Not run |

## فهرست screenshotهای لازم

الگوی نام: <run-id>_<issue>_<A-code>_<D-code-or-none>_<X-code-or-none>_<state>_<font>_<timestamp>.png.
- همهٔ A01…A12 در حالت قابل وقوع؛ وضعیتهای داخل Today با A01/A05 جدا؛ قبل/بعد کنترل‌های مهم، نافقط چهار PNG مرجع.
- تمام Dهای active با عنوان/کد و لغو/تأیید؛ D03 نباید قابل دسترس باشد؛ D08 هنگام بازشدن، انتخاب mode و custom.
- M-01/M-04/M-02/M-10 در RTL و فونت بزرگ؛ zero/empty/error/loading؛ حالت disabled و کنترل فقط‌آیکون.
- warning قبل grant، OS settings، A09 پس از بازگشت با checkedAt، X75 در صف خالی/موفق/خطا/running.
- A02/D02/A06/A03/A11 بدون ICATUS؛ دادهٔ before/after در evidence مجزا، از screenshot حفظ داده نتیجه نگیرید.
- screenshot به‌تنهایی اثبات handler، write-free tap، یکتایی DB یا تحویل موعد Android نیست.

## Gateها

OI-A01-R، OI-P01 و AC-A11 باز هستند. reboot/CI/build یا عبارت «سر وقت» آن‌ها را نمی‌بندد. اعداد 48h و آستانه‌های 40/60s در پیشنهاد معماری، بدون تصمیم معتبر جدید مصوب نیستند. نتیجهٔ آزمون‌های RC2 صرفاً سابقه است.


## موارد دستگاهی تکمیلی FIX02

| ID | پیش‌شرط / مسیر | انتظار | نتیجه | شاهد |
| --- | --- | --- | --- | --- |
| N15-5 | A09، شکست خواندن و اقدام مستقل X69/X70/X71/X72؛ سپس refresh موفق | فقط خطای خواندن رفع، خطای اقدام حل‌نشده باقی؛ retry موفق همان اقدام آن را رفع کند | Not run | APK/device و تصویر واقعی لازم |
| N15-6 | A09، refresh آهسته، focus/blur و بازگشت OS settings | loading/unknown درست، دادهٔ قدیمی و خطای دیررس جای دادهٔ تازه ننشینند؛ loop/listener تکراری نباشد | Not run | رویدادها و checkedAt/system state ثبت شوند |
| N16-ID | App/X75 در خطای init و حالت ready/processing، RTL و scale1/1.5/2 | کد داخل target≥48dp، حداقل14sp/LTR، فارسی کامل، wrap بدون بریدن؛ یک لمس یک handler | Not run | screenshot واقعی همه scaleها و هر دو placement |

تصاویر لازم افزوده: warning پیش از grant و پس از resume موفق؛ A09 هنگام loading، شکست refresh، display مجاز با channel بسته و exact نامعلوم؛ X70 بازگشت و خطای بازشدن؛ X75 داخل target در هر سه scale و هنگام processing. عکس ساختگی یا host renderer جای این شواهد قرار نمی‌گیرد.

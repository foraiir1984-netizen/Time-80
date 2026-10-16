# RC3-UI-REPAIR-01 — گزارش Rev01

تاریخ: 2026-10-16. اصلاح چهار ترکیب‌بندی در سورس انجام و آزمون‌های خودکار نهایی پاس شدند. **APK اصلاحی هنوز ساخته نشده؛ پذیرش بصری Android و آزمون گوشی Not run هستند.** مانع ساخت، پاسخ `Forbidden` به درخواست اجرای Actions و نبود SDK/ورودی‌های امضا در محیط محلی است. این تحویل، تأیید انتشار یا پایان تمام معیارهای task نیست.

## مبنا و اتصال شواهد

- آغاز: HEAD=`e53be49da51dd79fb5d282520060ba50fc26328e`، شاخهٔ `rc3-build-qa01-handoff`، working tree تمیز.
- نسبت با مبنای اعلام‌شده `e6fa5c1968797d5bc6bdd3e442ca1b804c4c9d85`: صفر commit عقب و دو commit مستنداتی جلو؛ هر دو حفظ شدند. remote هنگام آغاز با همین وضعیت مطابق بود.
- شاخهٔ سورس: [rc3-ui-repair01](https://github.com/foraiir1984-netizen/Time-80/tree/rc3-ui-repair01).
- **SHA دقیق سورس آزمون‌شده و آمادهٔ ساخت: `4dbc92978dad73036dc4ab021f62b2a21d186572`**؛ پس از commit، typecheck، UTC، گروه تهران و export دوباره روی همین SHA اجرا شدند.
- remote شاخهٔ سورس پس از push دقیقاً همین SHA را برگرداند. شاخهٔ `rc3-ui-repair01-handoff` از همین SHA برای مستندات ساخته شد تا شاخهٔ ساخت ثابت بماند. commit تحویل مستندات، سورس آزمون‌شده یا «commit ساخته‌شدهٔ APK» نیست؛ SHA تحویل و تأیید remote آن در پاسخ نهایی آمده و از تاریخچهٔ همین گزارش قابل بازیابی است.
- [مقایسه با مبنای ساخت قبلی](https://github.com/foraiir1984-netizen/Time-80/compare/e6fa5c1968797d5bc6bdd3e442ca1b804c4c9d85...rc3-ui-repair01).
- [manifest سورس](rc3-ui-repair01/tested-source-manifest.json): ۳۲۳ فایل. [manifest حفاظت](rc3-ui-repair01/protected-manifest.json): ۲۴۹ فایل شامل داده، سرویس‌ها، scheduler، قراردادهای روز، آیکون، دارایی‌ها، dependency و plugin امضا برابر بایتی با مبنا هستند. تغییر App فقط ارائهٔ نوار وضعیت و ارتفاع تب‌هاست؛ منطق FIX01/FIX02 تغییر نکرده است.

## منابع واقعاً بررسی‌شده

[نام، مسیر و SHA-256 منابع](rc3-ui-repair01/sources-manifest.json) ثبت شده است. ZIP اصلی `Time80_Product_UI_Handoff_2026-10-06.zip` باز شد؛ همهٔ فایل‌های متنی و هر چهار PNG اصلی جداگانه با ابزار تصویر خوانده/مشاهده شدند. [۱۲ checksum داخلی](rc3-ui-repair01/logs/design-checksums.log) معتبرند. ZIP دارای hash `f42852923f84c9d09253aa0f8853509b6d5996e9ec57a4f38a5fa77b21d70706` است.

| منبع | نسخه / نقش |
| --- | --- |
| README، MOCKUP_INDEX، Approved UI Decisions، M10 Behavior و Color Direction | بستهٔ 2026-10-06؛ ساختار و مرز تصمیم‌ها |
| Typography / Visual System Normalization | v1.0؛ اندازه، وزن، فاصله، شعاع و آیکون |
| M-01، M-02، M-04 و M-10 Final Visual Reference | چهار PNG Approved؛ مرجع ترکیب‌بندی با استثناهای پرامپت ۱۲ |
| RC3_Product_Handoff.md | 1.0، D03-005 و حفظ قابلیت‌ها |
| Release_Brief_v0.3.md | 1.2، متن D03-004 و D03-005 |
| ADR-003-04 / ADR-003-05 | 0.1؛ قرارداد روز محلی و سازگاری آیکون |
| checkpoint، گزارش‌های گزارش/اصلاح آیکون/تنظیمات/امروز/ساخت، registry و راهنما | وضعیت فعلی و سوابق؛ نسخه‌های تاریخی بازنویسی نشدند |

پنج تصویر گوشی ارسالی کاربر نیز مشاهده شدند؛ [نام و hash آن‌ها](rc3-ui-repair01/supplied-before-images.json) ثبت است. این‌ها **قبل از اصلاح** هستند؛ SHA، دستگاه، عرض منطقی، safe area و font scale آن‌ها مشخص نیست. تصویر تازهٔ Android یا مقایسهٔ before/after روی build جدید وجود ندارد. از نسبت پیکسل JPG، عرض dp حدس زده نشد. Library فرض نشد؛ منبع طراحی لازم غایب نیست.

## چهار طرح: قبل، اصلاح و پذیرش

Pass در ستون سورس، به معنای پذیرش بصری گوشی نیست. همهٔ موارد چیدمان واقعی در RTL و scaleهای ۱، ۱٫۵ و ۲ به Android نیاز دارند.

| طرح / بند | قبل | اصلاح سورس و شاهد خودکار | وضعیت سورس / native / گوشی |
| --- | --- | --- | --- |
| M-01، پنج preset | عنوان‌های بلند، ستون دارای wrap و اندازه‌گذاری نامناسب؛ احتمال خروج کد به همسایه | عنوان‌های امروز/روز قبل/۷ روز/۳۰ روز/بیشتر؛ پایهٔ مساوی، حداقل 48dp، ستون icon/title/code بدون wrap ستون؛ متن داخل ستون wrap می‌شود. selected اندازه را عوض نمی‌کند. متن بزرگ، کنترل کامل را به ردیف بعد می‌برد | Pass / Not run / Not run |
| M-01، دسترسی بازه‌ها | تمام modeها و D08 موجود | همان D08/X99، هشت mode، custom، validation، calendar/weekStart، offset و disabled؛ X100 مطلق و X85 نسبی مستقل ماندند | Pass / Not run / Not run |
| M-01، کارت گزارش | edit بزرگ و metadata/مجموع با فاصلهٔ زیاد؛ تکرار تاریخ در گزارش تک‌روز | تاریخ و edit کم‌قاب در بالا؛ metadata، مجموع، divider، مقایسه، پوشش و pending/skipped. تاریخ یکسان فقط یک بار نوشته می‌شود؛ بازهٔ چندروزه هر دو تاریخ را دارد. فونت بزرگ header را عمودی می‌کند؛ ارتفاع ثابت ندارد | Pass / Not run / Not run |
| M-04، کارت مشترک | شرط عرض حداقل 392dp باعث عمودی‌شدن در گوشی باریک‌تر؛ مجموع خارج حلقه و توضیح فنی طولانی | در عرض حداقل 360dp و scale عادی، حلقه چپ و فهرست راست؛ مجموع/برچسب داخل حلقه، نام/مدت/درصد/نشان رنگ در ردیف‌ها؛ توضیح فنی حذف شد. متن بزرگ یا مدت بسیار بلند ترکیب را عمودی می‌کند، بدون کوچک‌سازی متن | Pass / Not run / Not run |
| M-04، سایر/فهرست کامل/صفر | سه فعالیت+سایر و X101 موجود | همان projection، مجموع، کسرها و query؛ X101 فهرست کامل را پایین خلاصه باز می‌کند، بدون خواندن/نوشتن تازه. آیکون‌های فهرست کامل همچنان frame40/icon20/gap12، legacy خام و پیش‌فرض سایر callerها محفوظ‌اند. صفر و خطا روشن باقی‌اند | Pass / Not run / Not run |
| M-02، گروه‌های تنظیمات | ورودی فاصله با عنوان کشیده؛ کد/عنوان ساعات در خطوط نامتوازن | همان ترتیب شش گروه؛ ورودی فاصله 88dp پایه، عنوان کوتاه با نام دسترس‌پذیر کامل؛ آیکون کنار گروه عنوان/کد. شروع/پایان کنار هم در یک کارت و در متن بزرگ عمودی. ورودی‌ها margin اضافی ندارند؛ chips و صدا/لرزش و CTA پایین حفظ شدند | Pass / Not run / Not run |
| M-02، رفتار | autosave/onBlur و D04 موجود | callbackها، draft، validation، permission، روزها، صدا/لرزش، دو انتخاب D04 و A04→A09 بی‌تغییر؛ ذخیرهٔ عمومی اضافه نشد؛ تست تعداد write/reconcile و بارگذاری مجدد پاس است | Pass / Not run / Not run |
| M-10، هدر/ساعت/شمع | هدر بلند و فاصله‌های عمودی زیاد؛ توضیح درصد بیرون حلقه | نیمه‌های هم‌عرض تصویر چپ/عنوان راست در متن عادی، تصویر 96dp و ارتفاع طبیعی متن؛ پیام خنثی با normalization؛ ساعت واقعی 42/50، بدون caption تکراری. شمع پذیرفته‌شده کوچک‌تر و کنار حلقه؛ درصد و متن کوتاه داخل حلقه | Pass / Not run / Not run |
| M-10، Timeline | ردیف‌ها از قبل در A01 موجود بودند؛ X08 بزرگ و کنترل‌های مرور پیش از ردیف‌ها جا می‌گرفتند | X08 «مرور کامل» کنار عنوان؛ محور/نشان/ردیف واقعی مستقیماً پس از راهنمای کوتاه. در A01 کنترل‌های روز/X07/backlog و شمارش‌ها به footer ردیف‌ها منتقل شدند؛ A05 کنترل‌های خود را در بالا دارد. مشاهدهٔ عنوان و آغاز ردیف در viewport نخست، اندازه‌گیری native نشده است | Pass / Not run / Not run |
| M-10، مسیر و گذر زمان | items.find و timelinePresentation مستقل؛ timer دقیقه‌ای و focus/resume موجود | همان انتخاب X07، کپی نزولی، route/context، آیندهٔ disabled و pending/skipped/logged؛ همان progress مشترک و clamp/unknown، بدون write ثبت در tick؛ دارایی کوه و هندسه/پویایی شمع بازسازی نشدند | Pass / Not run / Not run |

اختلاف بازِ قطعی، **نبود پذیرش و اندازه‌گیری native روی APK اصلاحی** است. از style یا renderer نتیجهٔ «بدون بریدگی/هم‌پوشانی روی گوشی» استنتاج نشده است. انطباق crop، اندازهٔ حلقه و متن بلند، تراز ورودی‌ها، safe area و آغاز Timeline در viewport نخست باید در اجرای واقعی بازآزمایی شوند.

## فایل‌های تغییرکرده و علت

- `ReportButton.tsx` و `ReportRangeControls.tsx`: چیدمان preset و عنوان‌های کوتاه؛ موتور بازه تغییر نکرد.
- `InsightsScreen.tsx` و `ReportActivitySummary.tsx`: ترتیب کارت و ترکیب حلقه/فهرست، total داخل حلقه و حذف توضیح فنی عادی؛ محاسبات سرویس ثابت‌اند.
- `SettingsScreen.tsx` و گزینه‌های اختیاری `label/stackLabel` در `Ui.tsx`: برچسب‌های جمع‌وجور و header هماهنگ ورودی؛ پیش‌فرض سایر Inputها و handlerها حفظ شدند.
- `TodayOverview.tsx`، `DayPassage.tsx` و `TodayScreen.tsx`: اندازه و فاصله، محتوای داخل حلقه، عنوان/X08 و انتقال کنترل‌ها به footer A01. گزینهٔ اختیاری showActions برای مصرف مستقل Overview باقی است؛ Today واقعی آن را false می‌دهد و هر X07/X08 تنها یک target دارد.
- `App.tsx`: کاهش خط خالی اضافی رزرو تب‌ها از 72 به 48sp مبنا؛ اندازه‌گیری واقعی label و safe area و رشد با scaling باقی است. StatusBar با متن تیره روی سطح روشن؛ مسیرها، ترتیب تب‌ها و FIXها ثابت‌اند.
- `tests/react-native.mjs`: مدل‌کردن footer واقعی FlatList و StatusBar. `visualIntegration.test.tsx`: یافتن X08 با کد ثابت به‌جای عنوان قدیمی؛ assertionهای مقصد/زمان/Backlog باقی‌اند. `v03UIRepair.test.tsx`: سه تست واقعی screen برای متن مجاز زیر Text، یک target و یک handler X07/X08، همان بازهٔ fixture و footer در هر سه scale؛ شاهد خوانایی native نیستند.
- registry فقط sites تازه گرفت؛ guide/CSV از همان registry تولید شدند. generator فقط ارجاع پوشش را به این مرحله برد. کد/معنا/status/نسخهٔ Rev04 عوض نشدند؛ **۱۱۲ فعال، ۱۰ رزرو، ۱۵۰ ردیف پوشش و Pending=0**. [پوشش](rc3-ui-repair01/RC3_UI_Coverage_Rev01_FA.md)، [راهنما](RC3_UI_Code_Guide_FA.md)، [CSV](RC3_UI_Code_Guide_FA.csv).
- `app.json`: فقط versionCode از ۵ به ۶. `build-android-release.sh`: ثبت metadata واقعی APK، checksum و fingerprint عمومی در log/artifact. workflow موجود فقط نام/path artifact را اصلاح کرد؛ trigger، input، job، permission و secretها تغییر نکردند.

ICATUS همچنان hidden؛ D03 و کدهای طبقه‌بندی رزرو هستند. schema، migration، assignment، revision، Undo، scheduler، payload، permission policy و dependency تغییر نکردند. countdown اضافه نشد.

## آزمون نهایی روی SHA بالا

| نتیجه | فرمان / بررسی | شاهد و حد |
| --- | --- | --- |
| Pass | `npm run typecheck` | [log](rc3-ui-repair01/logs/typecheck.log) |
| Pass، 149/149 | `TZ=UTC TIME80_UI_EVIDENCE_DIR=/workspace/work/rc3-ui-repair01/final/witness-UTC timeout 120 npm test` | [log کامل](rc3-ui-repair01/logs/tests-UTC.log)؛ fail/skip/cancel=0 |
| Pass، 138/138 | گروه ۱۵ فایل مرتبط با `TZ=Asia/Tehran`؛ فرمان کامل در results.json | [log](rc3-ui-repair01/logs/tests-Tehran.log)؛ suite کامل تهران نیست؛ fail/skip/cancel=0 |
| Pass | `CI=1 EXPO_NO_TELEMETRY=1 npx expo export --platform android --output-dir /workspace/work/rc3-ui-repair01/export` | [log](rc3-ui-repair01/logs/export-android.log)، [manifest](rc3-ui-repair01/export-verification.json): ۱۸۷ asset، hash هر چهار TTF و تصویر کوه مطابق منبع؛ export APK یا اجرای native نیست |
| Pass | registry/guide/CSV، ۱۱۲ کد مشاهده‌شده در جریان‌های واقعی renderer | [شاهد](rc3-ui-repair01/rendered-code-evidence-UTC.json)؛ پذیرش AC-ID native نیست |
| Pass | وزن واقعی Vazirmatn و حفظ دارایی‌ها | [فونت‌ها](rc3-ui-repair01/fonts.json): 400/500/600/700؛ فایل‌های اجرایی جدید تولید نشدند |
| Pass | `bash -n scripts/build-android-release.sh` | فقط syntax؛ اجرای native/گیت metadata تازه Not run |
| Fail | dispatch واقعی workflow | [خطای دقیق بدون اطلاعات حساس](rc3-ui-repair01/dispatch-attempt.json)؛ ساخت تازه شروع‌شده فرض نشد |
| Not run | APK release تازه، امضا و checksum تازه، نصب/ارتقای RC3 | run تازه/باینری موجود نیست |
| Not run | Android: چهار طرح، D08/X101/D04/A01/A05، RTL و scaleهای ۱/۱٫۵/۲، صفر/خطا/متن بلند/disabled، target و overlap، safe area و viewport | [runtime](rc3-ui-repair01/runtime.json): SDK/adb/emulator/apksigner/aapt2 و KVM موجود نیستند |
| Not run | اعلان→بازه→ثبت، duplicate و Undo روی گوشی؛ ارتقا و مقایسهٔ داده | رگرسیون خودکار پاس؛ پذیرش گوشی باز و الزامی |
| Not run / Deferred | TalkBack | تنها مورد Deferred فعلی |

نتایج مرحله‌ای ناموفق از نتیجهٔ نهایی جدا هستند: lookup قدیمی عنوان X08 با کد پایدار جایگزین شد؛ sites قدیمی registry دوباره تولید شدند؛ fixture تازهٔ تست repair ابتدا با یادآوری خاموش، pending ایجاد نمی‌کرد و با درج مصنوعی بازهٔ معلوم اصلاح شد. رفتار محصول برای سبزشدن تغییر نکرد؛ assertion یا پوشش X07 حذف/skip نشد. فایل‌های fixture قبلی X07 و progress دست‌نخورده‌اند؛ آزمون نهایی روی تاریخ میزبان ۱۶ اکتبر با fixture ثابت ۱۲ اکتبر پاس شد.

## ساخت، مانع و موارد باز

آخرین run مشاهده‌شدهٔ مخزن، [38385334458](https://github.com/foraiir1984-netizen/Time-80/actions/runs/38385334458)، متعلق به **سورس قدیمی e6fa5c…** است؛ validate و release موفق و artifact `Time80-v0.2-APK` دارد. [شاهد artifact](rc3-ui-repair01/baseline-run-artifacts.json) به همان SHA متصل است؛ app.json آن SHA دارای versionCode=5 است. نسخهٔ ۶ از این سابقهٔ واقعی انتخاب شد؛ وضعیت نصب شخصی کاربر مستقلاً خوانده نشده است. انتقال ZIP قدیمی به executor به محدودیت 32MiB برخورد کرد؛ metadata خود APK قدیمی در این task استخراج نشد. گزارش موفقیت تاریخی، ساخت تازه یا پذیرش ظاهری اصلاح حاضر نیست.

برای سورس اصلاحی: applicationId و نام نسخه در config همان `com.personal.time80` / `0.3.0` هستند؛ **APK SHA-256، fingerprint تازه، version استخراج‌شده، target SDK واقعی و SHA ساخته‌شده فعلاً Not run/فاقد مقدار هستند**. SHA آمادهٔ ساخت با SHA APK ساخته‌شده یکی فرض نشده است. کلید تازه/debug signing ساخته نشد؛ keystore/APK/ZIP/node_modules وارد Git نشدند.

[راهنمای اجرای دقیق ساخت](RC3_UI_REPAIR_01_Build_Guide_FA.md) آماده و درخواست اجرای Run workflow برای همین شاخه/ورودی با کاربر مطرح شد؛ تأیید صفحه‌به‌صفحه درخواست نشد. اجرای جدید یا رفع محدودیت شبکه فرض نشده است. پس از دریافت run موفق، metadata/checksum/گواهی با RC2 تطبیق و APK این task تحویل می‌شود؛ سپس QA واقعی چهار طرح و نصب بدون uninstall لازم است.

Known Issues:

- **محصول / پذیرش باز:** P03-014/P03-019 و QA گوشی P03-015/P03-016 و ارتقا بسته نشده‌اند. cache/reconcile/build/export اثبات دریافت اعلان نیستند.
- **محیط / آزمون اجرا‌نشده:** ساخت تازه با Forbidden مسدود است؛ اجرای Android و اندازه‌گیری بصری Not run. این‌ها به‌عنوان ایراد محاسبات گزارش ثبت نشده‌اند.
- **fixture تاریخی نامرتبط:** شکست core در تهران و سابقهٔ TZ unset حفظ شده‌اند؛ این task full suite تهران یا TZ unset را دوباره اجرا/بسته اعلام نکرد. اصلاحات قبلی fixture X07 و progress با رگرسیون جاری پاس‌اند.

merge، force push یا انتشار عمومی انجام نشد. این checkpoint اجازهٔ شروع مرحلهٔ بعد نیست.

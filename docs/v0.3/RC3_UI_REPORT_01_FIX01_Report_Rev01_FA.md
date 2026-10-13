# RC3-UI-REPORT-01-FIX01 — Rev01

2026-10-13، Asia/Tehran؛ پرامپت۸-الف. اصلاح محدود نمایش آیکون فهرست کامل A03. انطباق سورس انجام شد؛ پذیرش native Android هنوز Not run است.

## نتیجه، مبنا و محدوده

قاب asset در فهرست کامل اکنون۴۰×۴۰dp و تصویر۲۰×۲۰dp است. منبع همان PNG موجود۲۴ با densityهای موجود است؛ `asset20` یا فایل/کلید تازه ساخته نشد. آیکون و نام، دو فرزند مستقیمِ یک گروه با gap12 هستند؛ marker بیرون این گروه قرار دارد و دیگر میان آیکون و متن نیست. آیکون decorative است و target/handler تازه ندارد.

HEAD شروع `69e7be150c0e030b4cf9e5217e9957f10bc15e72`، شاخه `rc3-ui-report01`، working tree پاک و ancestry0/0 بود؛ تغییر جدیدتری وجود نداشت. شاخه اختصاصی **rc3-ui-report01-fix01-icons** از همان checkout کامل ساخته شد؛ remote هم‌نام در بررسی اولیه موجود نبود. هیچ reset یا بازگشت به checkout قدیمی برای پیاده‌سازی انجام نشد. archive مستقل مبنا فقط برای آزمون مقایسه‌ای خوانده شد.

**سورس نهایی آزمون‌شده:** `34f215a04cf74c5795da74e5679082c37af71bd2`. commit تحویل پس از آن فقط همین docs/evidence، شامل فایل بازتولید ساعت fixture، را اضافه می‌کند؛ کد برنامه/تست‌ها بعد از این SHA تغییر نمی‌کنند. SHA کامل تحویل و remote پس از push در پاسخ نهایی اعلام می‌شود؛ برای یافتن commit سند: `git log -1 --format=%H -- docs/v0.3/RC3_UI_REPORT_01_FIX01_Report_Rev01_FA.md`. این دو SHA یکی فرض نشده‌اند.

## منابع واقعاً خوانده‌شده

| منبع | نسخه / مسیر / کاربرد |
| --- | --- |
| RC3_UI_REPORT_01_Report_Rev01_FA.md | Rev01؛ `docs/v0.3/`؛ گزارش تاریخی و اختلاف52/40؛ بایت‌های آن محفوظ‌اند |
| Time80_Visual_System_Normalization_v1.0_FA.md |1.0؛ `docs/v0.3/rc3-ui-report01/design-inputs/02_Design_System/`؛ container40/icon20/gap-to-text12، هدف48 و شعاع16 |
| ADR-003-05_Icon_Compatibility.md |0.1 Accepted،2026-09-30؛ `/workspace/work/rc3-inspection/contracts/02_Architecture/v0.3/`؛ raw آزاد/metadata مستقل، resolver، source sizes24/30/32 و default قبلی52 |
| Architecture_Icon_Review_v0.3.md |0.1،2026-09-30؛ همان مسیر Architecture؛ تقدم ADR و هویت asset/legacy |
| سورس و تست‌های جاری | ActivityIcon،ReportActivitySummary،iconModel/iconAssets و callerهای واقعی؛ visualIntegration،v03Data،v03ReportUI،UI/flows/identifiers و FIX lifecycle/response/notifications بررسی شدند |

hash و مسیر منابع در `rc3-ui-report01-fix01/sources-read.json` است. دستور جاری پرامپت۸-الف است؛ دستورهای تاریخی در اسناد قرارداد مجوز اجرای task دیگر نیستند. برای اصلاح محدود، normalization بر اندازهٔ نمایشی گزارش حاکم است؛ قرارداد هویت/raster و defaultهای سایر صفحه‌ها محفوظ‌اند.

## قبل/بعد و فایل‌های تغییرکرده

| محل | قبل | بعد / دلیل |
| --- | --- | --- |
| ActivityIcon.tsx / AssetIcon | size هم انتخاب منبع و هم اندازه نمایش؛ frame52 ثابت | prop اختیاری `presentation: {containerSize, iconSize}`؛ فقط اندازه نمایش را جدا می‌کند؛ lookup منبع همچنان `ICON_ASSETS[iconKey][size]` |
| فهرست کامل asset | source24،image24،frame52 | source24،image20،frame40؛ همان key/tint/background/radius16، فقط مقیاس نمایش |
| legacy در فهرست کامل | font24،width52/minHeight52؛ raw قبلی | font20sp با scaling،width40/minHeight40؛ متن خام دقیق، width100% برای wrap، ارتفاع آزاد؛ استثنای ارتفاع پایین توضیح داده شده است |
| چیدمان ردیف کامل | آیکون → marker12 → نام؛ gap8 میان فرزندان | marker خارج از گروه؛ گروه مستقیم آیکون → نام،gap12،row-reverse و minWidth0؛ marker فاصله را مصرف نمی‌کند |
| نمای خلاصه۳+سایر | marker و نام با gap8 | همان ترتیب/فاصله و داده؛ گروه تازه فقط در حالت expanded |
| default سایر callerها | ActivityIcon32/frame52،size24/30/32؛ AssetIcon24 بدون frame؛ legacy32/width52/minHeight52 | همان مقادیر؛ هیچ caller دیگری opt-in نکرده؛ scaling صریح legacy همان default فعال React Native است |
| tests/v03ReportUI.test.tsx |۱۲تست گزارش | فقط یک تست متمرکز اضافه شد: defaultها/منبع/هویت، report40/20، همسایگی12، raw ناشناخته/ZWJ/نام بلند و scales1/1.5/2؛ تست‌های قدیمی و انتظارها حذف/skip/بازنویسی نشدند |

فقط این سه فایل سورس/تست تغییر کردند. registry،guide/CSV و محل شناسه‌ها byte-identical هستند: RC3-ID-01-Rev04،۱۲۲تخصیص،۱۱۲فعال،۱۰رزرو،۱۳۹binding؛ پس تولید مجددِ بدون تغییر، فایل تازه‌ای در diff ایجاد نکرد. هیچ کد/معنا/وضعیت تغییر نکرد؛ X101 همان inline expansion است. تطابق registry/راهنما/سورس آزموده شد؛ پوشش تاریخی مرحله۸ حفظ است و delta این اصلاح در `coverage-delta-Rev01.csv` ثبت شده است.

۳۰۵فایل حفاظت‌شده با مبنا byte-identical هستند؛ manifest۳۰۸فایل سورس آزمون‌شده را hash می‌کند. App،FIX01/FIX02،query/reportPeriods/reportService،محاسبات،Donut،۳+سایر،ICATUS hide،schema/services/repository/scheduler و تمامی دارایی‌ها،dependencyها و سایر callerها تغییر نکردند. اسناد RC2 و گزارش Rev01 قبلی بازنویسی نشدند.

## legacy بلند و محدودیت دقیق قاب

ADR اجازه رشتهٔ خام آزاد، از جمله فارسی، `work`، متن شبیه JSON و ZWJ را می‌دهد. fixture متمرکز شامل این رشتهٔ دقیق با newline است:

```text
متن قدیمی بسیار بلند 👨‍👩‍👦 work {"kind":"asset"}
سطر دوم
```

قاب سختِ40×40 با متنِ چندخطی در scale200% با حفظ کامل raw و ممنوعیت کوچک‌سازی/برش سازگار نیست. برای legacy، عرض40 و حداقل ارتفاع40 اعمال شد؛ ارتفاع با محتوا رشد می‌کند. اندازه پایه20sp است، نه فشرده‌سازی برای جاگرفتن. `allowFontScaling=true`، بدون numberOfLines،adjustsFontSizeToFit،maxFontSizeMultiplier یا overflow:hidden است. این استثنای **ارتفاع متن legacy** صریح است؛ قاب asset دقیقاً40×40 باقی می‌ماند. شاهد، رشتهٔ واقعی fixture و props/rendered children در تست است؛ ارتفاع نهایی/glyph/شکستن متن روی Android اندازه‌گیری نشده و Not run است. ادعای «همه legacyها مربع ثابت40 هستند» نمی‌شود.

نام فعالیت کامل و قابل wrap می‌ماند؛ raw نه normalize می‌شود، نه به key تبدیل و نه در داده ذخیرهٔ تازه می‌شود. خود آیکون handler ندارد. کنترل X101 و سایر Buttonها همان targetهای حداقل48 در سورس را دارند؛ اندازه‌گیری target واقعی جدا Not run است.

## اعتبارسنجی نهایی و حدود شاهد

فرمان کامل هر اجرا/SHA/ساعت/نتیجه در `validation-record.json` و۳۴۷ردیف نتیجه در `test-results-Rev01.csv` است. همه اجراهای نهایی سورس جاری بر SHA34f215a هستند. دو Fail ساعت جاری در گروه‌ها شامل **یک تست X07 و hook پوشش وابسته به آن** هستند؛ دو ایراد محصول مستقل نیستند. هیچ skipped/cancelled وجود ندارد.

| آزمون | نتیجه | فرمان / شاهد / حد |
| --- | --- | --- |
| typecheck نهایی | Pass | `npm run typecheck`،exit0؛typecheck.log |
| تمام۱۳تست گزارش،از جمله تست متمرکز جدید | Pass در UTC و Asia/Tehran | داخل گروه‌های مرتبط؛ raw/هویت/defaultها/40/20/12 و config سه scale؛ renderer/service شاهد native نیست |
| گروه مرتبط UTC و رگرسیون callerها | **Fail**؛116Pass/118،دوFail | related-UTC.log؛ X07 تاریخ‌ثابت و hook؛ سایر آزمون‌ها،از جمله۷visual وFIXها پاس‌اند؛ suite کامل نیست |
| گروه مرتبط Asia/Tehran | **Fail**؛109Pass/111،دوFail | related-Asia-Tehran.log؛ همان X07 و hook؛ گزارش/داده/legacy/UI/ICATUS/registry/FIXها پاس‌اند؛ suite کامل نیست |
| شناسه‌ها با ساعت جاری در archive مبنا69e7،هر دو timezone | **Fail**؛16Pass/18،دوFail در هر اجرا | baseline-identifiers-UTC/Asia-Tehran.log؛ همان X07/hook؛ تاریخ fixture12اکتبر با روزجاری13اکتبر متفاوت است |
| اجرای تکمیلی۱۷سناریوی شناسه در تاریخ fixture | **Pass**؛17/17 در هر چهار اجرا | مبنا و نهایی،UTC وTehran؛ ساعت ثابت2026-10-12T12Z،نه ساعت جاری؛خطای بالا را رفع/پنهان نمی‌کند |
| visualIntegration در Tehran | **Fail / Known Issue**؛6Pass/7 | visual-Asia-Tehran.log؛progress65≠50،همان شواهد تاریخی `../rc3-fix02/baseline-visual-Asia-Tehran.log`؛انتظار/محصول تغییر نکرد |
| native asset/legacy/متن بلند،RTL/scales1/1.5/2،اندازه target | Not run | runtime-check.json؛adb/emulator/native Android project/build/device موجود نیست؛fixture/renderer تصویر گوشی نیست |
| full UTC suite،TZ unset وcore Tehran fixture | Not run این اصلاح | task آزمون‌های مرتبط خواسته است؛full suite اجرا نشد؛Known Issueهای قبلی باز هستند |
| QA دستگاه اعلان P03-015/P03-016 و ارتقا | Not run / باز و الزامی | تحویل اعلان/ارتقا اثبات نشده؛Deferred نیست |
| TalkBack | Deferred / Not run | تنها QA تعویق‌داده‌شده |

گروه مرتبط این فایل‌های واقعی را بدون skip اجرا می‌کند؛ در UTC،visualIntegration نیز به همین گروه اضافه شده است:

```sh
TZ=Asia/Tehran node --import ./tests/register.mjs --import tsx --test --test-reporter=tap \
  tests/v03ReportUI.test.tsx tests/v03ClassificationPolicy.test.ts \
  tests/v03IcatusHideUI.test.tsx tests/v03Data.test.ts \
  tests/v03IdentifierFlows.test.tsx tests/v03UIIdentifiers.test.tsx \
  tests/v03LifecycleUI.test.tsx tests/v03ResponseUI.test.tsx \
  tests/v03Notifications.test.ts tests/v03UI.test.tsx
```

بازتولید تکمیلی fixture،برای هر دو timezone وهر دو سورس:

```sh
TZ=Asia/Tehran node --import ./docs/v0.3/rc3-ui-report01-fix01/freeze-fixture-date.mjs \
  --import ./tests/register.mjs --import tsx --test --test-reporter=tap \
  tests/v03IdentifierFlows.test.tsx
```

در زمان آزمون،فایل clock از work خوانده شد؛نسخه این پوشه byte-identical/hash-equal است. این helper فقط setup فرایند آزمون است، وارد برنامه نمی‌شود و TZ/داده/انتظارها را تغییر نمی‌دهد. شکست ساعت جاری مبنا/نهایی و aggregate قرمز محفوظ‌اند. رفع fixture تاریخ‌ثابت task جدا می‌خواهد؛ تبدیل نتایج بالا به ادعای suite سبز مجاز نیست.

اجراهای اولیه Fail نیز در logهای initial محفوظ‌اند: helper نخست والدِ port Image را به‌جای host View خواند؛ سپس TS7006 و ناسازگاری typing نام host در ReactTestInstance اصلاح شد. این تغییرها فقط تست جدید بودند. typecheck نهایی و تست متمرکز پس از اصلاح Pass شدند؛ نتیجهٔ draft جای نتیجه نهایی نیامده است.

## وضعیت تحویل و قدم بعدی

اختلاف قدیمی52/24 وmarker میان آیکون ونام در سورس رفع شده است؛ استثنای ارتفاع raw متنی و پذیرش native باز هستند. Known Issueهای TZ unset،progress تهران،core interval تهران و fixture تاریخ‌ثابت X07 جدا ثبت و بسته اعلام نشدند. P03-014/P03-019 باز؛QA واقعی Android،اعلان وارتقا الزامی باقی‌اند. M-02/M-10،dependency،countdown Undo ومرحله بعد اجرا نشدند.

کوچک‌ترین قدم بعدی پس از بررسی دفتر،QA روی build/device معلوم برای فهرست کامل با asset/legacy/متن بلند در سه scale،با اندازه‌گیری واقعی target است؛ fixture تاریخ‌ثابت نیز نیازمند اصلاح آزمون با دامنه جدا است. این task پس از تحویل متوقف می‌شود.

کد/تست مرتبط وشواهد متنی مصنوعی پس از diff/security review ثبت می‌شوند؛APK/ZIP/node_modules/credential وارد Git نمی‌شوند. commit/push عادی روی شاخه اختصاصی،بدون merge/force-push/workflow/Release انجام می‌شود. status و SHA remote باید در تحویل نهایی واقعاً خوانده شوند.

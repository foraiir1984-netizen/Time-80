# تحویل RC3-UI-REPORT-01 — Rev01

2026-10-12، Asia/Tehran. پرامپت۸؛ اجرای M-01/M-04 در A03. سورس و رفتار قابل‌آزمون تکمیل‌اند؛ پذیرش بصری و تعامل واقعی Android همچنان Not run است.

## نتیجه و مبنا

A03 اکنون پنج quick preset، D08 برای بقیهٔ بازه‌ها/تنظیمات، metadata جدا و «خلاصه فعالیت‌ها» با Donut سهم زمان دارد. سه فعالیت اصلی انتخاب شدند؛ «سایر» جمع دقیق بقیه است. X101 همهٔ فعالیت‌های همان نتیجه را inline نشان می‌دهد؛ مجموع/query تغییر نمی‌کند. حالت صفر/loading/error و شناسه‌های قابل‌دیدن حفظ شدند. ICATUS به رابط برنگشت.

HEAD شروع دقیقاً `ddc320ffa45867f2db3a38261e1489c91ff672d6`، شاخهٔ `rc3-icatus-hide01-ui`، working tree پاک و ancestry0/0 بود. SHA origin همان مبنا دوباره خوانده شد؛ شاخهٔ اختصاصی remote وجود نداشت. از همان checkout کامل شامل FIX01/FIX02/ID01/HIDE01، شاخهٔ **rc3-ui-report01** ساخته شد. reset یا بازگشت به work/RC2 انجام نشد و تغییر جدیدتری برای حذف وجود نداشت.

دستور اجرایی این مرحله پرامپت۸ است. Handoff و اسناد طراحی مرجع دامنه/رفتار/ظاهر هستند؛ دستور تاریخی ساخت APK/اجرای هر چهار طرح در Handoff به‌عنوان مجوز تازه اجرا نشد. M-02/M-10، scheduler/schema/migration/data/policy/workflow/انتشار خارج از محدوده ماندند.

## منابع واقعاً خوانده‌شده

بستهٔ uploaded `Time80_RC3_Codex_Inspection_Inputs_2026-10-06.zip` از filesystem همین محیط باز شد؛ ZIP داخلی `original/Time80_RC3_Office_Start.zip` و سپس `inputs/Time80_Product_UI_Handoff_2026-10-06.zip` نیز باز شدند. دسترسی به Library فرض نشد. PNGهای M-01 و M-04 جدا با ابزار تصویر مشاهده شدند؛ تمام۱۲ checksum داخلی معتبر بود. hash ZIP طراحی `f42852923f84c9d09253aa0f8853509b6d5996e9ec57a4f38a5fa77b21d70706` است.

ریشهٔ خواندن طراحی: `/workspace/work/rc3-inspection/design/Time80_Product_UI_Handoff_2026-10-06/`. نسخه/نام/مسیر دقیق و hash در `rc3-ui-report01/design-source-manifest.json` است. فایل‌ها با بایت اصلی در `rc3-ui-report01/design-inputs/` نگهداری شدند؛ تصاویر این پوشه **مرجع طراحی** هستند و screenshot اجرای برنامه نیستند.

| منبع | نسخه / وضعیت | مسیر در مخزن برای بازبینی |
| --- | --- | --- |
| RC3_Product_Handoff.md |1.0،2026-10-06؛ D03-005 بخش۱ همین سند است، نه فایل فرضی جدا | design-inputs/RC3_Product_Handoff.md؛ نسخهٔ current/01_Product در بسته و نسخهٔ original خوانده شد |
| Time80_Approved_UI_Decisions_FA.md | Approved،بسته2026-10-06؛۳…۵ فعالیت اصلی | design-inputs/01_Product_Decisions/Time80_Approved_UI_Decisions_FA.md |
| Time80_Typography_Normalization_v1.0_FA.md |1.0؛ منبع اندازه/فونت/وزن | design-inputs/02_Design_System/Time80_Typography_Normalization_v1.0_FA.md |
| Time80_Visual_System_Normalization_v1.0_FA.md |1.0؛ منبع فاصله/شعاع/هدف لمس | design-inputs/02_Design_System/Time80_Visual_System_Normalization_v1.0_FA.md |
| Color_Direction_Note_FA.md | جهت مصوب؛ hex نهایی در ZIP تعیین نشده | design-inputs/02_Design_System/Color_Direction_Note_FA.md |
| README_FA.md و MOCKUP_INDEX_FA.md | بسته2026-10-06؛ اولویت تصمیم→normalization→PNG | design-inputs/00_README/ |
| M-01_Report_Time_Range_APPROVED.png | Approved؛ مرجع ترکیب‌بندی، نه استخراج اندازه | design-inputs/03_Approved_Mockups/M-01_Report_Time_Range_APPROVED.png |
| M-04_Activity_Summary_Donut_APPROVED.png | Approved؛ متن آن مقدم بر «پارتو» در M-01 | design-inputs/03_Approved_Mockups/M-04_Activity_Summary_Donut_APPROVED.png |
| مرجع شناسه Rev01 و الحاقیه X102 | تخصیص تاریخی معتبر،بدون بازشماری | ../RC3_UI_Identifiers_Reference_Rev01.md و ../RC3_UI_Identifiers_Addendum_6B_Rev01.md |

مرجع لازم طراحی Not Available نبود. **باینری فونت در ZIP نبود**؛ از upstream رسمی `rastikerdar/vazirmatn`، tag `v33.003`، چهار فایل Regular/Medium/SemiBold/Bold همراه OFL1.1 تهیه شدند. URL/hash/نسخه در `assets/fonts/vazirmatn/source.json`؛ فونت فارسی جایگزین حدسی انتخاب نشد. فونت واقعی روی گوشی هنوز Not run است.

پیش از ویرایش، InsightsScreen، reportPeriods، reportService، Ui، time80Theme و registry خوانده شدند. API آیکون موجود نیز بررسی شد؛ استفادهٔ فهرست کامل از اندازهٔ موجود۲۴px است، نه API اندازه۲۰ فرضی.

## فایل‌ها و دلیل تغییر

| فایل / گروه | اجرا و حفاظت |
| --- | --- |
| InsightsScreen.tsx | ترکیب صفحه/metadata و بارگذاری فونت؛ q،loadPreferences،persist موجود، focus/active/day refresh، getReport و guard resultQuery/alive همان قرارداد قبلی |
| ReportRangeControls.tsx | فایل تازه بعد از بررسی ساختار؛ پنج preset، D08،۸mode،relative navigation،calendar/week start و inputهای custom؛ خود open/close فقط UI state |
| ReportActivitySummary.tsx | فایل تازه؛ projection نمایشی۳+سایر،SVGDonut،legend و فهرست کامل؛ raw r.activities/r.total،ترتیب موجود؛ آیکون و سهم تجمعی قدیمی در فهرست کامل محفوظ |
| ReportButton.tsx / reportTheme.ts | سبک مختص گزارش با فونت/spacing/radius normalized،glyph20،هدف48،کد در همان Button؛سبز گرم فعال/series و نارنجی مکمل CTA،برگرفته از palette موجود نه نمونه‌برداری PNG |
| Ui.tsx | فقط props اختیاری font/color/container/content/icon؛ Badge14/LTR/scaling،handler/ref/disabled/input focus/onBlur و defaultهای صفحات دیگر محفوظ؛ styles default به شکل قبلی نگه داشته شدند |
| uiIdentifiers.ts / generatorها / guide/CSV | نسخه RC3-ID-01-Rev04،فقط فعال‌سازی۴تخصیص مصوب؛ محل‌های جاری sync،توضیح X18 برای D08 به‌روز؛ هیچ کد تازه یا تخصیص دوباره |
| package.json / lock / fonts | expo-font57.0.4 و react-native-svg15.15.4 مطابق bundledNativeModules Expo57؛font loader و Donut vector لازم‌اند. expo-font از dependency تو‌در‌توی همان نسخه hoist شد؛ نسخهٔ هیچ dependency قدیمی ارتقا نیافت |
| tests/ |۱۲تست تازهٔ UI/داده گزارش؛ mock فقط host فونت/SVG/TTF؛ تست‌های قبلی برای محل جدید Modal و۴فعال‌سازی معتبر تطبیق یافتند؛ هیچ حذف/skip یا تغییر انتظار داده/زمان انجام نشد |
| docs و design-inputs | منابع قابل‌ردیابی،تطبیق،پوشش،لاگ و checkpoint؛سوابق FIX/ID/HIDE/RC2 دست‌نخورده |

۱۲۱ فایل حفاظت‌شده byte-identical با مبنا هستند؛ services/db/data/types/notifications/icons، App،time80Theme اصلی،ActivityEditor/CheckIn/diagnostics و اسناد تاریخی محفوظ‌اند. reportPeriods.ts و reportService.ts حتی یک بایت تغییر نکردند. schema/migration/dataset/default/assignment/history/scheduler/manifest/SDK/signing/applicationId/versionCode تغییر نکردند.

## جدول تطبیق M-01/M-04

«Pass» جدول زیر شاهد سورس/رفتار renderer/service است؛ تطبیق واقعی layout/فونت/target روی Android جدا Not run است.

| بند مصوب / task | اجرا | نتیجه و شاهد |
| --- | --- | --- |
| M-01 پنج preset اصلی | امروزX77،روزقبلX100،۷روز اخیرX82،۳۰روز اخیرX83،بیشترX99؛یک گروه با glyph و code،wrap responsive | Pass؛ تست default پنج کنترل و hidden secondaryها؛ Source ReportRangeControls |
| بازه فعال روشن | quickها فقط mode/offset دقیق،سایرmode/offsetها More را active می‌کنند؛گزینهٔ mode در D08 selected؛Date/result از query یکسان | Pass؛ هشتmode و More active،resultQuery/aliveguard؛ visual native Not run |
| D08 و X99 بدون query/write تازه | Modal Bottom Sheet با scroll/safe area؛دو ورودی صفحه/pencil metadata همان X99؛open فقط setMoreOpen | Pass؛open/close/backdrop/system-back read0/write0/history equal |
| همهٔ۸mode موجود | day/week/month/usage7/usage30/rolling7/rolling30/custom در D08 با کدهای قبلی | Pass؛ UI واقعی q/range/total/activities با getReport برای هر mode |
| X100 با X85 متفاوت | X100 day/-1 مطلق؛X85 offset-1 در mode فعلی؛X86 فقط offset0؛X87 disabled در offset>=0 | Pass؛month-2→X100 day-1،relativeday-2،current mode ثابت؛مدل بازه تغییر نکرد |
| custom/validation/date/calendar/week start | ورودی متنی موجود Gregorian YYYY-MM-DD؛draft بدون read،X90 apply،end inclusive؛انتخاب قبلاً اعمال‌شده باclose rollback نمی‌شود | Pass؛تاریخ نامعتبر/معکوس/همان‌روز،week/month/persian/gregory/Tehran boundary؛date picker تازه ساخته نشد |
| metadata جدا | Date/timezone/partial/calendar/week start جدا از presets؛controlهایcalendar/week داخلD08 | Pass سورس؛متن timezone/codes مستقلLTR؛Native Bidi/layout Not run |
| M-04 عنوان و سهم زمان | «خلاصه فعالیت‌ها»؛Donut سهم r.activities/r.total،نهdayProgress؛زمان کل در hero و مجاور Donut | Pass؛fixture ۵h،SVG arc shares50/30/10/10؛هیچ شمارش روز/قضاوت بهره‌وری |
|۳…۵ فعالیت و سایر دقیق | انتخاب۳ از دامنه مصوب،مطابقPNG؛سایر=sum(slice3)،بدون sorting/rounding داده | Pass؛۷فعالیت150/90/30/15/10/3/2→main270،other30،total300؛fractional raw/frozen fixture |
| X101 واقعاً همهٔ همان نتیجه | inline list جای legend خلاصه را می‌گیرد،همه۷نام/مدت/سهم؛code درdisabled پس از گسترش؛Donut/total/query ثابت | Pass؛read0/write0/history/query unchanged؛Icons/cumulative legacy حفظ |
| zero/loading/error | ring neutral صفر/بدونNaN،شرح empty تاریخ‌دار،loading بدون نتیجه قدیمی،خطایread باretry؛A03 وpresetها باقی | Pass؛fail→retry،older async/cleanup،font IO fallback؛Native screenshots Not run |
| شناسه‌ها و ICATUS | A03 ثابت؛D08/X99/X100/X101 active؛۱۰رزروICATUS بدون UI/binding؛X18 close same meaning | Pass؛reg/history/source/guide/CSV،هر۱۱۲active دیده شد؛هیچ ICATUS یا مسیر آن در UI جدید |
| normalization / کیفیت | page26/36،section20/30،metric32/40،body15/24،secondary14/22،caption13/20،control14/22،code14؛page16/card16/large20/gap12/section24،radius12/16/24 | Pass پیکربندی وfont assets؛فونت سیستم فقط هنگام IO load/failure؛اصلی Vazirmatn است؛real font/layout Not run |
| RTL/scale1/1.5/2/target واحد | نام بلند،wrap/no cap/no shrink-to-fit،min48،badge داخلtarget وSVG غیرتعاملی؛selected/disabled contrast>=4.5 | Pass درrenderer/contrast palette/handler؛اندازه‌گیری48×48 وoverlap گوشی Not run |
| رفتار/داده و FIX01/FIX02 | same service/query/preference contract؛all historical entries/assignments unchanged؛rounding فقط متن | Pass fullUTC/selectedTehran؛تحویل اعلان/ارتقا گوشی Not run و باز |

## انتخاب‌های اجرایی و اختلاف‌ها

- تعداد۳فعالیت تصمیم اجرایی در دامنهٔ۳…۵ است؛«سایر» ردیف چهارمِ داده‌های خارج از خلاصه است،نه فعالیت تازه. درصد از مجموع **زمان ثبت‌شده** می‌آید؛pending/skipped/گذرروز وارد denominator نمی‌شوند. نمایش مدت با formatter دقیقهٔ قبلی و درصد با یک رقم اعشار فارسی است؛raw minutes/geometry/data محفوظ‌اند. اختلاف جمع float پس از regrouping در حد ULP است و در تست تحمل ماشین،نه rounding داده،ثبت شد.
- Donut زمان کل را **مجاور** دارد؛متن بزرگ داخل حلقه گذاشته نشد تا مدت بلند/font200% آن را نپوشاند. این انتخاب در قرارداد «مرکز یا مجاورت» مجاز است. رنگ‌هایcategorical از rank می‌آیند،نه تشخیص مفید/بیهوده بودن نام فعالیت؛سبز گرم active وCTA نارنجی مکمل مطابق جهت مصوب،نه hex استخراج‌شده ازPNG.
- badgeها و wrap در نمایش بزرگ فضای بیشتری ازPNG می‌خواهند؛Tile width با font scale رشد می‌کند و گروه روی viewport باریک wrap می‌شود. D08 یک sheet اسکرول‌شونده برای همهmodeها وcustom موجود است؛تصویر زیرپنجرهٔcalendar مجوزdate picker تازه نشد. Header/tabهای کل برنامه بازچینی نشدند.
- فهرست کامل آیکون legacy/asset و سهم تجمعی نمای قبلی را حفظ می‌کند. frame آیکون در این نمای توسعه‌یافته همان۵۲dp کامپوننت موجود است؛این بخش درPNG فهرست کامل مشخص نشده و با container40dp عمومی normalization اختلاف دارد. main summary از markerها وglyphهایnormalized استفاده می‌کند. این اختلاف محدود برای حفظ API آیکون موجود صریح است؛اصلاح frame مشترک در این task انجام نشد.
- کنترل‌هایrelative mode همان semantics قدیمی‌اند؛برایcustom،engine offset را به تاریخ‌های دستی تحمیل نمی‌کند. query/offset وdisabled state موجود حفظ شدند؛سیاست تازهٔcustom از رویPNG ساخته نشد.
- native font metrics،SVG rendering،ترتیب چپ/راست واقعی،scroll/keyboard/safe area،عرض/overlap/targets وفیدلیتی تصویر هنوز **Not run**. وجود style یا renderer یا exportJS پذیرش گوشی نیست.

## آزمون نهایی، SHA و ساختار تحویل

**سورس آزمون‌شده:** `03d410279f9e1e122c4cfc823a5efd8d77bade3a`. همهٔ اجراهای نهایی پس از commit، روی همین کد/تست/generator/guide/assets بوده‌اند؛بعد از آن فقط docs/evidence اضافه شدند. manifest۱۱۶فایل آزمون‌شده و source-review۱۲۱فایل حفاظت‌شده را ثبت می‌کند.

SHA تحویل،commit بعدیِ حاوی همین گزارش/شواهد است و پس از push/خواندنremote در پاسخ نهایی کامل اعلام می‌شود. برای SHA دقیق سند: `git log -1 --format=%H -- docs/v0.3/RC3_UI_REPORT_01_Report_Rev01_FA.md`. SHA آزمون با commit تحویل یکی فرض نشده؛تفاوت فقط docs/evidence است.

| اجرا / QA | وضعیت | فرمان / شاهد |
| --- | --- | --- |
| typecheck | Pass | `npm run typecheck`،exit0؛final-Rev01/typecheck.log |
| suite کامل UTC | Pass | `TZ=UTC npm test`،130/130،fail0/skip0؛118 قبلی+12 تازه؛npm-test-UTC.log |
| منتخب مرتبط Tehran | Pass | فرمان دقیق زیر؛109/109،fail0/skip0؛related-Asia-Tehran.log؛کل suite تهران نیست |
| Android-platform JS/asset export | Pass | `CI=1 EXPO_OFFLINE=1 EXPO_NO_TELEMETRY=1 node node_modules/expo/bin/cli export --platform android --no-bytecode --output-dir <work>/metro-android`؛چهارTTF hash-equal،هیچPNGکامل موکاپ bundled نشد؛metro-export-review.json/log؛APK/native build نیست |
| core fixture Tehran در مبناDDC و نهایی | Fail / Known Issue | `TZ=Asia/Tehran node --import ./tests/register.mjs --import tsx --test tests/core.test.ts`؛هر دو2/3؛slot10:00…10:30 fixture غایب؛baseline/current-core-Asia-Tehran.log؛source/expectation unchanged |
| Screenshot/Android/واقعیRTL وscale1/1.5/2 وtargetها | Not run | adb/emulator/native project/device/build موجود نیست؛screenshot-plan-Rev01.json برنامه است؛تصاویرdesign-inputs شاهد اجرا نیستند |
| P03-015/P03-016 اعلان وارتقا گوشی | Not run / باز و الزامی | QA گوشی Deferred نیست؛cache/reconcile/exportJS اثبات تحویل اعلان نیست |
| TalkBack | Deferred / Not run | تنهاQA فعلاً تعویق‌داده‌شده |
| TZ unset/undefined وfixture progress Tehran | Not run این task / Known Issues باز | شواهد تاریخیFIX01/FIX02/HIDE محفوظ؛بی‌دلیل بسته یاskip نشده‌اند |

```sh
TZ=Asia/Tehran node --import ./tests/register.mjs --import tsx --test \
  tests/v03ReportUI.test.tsx tests/v03ClassificationPolicy.test.ts \
  tests/v03IcatusHideUI.test.tsx tests/v03Data.test.ts \
  tests/v03IdentifierFlows.test.tsx tests/v03UIIdentifiers.test.tsx \
  tests/v03LifecycleUI.test.tsx tests/v03ResponseUI.test.tsx \
  tests/v03Notifications.test.ts tests/v03UI.test.tsx
```

TIME80_UI_EVIDENCE_DIR فقط خروجی witness آزمون است؛فعال‌بودن شناسه یاUI محصول به آن وابسته نیست. `test-results-Rev01.csv` نتیجهٔ۲۴۵آزمون نهایی/مبنا را با فرمان/SHA/limit نگه می‌دارد. `RC3_UI_Coverage_Rev01_FA.md` و CSV،۱۳۹binding+۱۰reserved=۱۴۹ردیف،activePending0؛Registry۱۲۲تخصیص،۱۱۲active،۱۰reserved،RC3-ID-01-Rev04. هر۱۱۲کد فعال در رفتارUI/Alert دیده شدند؛ guide/CSV از همینregistry تولید شد. تخصیص/شماره/نام قبلی تغییر نکردند؛فقط۴فعال‌سازی و توضیح محلcloseX18 به‌روز شد.

اجراهای اولیه و رفع خطای پیاده‌سازی/fixture در logها محفوظ‌اند: type inference رنگsegment،mock Error|null،API اندازهآیکون وoptionalstyle insertion باtypecheck اصلاح شد؛۳Fail تست قدیمی ناشی از shape style مشترک با حفظ default قبلی رفع شد؛helper تست تازه undefined disabled را false منطقی خواند و جمع fractional باULP سنجیده شد. هیچ تست قدیمی برای سبزشدن حذف/skip یا تغییر انتظار داده نشد. پس از بازبینی،helperها target داخلModal را ترجیح می‌دهند وX100 واقعاً پس ازclose sheet لمس می‌شود؛کنترل پشتModal شاهد مسیر قابل‌لمس محسوب نشد.

نصب اولیه npm به‌دلیل cache غیرقابل‌ساخت /home/agent/.npm Fail شد؛retry با cache درwork Pass بود،بدونHOME/credential override. whitespace اصلی اسناد منبع (Markdown hard break) وOFL/license/log خام حفظ وازcheck قالب کد مستثنا شد؛کد/guide/اسناد تولیدی checkPass. packageهایقدیمیupgradeنشدند.

## باز و قدم بعدی

اختلاف frame فهرست کامل و تمام محدودیت‌های native بالا صریح باقی‌اند. P03-014/P03-019 باز؛P03-015/P03-016 وارتقا گوشی باز و الزامی. M-02/M-10/دارایی‌ها اجرا نشده‌اند؛countdown Undo تصویب نشده و اضافه نشد. کوچک‌ترین قدم بعدی پس از بررسی دفتر:build/device معلوم برای QA واقعی M-01/M-04/D08/full/zero/error در سهfont scale،با fixture۵h/۷فعالیت واندازه‌گیریtarget؛سپس دستور جدا برای مرحلهبعد.

فقط source/test/assets مرتبط وdocs/evidence بررسی‌شده ثبت وpush می‌شوند؛APK/ZIP/node_modules/credential واردGit نمی‌شوند. پس از تأییدremote همینtask متوقف می‌شود؛merge/force-push/workflow/انتشار یا مرحلهبعد انجام نمی‌شود.

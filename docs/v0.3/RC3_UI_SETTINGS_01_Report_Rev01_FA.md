# RC3-UI-SETTINGS-01 — Rev01

2026-10-13، Asia/Tehran؛ پرامپت۹. اصلاح fixture X07 انجام و gate آن پاس شد؛ سپس M-02 در A04 اجرا شد. انطباق سورس/رفتار قابل‌آزمون پاس است؛ پذیرش واقعی Android همچنان Not run است.

## مبنا، ترتیب و SHAها

HEAD شروع دقیقاً `e1278bb3e812ef3ae636546bfdf2b1e28050014c`، شاخه قبلی rc3-ui-report01-fix01-icons، working tree پاک و ancestry0/0 بود. remote شاخه قبلی نیز دوباره همین SHA را نشان داد؛ شاخه اختصاصی **rc3-ui-settings01** از همین checkout کامل ساخته شد و remote هم‌نام موجود نبود. reset یا حذف تغییر جدیدتر انجام نشد.

| مرحله | commit / نتیجه |
| --- | --- |
| اصلاح مستقل آزمون X07 | `1759ff8a1de181074ae41f6f33e0aa04dd66af93`؛ فقط فایل آزمون، بدون تغییر محصول |
| گزارش و شواهد مستقل fixture،پیش از M-02 | `79d93116f26d9d896ca8ecf7f549fac221a82a83`؛ gate UTC117/117،Tehran110/110 و۴اجرای تغییر تاریخ میزبان هرکدام17/17 |
| پیاده‌سازی مستقل M-02 | `81d88cb6d5842a94283d9bc98139a6aff8b0b741`؛ cards/chips/fonts/glyphs/optional UI props و۷تست تازه |
| بازبینی رنگ خطا و **سورس نهایی آزمون‌شده** | `711b6eb8a457934f298ab5c72b132ae59101b6f8`؛ رنگ danger قبلی با تایپوگرافی جدید محفوظ شد؛ تمام بررسی‌های نهایی روی این SHA |
| تحویل | commit بعدی فقط docs/evidence؛ SHA کامل پس از push و خواندن remote در پاسخ نهایی اعلام می‌شود؛ با SHA آزمون یکی فرض نشود |

گزارش مستقل [RC3_TEST_CLOCK_FIX_01_Report_Rev01_FA.md](RC3_TEST_CLOCK_FIX_01_Report_Rev01_FA.md) علت X07، مالکیت ساعت و cleanup را ثبت می‌کند. فرمان عادی تست setup داخلی دارد؛ import از پوشه شواهد لازم نیست. محصول/items.find/route/baze و hook پوشش تغییر نکردند. Pending/future و امروز/روزقبل محفوظ‌اند. تغییر تاریخ میزبان شبیه‌سازی‌شده به۲۰۲۴/۲۰۳۱ در هر دوTZ پاس شد؛ clock fixture ثابت و مستقل از OS است. Known Issue تاریخ‌وابسته X07 **در آزمون Resolved** است،نه مسئله‌ای در محصول.

## منابع واقعاً خوانده و مشاهده‌شده

| منبع | نسخه / مسیر / کاربرد |
| --- | --- |
| RC3_Product_Handoff.md،D03-005 |1.0،2026-10-06؛ `docs/v0.3/rc3-ui-report01/design-inputs/RC3_Product_Handoff.md`؛ تمام سند خوانده شد،D03-005 بخش۱؛حفظ save/validation ودامنه M-02 |
| Time80_Approved_UI_Decisions_FA.md | Approved،بسته2026-10-06؛ همان design-inputs/01_Product_Decisions؛شش گروه M-02 وChips |
| Time80_Typography_Normalization_v1.0_FA.md |1.0؛ design-inputs/02_Design_System؛Vazirmatn واندازه/وزن/line height |
| Time80_Visual_System_Normalization_v1.0_FA.md |1.0؛ همان مسیر؛page16/card16/gap12،radius12/16/999،icon40/20/12،target48 |
| M-02_Reminder_Settings_APPROVED.png | Approved؛واقعاً با ابزار تصویر باز شد؛ریشه خواندن `/workspace/work/rc3-inspection/design/Time80_Product_UI_Handoff_2026-10-06/03_Approved_Mockups/`؛نسخه عین فایل در rc3-ui-settings01/design-inputs |
| SettingsScreen،Ui،registry و سرویس‌ها | سورس جاری پس از FIX01/FIX02/ID/HIDE/REPORT؛settingsService،validateSettings،ensureNotificationPermission وreconcileNotifications خوانده شدند |

`rc3-ui-settings01/design-source-manifest.json` مسیر/hash همه منابع وابعاد PNG1122×1402 را ثبت می‌کند. بسته طراحی موجود ZIP باhash `f42852923f84c9d09253aa0f8853509b6d5996e9ec57a4f38a5fa77b21d70706` قبلاً در همین محیط استخراج شده بود؛دسترسی به Library فرض نشد. هیچ مرجع لازم Not Available نبود. PNG **مرجع ترکیب‌بندی** وnormalization مرجع اندازه‌اند؛فایل PNG در برنامه استفاده نشده و screenshot اجرای برنامه نیست.

دستور جاری پرامپت۹ است؛دستور تاریخی ساخت APK یااجرای هر چهارطرح درHandoff مجوز تازه نیست و اجرا نشد. فونت‌های چهاروزن Vazirmatn موجود v33.003 وaliasهای بارگذاری‌شده موجود Time80Report… دوباره استفاده شدند؛dependency،فونت یاasset activity تازه نصب/تخصیص نشد.

## تطبیق M-02 با اجرا

Pass جدول یعنی سورس/renderer/سرویس واقعی باnative ports mock؛فیدلیتی/اندازه‌گیری گوشی جدا Not run است.

| بند | اجرا / شاهد | وضعیت |
| --- | --- | --- |
| عنوان و کارت یادآوری | عنوان فارسی کامل/A04،کارت مستقل X59 باswitch،hint مسیر وضعیت OS؛state ازsettings موجود،نهاثبات دریافت اعلان | Pass؛source/settings tests |
| فاصلهٔ جمع‌وجور | X60،عنوان/واحد واضح۱۵…۲۴۰،number-pad،field کوچک کنارlabel وwrap درمتن بزرگ؛value/draft/Number/onBlur همان قرارداد | Pass؛valid90 وinvalid14/241/15.5/nope،revision وreconcile یک‌باره |
| شروع/پایان روز | کارت مشترک،دوInput X61/X62 باHH:MM/LTR؛درعرض کافی دو ستون،scale>=1.5 یاعرض باریک زیرهم؛datepicker تازه نیست | Pass؛09:15/22:30،25:00/برابر/معکوس،reload |
| روزهای فعال Chips |۷نام موجود،X63 درهرtarget،selected/checkmark واضح،round999 وgap8؛mapping روزها همان `((i+6)%7)+1` | Pass؛حفظ patch/scope/validation وsingle handler |
| صدا/لرزش | یک کارت تنظیمات اعلان،دو ردیف X64/X65،divider؛native Switch decorative/pointerEvents none،handler فقط outer target | Pass؛persist/revision وnative handler نبودن |
| CTA بررسی اعلان‌ها | X66 باسبز گرم؛همان navigate("Diagnostics") بهA09؛A09/X69/X72/X75 وguardهایFIX محفوظ | Pass؛UI/FIX regression |
| typography / رنگ | page26/36،card16/24،body15/24،secondary14/22،control14/22،code14/LTR؛Vazirmatn staticweights موجود؛سبز#42553B،سطوح گرم قبلی | Pass درconfig؛native font metrics Not run |
| spacing / glyphs | page/card16،gap12،input radius12/card16،touch48؛glyph20 درframe40 وgap12؛SVGهای ثابت UI مطابق نقش PNG وsettings ازasset موجودsource24/display20 | Pass درconfig؛identity/key/density دارایی‌های activity تغییر نکرد |
| D04/X67/X68 | همانnative Alert وcallbackها؛continue draft را حفظ،discard فقطdraft ناقص را کنارمی‌گذارد؛تنظیم معتبر قبلاً ذخیره‌شده برنمی‌گردد | Pass؛هر دو انتخاب وreload واقعیsettings |
| loading/error/busy/disabled | A04 درخواندن/خطا،عدم پیام loading پس ازread failure؛font IO fallback روشن؛error رنگ اصلیdanger؛busy/code/نام حذف نمی‌شوند | Pass؛۷تست تازه وregressions |
| RTL/متن بلند/scales1/1.5/2/keyboard | full labels،wrap بدون cap/shrink-to-fit،کد داخلtarget واحد،ScrollView باhandled همان قرارداد وinput focus/ref/onBlur محفوظ | Pass درrenderer/config؛keyboard/scroll/overlap/target واقعی Not run |
| query/داده/FIXها/ICATUS hide | services/App/scheduler/schema/data/report engine byte-identical،same policies؛ICATUS بهUI برنگشت | Pass؛fullUTC138/138 ومرتبطTehran117/117 |

## حفاظت رفتار و فایل‌ها

- SettingsScreen.tsx فقط نمایش گروه‌ها/فونت/state خوانا را تغییر می‌دهد. save/getSettings/effect beforeRemove وrequest permission/apply/reconcile همانترتیب دارند. هنگامشروعsave تازه،message موفقیت قبلی پاک می‌شود تاvalidation ناموفق موفقیت کاذب نشان ندهد؛معیارvalidity/ذخیره تغییرنکرد. پس ازpersist موفق وreconcile ناموفق،پیام «تنظیمات ذخیره شد» دقیقاً بهpersist اشاره دارد وerror مجوز/هماهنگ‌سازی هم نمایش داده می‌شود؛تحویل اعلان ادعا نمی‌شود.
- سیاست موجود denied محفوظ است:ensureNotificationPermission نتیجهfalse می‌دهد ولیX59 قصد فعال‌بودن را ذخیره می‌کند؛reconcile هشدار مجوز می‌دهد. به‌جای بازنویسی این سیاست،UI مسیرA09 را روشن کرده و تست همان رفتار را ثبت می‌کند.
- Ui.tsx فقط گزینه‌های اختیاری label/container/font/glyph برایCodedSwitch وInput دارد؛default style شکل قبلی،ref/focus/onBlur،disabled وhandlerها محفوظ‌اند. CodedSwitch فقط درSettings caller دارد؛Input وسایرcallerها باsuite کامل رگرسیون شدند. دکمه عمومی save/cancel یاonBlur برنامه‌ای/handler مضاعف افزوده نشد؛خواندنSettings صرف ورود write ندارد.
- SettingsGlyph.tsx پس ازبررسی assets اضافه شد:fixed decorative vectors باSVG موجود وasset settings موجود؛هیچactivity key/schema/payload تازه‌ای نیست. نمودار یااطلاعات زمان پوشانده نمی‌شوند.
- tests/v03SettingsUI.test.tsx۷تست رفتار واقعی/SQLite دارد؛تست‌های پیشین حذف/skip یاانتظارهای داده/زمان برایسبزشدن تغییرنکردند. یک permission read واقعیreconcile ویکrevision درblur معتبر،عدم تکرارblur ثابت،روت/draft/save/permission وstateهایlayout بررسی شدند.
- registry فقطsites راsync کرده است؛کد/کلید/نام/اثر/status ونسخه تخصیص Rev04 ثابت‌اند. generator راهنما بهپوشش جاریM-02 اشاره می‌کند؛guide/CSV ازregistry تولید شده‌اند. coverage جاری۱۳۹binding+۱۰reserved=۱۴۹ردیف،۱۱۲active دیده‌شده وactivePending0؛وجودregistry به‌تنهایی شاهد UI نیست.

manifest۳۰۹فایل سورس آزمون‌شده و۳۰۰فایل حفاظت‌شده عین مبنا را ثبت می‌کند. تغییرات مرتبط source/guide نسبت بهe127 فقط۹فایل‌اند:fixture test،SettingsScreen،Ui،SettingsGlyph،registry،guide generator،guide MD/CSV وsettings tests. reportPeriods/reportService/report components،ActivityIcon،App/FIX01/FIX02،schema/services/repositories/dataset،dependencies،workflow/manifest/target SDK تغییرنکردند. سوابق قبلی وگزارش‌های تاریخی بازنویسی نمی‌شوند.

## نتایج نهایی و Known Issues

| اجرا | وضعیت | فرمان / شاهد و محدودیت |
| --- | --- | --- |
| typecheck رویSHA711b6eb | Pass | `npm run typecheck`،exit0؛typecheck.log |
| suite کاملUTC رویهمانSHA | Pass138/138 | `TZ=UTC npm test`؛full-UTC.log؛۷تست تازه+۱۳۱قبلی،fail0/skip0/cancel0 |
| گروه مرتبطTehran رویهمانSHA | Pass117/117 | فرمان زیر؛related-Asia-Tehran.log؛همه۱۷شناسه شاملX07/hook وFIXها؛کلsuiteTehran نیست |
| visualTehran،رویM-02 اولیه81d88cb | Fail / Known Issue6/7 | visual-known-issue-Asia-Tehran.log؛progress65≠50،همانfail مبنا درشواهدتاریخی؛test/TodayOverview دربازبینی711b6eb تغییرنکرده‌اند |
| TZunset وcore interval fixtureTehran | Not run این task / Known Issues باز | شواهد تاریخی محفوظ؛محصول/fixture/انتظارها برایرفع این موارد تغییرنکردند |
| Android screenshot M-02/D04،سهscale/RTL/keyboard/targets | Not run | runtime-check.json؛adb/emulator/nativeproject/build/device موجود نیست؛PNG طراحی وrenderer شاهد گوشی نیستند |
| QA دستگاه اعلان P03-015/P03-016 وارتقا | Not run / باز و الزامی | دریافت اعلان یاupgrade پذیرفته نشده است؛P03-014/P03-019 هم باز |
| TalkBack | Deferred / Not run | تنهاQA فعلاًتعویق‌داده‌شده |

```sh
TZ=Asia/Tehran node --import ./tests/register.mjs --import tsx --test --test-reporter=tap \
  tests/v03SettingsUI.test.tsx tests/v03ReportUI.test.tsx \
  tests/v03ClassificationPolicy.test.ts tests/v03IcatusHideUI.test.tsx \
  tests/v03Data.test.ts tests/v03IdentifierFlows.test.tsx tests/v03UIIdentifiers.test.tsx \
  tests/v03LifecycleUI.test.tsx tests/v03ResponseUI.test.tsx \
  tests/v03Notifications.test.ts tests/v03UI.test.tsx
```

TIME80_UI_EVIDENCE_DIR فقط خروجی witness تست است؛شناسه‌های برنامه وابسته بهآن نیستند. validation-record.json و۲۶۸ردیفCSV فرمان/SHA/result/limit را نگه می‌دارند. اجرایinitialtypecheck،API title وtype context را نشان داد؛باAPI واقعیtextProps وnarrowing context اصلاح شدند. پس ازبازبینی رنگ error،همهچک‌هایلازم رویcommit711b6eb تکرارشدند؛نتایج81d88cb جای نتیجه نهایی نیستند.

## اختلاف‌ها، تحویل و قدم بعدی

سبز گرم طبقپرامپت/جهت مصوب جایaccent نارنجی نمونهPNG درchips/CTA/switch را گرفته است. glyphهابرداری سبک‌اند؛PNGپیکسلی بهUI تبدیل نشد. اندازه‌هایbody/input/code ازnormalization گرفته شدند؛نمونهvalue30 درPNG داده تولیدی نیست وsettings واقعی باقی می‌ماند. badgeها/نام کامل وfont بزرگ باعثwrap/ارتفاع بیشتر ازتصویر مرجع می‌شوند؛Native fidelity/layout/keyboard وD04font/RTL هنوز Not run‌اند وپذیرش نهایی ادعا نمی‌شود.

گزارش fixture وM-02،checkpoint/QA،guide/CSV،coverage،logs/hash وPNG **مرجع** برایبازبینی تحویل‌اند. docs/evidence پس ازبررسی اطلاعات حساس ثبت وpush می‌شوند؛APK/ZIP/node_modules/credential واردGit نمی‌شوند. SHA تحویل/remote وworking tree باید واقعاً خوانده شوند. تفاوت delivery باSHAآزمون فقطdocs/evidence است.

کوچک‌ترین قدم بعدی پس ازبررسی دفتر:QA Android رویbuild/device معلوم باM-02/D04،سهfontscale واندازه‌گیریtarget/keyboard/scroll؛اعلان وارتقا هم بازوالزامی. M-10/countdown/merge/force-push/workflow/Release اجرا نمی‌شوند؛بعد ازهمین تحویل taskمتوقف می‌شود.

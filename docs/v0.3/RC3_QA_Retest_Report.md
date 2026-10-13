# RC3 QA Retest — RC3-BUILD-QA-01 Rev01 — checkpoint پیش از ساخت

2026-10-13،Asia/Tehran؛سورسآمادهe6fa5c1968797d5bc6bdd3e442ca1b804c4c9d85 رویrc3-build-qa01،مبناd66b42a47d3fc519692c025d7df696d8a19bb12e. فقطversionCode5؛commit مستندات جدا وAPKهنوزنیست.

| مورد | نتیجه | شاهد / حد |
| --- | --- | --- |
| typecheck | Pass | اجرای تازهtypecheck.log |
| fullUTC | Pass۱۴۶/۱۴۶ | suiteکاملتازه،fail/skip/cancel0 |
| relatedTehran | Pass۱۳۵/۱۳۵ | ۱۴فایل،FIXها/UI/data/patch؛fullsuiteTehranنیست |
| X07/progressfixtures،registry/guide/CSV،manual/past/report/settings/notificationresponse/Undo | Pass خودکار | realmodules/SQLite،nativeportsmock؛پذیرشگوشینیست |
| patch/icons/export/Hermes/assets | Pass | ۱۵icon/۱۸۰PNG؛۱۸۷exportasset و۴font/headerhash؛APKنیست |
| prebuild/autolinking/stablesigningguard | Pass درتولیدproject | archiveجدا؛nativecompile یاامضایواقعیNot run |
| coreintervalTehran | Fail۲/۳ KnownIssue | همانslot10:00–10:30fixture؛source/testتغییرنکرد |
| fullTZunset | Not run | سابقه محفوظ،بسته اعلامنشد |
| Actionsdispatch/releaseAPK/actualcert/checksum | Not run | APIForbidden/networkpolicy؛runIDنداریم |
| mergedmanifest/actualtargetSdk/packagedpatch/font/SVG | Not run | target36sourcehint،APKنبود؛P03-019باز |
| nativeM-01/M-02/M-04/M-10 screenshots/RTL/scales/targets | Not run | adb/emulator/SDK/device/KVM موجودنیست؛renderer/exportمرجعnativeنیست |
| deviceupgrade/P03-014/015/016/019 | Not run؛بازوالزامی | فقطTalkBackDeferred است |
| TalkBack | Deferred /Not run | شمارشمعکوسUndoاضافه نشد |

گزارشRC3_BUILD_QA_01_Report_Rev01_FA.md،DeviceGuide،checkpointدقیق،۲۹۸نتیجه/فرمان،نسخه/RC2publicsigner وmanifestحفاظتدرrc3-build-qa01ثبتاست. آمادهساخت ازساختواقعیجداست. پس از رفع دسترسیAPI اجرایمجازworkflowموجود وverifyartifactواقعی ادامهیابد؛تاریخچهقبلیپایین دست‌نخورده است.

---

## سوابق محفوظ — نتایج زیر متعلق به مراحل قبلی‌اند

# RC3 QA Retest — RC3-UI-TODAY-01 — Rev01

2026-10-13، Asia/Tehran؛ مبنا51728c49acfaba52412b6500f719c80a31848d7a، سورس آزمون‌شده **b8d798d454236b2f66eefc6d318033b50777a233**، شاخهrc3-ui-today01. commit تحویل فقط docs/evidence و SHA دقیق در پاسخ نهایی/Git گزارش است. منابع و بندهای کامل در RC3_UI_TODAY_01_Report_Rev01_FA.md؛ فرمان هرcase در validation-record.json/test-results.csv همان پوشه.

| مورد | نتیجه | شاهد / محدودیت |
| --- | --- | --- |
| npm run typecheck | Pass | typecheck.log؛ static،native نیست |
| TZ=UTC npm test | Pass؛۱۴۶/۱۴۶ | suite کامل،fail/skip/cancel0؛full-UTC.log |
| گروه مرتبط۱۳فایل TZ=Asia/Tehran | Pass؛۱۳۲/۱۳۲ | Today8/visual7/Settings/Report/data/policy/hide/identifiers وFIXها؛fullsuiteTehran نیست |
| progress start/mid/end/outside،samevalue،invalid/equal/overnight | Pass | UI/helper واقعی،unknown بدون NaN؛source/runtime day policy جدا |
| midnight/zone/focus/resume/cleanup و stale/unmounted response | Pass | timer دقیقه‌ای scoped؛SQLite serialized واقعی؛Android background Not run |
| descendingcopy وX07/items.find،A01/A05→A06/manual/past/backlog/future | Pass | exactroute/context،اصل items ثابت،singlehandler |
| no recording writes/old classification+context intact | Pass | realSQLite snapshots؛tick معمولی total_changes ثابت؛horizon cache maintenance قبلی باقی است |
| scales1/1.5/2،fullrawlegacy/asset،code14LTR/defaultcaller | Pass در سورس/renderer | wrap/stack وsingle48target props؛native layout/measurement Not run |
| M-01/M-02/M-04،ICATUS hide،FIX01/FIX02 وکدها | Pass در گروه رگرسیون | protectedsource+suite؛اعلان گوشی تأیید نمی‌شود |
| registry/guide/CSV/coverage | Pass | Rev04،۱۲۲stable/۱۱۲active/۱۰reserved،۱۳۹binding و۱۴۹row،Pendingactive0؛۱۱۲code هرTZ |
| outerhost۲۰۳۱UTC و۲۰۲۴Tehran | Pass؛هرکدام۳۲/۳۲ | ۳ فایلToday/visual/IdentifierFlows،fixture مستقل ازتاریخ میزبان،cleanup |
| progressfixtureتهران | Resolved در دامنه M-10 | configured08–16،noonlocal08:30Z=1/2؛UTCهمانinstant1/16،DSTendpoint واقعی؛نه تغییر۵۰به۶۵ |
| coreTehran intervaltransition | Fail؛۲/۳ /KnownIssueباز | slot10:00–10:30 غایب؛source/expectation/engine برابر مبنا،known-core-Tehran.log |
| fullTZunset | Not run /KnownIssueتاریخی | بسته اعلام نشده؛logهای تاریخی محفوظ |
| nativeM-10/screenshots RTL/scales/empty/error/past/crop/targets | Not run | adb/emulator/device/build/nativeproject نیست؛renderer/PNG/تولیدتصویر شاهدگوشی نیست |
| P03-015/P03-016 اعلان وupgrade گوشی | Not run؛بازوالزامی | Deferred نیست؛P03-014/P03-019 همباز |
| TalkBack | Deferred /Not run | فقط اینQA تعویق‌داده‌شده |

شواهد نهایی۳۵۳case/status،manifest۳۱۶فایل آزمون‌شده و۲۹۳protected،design/source/asset hashes وmatrixM-10 ثبت‌اند. initial-* خطاهای ساختfixture/typeها و نتیجه نهایی ازهم جدا هستند. پذیرش Android باز؛ APK/countdown/انتشار/task بعدی اجرا نشد. پایین عین تاریخچهٔ قبلی است.

---

## سوابق حفظ‌شده — نتایج زیر برای سورس‌های پیشین‌اند

# RC3 QA Retest — RC3-UI-SETTINGS-01 — Rev01

2026-10-13، Asia/Tehran؛ مبناe1278bb3e812ef3ae636546bfdf2b1e28050014c؛ شاخهrc3-ui-settings01. fixture source1759ff8a1de181074ae41f6f33e0aa04dd66af93؛M-02 source نهایی711b6eb8a457934f298ab5c72b132ae59101b6f8؛delivery فقطdocs/evidence پس ازآن،SHA/remote درپاسخ نهایی/Git.

| مورد | وضعیت | شاهد / حد |
| --- | --- | --- |
| fixture X07/hook،گروهUTC/Tehran پیش ازM-02 | Pass117/117 و110/110 | clockfix logs؛normal command setup داخلیDate-only؛انتظار/hook حذف/skip نشد |
| outerhost۲۰۲۴/۲۰۳۱،هر دوTZ | Pass،هرکدام17/17 | clockfixhostlogs؛constructor restoration پس ازهرtest؛وابستگی بهروز واقعی۱۲اکتبر رفع |
| typecheck نهایی | Pass | npm run typecheck،exit0؛rc3-ui-settings01/typecheck.log |
| suite کاملUTC نهایی | Pass138/138 | TZ=UTC npm test؛full-UTC.log؛۷تازه+۱۳۱قبلی،fail/skip/cancel0 |
| مرتبطTehran نهایی | Pass117/117 | فرمان دقیق درگزارش/validation-record؛settings/report/data/hide/identifiers/lifecycle/response/notifications/UI؛نهfullTehran |
| M-02valid/invalid interval/hours،blur/reload | Pass | realSQLite،revision یک‌بار،permissionread reconcile یک‌بار،draft تاblur؛invalidبدونsuccessکاذب |
| D04/X67/X68 | Pass | continuedraft/dispatchdiscard،تنظیم معتبر قبلی محفوظ،reload صحیح |
| days/sound/vibration/enable/denied/A04→A09 | Pass | policy/service موجود؛denied قصدفعال‌بودن راsave وreconcilewarning نمایش؛deliveryادعا نمی‌شود |
| M-02RTL/نامبلند/scales/targets/code/glyph/busy/loading/error | Pass درsource/renderer | normalizedfonts،40/20/12،target48config،onehandler،code14/LTR؛nativeنیست |
| M-01/M-04/ICATUS/شناسه‌ها/FIX01/FIX02 وsharedcaller | Pass | fullUTC/selectedTehran؛۳۰۰protectedbyte-identical،۱۳۹binding،۱۱۲code witnessed |
| visualTehran روی81d88cb | Fail / Known Issue6/7 | progress65≠50؛همانشواهدپیشین؛test/TodayOverview در711b6eb unchanged |
| TZunset/coreTehranfixture | Not run اینtask / KnownIssuesباز | منابع تاریخی محفوظ؛منطق/expectation تغییرنکرد |
| nativeM-02/D04/screenshots/RTL/3scales/keyboard/scroll/touch | Not run | runtime-check؛device/build/adb/emulator/nativeproject موجودنیست؛PNGمرجعrendererشاهدگوشی نیست |
| اعلانP03-015/P03-016 وارتقا گوشی | Not run / بازوالزامی | Deferred نیست؛P03-014/P03-019 نیزباز |
| TalkBack | Deferred / Not run | فقطاینQAتعویق‌داده‌شده |

منابعPNG واقعاً مشاهده‌شده وnormalization،جدولM-02،۲۶۸نتیجهphaseنهایی و۲۹۵نتیجهclock،coverage۱۴۹ردیف،guide/CSV/hash/logs درگزارش‌ها/پوشه‌های جدیدند. X07fixtureResolved مستقل ازKnownIssuesنامرتبط است. Nativeپذیرش باز؛M-10/countdown/Release اجرا نشده‌اند. پایین دقیقاًسوابق قبلی است.

---

## سوابق حفظ‌شده — نتایج زیر برای سورس‌های پیشین‌اند

# RC3 QA Retest — RC3-UI-REPORT-01-FIX01 — Rev01

2026-10-13،Asia/Tehran؛مبنا69e7be150c0e030b4cf9e5217e9957f10bc15e72؛سورس نهایی آزمون‌شده34f215a04cf74c5795da74e5679082c37af71bd2؛شاخهrc3-ui-report01-fix01-icons. commit تحویل بعدی فقطdocs/evidence است؛SHA کامل/remote درپاسخ نهایی وGit سند. شرح دقیق/فرمان‌ها درگزارشFIX01 وvalidation-record.json.

| مورد | وضعیت | شاهد و حد |
| --- | --- | --- |
| npm run typecheck | Pass | typecheck.log،exit0 |
|۱۳تست گزارش UTC وTehran | Pass | درهر دوگروه مرتبط؛یک تست تازه defaultها/40/20/12/raw/scales؛native نیست |
| گروه مرتبطUTC شاملcallerها وFIXها | Fail؛116/118 | related-UTC.log؛X07 تاریخ‌ثابت+hook؛سایر116پاس؛suite کامل نیست |
| گروه مرتبطTehran | Fail؛109/111 | related-Asia-Tehran.log؛همانX07+hook؛سایر109پاس |
| flows مبنا،clockجاری،UTC/Tehran | Fail؛هرکدام16/18 | baseline-identifiers logs؛همانfixture12اکتبر درروزجاری13اکتبر؛محصول/تست قدیمی تغییرنکرد |
| flows مکمل،clock تاریخfixture،مبنا/نهایی وهر دوTZ | Pass؛هرکدام17/17 | identifiers-fixture-date logs؛2026-10-12T12Z؛جای clockجاری نیست،شکست بالابازاست |
| visualIntegration Tehran | Fail / Known Issue؛6/7 | progress65≠50؛همانشاهدتاریخیFIX02؛انتظار/منطق تغییرنکرد |
| source asset40/20 وgap مستقیم12 | Pass | تصویرهمانraster24،ناموآیکونdirectsiblings،markerبیرون؛تست متمرکز وdiff |
| legacy/نامبلند/scales1/1.5/2 | Pass درconfig/children | rawدقیق،font20/scaling/wrap،width40/minHeight40،ارتفاعآزاد؛مربع‌ثابت40برایrawچندخطی ادعانمی‌شود |
| defaultها/شناسه‌ها/ICATUS/FIXها/query/داده | Pass درتست‌های مربوط وdiff | ۳۰۵protectedbyte-identical؛Rev04/۱۳۹binding،guideCSVunchanged؛X101بدونquery/writeجدید |
| native asset/legacy/نامبلند/سهscale وtarget48 | Not run | runtime-check.json؛adb/emulator/nativeproject/build/deviceوجودندارد |
| fullUTC،TZunset وcoreTehranfixture | Not run این اصلاح | scope آزمون مرتبط؛KnownIssuesقبلیباز،بی‌دلیل‌بسته‌نشده |
| QA گوشیAndroid،اعلانP03-015/P03-016 وارتقا | Not run / بازوالزامی | Deferred نیست؛rendererشاهدگوشی نیست |
| TalkBack | Deferred / Not run | تنهاQAتعویق‌داده‌شده |

اختلاف52/24/markerمیانی درsource رفعشد؛استثنایارتفاعrawlegacy ومحدودیتnative درگزارش جدیدصریح است. initialFailهایhelper/typecheck محفوظ؛نهاییtypecheck/۱۳گزارشپاس. ۳۴۷ردیفنتیجه،فرمان/SHA/log/limit ثبت‌شدند؛aggregateclockجاری سبزاعلام‌نشده است. M-02/M-10/dependency/countdown/Release اجرا نشدند. پایین عین سابقه است.

---

## سوابق حفظ‌شده — نتایج زیر برای سورس‌های پیشین‌اند

# RC3 QA Retest — RC3-UI-REPORT-01 — Rev01

2026-10-12،Asia/Tehran؛ مبناddc320ffa45867f2db3a38261e1489c91ff672d6،سورس آزمون‌شده03d410279f9e1e122c4cfc823a5efd8d77bade3a،شاخه rc3-ui-report01. commit تحویل بعدی فقط docs/evidence؛ SHA کامل پس از push/remoteverify در پاسخ نهایی/Git. گزارش و validation-record فرمان‌ها و حد شاهد را ثبت می‌کنند.

| مورد | وضعیت | شاهد و حد |
| --- | --- | --- |
| npm run typecheck | Pass | final-Rev01/typecheck.log،exit0 |
| TZ=UTC npm test | Pass |130/130،fail0/skip0؛118 قبلی+12 جدید؛npm-test-UTC.log |
| منتخب مرتبط TZ=Asia/Tehran | Pass |109/109،fail0/skip0؛report/policy/hide/data/identifiers/lifecycle/response/notifications/UI؛فرمان دقیق در گزارش/validation-record |
| Android-platform JS/assets export | Pass | Metro offline،۴TTF hash-equal،بدون موکاپ کامل؛metro-export-review/log؛APK/native build نیست |
| core interval fixture تهران در مبنا و نهایی | Fail / Known Issue | هرکدام2/3،slot10:00…10:30 fixture غایب؛baseline/current core logs؛source/expectation ثابت |
| پنج preset/۸mode/D08/absolute و relative/reset | Pass UI/service | query/range واقعی مطابق getReport؛open/close بدون read/write؛target helper داخل Modal |
| custom invalid/reversed/end inclusive/calendar/week/day bounds | Pass | clock/data معلوم،UTC/Tehran؛draft read0 و X90 apply؛date picker تازه ساخته نشد |
| M-04 اصلی/سایر/مجموع/سهم/full/zero/error/async cleanup | Pass | fixture300min/۷فعالیت،150/90/30+other30؛full بدون query/read/write؛fractional raw/ULP؛icons/cumulative محفوظ |
| تاریخچه/ICATUS hide/شناسه‌ها/FIX01/FIX02 | Pass |۱۲۱ protected برابر با مبنا؛۱۱۲active/۱۰reserve و۱۳۹binding؛هر active مشاهده شده؛تست قدیمی حذف/skip نشد |
| RTL/نام بلند/scales/code/font/contrast/target config | Pass در پیکربندی renderer | یک handler،code14/LTR،wrap و contrast≥4.5؛layout/اندازه‌گیری واقعی گوشی نیست |
| Android screenshot/font/SVG/layout/keyboard/target در سه scale | Not run | runtime/adb/emulator/native project/device/APK موجود نیست؛screenshot plan برنامه و PNG مرجع است |
| اعلان P03-015/P03-016 و ارتقا گوشی | Not run / باز و الزامی | Deferred نیست؛تحویل اعلان یا ارتقا اثبات نشده |
| TalkBack | Deferred / Not run | تنها QA فعلاً تعویق‌داده‌شده |
| TZ unset/undefined و fixture progress Tehran | Not run این task / Known Issues باز | سوابق FIX/HIDE محفوظ؛بی‌دلیل بسته یا skip نشده‌اند |

منابع/ZIP داخلی/۲PNG/۱۲checksum و normalization در design-inputs/manifest؛جدول تطبیق بندها و اختلاف frame۵۲ legacy full با۴۰ normalization در گزارش صریح است. پذیرش native باز است. guide/CSV/coverage و۲۴۵ نتیجهٔ تک‌آزمون مربوط به سورس نهایی‌اند؛M-02/M-10/countdown/Release اجرا نشدند. بخش پایین عین سابقه است.

---

## سوابق حفظ‌شده — نتایج زیر برای سورس‌های پیشین‌اند

# RC3 QA Retest — RC3-ICATUS-HIDE-01 — Rev01

2026-10-12، Asia/Tehran؛ مبنا50a54992a2b28690b73755a7848319b533c12e69، سورس آزمون‌شده3ecbd2910f65733b69ac62d6cd32d941062c94e9، شاخه rc3-icatus-hide01-ui. SHA commit تحویل بعدی از Git/پاسخ نهایی خوانده شود؛ فقط docs/evidence با سورس آزمون تفاوت دارند. گزارش مستقل RC3_ICATUS_HIDE_01_Report_Rev01_FA.md و final-Rev01/validation-record.json فرمان/حد شاهد را ثبت می‌کنند.

| مورد | وضعیت | شاهد و محدودیت |
| --- | --- | --- |
| npm run typecheck | Pass | final-Rev01/typecheck.log،exit0 |
| TZ=UTC npm test | Pass |118/118،fail0/skip0؛۹ تست جدید +۱۰۹ قبلی بدون حذف/skip/تغییر انتظار؛ npm-test-UTC.log |
| انتخاب مرتبط با TZ=Asia/Tehran | Pass |97/97،fail0/skip0؛ policy/hide/data/identifier/lifecycle/response/notification/UI؛ فرمان کامل در گزارش/validation-record، related-Asia-Tehran.log |
| همان fixture policy در archive مبنا +core/v03Data، UTC | Pass |14/14؛ baseline-policy-UTC.log؛ archive محصول عین SHA مبنا با فقط تست جدید؛ service policy واقعی/SQLite |
| core interval fixture در Tehran، مبنا و نهایی | Fail / Known Issue مبنا | هر دو2/3، slot10:00…10:30 غایب؛ baseline-core/current-core-Asia-Tehran.log؛ بدون تغییر منطق یا انتظار تست |
| ایجاد/مشاهده/ویرایش/empty/loading/error بدون ICATUS UI/route | Pass در سورس/renderer | واقعی ActivityEditor/CheckIn/Insights/Onboarding، کنترل‌ها و متن/Alert؛ فایل picker و callerها حذف؛ native phone نیست |
| دستهٔ قبلی در ویرایش نام/آیکون و حفظ revision/snapshot | Pass | سه scale فرم، fixture category قبلی byte-equal، stale save رد و rollback |
| ثبت تازه/همان فعالیت/تغییر/Undo و duplicate/validation | Pass | مقایسهٔ قرارداد مبنا؛ تغییر فعالیت پیش‌فرض جدید را می‌گیرد و Undo تاریخی را برمی‌گرداند؛ no-manual-selection policy تغییر نکرد |
| ورود/refocus بدون write تازهٔ طبقه‌بندی | Pass | فرم/A06 بدون write؛ report mount همان دو ترجیح قبلی و refocus/resume بدون اضافه، روی مبنا و نهایی برابر |
| شناسه/guide/CSV/coverage و FIX01/FIX02 | Pass |۱۲۲ تخصیص،۱۰۸ active،۱۴reserved،۱۲۹ binding؛ source و renderer واقعی؛ X18/X38/X102/X75 محفوظ |
| RTL/long name/font scales در renderer | Pass در پیکربندی تست | سه scale فرم و رگرسیون target/LTR/wrap؛ layout واقعی گوشی نیست |
| تصویر Android، target/wrap/overlap/Alert در RTL scale1/1.5/2 | Not run | runtime/adb/emulator/project Android وجود ندارد؛ screenshot-plan فقط برنامهٔ اجراست |
| P03-015/P03-016 پذیرش گوشی | Not run / باز و الزامی | دریافت اعلان/علت رخداد اولیه تأیید نشده؛ QA گوشی Deferred نیست |
| TalkBack | Deferred / Not run | تنها QA فعلاً تعویق‌داده‌شده |
| TZ unset/undefined و fixture progress Tehran | Not run در این مرحله / Known Issues باز | Failهای تاریخی FIX01/FIX02 محفوظ؛ بی‌دلیل بسته یا skip نشده |

pending hide فقط پس از حذف واقعی UI و آزمون حالت‌ها در این checkpoint بسته شد. D03/X32…37/X41/X48/X95 رزرو و بدون قابلیت فعال؛ D08/X99…101 رزرو طراحی. چهار طرح و countdown Undo اجرا نشدند؛ P03-014/P03-019 باز. نتایج118/97 جای نتایج مرحله‌های قبلی برای این سورس هستند؛ بخش‌های زیر عین سابقه‌اند.

---

## سوابق حفظ‌شده — نتایج زیر مربوط به سورس‌های پیشین‌اند

# Checkpoint جاری — RC3-ID-01 / Rev02

تاریخ2026-10-12، Asia/Tehran؛ شاخه rc3-id01-ui-identifiers. SHA سورس آزمون‌شده77ded971005be832233955dbd5df8b52bff99fe4 از مبنای FIX02ffa7bfc1dcb18c747611d585553bed4d4e4d5359. commit تحویل بعدی فقط docs/evidence دارد؛ SHA آن از Git این سند/پاسخ تحویل خوانده شود. گزارش: RC3_ID_01_Report_Rev02_FA.md؛ build/device/APK Not Available.

| اجرا / رفتار | نتیجه | فرمان / شاهد و حد |
| --- | --- | --- |
| npm run typecheck | Pass | final-Rev02/typecheck.log،exit0؛ در SHA سورس بالا |
| TZ=UTC npm test | Pass |109/109،fail0/skip0؛ final-Rev02/npm-test-UTC.log؛ 86 تست قبلی +23 شناسه |
| تست شناسه + App/diagnostics/coordinator/UI با TZ=Asia/Tehran | Pass |79/79،fail0/skip0؛ فرمان کامل در گزارش/validation-record؛ related-Asia-Tehran.log |
| ۱۲۲ تخصیص/تاریخچه،۱۰۸ فعال،۱۴رزرو | Pass سورس/رفتار renderer |۱۲۹ binding،۱۴۳ردیف پوشش، هر۱۰۸ کد فعال مشاهده؛ هیچ رزرو binding یا badge تازه ندارد |
| guide/CSV/registry و محل واقعی | Pass | generator، history pin و source contract همراه رفتار UI؛ CSV UTF-8/LF |
| X17 دو ورودی، X39/X40، Alertهای لغو/تأیید، create/edit، autosave onBlur و D04 draft | Pass | actual screens/services/SQLite؛ native/OS/navigation hosts doubled |
| scope/replace/navigate، Undo معتبر/منقضی و X102 بدون create/restore | Pass | payload واقعی callback و تغییر دادهٔ fixture بررسی شده؛ گوشی نیست |
| FIX01/FIX02 و X75 داخل target در همه حالت‌های صف | Pass | تست‌های موجود واقعی App/notifications +تست‌های جدید؛ دریافت اعلان اثبات نمی‌شود |
| RTL/نام بلند/scale1/1.5/2، تک handler، contrast و قیود wrap/بستن | Pass در پیکربندی renderer | حداقل14/scaling/LTR، target config، فضای sheet و اندازه‌گیری label؛ native layout اندازه‌گیری نشده |
| screenshot واقعی، overlap/target48×48، native Alert و header/tab در سه scale | Not run | adb/emulator/native Android project/device/build معلوم وجود ندارد؛ screenshot-plan-Rev02.json برنامه است |
| AC-ID نهایی و گوشی P03-015/P03-016 | Not run / باز | وابسته به QA دستگاه و پوشش نهایی RC3؛ شواهد renderer پذیرش گوشی نیست |
| TalkBack | Deferred / Not run | اجرا نشده |
| TZ unset و fixture progress Tehran | Not run در این مرحله / Known Issue باز | Fail تاریخی و logهای FIX01/FIX02 محفوظ؛ هیچ skip/تغییر منطق/انتظار تست |

ICATUS هنوز pending hide و برای RC3 نهایی قابل‌قبول نیست؛ رزرو D03/X32…37/X41/X48/X95 حذف UI را اثبات نمی‌کند. D08/X99…101 و چهار طرح بعد Deferred؛ کنترل تازه/logout/countdown/صفحه‌بندی دستی/Undo غیرقابل‌دسترسی اضافه نشد. P03-014/P03-019 بسته نشده‌اند.

نتایج۹۲/۹۲ و۶۲/۶۲ بخش بعد تاریخی مرحلهٔ ناقص‌اند و جای نهایی را نمی‌گیرند. بخش‌های FIX01/FIX02 پایین، عین سابقهٔ پیشین‌اند.

---

# Checkpoint تاریخی — RC3-ID-01 ناقص / منتظر مرجع

2026-10-11؛ شاخهٔ محلی rc3-id01-ui-identifiers، HEAD مبنای FIX02 ffa7bfc1dcb18c747611d585553bed4d4e4d5359 + diff ثبت‌نشده. SHA مبنا commit تحویل نیست؛ commit/push این checkpoint انجام نشده. گزارش مستقل: RC3_ID_01_Report_FA.md.

| اجرا / رفتار | نتیجه | شاهد و محدودیت |
| --- | --- | --- |
| npm run typecheck | Pass | rc3-id01/typecheck.log، exit0 |
| TZ=UTC npm test | Pass | 92/92،skip0؛ rc3-id01/npm-test-UTC.log؛ زیرساخت موجود با doubles native/navigation |
| تست شناسه تازه + App/diagnostics/coordinator/UI در Tehran | Pass | 62/62،skip0؛ فرمان کامل در گزارش مستقل؛ related-Asia-Tehran.log |
| تخصیص صریح موجود، برخورد کد، منع رزرو فعال، guide/CSV برابر registry | Pass | 6 تست تازه؛ registry کامل/سابقهٔ غایب هنوز پوشش ندارد |
| X69–72 در loading/failure/success و X75 در جریان FIX01/FIX02 | Pass | target و label واقعی renderer؛ کدهای رزرو کنترل تازه ایجاد نکردند |
| code14/LTR/scaling/wrap/contrast در enabled/selected/disabled و یک handler | Pass | پیکربندی scale1/1.5/2 و محاسبهٔ رنگ؛ تصویر/اندازه‌گیری گوشی نیست |
| اجرای اولیهٔ تست تازه | Fail، سپس اصلاح تست | 91/92؛ import ثابت پورت double جای dynamic import؛ محصول برای آن تغییر نکرد؛ log اولیه محفوظ |
| تمام A/D/X و محل‌های تکراری | Not run / Pending | جدول مرجع کامل و AC-ID-01…10 غایب؛ تحویل کامل نیست |
| RTL/نام بلند/scaleهای1/1.5/2 روی گوشی، screenshot و48×48 واقعی | Not run | adb/emulator/native Android project موجود نیست؛ renderer شاهد پذیرش بصری نیست |
| TZ unset و fixture progress تهران در این مرحله | Not run | Known Issueهای تاریخی زیر محفوظ؛ هیچ skip یا تغییر منطق/انتظار تست |
| P03-015/P03-016 روی گوشی و TalkBack | Not run / Deferred | پذیرش دستگاهی و دریافت اعلان همچنان باز |

ICATUS در سورس میانی pending hide؛ رزرو registry شاهد حذف UI نیست. باقی پوشش و پذیرش نهایی AC-ID منتظر مرجع و شواهد اجراست. بخش‌های FIX02/FIX01 پایین، سوابق پیشین و بدون تغییرند.

---

# Checkpoint خودکار تاریخی — RC3-FIX-02

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

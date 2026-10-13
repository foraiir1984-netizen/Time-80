# RC3-BUILD-QA-01 — گزارش Rev01 / checkpoint پیش از اجرای Actions

2026-10-13، Asia/Tehran. بررسی یکپارچه و آماده‌سازی سورس انجام شد؛ **APK هنوز ساخته نشده است**. مانع جاری دسترسی API اجرای Actions است. گزارش با نتیجه run واقعی تکمیل خواهد شد؛ export/prebuild نتیجه ساخت release یا QA گوشی معرفی نشده‌اند.

## مبنا، SHA و مسیر

- آغاز: HEAD `d66b42a47d3fc519692c025d7df696d8a19bb12e`،شاخهrc3-ui-today01،working treeپاک،ancestry0/0. checkoutکامل همانقبلی است؛reset/حذف تغییر جدیدتر انجام نشد.
- شاخه اختصاصی `rc3-build-qa01`؛ **SHA آماده و آزمون‌شده برای ساخت `e6fa5c1968797d5bc6bdd3e442ca1b804c4c9d85`**؛فقطapp.json versionCode4→5 تغییرکرد. باgit ls-remote همانSHA remote تأییدشد.
- تاریخچهconfig پس ازfetch --refetch برایرفعmissing historicaltree:versionCode1/2/3/4؛RC2SHA8e1cef…/code4. تمام۱۲شاخهremote مرتبط باGitHub connector بررسی‌شدند ونسخه بالاتراز۴ نبود. versionName0.3.0 وapplicationIdcom.personal.time80 محفوظ‌اند. تاریخچهدرversion-history.json.
- کدهایFIX01/FIX02،registryRev04 وguide/CSV،ICATUS hide،clockfixture،M-01/M-02/M-04/M-10 درهمینSHAهستند؛diff باd66فقطapp.json است.
- workflowواقعی قابل‌استفاده `.github/workflows/build-android-apk.yml` است؛ورودیdispatch `release=true`،jobvalidate سپسrelease،scriptموجودscripts/build-android-release.sh وpluginwithStableSigning.cjs. تغییرworkflow/secret/signing/sourceسرویس لازم نشد.
- workflowRC2 `.github/workflows/build-android-rc.yml` وnativeDEBUG موجود بهfeat/time80-v0.3-implementation وversionCode4 محدودند؛برایRC3تغییرشان ندادیم ونتیجهoldRC2راbuildتازه معرفی نمی‌کنیم.

مستندات checkpoint روی شاخهٔ جدا `rc3-build-qa01-handoff` ثبت می‌شوند تا شاخهٔ ساخت `rc3-build-qa01` دقیقاً روی SHA آزمون‌شده e6fa5c… ثابت بماند. SHA تحویل مستندات از SHA آمادهٔ ساخت جدا است؛ اجرای بعدی همین branch ساخت را هدف می‌گیرد.

## مانع اجرایی دقیق

`gh api repos/foraiir1984-netizen/Time-80/actions/workflows` وqueryruns/secretnames با **`Get "https://api.github.com/…": Forbidden`** شکست خوردند. networkpolicy restricted/enforced است وeffectivehosts شاملapi.github.com نیست. gitpush/read بهgithub.com کار می‌کند. اتصالGitHub خواندن فایل/branch وartifact/run شناخته‌شده را دارد،ولی ابزارcallabledispatch ندارد. درخواست افزودنapi.github.com به شبکهCloud Environment ارسال شد؛مجوزاجرایActions ازپرامپت۱۱ موجوداست و تأییددوباره ساخت خواسته نشد. پس‌ازرفعشبکه بایددسترسیواقعیAPI/Actions دوبارهتأییدشود؛وجودsecret یاdispatchsuccess فرضنشده است.

[checkpoint دقیق](rc3-build-qa01/checkpoint.json):کارانجام‌شده،SHA،فرمان‌هایآخر،هیچفرمانrunning،مانع وقدمبعدی. فرمان بعدی `gh workflow run build-android-apk.yml --repo foraiir1984-netizen/Time-80 --ref rc3-build-qa01 -f release=true`؛بعدبایدrunID/head_shaخوانده وAPKواقعی گرفته شود. روش تغییرworkflow برایدورزدن guard یاnetworkpolicy استفاده نشد.

## شواهد تازه قبل ساخت

همه اجراهای زیر دراینtask رویSHAe6fa5c… هستند؛نتایجtask۱۰ به‌عنوان اجرای تازه نقل نشدند. فرمان کاملگروه تهران درcheckpoint/گزارشآزمون ثبت می‌شود.

| بررسی | نتیجه | شاهد / حد |
| --- | --- | --- |
| npm run typecheck | Pass | typecheck.log؛static |
| TZ=UTC npm test | Pass۱۴۶/۱۴۶ | suiteکامل؛fail/skip/cancel0،full-UTC.log |
| مرتبطTehran،۱۴فایلUI/data/identifiers/FIXها/nativepatchassets | Pass۱۳۵/۱۳۵ | related-Tehran.log؛fullsuiteTehranنیست |
| X07/progressfixtures،date/cleanup وregistry-guide-CSV | Pass درگروهرفتاری | testsواقعیApp/screens/services/SQLite؛UInativeنیست |
| npm run patch:check | Pass | versionlocked expo-notifications57.0.20 patch؛helper/hash برابرmanifest |
| npm run icons:check | Pass | ۱۵آیکون،۱۸۰PNGvariants؛identitylegacyمحفوظ |
| Expo export Android /Hermes | Pass | ۱۱۶۴module،bundle۳٬۰۵۶٬۵۸۰byte،۱۸۷asset؛export-android.log |
| fonts/headerbundling | Pass | ۴VazirmatnTTF وheaderPNG bytehash مطابقsource درexport؛bundle-verification.json |
| prebuildisolatedaudit | Pass | app5،stable signingguard وautolinking؛sourceاصلی/package تغییرنکرد |
| nativefont/SVG/notificationdependencies | Pass درautolinking/source | expo-font،react-native-svg وnotificationbuildFromSource؛APKcompile/packagedproof Not run |
| coreTehranintervalfixture | Fail۲/۳؛KnownIssueقبلی | known-core-Tehran.log؛slot10:00–10:30 غایب؛test/serviceتغییرنکرد |
| TZunsetfullsuite | Not run | KnownIssueتاریخیبسته اعلامنشد |
| Actions dispatch/build/actualsigning | Not run | APIForbidden؛runID/نتیجه نداریم |
| mergedmanifest/actualtargetSDK/APKbundlingdex | Not run | APKنبود؛منبعRN target36 فقطsourcehintاست،نهactualpackagedtarget |
| Androidsmoke/UI/screenshot/RTL/scales/targets | Not run | ابزار/SDK/device/emulator/KVM دربررسیامروز موجودنیست؛generatedandroidaudit=runtimeنیست |
| اعلان/ارتقاگوشی | Not run؛بازوالزامی | cache/reconcile/build/export اثباتdeliveryنیست |
| TalkBack | Deferred /Not run | فقطاینQAتعویق‌داده‌شده |

## ماتریس چهار طرح و ثبت‌های محفوظ

| طرح | پیاده‌سازی | آزمونخودکاراینtask | Native | گوشی |
| --- | --- | --- | --- | --- |
| M-01/A03/D08 | Pass درسورس | Pass؛۸mode/query/offset/date/validation وکدها | Not run | Not run |
| M-04/A03/X101 | Pass درسورس | Pass؛۳+سایر/total/همه/assetlegacy/zero/error | Not run | Not run |
| M-02/A04/D04 | Pass درسورس | Pass؛draft/onBlur/days/switches/permission/A09 | Not run | Not run |
| M-10/A01/A05 | Pass درسورس | Pass؛progress/lifecycle/orderingX07/manual/past/future/no-record-write | Not run | Not run |

FIX01/FIX02 وnotification→exactperiod→register/duplicate/Undo باگروه‌هایواقعیApp/service/SQLite رگرسیونشدند؛portهایnative درتستmockهستند. ICATUSبهUIبرنگشت. شمع/DonutSVGباdependencyموجودbundleشدند؛کیفیتتصویر/crop/font رویگوشیNot run است.

## امضا و مشخصات واقعی APK

| فیلد | وضعیتفعلی |
| --- | --- |
| commit آماده ساخت | e6fa5c1968797d5bc6bdd3e442ca1b804c4c9d85 |
| workflow/runID/link | pathمشخص؛runID/linkاجرایجدید Not Available |
| APKrelease | Not run؛فایلنداریم |
| APKapplicationId/versionName/versionCode | Not Available؛فقطsourceexpectedcom.personal.time80/0.3.0/5 |
| APKchecksum/certificate/verify | Not run؛هیچhashساختگی تحویلنشد |
| RC2referencecertificate | a9b10ace1c5b633458542bb3af73e4254334660718afe79f579e51c03ebbcb7d؛لاگpublicapksignerRC2خواندهشد |
| RC2APKhash | f79228c789843ac5b97c5441f75d191c1e7eea436b8fa85d5c761da483dc06d8؛سابقه،نهAPKاینtask |
| RC3artifactdownload | Not Available؛لینکworkflow فقطمسیر اجراست،نهartifactساخته‌شده |

کلیدجدید/debugsigning جایگزیننشده؛pluginreleaseبدونکلیدstable خطامی‌دهد. secretvalue/keystore محلیخوانده یاافشا نشد. workflowعمومینامartifactتاریخیTime80-v0.2-APK دارد؛بعدازساختبایدactualmetadataverify وفایلخروجیTime80-v0.3.0-RC3.apk/checksum/evidence تحویلشود،بدونGitAPK/ZIP/node_modules.

## Known Issues و پذیرش باز

- محدودیتfixture: coreintervalتهرانFailقبلی،جداازX07/progressResolved؛fullTZunsetNot run.
- مانعاجرایی:APIForbidden؛buildjob شکست‌خورده یاsecretmissing ادعانشده،چونdispatchهنوزنشد.
- هشدارprebuildموجود:expo-system-ui برایuserInterfaceStyleautomatic نصبنیست؛baselinewarning،نهخطایساختتازه؛dependencyاضافه نشد.
- P03-014:اعطایمجوز/موعدها/dirty/deliveryرویگوشیباز؛patchsourcePassاثباتdeliveryنیست.
- P03-015/P03-016:FIXهاوX75درخودکارPass؛پذیرشگوشیهنوزالزامی.
- P03-019:منبعRN targetSdk36؛mergedmanifest/APKtargetوOSexact-listهنوزNot run؛سیاستSDK/manifestبرایسبزشدن عوضنشد.
- ارتقایRC2→RC3،حفظداده/تاریخچه،smoke وnativeRTL/scales/targets/crop/screenshots Not run؛emulatorنیست وگوشیواقعیکارشده ادعانشد.

[راهنمایدستگاه](RC3_Device_Test_Guide_Rev01_FA.md) آماده است،اما نصب فقطپس‌ازAPKامضاتأییدشده. اینcheckpointتحویلکاملAPK یاتأییدانتشارنیست. قدمبعدی رفعدسترسیAPI،اجرایمسیرموجودازSHAمشخص وراستی‌آزماییartifactواقعی است؛merge/forcepush/Release/countdown/datareset انجامنشده.

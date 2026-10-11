# RC3-FIX-02 — چرخهٔ خطای P03-015 و ناحیهٔ لمس X75

تاریخ: 2026-10-11، Asia/Tehran. اصلاح سورس و آزمون‌های خودکار تکمیل شدند؛ پذیرش دستگاهی P03-015/P03-016 باز است. این گزارش دربارهٔ علت قطعی هشدار RC2 یا دریافت واقعی اعلان ادعایی ندارد. شناسهٔ نسخهٔ تحویل، commit همین فایل و SHA کامل پاسخ تحویل است؛ snapshot زمان آزمون پیش از commit بود.

## مبنا و اختیار اجرا

درخواست اجرایی، پرامپت۵ صریح صاحب محصول است. IMPLEMENTATION_STATE_RC3 (1).md پیوست، یافته‌ها و سابقهٔ بررسی دفتر را فراهم کرد؛ دستور انجام کارهای خارج از پرامپت نیست. گزارش FIX01 و RC3-QA-01، QA/Triage اصلی RC2، الحاقیهٔ شناسه‌ها و Handoff/D03-005 خوانده شدند. AGENTS.md قابل اعمال در مسیر checkout یافت نشد. دستورهای معتبر روز/آیکون/داده حفظ شدند.

- checkout اجرا همان `/workspace/work/rc3-fix01/repo` کامل شامل FIX01، با 316 فایل tracked در آغاز است؛ تعویض به checkout قدیمی یا RC2 انجام نشد.
- HEAD آغاز: `22cfac2895e35845382b4f41edfeb171e544f2c7`؛ شاخهٔ آغاز `rc3-fix01-x75`؛ working tree clean؛ نسبت با مبنای دفتر `0/0`.
- کنترل تازهٔ remote: FIX01 همان SHA؛ RC2 `8e1cef5c0bdf0d471a0ed6cfbd02872b127f7634`؛ main `5c45240ab1dc967cfbbabcdede73b27bb0f468e8`؛ شاخهٔ FIX02 موجود نبود.
- شاخهٔ اختصاصی ساخته‌شده از FIX01: `rc3-fix02-p015-x75`. تغییرات FIX01 حفظ شدند؛ coordinator تولیدی، گزارش و تمام شواهد تاریخی FIX01 بدون تغییر هستند.
- `/workspace/Time-80` روی branch `work` و HEAD قدیمی، checkout اجرای این task نیست و تغییر نکرد.
- RC2 detached worktree فقط برای بازتولید یک شکست قدیمی تست استفاده شد؛ محصول FIX02 از آن اجرا/پیاده نشد. فایل‌های baseline دست‌نخورده‌اند؛ symlink وابستگی آزمون untracked و خارج تحویل است.

## فایل‌های تغییرکرده و دلیل

| فایل | دلیل |
| --- | --- |
| App.tsx | جداسازی bootstrap/resume/response، مالکیت نتیجهٔ جدید resume، cleanup و نگهداری کد X75 داخل کنترل در processing |
| src/screens/NotificationDiagnosticsScreen.tsx | focus/resume refresh، دادهٔ تازه یا نامعلوم، مالکیت مستقل خواندن و چهار اقدام، محافظت از ترتیب پاسخ‌ها و نمایش خطای X70 |
| src/components/Ui.tsx | تنها prop اختیاری actionCode؛ متن 14sp/LTR/scaling در همان Pressable و wrap برای دکمهٔ دارای کد |
| tests/v03LifecycleUI.test.tsx | 26 تست رفتاری ماژول‌های واقعی، lifecycle، داده و خطای مستقل، X75 و یک handler |
| tests/navigation.mjs | رویداد focus/blur و cleanup قابل کنترل برای useFocusEffect در زیرساخت موجود |
| tests/react-native.mjs | مشاهدهٔ تعداد listenerهای AppState برای آزمون حذف listener؛ Linking و dimensions موجود استفاده شدند |
| tests/notifications.mjs | پورت خواندن/درخواست permission، channels و وضعیت denied/granted قابل کنترل |
| tests/notificationPlatform.mjs | قابلیت‌های supported/value قابل کنترل، بدون جایگزین‌کردن diagnostics تولیدی |
| tests/sqlite.mjs | امکان توقف/شکست یک خواندن واقعی برای آزمون پاسخ‌های خارج از ترتیب؛ SQLite fixture همان زیرساخت قبلی است |
| docs/v0.3/IMPLEMENTATION_STATE_RC3.md و RC3_QA_Retest_Report.md | checkpoint جاری و تفکیک نتیجهٔ خودکار از QA دستگاهی |
| این گزارش و rc3-fix02/ | فرمان‌ها، تمام نتیجه‌ها، logهای Pass/Fail، محدودیت‌ها و checksum شواهد |

SettingsScreen و OnboardingScreen بررسی شدند؛ state محلی آن‌ها وابستگی ضروری این چرخه نبود، بنابراین تغییر نکردند. scheduler، platform تولیدی، schema/data services، dependency/lock، manifest/target/signing/applicationId و workflow تغییر نکردند. `protected-files.json` مقایسهٔ بایت 42 فایل با FIX01 را ثبت می‌کند.

## رفتار قبل و بعد و مالکیت خطا

| مالک | قبل | بعد / شاهد رفع خطا |
| --- | --- | --- |
| bootstrap | error مشترک با resume؛ retry پیام را پیش از نتیجه پاک می‌کرد | bootstrapError متعلق به attempt جاری؛ موفقیت کامل همان bootstrap پاک می‌کند؛ cleanup نتیجهٔ attempt قدیمی را نمی‌پذیرد |
| resume/reconcile | catch خطا را می‌نوشت، موفقیت آن را پاک نمی‌کرد | resumeError مستقل؛ فقط موفقیت جدیدترین resume پس از همان بررسی‌های واقعی پاک می‌کند؛ خطای response/bootstrap دست‌نخورده |
| پاسخ اعلان | FIX01 صاحب responseError و guardها بود | همان مالکیت و run/version guard؛ موفقیت X75 فقط مالک پاسخ را رفع می‌کند؛ پس از unmount مسیر جدید dispatch نمی‌شود |
| خواندن diagnostics | فقط mount؛ خطای قدیمی می‌ماند؛ پیش از داده denied/dirty=false کاذب | focus و AppState active؛ readError و نسخهٔ مستقل؛ موفقیت تازه فقط readError را پاک می‌کند؛ loading و شکست refresh دادهٔ قبلی را معتبر جلوه نمی‌دهند |
| اقدام diagnostics | یک error برای همه؛ refresh/action می‌توانست خطای دیگر را پاک کند | actionErrors مستقل برای permission/settings/test/reconcile؛ تنها موفقیت همان اقدام و نسخهٔ جاری خطای خودش را رفع می‌کند |
| پیام اقدام | موفقیت قدیمی کنار شکست جدید می‌ماند | شروع هر اقدام/خواندن پیام را پاک می‌کند؛ پیام فقط برای آخرین اقدام موفق پس از خواندن تازه نمایش دارد؛ با خطای اقدام حل‌نشده مخفی است |

ترتیب resume همان خواندن timezone → در صورت اختلاف applySettingsPatch → ensureSlotHorizon → reconcileNotifications("resume") است. بررسی واقعی جای خود را به پاک‌کردن پیام نداده است؛ پایان عملیات زنده و متعلق به جدیدترین درخواست، تنها محل پاک‌شدن resumeError است. guard عمر component ادامهٔ کار پس از cleanup را متوقف می‌کند؛ scheduler force عمومی یا بازنویسی نشده است.

خواندن diagnostics callback پایدار دارد؛ listener فقط در مدت focus ثبت و در blur/unmount حذف می‌شود. شمارهٔ خواندن با درخواست بعدی یا cleanup تغییر می‌کند؛ نتیجهٔ دیررس موفق یا ناموفق اجازهٔ جایگزینی داده/خطای جدید را ندارد. پایان اقدام هم نسخهٔ مخصوص همان اقدام و عمر component را بررسی می‌کند. refresh صرفاً getNotificationDiagnostics موجود را می‌خواند و permission/repair تازه اجرا نمی‌کند.

در آغاز/refresh مقدار «در حال بررسی…» و در شکست/undetermined «نامعلوم» نمایش داده می‌شود؛ پس از خواندن معتبر، denied و granted جدا هستند. dirty فقط از مقدار خوانده‌شدهٔ true/false نمایش دارد. capability با supported=false یا value=null نامعلوم باقی می‌ماند. مجوز کلی، مجوز نمایش، کانال باز/بسته و exact جدا دیده می‌شوند. cache/reconcile اثبات دریافت اعلان معرفی نمی‌شوند.

X69 همان درخواست مجوز، X70 همان بازکردن تنظیمات گوشی، X71 همان تست 10ثانیه و X72 همان reconcile("manual") هستند. X70 اکنون خطای ردشدهٔ openSettings را نشان می‌دهد. خواندن پس از پایان اقدام، refresh رابط است؛ اقدام دیگری را repair نمی‌کند. X75 همچنان فقط drain صف پاسخ و ترتیب resolve→route→dismiss→ack با dedupe و حفظ مراحل موفق FIX01 است.

## اصلاح X75

Text بیرون Button و اندازهٔ 12 حذف شد. `actionCode="X75"` متن مستقل LTR با اندازهٔ 14sp و allowFontScaling درون همان InteractivePressable تولید می‌کند؛ نام فارسی کامل و accessibilityLabel موجود حفظ شده‌اند. دکمه یک onPress دارد، Pressable تو‌در‌تو یا handler روی متن کد وجود ندارد. minHeight/minWidth قبلی حداقل48dp باقی است؛ ردیف فقط برای دکمهٔ دارای کد wrap می‌کند، متن تعداد خط ثابت، سقف scaling یا کوچک‌سازی ندارد. دکمه‌های بدون کد مسیر click و style قبلی را حفظ می‌کنند.

processing به شرط حضور کنترل اضافه شد؛ حتی اگر resume در این فاصله موفق و هشدار آن پاک شود، X75 تا پایان پردازش دیده می‌شود. RTL و scaleهای1/1.5/2 در host renderer، ناحیهٔ مشترک و تنظیمات scaling/wrap و تک‌اجرایی بررسی شدند. این شاهد، اندازه‌گیری یا تصویر layout گوشی نیست؛ QA بصری واقعی هر سه scale هنوز Not run است. registry کامل و AC-ID کلی بسته نشده‌اند.

## فرمان‌ها و نتیجه‌ها

تمام logها در `docs/v0.3/rc3-fix02/` هستند. نسخهٔ Git فقط whitespace انتهای خطوط را حذف کرده؛ خروجی خام در scratch حفظ شده است. manifest هش همین نسخه‌های ثبت‌شده را دارد.

| فرمان / اجرا | نتیجه | شاهد و حد |
| --- | --- | --- |
| npm run typecheck، نهایی | Pass، exit0 | typecheck.log؛ stdout tsc ذخیره شده |
| npm run typecheck، اولین اجرای تست جدید | Fail، exit2 | typecheck-initial.log؛ generic نتیجهٔ query و نوع counter closure اصلاح شدند؛ بدون اصلاح محصول |
| TZ=UTC npm test | Pass، 86/86، skip0 | npm-test-UTC.log؛ شامل تمام60 تست FIX01 و26 تست جدید |
| TZ=UTC node --import ./tests/register.mjs --import tsx --test tests/v03LifecycleUI.test.tsx | Pass،26/26 | lifecycle-initial-UTC.log؛ اجرای رفتاری اولیه، قبل از annotation نوع تست |
| TZ=Asia/Tehran node --import ./tests/register.mjs --import tsx --test tests/v03LifecycleUI.test.tsx tests/v03ResponseUI.test.tsx tests/v03Notifications.test.ts tests/v03UI.test.tsx | Pass،56/56،skip0 | related-task-Asia-Tehran.log؛ پوشش همین task و رگرسیون FIX01/Ui؛ ادعای Pass کل suite تهران نیست |
| همان انتخاب بالا با tests/visualIntegration.test.tsx افزوده | Fail،62/63،skip0 | related-Asia-Tehran.log؛ تنها fixture قدیمی progress: 65 به‌جای50 |
| TZ=Asia/Tehran node --import ./tests/register.mjs --import tsx --test tests/visualIntegration.test.tsx روی RC2 دست‌نخورده | Fail،6/7 | baseline-visual-Asia-Tehran.log؛ همان65≠50، خط214؛ مستقل از FIX02 |
| git diff --check و مقایسهٔ بایت فایل‌های محافظت‌شده | Pass | بررسی diff و protected-files.json؛ فایل قدیمی visualIntegration نیز تغییر نکرد |
| npm test با TZ unset در FIX02 | Not run | Known Issue تاریخی FIX01 حفظ؛ شکست fixture به علت literal undefined/SQLite parameter2 در baseline-visualIntegration.log قبلی ثبت است |
| Android/native/screenshots warning قبل/بعد، diagnostics، X75 و layout RTL/scales1/1.5/2 | Not run | adb و emulator موجود نیستند؛ Android project/device/APK شناخته‌شدهٔ در حال اجرا موجود نیست؛ renderer جای تصویر گوشی نیست |
| build/امضا/ارتقا/تحویل اعلان و TalkBack | Not run | در این task اجرا نشده؛ TalkBack همچنان Deferred |

شکست progress تهران یک محدودیت قدیمی اضافی fixture است: absolute UTC time در تست با progress روز محلی سنجیده می‌شود. به‌طور مستقل روی RC2 بازتولید شد. log اجرای شکست‌خورده حفظ شد؛ تست قدیمی skip/ویرایش نشده، منطق محصول یا timezone داده تغییر نکرد. دو Known Issue تست با سبز بودن UTC بسته نمی‌شوند.

## پوشش رفتاری پایان

همهٔ ردیف‌های زیر Pass هستند، با دو فرمان suite کامل UTC و انتخاب مرتبط Asia/Tehran بالا؛ نام مستقل هر26 تست و فرمان‌ها در validation-record.json آمده است.

| رفتار | شاهد | محدودیت |
| --- | --- | --- |
| denied→granted→resume، رفع فقط هشدار resume | App واقعی، reconcile واقعی، schedule_dirty=false در fixture و بدون تغییر time_entries | native scheduling double؛ دریافت گوشی اثبات نشده |
| bootstrap/response/resume مستقل | init failure و not-ready retry؛ bootstrap retry موفق با حفظ خطای پاسخ؛ resume موفق با حفظ response؛ X75 موفق با حفظ resume | DB آزمون و renderer؛ init شکست‌خورده در معماری فعلی resume را آماده نمی‌کند |
| resumeهای خارج ترتیب و unmount | شکست/موفقیت قدیمی پشت خواندن متوقف‌شده؛ جدیدترین نتیجه حفظ؛ continuation و listener پس از unmount متوقف | رویداد AppState تزریقی |
| X70 return و focus مجدد، بدون loop/repair | مجوز تازه، یک listener، blur removes، هر focus یک read؛ refresh شمار scheduling را افزایش نمی‌دهد | navigation focus و OS settings double |
| loading/unknown/denied/granted و dirty کاذب | read متوقف/ناموفق/موفق، undetermined؛ display مجاز، channel بسته، exact=null یا unsupported نامعلوم | APIهای OS/capability double، diagnostics واقعی |
| read/action مالکیت، پیام قدیمی | شکست read سپس موفقیت؛ شکست هر X69/X71/X72/X70 سپس refresh/اقدام دیگر؛ فقط retry موفق همان مالک رفع می‌کند؛ پیام موفقیت با شکست جدید حذف | scheduler و permission wrapper واقعی با IO تزریقی |
| read/action خارج ترتیب و cleanup | موفقیت/شکست قدیمی read و X70؛ blur/refocus، unmount read/action؛ بدون refresh پس از خروج | بدون native lifecycle واقعی |
| تمام حالت‌های FIX01 و dedupe | 17 تست notification و8 App موجود؛ صف خالی/not-ready/running/failure/success، stages و no-write | گوشی Not run |
| X75 داخل یک target، processing و یک handler | سه scale، کد LTR14، scaling/wrap، نام کامل، target≥48، tap واحد و retry running بدون ack/dismiss اضافه؛ دکمهٔ بدون کد حفظ | تنظیمات host آزمون‌اند؛ clipping واقعی Not run |

## موارد باز و تحویل

P03-015 از نظر چرخهٔ سورس اصلاح و خودکار آزموده شده است؛ علت دقیق هشدار گوشی و پذیرش دستگاهی آن هنوز باز است. P03-016 نیز پذیرش گوشی و تصویر نهایی X75 می‌خواهد. P03-014/P03-019 و OI-A01-R/OI-P01/AC-A11 بسته نشده‌اند. چهار UI، registry/guide کامل، ICATUS UI hide، شمارش معکوس Undo و TalkBack در این task اجرا نشدند؛ تصمیم پنهان‌سازی ICATUS برای task بعدی محفوظ و داده/assignment/history فعلی حفظ است.

کوچک‌ترین قدم بعدی با دستور جدا: روی build شناخته‌شده، QA گوشی N15/N16 و تصاویر warning قبل/بعد، diagnostics پس از X70/focus و X75 در scaleهای1/1.5/2؛ هویت APK/device و زمان‌ها ثبت شوند. این پیشنهاد مجوز build یا task بعدی در این مرحله نیست.

تحویل Git فقط به شاخهٔ `rc3-fix02-p015-x75` مجاز است؛ diff و متن شواهد پیش از staging بازبینی می‌شوند. فایل حساس، APK، ZIP و node_modules وارد Git نمی‌شوند. force-push، merge، تغییر workflow و Release انجام نمی‌شود. موفقیت push تنها پس از خواندن مجدد SHA remote در پاسخ تحویل تأیید خواهد شد.

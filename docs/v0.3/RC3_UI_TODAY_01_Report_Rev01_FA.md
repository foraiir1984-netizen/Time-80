# RC3-UI-TODAY-01 — گزارش Rev01

M-10 در سورس A01 و خط زمان A05 پیاده شد؛ ثبت دستی، تکمیل pending و مرور گذشته محفوظ‌اند. پذیرش native هنوز **Not run** است. تاریخ: 2026-10-13، Asia/Tehran.

## مبنا و اتصال تحویل

- شروع: HEAD `51728c49acfaba52412b6500f719c80a31848d7a`، شاخه `rc3-ui-settings01`، working tree پاک، ancestry نسبت به مبنا `0/0`.
- شاخه اختصاصی `rc3-ui-today01` از همان checkout کامل ساخته شد؛ remote هم‌نام هنگام آغاز موجود نبود. reset، checkout قدیمی، merge، force push یا انتشار انجام نشد.
- **SHA دقیق سورس آزمون‌شده: `b8d798d454236b2f66eefc6d318033b50777a233`**. آزمون‌های نهایی بعد از این commit اجرا شدند و سورس/تست/asset/guide پس از آن تغییر نکردند.
- commit تحویل، فرزند همین SHA و فقط مستندات/checkpoint/evidence است. SHA کامل تحویل و نتیجه خواندن remote در پاسخ نهایی داده می‌شود؛ commit این گزارش در Git نیز آن را مشخص می‌کند. SHA آزمون را با commit مستندات یکی نگیرید.
- [manifest سورس آزمون‌شده](rc3-ui-today01/tested-source-manifest.json): ۳۱۶ فایل؛ [manifest محافظت](rc3-ui-today01/protected-manifest.json): ۲۹۳ فایل برابر بایتی با مبنا، شامل App، سرویس‌ها، scheduler، schema، repository، داده، FIXها، تنظیمات/گزارش، fixture X07، آیکون‌ها، فونت‌ها، dependency و workflow.

## منابع خوانده‌شده و دارایی‌ها

[فهرست کامل نام/نسخه/مسیر/hash](rc3-ui-today01/sources-manifest.json) و نسخه‌های بایتی در `rc3-ui-today01/design-inputs/` ثبت‌اند:

| مرجع | نسخه / نقش | بررسی |
| --- | --- | --- |
| RC3_Product_Handoff.md | 1.0، بخش D03-005 و مرز M-10 | Read |
| Time80_Approved_UI_Decisions_FA.md و M10_Behavior_and_Open_Items_FA.md | بسته 2026-10-06، ساختار و progress زمانی | Read |
| Typography / Visual System Normalization | v1.0؛ اندازه فونت، فاصله، شعاع و آیکون | Read |
| Color_Direction_Note_FA.md و MOCKUP_INDEX_FA.md | جهت سبز گرم و تعیین مرجع نهایی | Read |
| M-10_Today_Final_Visual_Reference_APPROVED.png | Final Approved؛ مرجع ترکیب‌بندی | Viewed با ابزار تصویر |
| Release_Brief_v0.3.md | 1.2؛ متن تصمیم D03-004 | Read |
| ADR-003-04_Local_Day_Contract.md / ADR-003-05_Icon_Compatibility.md | 0.1 Accepted؛ روز محلی/آیکون | Read |
| ZIP داخلی Time80_Product_UI_Handoff_2026-10-06.zip | hash `f42852923f84c9d09253aa0f8853509b6d5996e9ec57a4f38a5fa77b21d70706` | Opened؛ ۱۲ checksum داخلی دوباره معتبر؛ PNG استخراج و مشاهده شد |

تمام مراجع لازم موجود بودند؛ نسخه مدل تولید تصویر در ابزار **Not Available** است. Library فرض نشد. منطق واقعی `TodayScreen`، `TodayOverview`، `SlotRow`، `utils/slots`، `slotService`، `slotRepository`، `dayScopeService`، `getSettings`، theme، registry و زیرساخت آزمون بررسی شد.

دارایی مستقل `assets/illustrations/today-mountain-v1.png` با image_gen و prompt متنی کوه برفی، جنگل سبز و نور گرم، بدون ورودی تصویر ثالث تولید شد؛ PNG اصلی 1254×1254 بدون تغییر بایت استفاده می‌شود. hash: `ed896d418b038151fc7116174eb0607fd44c5853bc975e963ede854bd710eed0`. نه کل موکاپ است و نه متن رندرشده. منشأ، حقوق خروجی OpenAI، روش و محدودیت‌ها در [README دارایی](../../assets/illustrations/README_FA.md) و source.json ثبت‌اند. استفاده طبق درخواست صاحب محصول؛ مجوز stock یا انحصار ساختگی ادعا نشده است. دارایی اجرایی v1 است، پذیرش crop/کیفیت Android باز است.

شمع، هندسه SVG مستقل و قابل‌مقیاس در `DayPassage.tsx` با مجوز CC0-1.0 برای بخش تصویرسازی است؛ تصویر/پس‌زمینه مجزا ندارد. Vazirmatn v33.003 با OFL-1.1 و react-native-svg موجود بازاستفاده شدند؛ هیچ dependency تازه یا ارتقا نیست. [manifest دارایی‌ها](rc3-ui-today01/assets-manifest.json) hash تصویر، شمع، فونت‌ها و مراجع مجموعه آیکون را دارد.

## قبل / بعد و محدوده فایل‌ها

| محل | قبل | بعد / علت |
| --- | --- | --- |
| TodayOverview.tsx | هدر متنی، progress نیمه‌شب، کارت‌های مستقل یادآوری/جاری/آخرین ثبت | هدر تصویر چپ/عنوان راست، متن خنثی، ساعت 42/50، شمع/Donut و اقدامات موجود؛ حذف فقط نمایش کارت‌های قدیمی |
| TodayScreen.tsx | A01 بدون ردیف؛ A05 خط زمان؛ load هر ۳۰ثانیه همراه horizon/read reminder | Timeline در A01 و A05؛ minute tick فقط setNow، focus/resume و تغییر روز/zone داده را تازه می‌کنند؛ نگهداری horizon همان تابع قبلی، بدون force |
| todayPresentation.ts | نبود مرجع UI روز تنظیم‌شده | helper فقط نمایشی با minute/zoned موجود؛ پنجره معتبر همان روز، clamp یا unknown |
| DayPassage.tsx | progressbar خطی | شمع و Donut با یک عدد؛ کوتاه‌شدن wax، حذف شعله در انتها، unknown بدون درصد کاذب |
| SlotRow.tsx | نمای عمومی Backlog/خط زمان | prop اختیاری typography فقط برای Today؛ گروه نام/آیکون و metadata، مدت واقعی، code همان target؛ default callerهای دیگر محفوظ |
| tests/v03TodayUI.test.tsx | نبود آزمون M-10 | ۸ تست رفتاری با ماژول‌های واقعی UI، SQLite واقعی و ساعت فقط در تست |
| tests/visualIntegration.test.tsx | فرض نصف روز UTC با timezone میزبان و کارت‌های حذف‌شده | ساعات صریح ۸–۱۶ و zone صریح، آزمون DST؛ پوشش read-only/route/disabled باقی و Date fixture با cleanup ثابت شد |
| registry، generator guide، راهنما/CSV | sites قبلی | فقط محل‌های تازه و اتصال پوشش M-10؛ تخصیص/معنا/status/Rev04 عوض نشد |
| assets/illustrations | نبود تصویر مستقل | PNG مستقل، README منشأ/حقوق و source.json؛ اطلاعات کاربر یا payload اعلان نیست |

`Ui.tsx`، `ActivityIcon.tsx`، M-01/M-02/M-04، FIX01/FIX02، scheduler، داده و سیاست طبقه‌بندی تغییر نکردند. کد تازه و کنترل تازه تخصیص داده نشد.

## قرارداد progress، زمان و ترتیب

`dayPresentationProgress(now, settings, zone)` تاریخ محلی را با همان `zoned`/Temporal موجود می‌گیرد، دو مرز day_start/day_end را در همان تاریخ/zone می‌سازد و زمان واقعی سپری‌شده را بر فاصله واقعی این مرزها تقسیم می‌کند. خروجی ۰..۱ است؛ قبل شروع=۰، بعد پایان=۱. طول روز/DST با جمع ۲۴ساعت ثابت فرض نمی‌شود. شمع و Donut عین همین عدد را می‌گیرند؛ فقط درصد نوشته‌شده گرد می‌شود. ثبت‌ها، نوع فعالیت، notification_enabled و شمارش بر آن اثر ندارند؛ progress اثبات تحویل اعلان یا بهره‌وری نیست.

validateSettings موجود، ساعت نامعتبر/برابر/شبانه را رد می‌کند؛ generator عبور روز را تولید نمی‌کند. fallback معتبر دیگری در سرویس نبود. UI در این حالت‌ها یا هنگام loading/read error، **null/نامعلوم** را نمایش می‌دهد؛ نه روز ۲۴ساعته ساختگی، NaN یا تقسیم بر صفر. سیاست روز/سرویس تغییر نکرد. بازه قدیمی عبوری در timeline همچنان به period_start تعلق دارد؛ helper progress دادهٔ بازه را تقسیم یا اصلاح نمی‌کند.

ساعت از Date واقعی runtime می‌آید. timer دقیقه‌ای فقط در صفحه focused و foreground فعال است؛ background/focus loss/unmount آن و listener را پاک می‌کند. resume/focus زمان واقعی و settings/timeline را دوباره می‌خواند. minute tick معمولی هیچ read/write دیتابیس ندارد. در تغییر تاریخ یا zone، context کامل تازه می‌شود و loading دیده می‌شود؛ عنوان/نمای زمان/خط زمان پاسخ از zone همان query استفاده می‌کنند. sequence/alive پاسخ قدیمی یا unmounted را کنار می‌گذارد؛ صف واقعی readSnapshot نیز خواندن‌ها را سری می‌کند. شکست refresh داده قبلی را با توضیح واضح نگه می‌دارد و درصد را تازه/تأییدشده معرفی نمی‌کند.

نگهداری horizon در load همان رفتار قبلی است و ممکن است slot cache/app_meta بنویسد؛ ادعای «هیچ SQL write هنگام focus» نشده است. تست دقیق نشان می‌دهد tick معمولی حتی total_changes را عوض نمی‌کند و browse/rollover/resume هیچ time_entry، classification revision/history یا time context را تغییر نمی‌دهد. alarm یا سرویس پس‌زمینه تازه نیست.

سورس واقعی repository از قبل نزولی بود. `timelinePresentation` فقط کپی را به ترتیب نزولی period_start مرتب می‌کند؛ `items` و **همان items.find X07** تغییر نمی‌کنند. A01 و A05 دو نمای همان Today باقی‌اند. A01 اکنون Timeline مستقیم هم دارد؛ X08 همچنان review=true، X09 تاریخ امروز+review=false، X11 فقط تاریخ امروز، X01 تب و X56 مسیر خودش است. X06/X07 همان زمان/source manual/slotId/entryState را به A06 می‌برند؛ X10/X12 گذشته و X13 Backlog عمومی را حفظ می‌کنند. آینده disabled، pending/skipped/logged متمایز و نام آخرین فعالیت گذشته هرگز «در حال انجام» نشده است.

## تطبیق M-10 با اجرا و شاهد

وضعیت Pass در جدول مربوط سورس/آزمون است؛ همه شواهد native ستون آخر **Not run** هستند.

| بند | اجرا | نتیجه / شاهد | حد |
| --- | --- | --- | --- |
| هدر 50/50، تصویر چپ و امروز/تاریخ راست، gap8/radius16 | دو flex برابر و direction LTR برای جای فیزیکی تصویر؛ متن RTL | Pass؛ test layout، PNG مشاهده‌شده | Android Not run؛ در 1.5/2 ستون برای حفظ متن |
| ساعت اصلی واقعی و tabular | Vazirmatn Bold،42/50؛ دقیقه واقعی | Pass؛ clock/lifecycle tests | native font/render Not run |
| متن خنثی | «امروزت را مرور کن»،19/28 | Pass؛ overview واقعی | state خوب/بد/بهره‌وری ساخته نشده |
| شمع مستقل روی سطح خنثی | SVG شمع+برگ/پایه، بدون image background | Pass؛ هندسه آغاز/میانه/پایان | بازنمایی سبک ۲بعدی، نه عمق ۳بعدی موکاپ؛ native Not run |
| Donut کنار شمع،gap≥16 | track/segment سبز گرم، عدد مرکز در scale1 و بیرون در متن بزرگ | Pass؛ shared progress/scale tests | native overlap Not run |
| progress مشترک و محدود | زمان/ساعات تنظیم‌شده،۰..۱؛ داده فعالیت ورودی آن نیست | Pass؛ start/mid/end/before/after/third | فقط rounding نمایش |
| نامعتبر/برابر/شبانه | همان رد سرویس، unknown بدون درصد | Pass؛ pure helper + screen/read error tests | قابلیت شبانه اضافه نشده |
| نیمه‌شب/DST/timezone | مرز zoned واقعی؛ refresh کل context | Pass؛ midnight/zone و DST spring/fall | دستگاه واقعی Not run |
| focus/resume/cleanup | listener scoped، minute timer و sequence/alive | Pass؛ lifecycle و late read/unmount | Android background Not run |
| حذف کارت‌های legacy | یادآوری/جاری/آخرین مستقل حذف، مسیرها حفظ | Pass؛ visual integration / routes | screenshot Not run |
| Timeline جدیدترین بالا | copy.sort نزولی، اصلی و X07 محفوظ | Pass؛ ordering+all exact routes | همه rows واقعی، شامل future disabled؛ PNG فقط نمونه ثبت‌شده دارد |
| ثبت دستی/گذشته/backlog | X06/X07/X08/X09/X10/X11/X12/X13 | Pass؛ Today UI و IdentifierFlows | پذیرش لمس واقعی Not run |
| pending/skipped/واقعی/آینده | متن خنثی و disabled همان شرط قبلی | Pass؛ SlotRow/route tests | آخرین ثبت، فعالیت جاری فرض نشده |
| فعالیت/مدت/آیکون | raw legacy و asset key، منبع24/نمایش20/frame40 scoped | Pass؛ layout/default tests، قرارداد قبلی | default Backlog 52/30 و ActivityIcon بدون تغییر |
| فونت/spacing/radius/رنگ | family موجود،padding16/section24/card16/axis2/node8–12 | Pass؛ normalization/source/scales | اندازه واقعی native Not run |
| کدهای visible،single target | 14sp/LTR؛ خارج ساعت/نمودار/نام/مدت، داخل target | Pass؛ identifier suite و single-handler | اندازه‌گیری لمس/هم‌پوشانی Not run |
| ICATUS/FIXها/گزارش/تنظیمات | protected source + regression groups | Pass؛ UTC/Tehran | پذیرش اعلان/ارتقا باز |
| عدم write ثبت بر اثر زمان/مرور | snapshot تاریخچه واقعی ثابت،tick total_changes ثابت | Pass؛ real SQLite tests | horizon maintenance قبلی استثنا ثبت‌شده |
| تصاویر/RTL/scales/native targets | محیط Android موجود نیست | Not run؛ runtime-check.json | renderer، PNG و تصویر تولیدی شاهد گوشی نیستند |

## آزمون‌های نهایی و Known Issues

[فرمان‌های کامل و نتایج](rc3-ui-today01/validation-record.json)، [هر case](rc3-ui-today01/test-results.csv) و logها کنار آن‌اند؛ سورس همه همین `b8d798d…` است.

| فرمان / گروه | نتیجه | حد شاهد |
| --- | --- | --- |
| `npm run typecheck` | Pass | TypeScript؛ typecheck.log |
| `TZ=UTC npm test` | Pass؛۱۴۶/۱۴۶،fail/skip/cancel=۰ | suite کامل؛ full-UTC.log |
| `TZ=Asia/Tehran node --import ./tests/register.mjs --import tsx --test --test-reporter=tap` با ۱۳ فایل مربوط در validation-record | Pass؛۱۳۲/۱۳۲،fail/skip/cancel=۰ | Today8،visual7،Settings7،Report13،policy/data/hide/identifiers و FIXها؛ full suite تهران نیست |
| outer host 2031-07-20 UTC،Today/visual/IdentifierFlows | Pass؛۳۲/۳۲ | setup fixture عادی داخل تست؛ import شواهد فقط برای شبیه‌سازی میزبان |
| outer host 2024-02-20 Tehran،همان ۳ فایل | Pass؛۳۲/۳۲ | استقلال از تاریخ واقعی و ۱۲اکتبر؛ cleanup ساعت |
| `TZ=Asia/Tehran … tests/core.test.ts` | Fail؛۲/۳ | Known Issue قبلی interval transition؛ expected slot10:00–10:30 غایب، source/expectation/core service برابر بایتی مبنا |
| suite کامل TZ unset | Not run | Known Issue تاریخی جدا و بسته اعلام نشده |
| Android M-10/empty/error/past،RTL وscale1/1.5/2،touch measurement | Not run | adb/emulator/native project/device/build نیست؛ APK مجاز این task نیست |
| اعلان P03-015/P03-016 و ارتقای گوشی | Not run؛ باز و الزامی | M-10 تأیید تحویل اعلان نیست؛ P03-014/P03-019 هم باز |
| TalkBack | Deferred / Not run | فقط این QA تعویق‌داده‌شده |

fixture progress تهران **Resolved در دامنه همین task**: فرض قدیمی noon UTC=50٪ از civil day حذف شد. اکنون قرارداد ساعت‌های ۸–۱۶ و zone صریح آزموده می‌شود: تهران `08:30Z = 12:00 محلی`،elapsed4h/duration8h=0.5؛ همان instant در UTC نسبت1/16 دارد. DST نیز به مرز zoned واقعی تکیه دارد. تغییر صرف ۵۰ به۶۵ یا تغییر timezone محصول انجام نشد. assertions کارت‌های واقعاً حذف‌شده با M-10 جایگزین شدند؛ assertions read-only،route،pending/future و handler باقی‌اند. آزمونی skip یا برای سبزشدن حذف نشد.

initial-* خطاهای مرحله ساخت را حفظ کرده‌اند: table history فرضی در fixture، seed بدون pending، انتخاب Image یکتا با وجود icon و انتظار async برخلاف صف واقعی SQLite؛ TypeScript branch narrowing نیز اصلاح شد. آن شکست‌های اولیه نتیجه commit نهایی نیستند. شکست مستقل core تهران بی‌دلیل رفع/مخفی نشده است.

## پوشش، موارد باز و کوچک‌ترین قدم بعدی

Registry **RC3-ID-01-Rev04** با۱۲۲ تخصیص ثابت؛۱۱۲active/۱۰reserved.۱۳۹ binding +۱۰ reserve=۱۴۹ ردیف در [گزارش پوشش](rc3-ui-today01/RC3_UI_Coverage_Rev01_FA.md) و CSV؛active Pending=۰،تمام۱۱۲ code در شاهد رفتاری UTC وTehran دیده شدند. [راهنمای فارسی](RC3_UI_Code_Guide_FA.md) و CSV از همان registry تولید شدند. D03 و X32…X37/X41/X48/X95 رزرو، ICATUS پنهان، X102 و D08/X99…X101 بدون تغییر معنا هستند. کنترل تکراری با کد و تاریخ/فعالیت گزارش شود.

اختلاف بصری باقی: کوهستان تولیدی مشابه جهت مرجع و نه همان عکس است؛ شمع برداری سبک است؛ برای خوانایی متن بزرگ، نسبت 50/50 و درصد مرکزی به ستون/درصد بیرون تبدیل می‌شوند. به‌جای timeline نمونهٔ صرفاً logged، حالت‌های واقعی pending/skipped/future محفوظ‌اند. همه در دامنه مجاز اجرا ثبت شده‌اند؛ پذیرش نهایی visual/native،RTL،crop،keyboard/scroll و اندازه target هنوز باز است.

کوچک‌ترین قدم بعدی، بررسی دفتر روی این branch و سپس دستور مستقل ساخت APK و QA یکپارچه Android با build/device/fixture معلوم و scaleهای۱/۱.۵/۲ است. در این task APK، countdown Undo، motion پیچیده، state خوب/بد، feedback احساسی، انتشار یا مرحله بعد اجرا نشده است.

# تحویل RC3-ICATUS-HIDE-01 — Rev01

تاریخ: 2026-10-12، Asia/Tehran. پرامپت۷ / Rev01؛ پنهان‌سازی رابط موجود، با حفظ داده و سیاست سرویس. اجرای طرح‌های بعدی و پذیرش گوشی در این تحویل انجام نشده‌اند.

## نتیجه، مبنا و اختیار

نمایش و انتخاب طبقه‌بندی از تمام callerهای قابل‌دسترسی حذف شد: فرم فعالیت، ثبت تازه/مشاهده/ویرایش بازه، گزارش و معرفی شروع کار. picker، جست‌وجو، سلسله‌مراتب، تعریف/لینک رسمی، تغییر دسته و انتخاب پیش‌فرض دیگر مسیر رابط ندارند. نام/آیکون فعالیت، گزارش زمان، ثبت و ویرایش، Undo و شناسه‌های فعال باقی‌اند. هیچ جایگزین یا تنظیم تازه اضافه نشد. **pending hide در سطح سورس و آزمون رفتار UI بسته است**؛ مشاهدهٔ واقعی روی Android هنوز Not run است.

مبنای تحویل دفتر: `50a54992a2b28690b73755a7848319b533c12e69`؛ سورس آزمون‌شدهٔ آن `77ded971005be832233955dbd5df8b52bff99fe4`. شروع در همان checkout کامل شامل FIX01/FIX02 و ID01 بود: HEAD=50a5499، branch=`rc3-id01-ui-identifiers`، working tree پاک، ancestry0/0. SHA شاخهٔ origin دوباره 50a5499 خوانده شد؛ شاخهٔ اختصاصی remote وجود نداشت. شاخهٔ جدید **`rc3-icatus-hide01-ui`** از همان HEAD ساخته شد؛ reset، بازگشت به checkout قدیمی یا حذف تغییر تازه انجام نشد.

درخواست مستقیم پرامپت۷ مجوز اجرای این مرحله و commit/push است. ضمیمهٔ Rev04 یک checkpoint ورودی است و عیناً در `rc3-icatus-hide01/inputs/IMPLEMENTATION_STATE_RC3_Rev04.md` نگهداری شد. گزارش ID01 Rev02، registry، راهنما، مرجع Rev01 و الحاقیهٔ X102 خوانده شدند؛ دستورهای تاریخی مرحله‌های قبلی در آن اسناد به‌عنوان درخواست اجرایی تازه اجرا نشدند. AGENTS.md در checkout/workspace یافت نشد.

## محل‌های قبل و بعد

شماره‌خط‌های قبل به SHA50a5499 و بعد به SHA سورس آزمون‌شدهٔ این مرحله مربوط‌اند؛ جدول inventory قدیمی مبنای استفادهٔ جدید نبود.

| محل واقعی | قبل | بعد / حفاظت |
| --- | --- | --- |
| ActivityEditor.tsx:17,272…276 در D02 | picker پیش‌فرض و دو متن مرتبط، انتخاب دستی code | import و بلوک UI حذف؛ snapshot.category/code/revision در خطوط61…75 فقط خوانده و در saveActivity:92…99 ارسال می‌شوند؛ تغییر نام/آیکون پیش‌فرض قبلی را null نمی‌کند |
| ClassificationPicker.tsx:1…108 / D03 | پنجره، نام/کد، search، انتخاب/null، والد/فرزند و لینک تعریف رسمی؛ دو caller D02/A06 | فایل صرفاً UI حذف شد و callerی باقی نماند؛ dataset/service/repository دست‌نخورده‌اند؛ تخصیص‌های رزرو در registry/history باقی‌اند |
| CheckInScreen.tsx:142…146,243…245 در A06 view | lookup عنوان دسته و نمایش آن | import nodes و lookup نمایشی حذف؛ نام/آیکون فعالیت و زمان/context موجود حفظ |
| CheckInScreen.tsx:300…316 در A06 fresh/edit | picker، draft explicit/inherit، استفاده از پیش‌فرض و ذخیرهٔ تغییر دسته | همهٔ کنترل‌ها و state انتخاب دستی حذف؛ commit:91 هنوز expectedClassificationRevision دارد؛ classificationSelection ارسال نمی‌شود و معنای قبلی undefined حفظ می‌شود |
| CheckInScreen.tsx:126 / D05 | وعدهٔ تغییر «فعالیت یا دسته» | در خط121 فقط «فعالیت این بازه تغییر کند؟»؛ همان callbackهای X38/X42، guard و commit/navigation |
| InsightsScreen.tsx:317…331 / A03 | buckets با نام دسته، بدون دسته و پوشش طبقه‌بندی | بلوک نمایش حذف؛ r.activities:295، روزبه‌روز:317، مدت/پوشش زمان و query موجود باقی؛ getReport/aggregate و محاسبات داخلی تغییر نکردند |
| OnboardingScreen.tsx:49 / A11 | معرفی انتخاب اختیاری ICATUS | جملهٔ ذخیرهٔ محلی در خط49 بدون وعدهٔ طبقه‌بندی؛ X71/X73/X74 و رفتار اعلان محفوظ |
| Ui.tsx:errorMessage در همهٔ callerهای موجود | raw message ممکن بود جزئیات طبقه‌بندی را نمایش دهد | نگاشت صرفاً نمایشی در خط450: تعارض پیش‌فرض→اطلاعات فعالیت، تعارض دسته→اطلاعات ثبت، جزئیات داخلی→پیام فارسی قابل‌فهم؛ ErrorText همچنان خطا نشان می‌دهد و validation/rollback/service حذف نشده |

جست‌وجوی UI در تمام screens/components/App انجام شد؛ سایر مسیرها شامل Today/SlotRow، backlog، نتیجه و resolution اعلان نام فعالیت/زمان دارند و محل نمایش طبقه‌بندی نبودند. وجود دادهٔ ICATUS در bundle یا محاسبات سرویس با مسیر مشاهده/انتخاب کاربر یکسان نیست. جدول بالا همراه تست UI و حذف callerها شاهد است؛ صرف registry مبنای بسته‌شدن pending hide نبود.

## قرارداد داده و رفتار مبنا

- ActivityEditor همان readSnapshot، snapshot آیکون، category.code و category.revision را نگه می‌دارد. loaded/name/guard/busy و rollback قبلی محفوظ‌اند. fixture دستهٔ قبلی در ویرایش نام و آیکون، در scale1/1.5/2، همان ردیف code/revision/updated_at را حفظ کرد؛ snapshot stale مانع ذخیره شد و موفقیت کاذب نمایش داده نشد.
- ثبت تازه بدون انتخاب دستی از همان پیش‌فرض موجود فعالیت ارث می‌برد. ثبت همان فعالیت دستهٔ تاریخی را به پیش‌فرض تازه تبدیل نمی‌کند. تغییر فعالیت به همان سیاست مبنا، پیش‌فرض فعالیت جدید را می‌گیرد؛ «همیشه قبلی» یا «همیشه null» تحمیل نشد. Undo فعالیت/assignment تاریخی و revision لازم را برمی‌گرداند؛ duplicate، overlap، بازهٔ نامعتبر، stale assignment و Undo منقضی رد می‌شوند.
- صرف ورود/refocus به فرم فعالیت و A06 و بازگشت active write ندارد. **رفتار قدیمی A03:** mount دو ترجیح report_calendar/report_week_start را persist می‌کند؛ این دو write روی مبنا و سورس جدید یکسان مشاهده شدند. refresh/focus/resume گزارش write اضافه ندارد و default/assignment/history تغییر نمی‌کند. این task write تازه‌ای معرفی نکرد؛ persistence موجود گزارش نیز بازطراحی نشد.
- برای مقایسهٔ رفتاری، یک archive مستقل از SHA50a5499 با همان dependencyهای نصب‌شده و فقط fixture جدید `v03ClassificationPolicy.test.ts` اجرا شد. این archive جای checkout اجرای task را نگرفت. فایل fixture روی مبنا و سورس جدید byte-identical است؛ hash و فرمان در validation record. خروجی baseline14/14 و همان قرارداد در suite نهایی Pass؛ مقایسه صرفاً متن سورس نبود.
- ۹۱ فایل حفاظت‌شده با مبنا byte-identical هستند؛ services/db/data/types/notifications، App و scheduler/FIX01/FIX02، package/config/workflow و شواهد تاریخی حفظ شدند. schema، migration، dataset، repository، default policy، assignment/history، signing/applicationId و dependency تغییر نکردند. هیچ پاک‌سازی یا write جمعی روی دادهٔ واقعی انجام نشد؛ writeهای fixture فقط در SQLite آزمون‌اند.

## شناسه‌ها، registry و پوشش

نسخهٔ جاری registry **RC3-ID-01-Rev03**: ۱۲۲ تخصیص،۱۰۸ فعال،۱۴ رزرو. هیچ code/key/name/نوع/وضعیت تخصیص قبلی تغییر نکرد. فقط محل‌های جاری، توضیح حذف رابط D03 و توضیح فعلی تأیید فعالیت D05 به‌روز شدند؛ معنا به قابلیت دیگری تخصیص داده نشد. snapshotهای تخصیص Rev01/Rev02 و مرجع/الحاقیه عیناً محفوظ‌اند.

D03/X32…X37/X41/X48/X95 با `sites=[]` و وضعیت reserved باقی‌اند؛ نبود source binding در این مرحله با تست نبود UI/route همراه است. D08/X99…X101 همچنان رزرو طراحی و اجرا‌نشده‌اند. X18 در D01، X38 در D05/D06/D07 و X102 در مسیر واقعی A06→Main/Activities فعال و ثابت هستند. X75 و سایر FIX01/FIX02 دست‌نخورده‌اند.

Guide فارسی و CSV از registry تولید شدند و با source/registry در تست مطابق‌اند. پوشش نهایی `rc3-icatus-hide01/RC3_UI_Coverage_Rev01_FA.md` و CSV:۱۲۹ اتصال صریح +۱۴ رزرو =۱۴۳ ردیف، active Pending=0؛ renderer هر۱۰۸ کد فعال را در جریان‌های واقعی دیده است. نسخه‌های ID01 Rev02 پوشش/شواهد تاریخی بازنویسی نشدند. برای کارت تکراری نام فعالیت یا تاریخ/بازه نیز در گزارش باگ لازم است.

## اجرای نهایی و اتصال به Git

**SHA دقیق سورس آزمون‌شده:** `3ecbd2910f65733b69ac62d6cd32d941062c94e9`، commit سورس/تست/generator/guide. همهٔ اجراهای نهایی زیر پس از commit روی این SHA بودند. کد تست، راهنما و مرجعی که تست‌ها می‌خوانند عیناً از این commit هستند؛ فقط گزارش و شواهد پس از آزمون افزوده‌اند.

commit تحویل، commit بعدیِ حاوی همین گزارش/checkpoint/شواهد است. SHA کامل تحویل پس از commit و خواندن remote در پاسخ نهایی اعلام می‌شود؛ برای این سند از Git commit حاوی آن خوانده شود. این SHA با سورس آزمون‌شده یکی فرض نشده است. `tested-source-manifest.json` برای۹۵ فایل سورس/تست/generator/guide و `protected-files.json` برای۹۱ فایل حفاظت‌شده، hash و نسبت دقیق را ثبت می‌کنند؛ اختلاف تحویل با SHA آزمون فقط docs/evidence خواهد بود.

| آزمون / بررسی | وضعیت | فرمان، نتیجه و حد شاهد |
| --- | --- | --- |
| typecheck نهایی | Pass | `npm run typecheck`؛ exit0؛ final-Rev01/typecheck.log |
| suite کامل UTC نهایی | Pass | `TZ=UTC npm test`؛118/118،fail0/skip0؛ final-Rev01/npm-test-UTC.log؛ TIME80_UI_EVIDENCE_DIR فقط فایل شاهد renderer را می‌نویسد و نمایش UI به آن وابسته نیست |
| مرتبط Tehran نهایی | Pass | فرمان کامل پایین؛97/97،fail0/skip0؛ final-Rev01/related-Asia-Tehran.log؛ شامل داده/سیاست جدید، UI hide، شناسه، App/diagnostics/X75/coordinator و UI موجود؛ کل suite تهران نیست |
| مقایسهٔ رفتاری در archive مبنا | Pass | `TZ=UTC node --import ./tests/register.mjs --import tsx --test tests/v03ClassificationPolicy.test.ts tests/core.test.ts tests/v03Data.test.ts`؛14/14؛ final-Rev01/baseline-policy-UTC.log |
| fixture interval قدیمی تهران، مبنا و نهایی | Fail / Known Issue تأییدشده در مبنا | `TZ=Asia/Tehran node --import ./tests/register.mjs --import tsx --test tests/core.test.ts`؛ هر دو2/3؛ slot10:00…10:30 در پیش‌شرط fixture تهران غایب است؛ baseline-core/current-core-Asia-Tehran.log؛ محصول یا انتظار تست تغییر نکرد |
| نبود طبقه‌بندی در ایجاد/مشاهده/ویرایش/خالی/loading/error و report/onboarding | Pass در UI renderer | v03IcatusHideUI.test.tsx،۷ تست؛ محتوای render، نام‌های dataset، ورودی/کنترل/شناسه و Alert واقعی از module بررسی شد؛ گوشی نیست |
| دستهٔ تاریخی، rename/icon، revision و خطای داخلی | Pass | UI واقعی +SQLite؛ stale save/change rollback و navigation موفق کاذب غایب؛ پیام خطا همچنان فارسی و قابل‌دیدن |
| تازه/همان فعالیت/تغییر/Undo، duplicate و بدون write تازه | Pass | دو تست v03ClassificationPolicy.test.ts در مبنا و نهایی؛ v03Data/core و جریان‌های UI/SaveResult نیز محفوظ |
| registry/history/guide/CSV، همهٔ activeها و FIX01/FIX02 | Pass | tests موجود بدون حذف/skip یا تغییر انتظار، شواهد UTC/Tehran و پوشش فعال؛ تحویل اعلان گوشی اثبات نشده |
| RTL و scale1/1.5/2 در renderer | Pass در پیکربندی تست | ویرایش فرم در سه scale، نام طولانی و تست‌های قبلی target/wrap/LTR/contrast؛ layout و font واقعی native اندازه‌گیری نشده‌اند |
| Android واقعی، screenshots مسیرهای تغییرکرده و target در RTL/scale1/1.5/2 | Not run | adb، emulator و native Android project در این محیط وجود ندارند؛ screenshot-plan-Rev01.json فقط برنامهٔ QA است و هیچ تصویر گوشی ساخته نشده |
| P03-015/P03-016 پذیرش گوشی و تحویل اعلان | Not run / باز و الزامی | این task UI hide است؛ شاهد اصلاح سورس جای آزمون گوشی نیست |
| TalkBack | Deferred / Not run | تنها مورد صریحاً تعویق‌داده‌شدهٔ QA |
| TZ unset/undefined و fixture progress Tehran | Not run در این مرحله / Known Issue باز | شکست‌های تاریخی FIX01/FIX02 محفوظ‌اند و بی‌دلیل بسته یا skip نشده‌اند |

فرمان دقیق انتخاب تهران:

```sh
TZ=Asia/Tehran node --import ./tests/register.mjs --import tsx --test \
  tests/v03ClassificationPolicy.test.ts tests/v03IcatusHideUI.test.tsx \
  tests/v03Data.test.ts tests/v03IdentifierFlows.test.tsx \
  tests/v03UIIdentifiers.test.tsx tests/v03LifecycleUI.test.tsx \
  tests/v03ResponseUI.test.tsx tests/v03Notifications.test.ts tests/v03UI.test.tsx
```

فایل `test-results-Rev01.csv` نتیجهٔ تک‌تک آزمون‌های اجراهای نهایی/مبنا را با SHA/فرمان/محدودیت ثبت می‌کند. آزمون‌های معتبر ICATUS/data حذف یا تغییر انتظار نشدند. اجرای اولیهٔ تست‌های تازه5/8 بود: Alert.body به‌جای message، SQL gate واقعی A06 و first_used_at fixture اصلاح شدند؛ سپس8/8 و پس از افزودن قرارداد خواندن،۹ تست جدید در نهایی Pass. اجرای گستردهٔ اولیهٔ تهران99/100 به همان fixture interval قدیمی محدود شد. همهٔ logهای این یافته‌ها محفوظ‌اند؛ سبزشدن با تغییر محصول یا skip انجام نشد.

## موارد باز و قدم بعدی

QA گوشی برای پنهان‌سازی، RTL/فونت/target/Alert و AC-ID نهایی Not run است. پذیرش دستگاهی P03-015/P03-016 باز و الزامی، P03-014/P03-019 باز؛ cache/reconcile اثبات دریافت اعلان نیست. Known Issueهای timezone بالا باز هستند. چهار طرح M-01/M-02/M-04/M-10 و دارایی‌ها اجرا نشده‌اند؛ شمارش معکوس Undo تصویب نشده، Undo غیرقابل‌دسترسی A06 فعال نشد.

کوچک‌ترین قدم بعدی پس از بررسی دفتر: اجرای QA Android روی commit/build معلوم، با fixture دارای دستهٔ تاریخی، مسیرهای حذف‌شده و شناسه‌های باقی‌مانده در هر سه scale؛ سپس دستور جدا برای مرحلهٔ بعد. این task پس از commit/push و تأیید SHA remote متوقف می‌شود. merge/force-push/workflow/APK/Release یا مرحلهٔ بعد انجام نمی‌شود.

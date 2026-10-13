# RC3-TEST-CLOCK-FIX-01 — Rev01

2026-10-13،Asia/Tehran؛ بخش اول پرامپت۹. مبنا `e1278bb3e812ef3ae636546bfdf2b1e28050014c`،HEAD آغاز/remote همان مبنا،شاخه قبلی rc3-ui-report01-fix01-icons،clean وancestry0/0. شاخه اختصاصی rc3-ui-settings01 از همان checkout ساخته شد؛reset یاحذف تغییر جدیدتر انجام نشد.

## علت و اصلاح

گزارش FIX01 و لاگ‌های baseline/current در `rc3-ui-report01-fix01/` خوانده شدند. TodayScreen امروز را با `new Date()` می‌خواند و X07 اولین pending پایان‌یافتهٔ همان timeline را با `items.find` پیدا می‌کند. fallback آزمون،بازهٔ ثابت۱۲اکتبر درج می‌کرد ولی ساعت صفحه روز۱۳اکتبر بود؛X07 غایب می‌شد وhook پوشش هم باX07 مشاهده‌نشده شکست می‌خورد. محصول عامل این شکست نبود.

فقط `tests/v03IdentifierFlows.test.tsx` تغییر کرد. wrapper موجود uiTest پیش ازsetup واقعی DB،با **context.mock.timers و API Date فقط** ساعت2026-10-12T12Z را برقرار می‌کند. Date.now وnew Date بدون آرگومان هماهنگ‌اند؛timeout/intervalهای واقعی freeze نمی‌شوند. fallback pending از نیمه‌شب محلی همین ساعت fixture وپایان۳۰دقیقه بعد ساخته می‌شود. afterEach پس ازunmount/listener cleanup ساعت راreset می‌کند و برابری constructor باDate میزبان اولیه راassert می‌کند؛context نیزمالک cleanup است.

assertionهای قدیمی route،manual،امروز/روزقبل،future disabled درscale1/1.5/2 وhook پوشش همه۱۱۲شناسه حذف یاskip نشدند. assertion دقیق بازه/slot/state وdue بودن همانpending بهroute اضافه شد. sourceTodayScreen/items.find/navigation/scheduler/query/model/data هیچ تغییر نکرد. دستور معمول `npm test` یا اجرای مستقیم همین فایل،setup راخودکار دارد؛import دستی ازپوشه شواهد لازم نیست.

## commit و نتایج

commit مستقل اصلاح تست و **سورس آزمون‌شده بخش اول**: `1759ff8a1de181074ae41f6f33e0aa04dd66af93`. شواهد واین گزارش درcommit مستقل بعدی پیش ازاجرایM-02 ثبت می‌شوند؛باcommit پیاده‌سازیM-02 مخلوط نیستند. checkpoint/تحویل نهاییSHA مستقلM-02 وdelivery را جدا اعلام می‌کنند.

| اجرا | وضعیت | شاهد / حد |
| --- | --- | --- |
| typecheck | Pass | `npm run typecheck`؛typecheck.log؛رویهمین کد fixture پیش ازcommit؛hash fixture درmanifest ثابت |
| گروه مرتبطUTC | Pass117/117 | related-UTC.log؛شامل۱۷شناسه،گزارش۱۳،داده،ICATUS hide،UI/sharedcaller وFIX01/FIX02؛نهsuite کامل |
| گروه مرتبطTehran | Pass110/110 | related-Asia-Tehran.log؛همانگروه بدونvisual fixtureProgress نامرتبط |
|۱۷شناسه باouter host2024-05-20T03Z | Pass17/17،هر دوTZ | host-2024 logs؛setup درفایل تستouterclock راتحت مالکیتcontext هماهنگ وپس ازهرcase بازمی‌گرداند |
|۱۷شناسه باouter host2031-12-31T18Z | Pass17/17،هر دوTZ | host-2031 logs؛وابستگی بهروز۱۲اکتبر میزبان باقی نماند |
| Android/QA گوشی | Not run | این شاهد renderer/service/native ports mock است،نهگوشی |

فرمان دقیق هر اجرا،SHA و۲۹۵نتیجهٔ تک‌آزمون در `rc3-test-clock-fix01/validation-record.json` وCSV است. مثال فرمان عادی:

```sh
TZ=Asia/Tehran node --import ./tests/register.mjs --import tsx --test --test-reporter=tap tests/v03IdentifierFlows.test.tsx
```

برای **اثبات تغییر تاریخ میزبان فقط**،helper شبیه‌سازیclock درwork قبل ازtest runner import شد؛نسخه عین آن کنارlogs محفوظ است. مثال بازتولید:

```sh
TIME80_SIMULATED_HOST_DATE=2031-12-31T18:00:00Z TZ=Asia/Tehran node \
  --import ./docs/v0.3/rc3-test-clock-fix01/simulated-host-date.mjs \
  --import ./tests/register.mjs --import tsx --test --test-reporter=tap \
  tests/v03IdentifierFlows.test.tsx
```

اینhelper ضرورت اجرای عادی نیست ودرمحصول استفاده نمی‌شود؛TZ یا ساعت OS تغییر نکرد. خطای typing اولیهٔ context درafterEach نیز درinitial-typecheck.log محفوظ ودرنسخه نهایی رفع شد. انتظار/hook آزمون برایسبزشدن تغییرنکرد.

شکست تاریخfixtureX07 درآزمون **Resolved** است. Known Issueهای قبلیTZunset،progressTehran65≠50 وcoreintervalTehran جدا وبازمی‌مانند. QA اعلان/ارتقا گوشی همچنان بازوالزامی؛فقطTalkBack Deferred/Not run. بارفعX07/hook و نبودرگرسیون تازه،gate بخش دوم پاس شد وM-02 طبقپرامپت۹ بدونتأیید مجدد ادامه می‌یابد.

# راهنمای اجرای دستی RC3 از GitHub — پیگیری ۱۱-ج / Rev01

تاریخ: 2026-10-13، Asia/Tehran. این راهنما از فایل واقعی workflow تهیه شده است؛ ساخت APK، اجرای Run workflow و آزمون گوشی در این مرحله **Not run** هستند. رفع شبکهٔ محیط فعلی طبق دستور متوقف شد؛ محیط/گفت‌وگو حذف یا بازسازی نشد.

## صفحه، شاخه و SHA

- [صفحهٔ مستقیم workflow در Actions](https://github.com/foraiir1984-netizen/Time-80/actions/workflows/build-android-apk.yml)
- فایل: `.github/workflows/build-android-apk.yml`
- نام در YAML شاخهٔ ساخت: **Time80 validation and Android build**.
- صفحهٔ فعلی Actions به‌دلیل نسخهٔ شاخهٔ پیش‌فرض می‌تواند عنوان **Build Android APK** داشته باشد؛ لینک بالا بر اساس فایل صحیح است.
- شاخهٔ ساخت: **`rc3-build-qa01`**؛ شاخهٔ مستندات `rc3-build-qa01-handoff` برای ساخت انتخاب نشود.
- SHA کامل آمادهٔ ساخت و دوباره تأییدشده در remote:

```text
e6fa5c1968797d5bc6bdd3e442ca1b804c4c9d85
```

[commit موردنظر](https://github.com/foraiir1984-netizen/Time-80/commit/e6fa5c1968797d5bc6bdd3e442ca1b804c4c9d85) / [workflow در همین SHA](https://github.com/foraiir1984-netizen/Time-80/blob/e6fa5c1968797d5bc6bdd3e442ca1b804c4c9d85/.github/workflows/build-android-apk.yml).

مقادیر سورس: applicationId=`com.personal.time80`،versionName=`0.3.0`،versionCode=`5`. این‌ها هنوز metadata استخراج‌شده از APK نیستند.

## ورودی‌های دقیق Run workflow

| کنترل | نام / برچسب واقعی | مقدار لازم |
| --- | --- | --- |
| انتخاب ref داخلی GitHub | Branch / Use workflow from | `rc3-build-qa01` |
| تنها input تعریف‌شده در YAML | کلید `release`؛ توضیح `Build with the configured stable release key`؛ نوع `boolean` | **true / checkbox فعال**؛ default برابرfalse است |

هیچ input دیگری برای version،SHA،build type،APK،keystore،password،alias یاcertificate در این workflow تعریف نشده است. secrets امضای موجود توسط job خوانده می‌شوند؛ مقدار secret در فرم یا گزارش وارد نشود. SHA input نیست؛ نتیجهٔ انتخاب branch باید با SHA بالا تطبیق داده شود.

## اجرای دستی و شرط توقف

1. با حساب دارای دسترسی Write مخزن، صفحهٔ مستقیم بالا را باز کنید و **Run workflow** را باز کنید.
2. در انتخاب Branch / Use workflow from، **rc3-build-qa01** را انتخاب کنید؛ نه main،feat/time80-v0.3-implementation یا شاخهٔ handoff.
3. فقط اگر input با کلید `release` یا توضیح دقیق جدول در فرم حاضر است، checkbox آن را فعال کنید تا مقدار **true** ارسال شود. سپس دکمهٔ Run workflow داخل فرم را بزنید.
4. اجرای تازه را باز کنید؛ event باید **workflow_dispatch** و branch باید **rc3-build-qa01** باشد. روش تأیید SHA در بخش بعد را انجام دهید. لینک run و Run ID را ثبت کنید.
5. برای ساخت release، job **validate** باید Pass شود و سپس job **release** باید اجرا شود. سبزبودن کلی run همراه release=`skipped` ساخت APK امضاشده نیست. Restore signing key یا بررسی fingerprint اگر شکست خورد، خطای همان job را بدون secret ثبت کنید؛ کلید تازه/debug یا حذف برنامه جایگزین نشود.

**اگر پس از انتخاب شاخه، ورودی release در فرم وجود ندارد، اجرای ساخت امضاشده از همان فرم قابل انجام نیست؛ روی Run workflow کلیک نکنید.** گزینه‌ای با نام حدسی یا checkbox دیگری جای release نگذارید. اگر Run workflow اصلاً دیده نمی‌شود، ابتدا ورود و Write access لازم است؛ رابط بدون ورود حساب در این محیط فرم dispatch را نمایش نمی‌دهد.

### اختلاف واقعی شاخهٔ پیش‌فرض و محدودیت شاهد رابط

default branch مخزن با GitHub connector و remote HEAD، **main** تأیید شد؛ HEAD آن `5c45240ab1dc967cfbbabcdede73b27bb0f468e8` است. [workflow همان main](https://github.com/foraiir1984-netizen/Time-80/blob/5c45240ab1dc967cfbbabcdede73b27bb0f468e8/.github/workflows/build-android-apk.yml) فقط `workflow_dispatch:` بدون inputs دارد. در شاخهٔ RC3،release input اضافه شده و job امضاشده این شرط را دارد:

```yaml
if: github.event_name == 'workflow_dispatch' && inputs.release
```

این اختلاف در فایل‌های واقعی تأیید شده است. فرم احراز هویت‌شدهٔ حساب کاربر در محیط فعلی قابل مشاهده نبود؛ بنابراین نمایش release پس از انتخاب شاخه **تأیید نشده** و اجرای UI موفق/ناممکن به‌طور قطعی ادعا نمی‌شود. اگر رابط فقط فرم بدون input نسخهٔ main را ارائه کند، درخواست بدون release=true باعث skipped شدن job امضاشدهٔ RC3 خواهد شد. این همان مانع عملی فرم است؛ شرط توقف بالا برای آن است. نسخهٔ main هم workflow ساخت RC3 محسوب نمی‌شود.

هیچ تغییر workflow،merge بهmain،تغییرdefault branch یا رفع شبکه در این پیگیری انجام نشد. در صورت نبود input، راه موجود CLI از **محیط دیگری با دسترسی API** این است؛ اینجا اجرا نشده است:

```sh
gh workflow run build-android-apk.yml \
  --repo foraiir1984-netizen/Time-80 \
  --ref rc3-build-qa01 -f release=true
```

این فرمان دقیقاً از ورودی واقعی YAML استفاده می‌کند، اما نتیجهٔ اجرا/دسترسی آن روی دستگاه کاربر هنوز Not run است؛ راه قطعی UI ادعا نمی‌شود.

## تطبیق SHA اجرای Actions بدون نیاز به حدس

- در Summary اجرای تازه، شاخه باید rc3-build-qa01 باشد. روی لینک commit نمایش‌داده‌شده کلیک کنید و **SHA کامل ۴۰کاراکتری** صفحه یا انتهای URL commit را با `e6fa5c1968797d5bc6bdd3e442ca1b804c4c9d85` مقایسه کنید؛ فقط عنوان یا ۷کاراکتر کافی نیست.
- در log مرحلهٔ **actions/checkout@v4** در هر دو job validate وrelease، خروجی نهایی `git log -1 --format=%H` باید همین SHA کامل باشد. checkout در workflow ref دیگری را hard-code نکرده است و commit رویداد را می‌گیرد.
- اگر SHA یا branch متفاوت است، آن run ساخت موردنظر نیست؛ artifact آن را RC3 این تحویل معرفی نکنید. مطابق درخواست دفتر، لینک run وSHA مشاهده‌شده را برای بررسی ثبت کنید.
- روش اختیاری برای دفتر دارای CLI: `gh run view RUN_ID --repo foraiir1984-netizen/Time-80 --json headSha,headBranch,event,url,status,conclusion`؛ RUN_ID از اجرای واقعی گرفته شود و مقدار حدسی ندارد.

## artifact و وضعیت فعلی

پس از success واقعی job release، بخش Artifacts همین run باید artifact با نام دقیق **`Time80-v0.2-APK`** داشته باشد. این نام تاریخی در YAML است؛ شامل `dist/Time80-v0.2.apk*` است. آن را دانلود کنید و لینک run/نام artifact را همراه فایل‌ها نگه دارید. نام تاریخی اثبات version نیست؛ metadata وcertificate واقعی باید بعداً تأیید و نسخهٔ دستگاه با نام `Time80-v0.3.0-RC3.apk` وchecksum متناظر تحویل شود. در این مرحله هیچ artifact/Run ID/link اجرای تازه یا APK/checksum موجود ادعا نمی‌شود.

| مورد | نتیجه |
| --- | --- |
| فایل workflow،ref،SHA و تنها input از سورس واقعی | Pass |
| وضعیت remote شاخهٔ ساخت / عدم تغییر source | Pass |
| مشاهده/اجرای فرم Run workflow پس از ورود | Not run |
| build release،امضا،metadata/checksum واقعی APK | Not run |
| native/emulator/گوشی و ارتقا | Not run |

مانع شبکهٔ محیط: آخرین آزمایش پیگیری۱۱-ب `Get "https://api.github.com/repos/foraiir1984-netizen/Time-80/actions/workflows": Forbidden` بود؛allowlist مشاهده‌شده api.github.com را نداشت. طبق۱۱-ج،این مانع صرفاً درcheckpoint محفوظ است و پیگیریرفعآن متوقف شد. نتیجهٔ خودکار قبلی متعلق به همان اجرای قبلی/SHAاست و آزمون تازه دراین مرحله معرفی نمی‌شود.

منبع روش عمومی رابط: [GitHub Docs — Manually running a workflow](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow). تعریف گزینه‌ها،guards وartifact این راهنما از YAML همین مخزن است.

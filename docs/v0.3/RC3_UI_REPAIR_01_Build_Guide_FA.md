# راهنمای ساخت RC3-UI-REPAIR-01 — Rev01

این راهنما برای اجرای ساخت آماده‌شده است؛ وجود APK تازه یا پذیرش گوشی را اعلام نمی‌کند. اجرای مستقیم این محیط با `Forbidden` متوقف شد.

- [صفحهٔ workflow](https://github.com/foraiir1984-netizen/Time-80/actions/workflows/build-android-apk.yml)
- نام workflow در سورس منتخب: `Time80 validation and Android build`
- شاخهٔ ثابت ساخت: `rc3-ui-repair01`
- SHA کامل: `4dbc92978dad73036dc4ab021f62b2a21d186572`
- تنها ورودی موجود: `release`، نوع boolean، مقدار **true**. ورودی دیگری وجود ندارد.
- تنظیم آمادهٔ سورس: `com.personal.time80`، versionName=`0.3.0`، versionCode=`6`؛ مشخصات APK فقط پس از ساخت از خروجی واقعی خوانده می‌شوند.

در Run workflow شاخهٔ بالا را انتخاب و release را فعال کنید. اگر این ورودی در فرم دیده نمی‌شود، آن فرم را با مقدار پیش‌فرض اجرا نکنید: workflow شاخهٔ پیش‌فرض main قدیمی و فاقد این ورودی است؛ رفتار فرم احراز هویت‌شده در این محیط آزموده نشده است. از دستگاهی با GitHub CLI متصل می‌توان دستور واقعی زیر را اجرا کرد:

```sh
gh workflow run build-android-apk.yml \
  --repo foraiir1984-netizen/Time-80 \
  --ref rc3-ui-repair01 -f release=true

gh run list --repo foraiir1984-netizen/Time-80 \
  --branch rc3-ui-repair01 --event workflow_dispatch --limit 3 \
  --json databaseId,headSha,status,conclusion,url
```

SHA اجرای تازه باید دقیقاً برابر مقدار کامل بالا باشد. شاخهٔ `rc3-ui-repair01-handoff` برای گزارش‌هاست؛ برای این ساخت شاخهٔ ثابت بالا انتخاب شود. موفقیت validate به‌تنهایی کافی نیست؛ job **release** نیز باید اجرا شود و success باشد.

artifact مورد انتظار در همین سورس: **`Time80-v0.3.0-RC3-UI-REPAIR-01-APK`**. داخل آن:

- `Time80-v0.3.0-RC3-UI-REPAIR-01.apk`
- فایل هم‌نام با پسوند `.sha256`
- فایل‌های هم‌نام با پسوندهای `.metadata.json` و `.badging.txt`

اسکریپت موجود امضای APK را با هویت ثابت موجود می‌سنجد. خط `TIME80_APK_VERIFICATION=` در log ساخت، SHA سورس، applicationId، نسخه‌های استخراج‌شده، target SDK، SHA-256 APK و fingerprint عمومی گواهی را گزارش می‌کند. این gate تازه در این مرحله فقط از نظر syntax بررسی شده و هنوز در ساخت native اجرا نشده است.

fingerprint مرجع RC2:

`a9b10ace1c5b633458542bb3af73e4254334660718afe79f579e51c03ebbcb7d`

پس از موفقیت ساخت، لینک run را برای دریافت و تطبیق artifact ارائه کنید. پیش از نصب، metadata و checksum باید با همان run/SHA و هویت RC2 تطبیق داده شوند. نصب روی RC2/RC3 موجود بدون uninstall یا پاک‌کردن داده انجام شود؛ پذیرش ارتقا و حفظ داده تا اجرای مقایسهٔ قبل/بعد **Not run** است. از artifact قدیمی run `38385334458` به‌عنوان خروجی اصلاح حاضر استفاده نشود.

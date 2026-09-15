# ساخت APK با GitHub Actions — Time80 v0.1

این روش به Replit یا Android Studio روی لپ‌تاپ نیاز ندارد. GitHub یک ماشین Ubuntu موقت می‌سازد، پروژه Android را از Expo تولید می‌کند و APK مستقل را به‌صورت Artifact تحویل می‌دهد.

## 1) ساخت Repository

در GitHub یک Repository جدید با نام پیشنهادی `time80` بساز. Public یا Private بودن برای خود پروژه تفاوتی در کد ایجاد نمی‌کند.

محتویات پوشه پروژه را در ریشه Repository قرار بده؛ یعنی `App.tsx`، `package.json`، `app.json` و پوشه‌های `src` و `.github` باید مستقیماً در ریشه Repository دیده شوند.

## 2) اجرای Build

پس از Push کردن فایل‌ها:

1. وارد Repository شو.
2. تب **Actions** را باز کن.
3. Workflow با نام **Build Android APK** را انتخاب کن.
4. روی **Run workflow** بزن.
5. Branch را `main` بگذار و دوباره **Run workflow** را بزن.

Build با هر Push مرتبط به branch `main` نیز به‌صورت خودکار اجرا می‌شود.

## 3) دریافت APK

پس از سبز شدن Workflow:

1. اجرای موفق را باز کن.
2. پایین صفحه به قسمت **Artifacts** برو.
3. `Time80-v0.1-APK` را دانلود کن.
4. فایل ZIP دانلودشده را Extract کن.
5. داخل آن فایل `Time80-v0.1.apk` قرار دارد.

## 4) نصب روی Samsung Galaxy S23 FE

1. APK را به گوشی منتقل کن.
2. روی فایل `Time80-v0.1.apk` بزن.
3. اگر Android اجازه نصب از آن منبع را نداد، برای همان برنامه‌ای که APK را باز کرده‌ای گزینه **Install unknown apps / Allow from this source** را فعال کن.
4. APK را نصب کن.
5. بار اول، اجازه Notification را به Time80 بده.

برای Reminderهای دقیق، ممکن است Android/Samsung از تو بخواهد دسترسی **Alarms & reminders** را نیز فعال کنی. اگر اعلان‌ها دیر می‌رسند، Battery optimization مربوط به Time80 را هم بررسی کن.

## درباره نوع APK

Workflow از `assembleRelease` استفاده می‌کند تا JavaScript داخل APK Bundle شود و برنامه بدون Metro/کامپیوتر اجرا شود. این Build برای نصب شخصی و تست مناسب است. برای انتشار رسمی در Google Play بعداً Signing production و AAB جداگانه تنظیم می‌کنیم.

## اگر Build قرمز شد

روی مرحله قرمز کلیک کن و متن خطا را برای ChatGPT بفرست. مهم‌ترین بخش معمولاً آخرین 30 تا 50 خط Log است. Workflow با `--stacktrace` تنظیم شده تا علت خطا واضح‌تر باشد.

# Time80 v0.1

یک اپ شخصی Android برای نمونه‌برداری از نحوه مصرف زمان: هر چند دقیقه یک یادآوری، ثبت یک‌لمسی فعالیت، Timeline روزانه و گزارش Pareto.

## تکنولوژی
- React Native
- Expo SDK 57
- TypeScript
- expo-sqlite
- expo-notifications
- react-native-safe-area-context

## قابلیت‌های پیاده‌سازی‌شده
- فاصله Notification قابل تنظیم (15 تا 240 دقیقه)
- ساعت شروع/پایان قابل تنظیم
- انتخاب روزهای فعال هفته
- صدا و لرزش قابل تنظیم
- افزودن/ویرایش/Archive فعالیت
- انتخاب Emoji به‌عنوان آیکون فعالیت
- Check-in یک‌لمسی
- باز کردن Check-in با لمس Notification
- Timeline روزانه و تکمیل Slotهای ثبت‌نشده
- گزارش امروز و 7 روز اخیر
- سهم زمانی و درصد تجمعی Pareto
- SQLite محلی؛ بدون Backend و بدون نیاز به اینترنت در استفاده روزمره

## اجرای توسعه
نیازمندی‌ها: Node.js 22.13+ و Android/Expo environment.

```bash
npm install
npx expo start
```

برای آزمایش سریع روی گوشی، می‌توان از Expo Go استفاده کرد. برای رفتار نهایی Notification بهتر است Development/Standalone build تست شود.

## ساخت APK محلی
Android SDK و JDK باید نصب و `ANDROID_HOME` تنظیم شده باشد.

```bash
npm install
npm run apk:debug
```

APK در حالت معمول در این مسیر ساخته می‌شود:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## ساخت APK با EAS
به Expo account نیاز دارد:

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile preview
```

پروفایل `preview` در `eas.json` برای خروجی APK تنظیم شده است.

## نکته Android / Samsung
- Android 13+ برای Notification مجوز کاربر می‌خواهد.
- Android 12+ ممکن است برای زمان‌بندی دقیق به مجوز Alarms & reminders نیاز داشته باشد.
- روی برخی گوشی‌های Samsung، Battery Optimization می‌تواند اعلان‌ها را به تأخیر بیندازد؛ در صورت مشاهده تأخیر، محدودیت باتری Time80 را بررسی کنید.

## ساختار پروژه

```text
App.tsx
src/
  components/
  db/database.ts
  notifications/scheduler.ts
  screens/
    TodayScreen.tsx
    CheckInScreen.tsx
    ActivitiesScreen.tsx
    InsightsScreen.tsx
    SettingsScreen.tsx
  types/models.ts
  utils/time.ts
assets/
SRS-v0.1.md
```

## حریم خصوصی
نسخه 0.1 هیچ داده‌ای را به سرور ارسال نمی‌کند. Activities، Time entries و Settings فقط در SQLite خود دستگاه ذخیره می‌شوند.

## ساخت APK با GitHub Actions (پیشنهادی)
پروژه شامل Workflow آماده در مسیر زیر است:

```text
.github/workflows/build-android-apk.yml
```

این Workflow روی GitHub Actions، پروژه native Android را با Expo Prebuild ایجاد می‌کند و سپس با `assembleRelease` یک APK مستقل می‌سازد. خروجی با نام زیر به‌عنوان Artifact آپلود می‌شود:

```text
Time80-v0.1-APK
  └── Time80-v0.1.apk
```

راهنمای فارسی مرحله‌به‌مرحله را در `BUILD-APK-GITHUB-FA.md` ببینید.

برای Build مشابه روی کامپیوتر محلی نیز می‌توان اجرا کرد:

```bash
./scripts/build-android-release.sh
```

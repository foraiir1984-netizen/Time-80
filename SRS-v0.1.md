# Time80 — SRS v0.1

## هدف
ثبت کم‌اصطکاک نحوه مصرف زمان در بازه‌های قابل تنظیم و ارائه گزارش روزانه/هفتگی برای تحلیل 80/20.

## محدوده نسخه 0.1
- اپ Android با React Native + Expo + TypeScript
- ذخیره‌سازی کاملاً محلی با SQLite
- بدون حساب کاربری، سرور، Cloud Sync یا AI
- یادآوری محلی در روزها و ساعات قابل تنظیم

## نیازمندی‌های اصلی
1. روشن/خاموش کردن Reminder.
2. فاصله قابل تنظیم 15 تا 240 دقیقه.
3. ساعت شروع و پایان روز قابل تنظیم.
4. انتخاب روزهای فعال هفته.
5. لمس Notification باید صفحه Check-in را باز کند.
6. ثبت Activity با یک لمس.
7. افزودن و ویرایش Activity.
8. انتخاب آیکون برای Activity.
9. حذف Activity از فهرست فعال بدون حذف تاریخچه (Archive).
10. Timeline روزانه با امکان تکمیل بازه‌های ثبت‌نشده.
11. گزارش امروز و 7 روز اخیر.
12. Pareto زمان بر اساس سهم و درصد تجمعی.

## صفحات
1. Today
2. Check-in
3. Activities
4. Insights
5. Settings

## مدل داده
- activities
- time_entries
- settings
- scheduled_notifications

## قواعد Notification
- Reminderها با trigger هفتگی محلی ساخته می‌شوند.
- هر تغییر در تنظیمات ابتدا Scheduleهای قبلی را لغو و سپس Schedule جدید را ایجاد می‌کند.
- برای جلوگیری از محدودیت‌های سیستم، تعداد Scheduleهای تکرارشونده به 450 محدود شده است.
- داده Notification شامل زمان Slot و interval است تا هنگام لمس، بازه درست بازسازی شود.

## خارج از Scope نسخه 0.1
- Cloud Sync
- Login
- ارزش/رضایت/انرژی هر فعالیت
- AI coaching
- GPS / passive tracking
- اتصال به Digital Wellbeing یا Calendar

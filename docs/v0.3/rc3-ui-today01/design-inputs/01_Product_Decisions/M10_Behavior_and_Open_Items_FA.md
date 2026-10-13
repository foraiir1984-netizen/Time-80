# M-10 — Behavior Contract & Open Items

## Behaviorهای تأییدشده

### 1. Dynamic Candle
`dayProgress = elapsedMinutes / configuredDayMinutes`

نمای بصری شمع باید با `dayProgress` تغییر کند.
هدف طراحی: کاربر بتواند بدون خواندن عدد، حس کند چه مقدار از روز مصرف شده است.

Implementation می‌تواند برای performance نمای بصری را در بازه‌های زمانی مناسب update کند، اما مقدار منطقی progress باید از زمان واقعی مشتق شود.

### 2. Day Progress Donut
همان مفهوم زمانی شمع را به‌صورت دقیق عددی/درصدی نمایش می‌دهد.
شمع = emotional/physical metaphor  
Donut = precise quantitative feedback

### 3. Timeline
- Reverse chronological visual order
- جدیدترین ثبت در بالا
- حرکت به سمت گذشته با پایین رفتن صفحه
- شروع روز در انتهای مسیر

### 4. Hero Clock
ساعت جاری مهم‌ترین عنصر تایپوگرافیک صفحه است و باید با Tabular Numerals نمایش داده شود.

## Open Items — نیازمند Product/UX Decision

### A. تعریف State مثبت/منفی
هنوز trigger رسمی برای تعیین «روز خوب/بد» یا «فعالیت مفید/غیرمفید» تعریف نشده است.
پیشنهاد: Product ابتدا signalهای معتبر را مشخص کند؛ مثل Goal alignment، user rating، planned vs actual، یا مدل دیگری.

### B. Sound Feedback
اصل استفاده از صدا به‌عنوان لایه احساسی مطرح شده، اما sound set، trigger و شدت هنوز تأیید نشده است.

### C. Haptic Feedback
اصل استفاده از Haptic مطرح شده، اما pattern و trigger نهایی نشده است.

### D. Motion
Animation شمع، progress و state transition باید در مرحله Motion Spec تعریف شود.

### E. Color Tokens
جهت سبز گرم تأیید شده است؛ مقادیر دقیق رنگ باید به semantic token تبدیل شوند، نه اینکه از PNG به‌صورت تصادفی sample شوند.

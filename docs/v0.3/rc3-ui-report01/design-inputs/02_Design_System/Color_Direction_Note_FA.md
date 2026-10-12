# Time80 Color Direction Note

## وضعیت
Direction تأییدشده؛ production tokens هنوز نیازمند تثبیت نهایی هستند.

## جهت اصلی
ترکیب مورد پسند برای Time80:
- سطح‌های کرم/خنثی گرم
- سبز طبیعی و گرم برای Progress / Positive / Life / Completion
- نارنجی گرم به‌عنوان Accent مکمل
- متن سرمه‌ای/ذغالی عمیق برای خوانایی

## Semantic intent
سبز نباید صرفاً تزئینی باشد؛ در درجه اول به مفاهیمی مثل:
- پیشرفت
- مسیر درست/مثبت
- وضعیت فعال و سالم
- completion
اختصاص یابد.

## هشدار
تا زمانی که Product state مثبت/منفی را تعریف نکرده است، رنگ سبز/منفی نباید از روی نام فعالیت به‌تنهایی تعیین شود.

## Implementation
Hexها نباید از PNG به‌طور تصادفی استخراج و hard-code شوند. در مرحله Design Tokenization باید رنگ‌ها به semantic tokens مثل `color-success`, `color-progress`, `color-accent-warm` تبدیل شوند و contrast آن‌ها بررسی شود.

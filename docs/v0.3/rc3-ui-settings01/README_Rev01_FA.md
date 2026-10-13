# شواهد RC3-UI-SETTINGS-01 — Rev01

گزارش اصلی: [RC3_UI_SETTINGS_01_Report_Rev01_FA.md](../RC3_UI_SETTINGS_01_Report_Rev01_FA.md). گزارش/شواهد fixture در فایل مستقل و `../rc3-test-clock-fix01/` هستند.

- SHA سورس نهایی آزمون‌شده: `711b6eb8a457934f298ab5c72b132ae59101b6f8`؛ پس از آن فقط docs/evidence اضافه می‌شود.
- typecheck و full UTC138/138 و گروه مرتبطTehran117/117 Pass؛ `validation-record.json` فرمان وSHA دقیق،`test-results-Rev01.csv` نتیجه هر آزمون وNot run را دارد.
- visual Tehran6/7 Fail،همانKnownIssue progress65≠50؛رویSource81d88cb اجرا شد وtest/caller درreviewنهایی تغییرنکردند. TZunset/coreTehran بازند؛X07fixture جدا رفع شد.
- coverage۱۴۹ردیف،۱۳۹source binding+۱۰reserved؛۱۱۲active دیده‌شده،Pending0؛guide/CSV ازregistryRev04 باsites تازه تولید شدند،کد/اثر/status ثابت‌اند.
- tested-source-manifest۳۰۹فایل/source-review۳۰۰protected،آثار FIXها/داده/engine محفوظ. Source/data hashes شاهدnative نیستند.
- design-source-manifest منابع واقعاً خوانده/PNG مشاهده‌شده را ثبت می‌کند. PNG پوشهdesign-inputs **مرجع طراحی** است ودرUI استفاده نشده؛عکس اجرای گوشی نیست.
- runtime-check:Android/D04/RTL/scales1/1.5/2/keyboard/scroll/target Not run؛QA گوشی،اعلان وارتقا همچنان الزامی‌اند؛فقطTalkBack Deferred است.

جدول coverage ازregistry وAST درکنارwitness آزمون تولید شده است؛عنوانcheckpoint بهM-02 تغییر داده شد،generatorهای تاریخی/خروجی‌های قبلی بازنویسی نشدند. برای کنترل تکراری X63،نام روز نیز درگزارش باگ ذکر شود. اندازه‌گیری واقعیlayout/targets وپذیرشAC-ID بهQA گوشی وابسته‌اند.

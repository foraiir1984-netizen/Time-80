# Time80 Typography Normalization v1.0

**Scope:** M-01 / M-02 / M-04 / M-10

## Font
Primary: **Vazirmatn**

Weights:
- 400 Regular
- 500 Medium
- 600 SemiBold
- 700 Bold

تمام UI از یک خانواده فونت استفاده کند.

## Type Scale
| Token | Usage | Size | Weight | Line Height |
|---|---|---:|---:|---:|
| `type.hero` | ساعت اصلی | 42sp | 700 | 50sp |
| `type.metricLarge` | اعداد بزرگ گزارش | 32sp | 700 | 40sp |
| `type.pageTitle` | عنوان صفحه | 26sp | 700 | 36sp |
| `type.sectionTitle` | عنوان بخش | 20sp | 700 | 30sp |
| `type.motivation` | پیام انگیزشی | 19sp | 700 | 28sp |
| `type.cardTitle` | عنوان کارت | 16sp | 600 | 24sp |
| `type.body` | متن اصلی | 15sp | 400 | 24sp |
| `type.bodySecondary` | متن ثانویه | 14sp | 400 | 22sp |
| `type.control` | Button/Chip/Tab | 14sp | 500 | 22sp |
| `type.caption` | metadata | 13sp | 400 | 20sp |
| `type.navigation` | Bottom Nav | 12sp | 500 | 18sp |

## قواعد
- Selected state نباید font size را تغییر دهد؛ فقط weight/color.
- متن قابل‌خواندن مهم کمتر از 14sp نباشد.
- Caption حداقل 13sp.
- ساعت، درصد و زمان‌ها از Tabular Numerals استفاده کنند.
- فارسی RTL باشد و mixed-direction text (زمان، درصد، Asia/Tehran) به‌صورت BiDi تست شود.

## M-10 Hierarchy
42 — Clock  
26 — Page title  
19 — Motivational message  
15 — Primary content  
13 — Metadata

## Source of Truth
اگر اندازه متن در PNG با این سند متفاوت است، **این سند مرجع اجراست**.

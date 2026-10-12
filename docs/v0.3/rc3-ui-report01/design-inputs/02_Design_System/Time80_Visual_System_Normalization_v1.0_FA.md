# Time80 Visual System Normalization v1.0

**Scope:** M-01 / M-02 / M-04 / M-10

## Spacing Scale
`4 / 8 / 12 / 16 / 24 / 32 / 40 dp`

- Screen horizontal padding: **16dp**
- Standard card padding: **16dp**
- Large card padding: **20dp**
- Card gap: **12dp**
- Section gap: **24dp**

## Radius Scale
| Token | Radius | Usage |
|---|---:|---|
| `radius.sm` | 8dp | badge/small indicators |
| `radius.md` | 12dp | inputs/small controls |
| `radius.lg` | 16dp | standard cards |
| `radius.xl` | 24dp | hero/bottom sheet |
| `radius.pill` | 999dp | chips/toggles |

## Icons
| Token | Size |
|---|---:|
| `icon.sm` | 16dp |
| `icon.md` | 20dp |
| `icon.lg` | 24dp |
| Illustration/Hero icon | max 32dp unless intentionally illustrative |

Icon container: 40dp, icon 20dp, gap to text 12dp.

## Touch
حداقل interactive target: **48×48dp**

## Controls
- Primary Button height: 48dp, radius 16dp
- Secondary Button: 44–48dp
- Chip min height: 40dp, horizontal padding 16dp, gap 8dp
- Input: 48–52dp, radius 12dp, horizontal padding 16dp

## Bottom Navigation
- Icon 24dp
- Label 12sp
- visual height حدود 64dp + safe area
- selected/unselected size ثابت؛ فقط color/weight/icon state تغییر کند

## Elevation
- Standard card: 1–2dp
- Hero: حداکثر 3dp
- مرز ظریف و variation سطح بر shadow سنگین ترجیح دارد

## M-10 Specific
- Header: 50% image / 50% today+date, gap 8dp
- Header card radius: 16dp
- Motivation spacing: 12dp from header; padding 16dp
- Candle + Donut gap: حداقل 16dp
- Candle: neutral surface, no image background
- Timeline card: radius 16dp, padding 16dp
- Timeline axis: 2dp
- Node 8–10dp; active 12dp
- Timeline item min vertical rhythm: 44dp

## Source of Truth
اگر spacing/radius/icon size در PNG متفاوت است، **این سند مرجع اجراست**.

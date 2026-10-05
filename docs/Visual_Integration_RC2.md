# Time80 v0.3 visual integration correction / RC2

Baseline: `f957798b4c18bd32a949b0451fd51eb3431bd59e` (RC1). Branch: `feat/time80-v0.3-implementation`.

Authority: the user's approved correction, the v0.3 UX behavior/accessibility material, and `Time80_Visual_Icon_Spec_v0.3.md` v0.2. `Time80-Redesign.png` and the referenced Design Office handoff are unavailable in this workspace. The user explicitly authorized the supplied tokens as sufficient in that case. This is a visual-language integration, not a claim of pixel-perfect comparison against an unavailable image.

## Changes

| Surface | Correction | Preserved behavior |
|---|---|---|
| Shared primitives | Central warm palette, 24dp page padding, surfaces/borders, 56dp/28dp primary buttons, secondary actions, focused inputs, loading/error feedback, press/focus states | Native callbacks, disabled guards, input onBlur handlers and refs |
| Today | Dominant current time, local-day presentation progress, next reminder, current/latest completed interval, due count and existing due action | Existing pending selector and exact CheckIn parameters; the progress indicator never changes slots/reports/schema |
| Day review | Lightweight time/identity rows, neutral pending/skipped states, previous/current day controls, explicit back to Today | All slot states, future disabling, Backlog and row actions |
| CheckIn | Question/date/period hierarchy; full ranked collection in two columns or one for large type/narrow width | One-tap initial logging, archive filtering, ranking, classification, editing and retry guards; no activity search/selection step |
| Activities | Style A framing, cards/sheet, quieter archive/close actions, focus/press treatment | Body/overflow sheet, edit/archive/10s Undo/Archived/Restore, IDs/history and focus restoration |
| Insights | Warm surfaces, visible previous-day/Today navigation, report hierarchy and activity icons | Every existing report mode, date source and calculation |
| Settings/support | Shared backgrounds/forms, readable labels, scrollable supporting outcomes/editor/onboarding | Settings information architecture, notification diagnostics/resolution, SaveResult/Undo, ICATUS controls |
| Bottom navigation | Warm rail, accent active/secondary inactive, 24dp icons, independent 48dp targets | Today/Activities/Insights/Settings destinations and back behavior |

Two-column threshold: useful width is window width minus 48dp; below 300dp or fontScale >= 1.5 uses one column. Cards grow with text. Management names remain two lines with full name in the sheet and accessibility label.

Approved icon source files and generated PNG assets are unchanged. Symbol-only PNGs receive one 52dp host frame: peach/rest, green/family/exercise, blue/work/commute, gold/study, with coordinated dark tints. Unknown metadata/raw legacy strings remain untouched in storage. Decorative legacy glyphs do not scale independently of their frame; their full activity name remains scalable/accessible.

## Palette audit / intentional exceptions

Removed general UI colors: `#F6F7F9` (including app splash/adaptive background configuration), `#17212D`, `#667085`, `#183C43`, `#21594b`; unused ScreenShell colors also replaced. Color values are centralized except matching build-time `app.json` background metadata and immutable approved asset provenance.

`#B42318` remains an intentional semantic error color in the central theme; the visible `خطا:` prefix, alert role and live-region prevent color-only error signaling. The central translucent black modal scrim is intentional. Native switches, native Alert dialogs, platform keyboard/navigation semantics and existing launcher/splash logo raster artwork are preserved rather than mechanically recolored. The existing launcher/splash raster artwork is not a redesigned Style A activity asset. Native font fallback is retained because no licensed/product Vazirmatn font file was supplied; final typography and launch/system rendering need device QA.

No new search: the already-existing icon lookup and ICATUS search remain available; activity search was not added. No drag/drop, permanent delete, bulk management, database migration or native behavior changes.

## Regression and release protections

Eight added tests cover authoritative tokens, responsive boundaries/tab hierarchy, focus/disabled/errors/input handlers, picker order/immediate taps/no search, icon host/legacy compatibility, read-only Today progress including DST, exact Today routing/review/Backlog, timeline states, and fail-closed RC signing gates. Existing functional regression tests remain.

RC2 keeps app version 0.3.0 and advances Android versionCode from 3 to 4. Package ID remains `com.personal.time80`. Schema/fingerprint/migration sources and stable signing plugin/script remain byte-identical to the v0.2 baseline. Functional services/notifications/utils/types/data/native patch/dependencies/assets remain byte-identical to RC1.

The RC workflow first polls the ordinary push validation and native debug runs for this exact repository, branch and SHA. It requires both workflows and required jobs to succeed, and the old release job to remain skipped. A failed/missing/wrong-SHA gate prevents the signing job. Gate job has only read permissions and the GitHub workflow token; signing secrets are bound only in the downstream signed RC job. Temporary stable keystore is removed even on failure. Only a verified `Time80-v0.3.0-RC2.apk`, checksum and verification evidence are uploaded. No merge, tag, GitHub Release or final release dispatch is performed.

## Samsung S23 FE acceptance remains necessary

The user reports RC1 successfully upgraded v0.2 in place. RC2 must separately be upgraded over installed RC1 without uninstall and checked for preserved data, visual layout/RTL, TalkBack focus/order, font scale 1.5/2, long names, system/launch rendering and all existing manual/report flows. Check notification delivery/tap/dismiss/exact-period routing under lock screen, idle/Doze, battery settings, reboot, alarm grant/revocation, clock/timezone changes; report navigation/ranking; Activities sheet/archive/Undo/restore; approved icons and accessibility. OI-A01-R, OI-P01 and AC-A11 remain unresolved device/Product/Architecture gates. Cloud/native compilation does not prove device reliability or release readiness.

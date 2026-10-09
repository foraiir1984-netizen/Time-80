# Time80 CAM data collection 0.2

Separate research deployment; no Time80 mobile app release changes.

## Files
- `docs/index.html`: responsive four-variant A/B/C/D public pilot
- `docs/config.js`: endpoint address for the survey backend (currently empty)
- `research/cam-backend/Code.gs`: Google Apps Script receiver; anonymous values only

## Connect the Google Sheet
1. Open https://docs.google.com/spreadsheets/d/11k9j68Itg2USdzJitujY5LBCUPxAKbjSNWxgtwIFc0Y/edit
2. Extensions > Apps Script; paste all of `research/cam-backend/Code.gs`; Save.
3. Deploy > New deployment > Web app; Execute as Me, Who has access Anyone; authorize and Deploy.
4. Copy the exact `/exec` URL into `docs/config.js` as `endpoint`. Do not expose any private OAuth credentials.
5. GitHub > Settings > Pages > Deploy from branch: `cam-pilot-collection`, folder `/docs`.
6. Test a submission; confirm page says 'پاسخ ثبت شد' and a row appears in Responses.

Use URLs ending `?v=A` through `?v=D` for controlled message tests. Without a version the page randomizes.

## Privacy and limitations
- Records variant, initial decision, three optional 1–5 scores, random receipt ID and server time only.
- No identifying info, personal wish text, or mood choices sent intentionally. Providers may log ordinary request metadata.
- Requires explicit consent before submission.
- Does NOT count abandonments/no-consent visitors and therefore cannot estimate initial click-through or engagement conversion.
- Do not publish the Google Sheet. Publish only static GitHub Pages site and Apps Script receiver.
- Apps Script is a low-volume research endpoint, not a hardened anti-spam platform; avoid mass public marketing.
- Historical offline record is in 'Earlier Pilot' and excluded from 'Summary'.

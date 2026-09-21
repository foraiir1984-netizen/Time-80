# Time80 v0.2

Android time-use diary implemented against [Implementation Specification 1.2](docs/Implementation_Specification_FA.md). This is a review build; see the [Persian implementation and validation report](docs/Implementation_Status_FA.md) for completed checks and device release gates.

## Development

Node 24, Java 17, and an Android SDK are required for native builds.

```sh
npm ci
npm run typecheck
TZ=UTC npm test
npx expo export --platform android
npm run android
```

The Android notification scheduler includes a small, guarded postinstall patch. Expo Go cannot exercise this patch. Use a native development/release build for notification acceptance tests.

## Stable release signing

Set these GitHub repository secrets, then dispatch **Time80 validation and Android build** with `release=true`:

- `TIME80_KEYSTORE_BASE64`: base64 of the permanent release keystore.
- `TIME80_KEYSTORE_PASSWORD`
- `TIME80_KEY_ALIAS`
- `TIME80_KEY_PASSWORD`
- `TIME80_SIGNER_SHA256`: expected SHA-256 fingerprint of that key's signing certificate.

Keep the same keystore, alias, and certificate for every v0.2+ update; back up the key securely outside this repository. The build fails if credentials are missing or the resulting certificate differs from the pinned fingerprint. It never falls back to debug signing for a release.

For local release builds, provide the corresponding environment variables plus `TIME80_KEYSTORE_PATH` as an absolute path, then run `npm run apk:release`.

## Data and ICATUS

Unknown and v0.1 databases are rejected without deletion. Specification 1.2 targets a fresh v0.2 baseline; v0.1 data migration is not included. Startup on an existing valid baseline does not reseed data. Foreign keys, check constraints, assignment revision history and a structural fingerprint protect the baseline.

The bundled classification is the official [UN Statistics Division ICATUS 2016](https://unstats.un.org/unsd/demographic-social/time-use/icatus-2016/) hierarchy, revision 2017-03-10: 9 major divisions, 56 divisions, 165 groups. Canonical source data and the independent Persian translation manifest carry SHA-256 hashes. Persian root labels are product translations; lower-level labels fall back to official English titles.

Tests use real SQLite via Node and mock only Expo's platform interfaces. Android notification delivery, reboot behavior, Samsung battery restrictions, and signed in-place upgrades still require device testing.

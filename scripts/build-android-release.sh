#!/usr/bin/env bash
set -euo pipefail
: "${TIME80_KEYSTORE_PATH:?Stable keystore required}"
: "${TIME80_KEYSTORE_PASSWORD:?Keystore password required}"
: "${TIME80_KEY_ALIAS:?Key alias required}"
: "${TIME80_KEY_PASSWORD:?Key password required}"
: "${TIME80_SIGNER_SHA256:?Expected certificate fingerprint required}"
test -f "$TIME80_KEYSTORE_PATH"
npm ci --no-audit --no-fund
npm run typecheck
TZ=UTC npm test
npx expo prebuild --platform android --clean
chmod +x android/gradlew
(cd android && ./gradlew assembleRelease --no-daemon)
mkdir -p dist
cp android/app/build/outputs/apk/release/app-release.apk dist/Time80-v0.2.apk
SDK_ROOT="${ANDROID_SDK_ROOT:-${ANDROID_HOME:-}}"
SIGNER="$(find "$SDK_ROOT/build-tools" -name apksigner -type f | sort -V | tail -1)"
test -n "$SIGNER"
ACTUAL="$("$SIGNER" verify --print-certs dist/Time80-v0.2.apk | sed -n 's/^Signer #1 certificate SHA-256 digest: //p' | tr '[:upper:]' '[:lower:]' | tr -d ': ')"
EXPECTED="$(printf '%s' "$TIME80_SIGNER_SHA256" | tr '[:upper:]' '[:lower:]' | tr -d ': ')"
if [ "$ACTUAL" != "$EXPECTED" ]; then
  rm dist/Time80-v0.2.apk
  echo 'Release certificate differs from the pinned signing identity.' >&2
  exit 1
fi
sha256sum dist/Time80-v0.2.apk > dist/Time80-v0.2.apk.sha256

#!/usr/bin/env bash
set -euo pipefail
: "${TIME80_KEYSTORE_PATH:?Stable keystore required}"
: "${TIME80_KEYSTORE_PASSWORD:?Keystore password required}"
: "${TIME80_KEY_ALIAS:?Key alias required}"
: "${TIME80_KEY_PASSWORD:?Key password required}"
: "${TIME80_SIGNER_SHA256:?Expected certificate fingerprint required}"
test -f "$TIME80_KEYSTORE_PATH"
normalize_fingerprint() {
  LC_ALL=C tr '[:upper:]' '[:lower:]' | LC_ALL=C tr -d ':[:space:]'
}
EXPECTED="$(printf '%s' "$TIME80_SIGNER_SHA256" | normalize_fingerprint)"
if [[ ! "$EXPECTED" =~ ^[0-9a-f]{64}$ ]]; then
  echo 'TIME80_SIGNER_SHA256 must contain a SHA-256 certificate fingerprint (64 hex digits).' >&2
  exit 1
fi
# Check the restored key before spending time on the native build.
KEYSTORE_DIGEST="$(keytool -exportcert -keystore "$TIME80_KEYSTORE_PATH" \
  -alias "$TIME80_KEY_ALIAS" -storepass:env TIME80_KEYSTORE_PASSWORD | sha256sum | cut -d ' ' -f 1)"
if [ "$KEYSTORE_DIGEST" != "$EXPECTED" ]; then
  echo 'Restored keystore certificate differs from TIME80_SIGNER_SHA256; native build not started.' >&2
  printf 'Restored certificate SHA-256 (public): %s\n' "$KEYSTORE_DIGEST" >&2
  exit 1
fi
echo 'Restored signing certificate matches the pinned identity.'
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
CERT_OUTPUT="$("$SIGNER" verify --print-certs dist/Time80-v0.2.apk)"
# apksigner can label signers by number or SDK range. Require every
# reported APK signer to have the same pinned identity; exclude source stamps.
ACTUAL="$(printf '%s\n' "$CERT_OUTPUT" | sed -nE 's/^Signer (#[0-9]+|\(.*\)) certificate SHA-256 digest: (.*)$/\2/p' | tr '[:upper:]' '[:lower:]' | sed 's/[[:space:]:]//g' | sort -u)"
if [[ ! "$ACTUAL" =~ ^[0-9a-f]{64}$ ]]; then
  rm dist/Time80-v0.2.apk
  echo 'Could not identify one unique APK signing certificate from apksigner output.' >&2
  printf '%s\n' "$CERT_OUTPUT" >&2
  exit 1
fi
if [ "$ACTUAL" != "$EXPECTED" ]; then
  rm dist/Time80-v0.2.apk
  echo 'Release certificate differs from the pinned signing identity.' >&2
  printf 'APK certificate SHA-256 (public): %s\n' "$ACTUAL" >&2
  exit 1
fi
sha256sum dist/Time80-v0.2.apk > dist/Time80-v0.2.apk.sha256

#!/usr/bin/env bash
set -euo pipefail

npm install --no-audit --no-fund
npx expo prebuild --platform android --clean
chmod +x android/gradlew
(
  cd android
  ./gradlew assembleRelease --no-daemon --stacktrace
)

mkdir -p dist
APK="$(find android/app/build/outputs/apk/release -type f -name '*.apk' | head -n 1)"
if [ -z "$APK" ]; then
  echo "No release APK was produced." >&2
  exit 1
fi
cp "$APK" dist/Time80-v0.1.apk
echo "APK ready: dist/Time80-v0.1.apk"

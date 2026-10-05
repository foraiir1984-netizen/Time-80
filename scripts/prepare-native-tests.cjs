// Test harness only. Writes generated/ignored Android and installed dependency files, never signing configuration.
const fs = require("fs"),
  path = require("path");
const root = path.resolve(__dirname, "..");
const copy = (from, to) => {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
};
function configure(file, block) {
  let s = fs.readFileSync(file, "utf8");
  if (!s.includes("// TIME80_NATIVE_TESTS")) {
    if (!s.includes("dependencies {"))
      throw Error("Native test Gradle shape changed");
    s = s.replace(
      "dependencies {",
      `dependencies {\n// TIME80_NATIVE_TESTS\n${block}`,
    );
    fs.writeFileSync(file, s);
  }
}
copy(
  path.join(root, "native/notifications/tests/Time80RuntimeTest.kt"),
  path.join(
    root,
    "node_modules/expo-notifications/android/src/test/java/expo/modules/notifications/time80/Time80RuntimeTest.kt",
  ),
);
configure(
  path.join(root, "node_modules/expo-notifications/android/build.gradle"),
  "testImplementation 'junit:junit:4.13.2'",
);
copy(
  path.join(
    root,
    "native/notifications/tests/Time80OccurrenceInstrumentedTest.kt",
  ),
  path.join(
    root,
    "android/app/src/androidTest/java/com/personal/time80/Time80OccurrenceInstrumentedTest.kt",
  ),
);
const app = path.join(root, "android/app/build.gradle");
let s = fs.readFileSync(app, "utf8");
if (!s.includes("testInstrumentationRunner")) {
  if (!s.includes("defaultConfig {")) throw Error("App Gradle shape changed");
  s = s.replace(
    "defaultConfig {",
    "defaultConfig {\n        testInstrumentationRunner 'androidx.test.runner.AndroidJUnitRunner'",
  );
  fs.writeFileSync(app, s);
}
configure(
  app,
  "androidTestImplementation 'androidx.test:runner:1.6.2'\nandroidTestImplementation 'androidx.test.ext:junit:1.2.1'",
);
console.log("Prepared version-pinned native test-only harness");

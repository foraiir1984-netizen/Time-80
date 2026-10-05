const fs = require("fs"),
  path = require("path"),
  crypto = require("crypto"),
  cp = require("child_process");
const root = path.resolve(__dirname, ".."),
  dep = path.join(root, "node_modules/expo-notifications");
const manifest = require("../native/notifications/patch-manifest.json");
const hash = (data) => crypto.createHash("sha256").update(data).digest("hex");
function patch() {
  if (
    JSON.parse(fs.readFileSync(path.join(dep, "package.json"))).version !==
    manifest.version
  )
    throw Error("Locked notifications version changed; review native patch");
  if (
    hash(
      fs.readFileSync(path.join(root, "native/notifications/Time80Runtime.kt")),
    ) !== manifest.helperSha256
  )
    throw Error("Native helper manifest mismatch");
  const statuses = manifest.files.map((f) => ({
    f,
    h: hash(fs.readFileSync(path.join(dep, f.path))),
  }));
  const runtime = path.join(root, "native/notifications/Time80Runtime.kt"),
    dest = path.join(
      dep,
      "android/src/main/java/expo/modules/notifications/time80/Time80Runtime.kt",
    );
  if (statuses.every(({ f, h }) => h === f.after)) {
    if (
      !fs.existsSync(dest) ||
      !fs.readFileSync(dest).equals(fs.readFileSync(runtime))
    )
      throw Error("Time80 native helper mismatch");
    return;
  }
  if (statuses.some(({ f, h }) => h === f.after))
    throw Error("Partial native patch; reinstall locked dependencies");
  // Only the scheduling delegate may be pristine before the preserved v0.2 postinstall guard.
  for (const { f, h } of statuses)
    if (h !== f.before && h !== f.pristine)
      throw Error(`Native source mismatch: ${f.path}`);
  require("./patch-notifications-v02.cjs");
  for (const f of manifest.files)
    if (hash(fs.readFileSync(path.join(dep, f.path))) !== f.before)
      throw Error(`Native preimage mismatch: ${f.path}`);
  const file = path.join(
    root,
    "native/notifications/expo-notifications-57.0.20.patch",
  );
  cp.execFileSync(
    "git",
    ["apply", "--check", "--unsafe-paths", `--directory=${dep}`, file],
    { cwd: root },
  );
  cp.execFileSync(
    "git",
    ["apply", "--unsafe-paths", `--directory=${dep}`, file],
    { cwd: root },
  );
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(runtime, dest);
  for (const f of manifest.files)
    if (hash(fs.readFileSync(path.join(dep, f.path))) !== f.after)
      throw Error(`Native output mismatch: ${f.path}`);
}
if (require.main === module) {
  patch();
  console.log("Verified expo-notifications 57.0.20 Time80 patch");
}
module.exports = { patch };

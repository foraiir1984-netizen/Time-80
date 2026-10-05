import { test } from "node:test";
import assert from "node:assert/strict";
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  mkdtempSync,
  copyFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
const root = resolve(import.meta.dirname, ".."),
  manifest = JSON.parse(
    readFileSync(
      join(root, "native/notifications/patch-manifest.json"),
      "utf8",
    ),
  );
const hash = (b: Buffer) => createHash("sha256").update(b).digest("hex");
test("locked native patch applies from v0.2 preimages, is idempotent and rejects partial/corrupt/version-changed sources without further writes", () => {
  const temp = mkdtempSync(join(tmpdir(), "time80-patch-test-"));
  try {
    for (const f of manifest.files) {
      const p = join(temp, "node_modules/expo-notifications", f.path);
      mkdirSync(dirname(p), { recursive: true });
      copyFileSync(join(root, "node_modules/expo-notifications", f.path), p);
    }
    for (const file of [
      "scripts/patch-notifications.cjs",
      "scripts/patch-notifications-v02.cjs",
      "native/notifications/patch-manifest.json",
      "native/notifications/expo-notifications-57.0.20.patch",
      "native/notifications/Time80Runtime.kt",
    ]) {
      const p = join(temp, file);
      mkdirSync(dirname(p), { recursive: true });
      copyFileSync(join(root, file), p);
    }
    writeFileSync(
      join(temp, "node_modules/expo-notifications/package.json"),
      JSON.stringify({ version: "57.0.20" }),
    );
    execFileSync("git", [
      "apply",
      "--reverse",
      "--unsafe-paths",
      `--directory=${join(temp, "node_modules/expo-notifications")}`,
      join(temp, "native/notifications/expo-notifications-57.0.20.patch"),
    ]);
    const script = join(temp, "scripts/patch-notifications.cjs");
    execFileSync("node", [script], { cwd: temp, stdio: "pipe" });
    execFileSync("node", [script], { cwd: temp, stdio: "pipe" });
    for (const f of manifest.files)
      assert.equal(
        hash(
          readFileSync(join(temp, "node_modules/expo-notifications", f.path)),
        ),
        f.after,
      );
    const target = join(
      temp,
      "node_modules/expo-notifications",
      manifest.files[0].path,
    );
    writeFileSync(target, readFileSync(target, "utf8") + "\n// corruption");
    const before = manifest.files.map((f: any) =>
      hash(readFileSync(join(temp, "node_modules/expo-notifications", f.path))),
    );
    assert.throws(
      () => execFileSync("node", [script], { cwd: temp, stdio: "pipe" }),
      /Partial native patch/,
    );
    assert.deepEqual(
      manifest.files.map((f: any) =>
        hash(
          readFileSync(join(temp, "node_modules/expo-notifications", f.path)),
        ),
      ),
      before,
    );
    writeFileSync(
      join(temp, "node_modules/expo-notifications/package.json"),
      JSON.stringify({ version: "57.0.21" }),
    );
    assert.throws(
      () => execFileSync("node", [script], { cwd: temp, stdio: "pipe" }),
      /Locked notifications version changed/,
    );
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});
test("all 15 approved icons and 180 transparent density outputs reproduce from pinned SVG sources", () => {
  execFileSync("node", [join(root, "scripts/generate-icons.cjs"), "--check"], {
    cwd: root,
    stdio: "pipe",
  });
  const asset = join(root, "assets/icons/time80-a-v1"),
    source = JSON.parse(
      readFileSync(join(asset, "source-hashes.json"), "utf8"),
    ),
    generated = JSON.parse(
      readFileSync(join(asset, "generated-hashes.json"), "utf8"),
    );
  assert.equal(Object.keys(source.files).length, 15);
  assert.equal(Object.keys(generated.files).length, 180);
  for (const [file, expected] of Object.entries(source.files))
    assert.equal(hash(readFileSync(join(asset, "svg", file))), expected);
  for (const [file, expected] of Object.entries(generated.files)) {
    const bytes = readFileSync(join(asset, "png", file));
    assert.equal(hash(bytes), expected);
    const match = file.match(/-(24|30|32)(?:@(2|3|4)x)?\.png$/)!;
    assert.equal(
      bytes.readUInt32BE(16),
      Number(match[1]) * Number(match[2] ?? 1),
    );
    assert.equal(bytes.readUInt32BE(20), bytes.readUInt32BE(16));
    assert.equal(bytes[25], 6);
  }
});

test("Android autolinking compiles exactly the patched notification module from source", () => {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  assert.deepEqual(pkg.expo.autolinking.android.buildFromSource, [
    "expo-notifications",
  ]);
});

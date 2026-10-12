import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { collectUiIdentifierUses } from "./inspect-ui-identifiers";
import {
  uiIdentifiers,
  uiIdentifierRegistryVersion,
  validateUiIdentifierRegistry,
} from "../src/components/uiIdentifiers";

// Existence in registry/source does not establish UI display. An active row
// needs both a real source binding and separate renderer behavior evidence.
const evidencePath = process.argv[2];
if (!evidencePath)
  throw Error("Supply rendered-code-evidence.json from behavior tests");
const evidence = JSON.parse(readFileSync(evidencePath, "utf8")) as {
  codes: Record<string, string[]>;
  renderedSites?: Record<string, string[]>;
};
const out = resolve(process.argv[3] ?? "docs/v0.3/rc3-id01");
mkdirSync(out, { recursive: true });
validateUiIdentifierRegistry(uiIdentifiers);
const uses = collectUiIdentifierUses();
type Row = {
  code: string;
  key: string;
  nameFa: string;
  effectFa: string;
  status: string;
  source: string;
  witness: string;
  limitation: string;
};
const rows: Row[] = [];
for (const [key, e] of Object.entries(uiIdentifiers).sort(([, a], [, b]) =>
  a.code.localeCompare(b.code, "en", { numeric: true }),
)) {
  const bindings = uses.filter((u) => u.key === key),
    witnessed = evidence.codes[e.code];
  if (e.status === "active") {
    const status =
      bindings.length && witnessed?.length ? "Implemented" : "Pending";
    for (const u of bindings.length ? bindings : [null])
      rows.push({
        code: e.code,
        key,
        nameFa: e.nameFa,
        effectFa: e.effectFa,
        status,
        source: u ? `${u.file}:${u.line} (${u.context})` : "No source binding",
        witness: witnessed?.join("; ") ?? "No renderer behavior witness",
        limitation:
          "Source + renderer evidence; actual native layout/target/screenshot Not run. Repeated instances use activity/date context.",
      });
  } else
    rows.push({
      code: e.code,
      key,
      nameFa: e.nameFa,
      effectFa: e.effectFa,
      status: "Reserved",
      source: e.sites.join("; ") || "Future design; no existing source binding",
      witness: "No active badge/control binding",
      limitation: e.sites.length
        ? "ICATUS existing UI pending hide; reservation does not prove UI removal."
        : "Deferred M-01/M-04; capability not implemented.",
    });
}
const csvCell = (s: string) => `"${s.replaceAll('"', '""')}"`;
writeFileSync(
  resolve(out, "coverage-Rev02.csv"),
  [
    [
      "registry_version",
      "code",
      "semantic_key",
      "name_fa",
      "effect_fa",
      "coverage_status",
      "actual_source_site",
      "renderer_witness",
      "limitations",
    ],
    ...rows.map((r) => [
      uiIdentifierRegistryVersion,
      r.code,
      r.key,
      r.nameFa,
      r.effectFa,
      r.status,
      r.source,
      r.witness,
      r.limitation,
    ]),
  ]
    .map((row) => row.map(csvCell).join(","))
    .join("\n") + "\n",
);
writeFileSync(
  resolve(out, "current-source-uses.json"),
  JSON.stringify(
    { note: "Explicit bindings, not native/layout evidence", uses },
    null,
    2,
  ) + "\n",
);
const cell = (s: string) => s.replaceAll("|", "\\|").replaceAll("\n", " ");
const active = Object.values(uiIdentifiers).filter(
    (e) => e.status === "active",
  ).length,
  reserved = Object.values(uiIdentifiers).filter(
    (e) => e.status === "reserved",
  ).length;
writeFileSync(
  resolve(out, "RC3_UI_Coverage_Rev02_FA.md"),
  [
    "# پوشش RC3-ID-01 — Rev02",
    "",
    `Registry: ${uiIdentifierRegistryVersion}؛ ۱۲۲ مدخل (${active} فعال، ${reserved} رزرو)، ${uses.length} اتصال صریح در سورس.`,
    "",
    "Implemented به معنای اتصال سورس همراه شاهد رفتار renderer است؛ پذیرش بصری گوشی و اندازه‌گیری target نیست. این جدول هر اتصال صریح را جدا نشان می‌دهد. کدهای منتقل‌شده با props مشترک (Button/Input/ActivityGrid/SlotRow/header/tab) و تکرار داده با تست‌های UI و current-source-uses.json پیگیری می‌شوند. نمونه‌های مشاهده‌شده در rendered-code-evidence-UTC.json و rendered-code-evidence-Tehran.json هستند.",
    "",
    "تمام activeها شاهد renderer دارند؛ هیچ رزرو binding فعال ندارد. ICATUS در سورس میانی pending hide است و برای RC3 نهایی به حذف واقعی UI نیاز دارد. AC-ID نهایی وابسته به اجرای گوشی/پوشش مراحل بعد است؛ M-01/M-04 و TalkBack همچنان Deferred / Not run.",
    "",
    "| کد | نام | وضعیت | محل واقعی | شاهد | حد |",
    "| --- | --- | --- | --- | --- | --- |",
    ...rows.map(
      (r) =>
        `| ${[r.code, r.nameFa, r.status, r.source, r.witness, r.limitation].map(cell).join(" | ")} |`,
    ),
    "",
  ].join("\n"),
);
if (rows.some((r) => r.status === "Pending"))
  throw Error("Pending active coverage rows; inspect generated table");
console.log(
  `${active} active, ${reserved} reserved; ${rows.length} source/reservation rows; Pending active=0.`,
);

import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  uiIdentifiers,
  uiIdentifierRegistryVersion,
  uiIdentifierReferenceComplete,
  validateUiIdentifierRegistry,
} from "../src/components/uiIdentifiers";

const statusFa = {
  active: "فعال",
  reserved: "رزرو",
  retired: "بازنشسته",
};
const cell = (value: string) =>
  value.replaceAll("|", "\\|").replaceAll("\n", " ");
const csvCell = (value: string) => `"${value.replaceAll('"', '""')}"`;

export function generateUiCodeGuide() {
  validateUiIdentifierRegistry(uiIdentifiers);
  const entries = Object.entries(uiIdentifiers).sort(([, a], [, b]) =>
    a.code.localeCompare(b.code, "en", { numeric: true }),
  );
  const markdown = [
    "# راهنمای کدهای رابط Time80",
    "",
    `نسخهٔ registry: ${uiIdentifierRegistryVersion}`,
    "مرجع: RC3_UI_Identifiers_Reference_Rev01.md + الحاقیهٔ ۶-ب / RC3_UI_Identifiers_Addendum_6B_Rev01.md. اتصال این خروجی به commit تحویل و snapshot آزمون در گزارش RC3_UI_REPORT_01_Report_Rev01_FA.md ثبت است.",
    "",
    ...(!uiIdentifierReferenceComplete
      ? [
          "**پیش‌نویس ناقص — جدول کامل تخصیص توافق‌شده و AC-ID-01…10 هنوز در دسترس نیست. این راهنما تحویل کامل RC3-ID-01 نیست.**",
          "",
        ]
      : []),
    "این خروجی از src/components/uiIdentifiers.ts تولید می‌شود. شماره‌ها از ترتیب این جدول تولید نمی‌شوند. «فعال» وضعیت تخصیص است؛ پذیرش نمایش در هر محل، به جدول پوشش و شاهد اجرای همان محل وابسته است.",
    "",
    "در گزارش باگ، کد صفحه/پنجره و کنترل را کنار هم بنویسید. برای کنترل تکراری، نام فعالیت یا تاریخ/بازه نیز لازم است. نمونهٔ مسیر مورد درخواست محصول: A02/X17 → A02/D01/X19 → A02/D02/X30؛ این مثال به‌تنهایی شاهد پیاده‌سازی آن مسیر در این checkpoint نیست.",
    "",
    "| کد | کلید ثابت | نام فارسی | اثر | نوع | وضعیت | محل‌های استفاده |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...entries.map(
      ([key, e]) =>
        `| ${[e.code, key, e.nameFa, e.effectFa, e.kind, statusFa[e.status], e.sites.join("؛ ") || "—"].map(cell).join(" | ")} |`,
    ),
    "",
    "کدهای رزرو badge فعال ندارند؛ وجود آن‌ها قابلیت تازه‌ای ایجاد نمی‌کند. کد بازنشسته دوباره تخصیص داده نمی‌شود و با نام/اثر قبلی در registry باقی می‌ماند. مرجع این نسخه کد بازنشسته‌ای اعلام نکرده است. تاریخچهٔ تخصیص Rev01 و الحاقیه در rc3-id01/allocations-Rev01.json و allocations-Rev02.json حفظ می‌شود؛ generator راهنما این تاریخچه را بازنویسی نمی‌کند.",
    "",
    "رابط قابل‌دسترسی ICATUS در RC3-ICATUS-HIDE-01 حذف شده است؛ داده‌ها و سیاست سرویس حفظ شده‌اند. D03/X32…X37/X41/X48/X95 رزرو و بدون محل استفادهٔ فعال‌اند. D08/X99/X100/X101 در M-01/M-04 فعال و در UI پیاده شده‌اند. شواهد پنهان‌سازی و پوشش جاری در گزارش پنهان‌سازی و rc3-icatus-hide01 محفوظ‌اند؛ پوشش جاری در rc3-ui-report01 ثبت است؛ پذیرش گوشی جدا و باز است.",
    "",
  ].join("\n");
  const csv =
    [
      [
        "registry_version",
        "reference_complete",
        "code",
        "semantic_key",
        "name_fa",
        "effect_fa",
        "kind",
        "status",
        "usage_sites",
      ],
      ...entries.map(([key, e]) => [
        uiIdentifierRegistryVersion,
        String(uiIdentifierReferenceComplete),
        e.code,
        key,
        e.nameFa,
        e.effectFa,
        e.kind,
        e.status,
        e.sites.join("; "),
      ]),
    ]
      .map((row) => row.map(csvCell).join(","))
      .join("\n") + "\n";
  return { markdown, csv };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const outputDir = resolve(process.argv[2] ?? "docs/v0.3");
  mkdirSync(outputDir, { recursive: true });
  const guide = generateUiCodeGuide();
  writeFileSync(resolve(outputDir, "RC3_UI_Code_Guide_FA.md"), guide.markdown);
  writeFileSync(resolve(outputDir, "RC3_UI_Code_Guide_FA.csv"), guide.csv);
}

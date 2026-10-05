export const ICON_KEYS = [
  "work",
  "study",
  "family",
  "rest",
  "exercise",
  "commute",
  "home",
  "report",
  "grid",
  "settings",
  "edit",
  "archive",
  "plus",
  "more",
  "check",
] as const;
export type IconKey = (typeof ICON_KEYS)[number];
export const ICON_SET = "time80-a-v1";
export type IconView =
  | { kind: "legacy"; raw: string; unresolved: boolean }
  | { kind: "asset"; raw: string; key: IconKey; unresolved: false };
export type IconCommand =
  | { kind: "keep" }
  | { kind: "selectAsset"; set: string; key: string }
  | { kind: "selectLegacy"; raw: string };
export type IconSnapshot = { legacyRaw: string; metaRaw: string | null };
export const iconMetaKey = (id: number) => {
  if (!Number.isSafeInteger(id) || id <= 0)
    throw Error("شناسهٔ فعالیت نامعتبر است");
  return `activity_icon_ref:v1:${id}`;
};
export function resolveActivityIcon(
  id: number,
  legacyRaw: string,
  metaRaw: string | null,
): IconView {
  iconMetaKey(id);
  if (metaRaw === null)
    return { kind: "legacy", raw: legacyRaw, unresolved: false };
  try {
    const m = JSON.parse(metaRaw);
    if (
      m?.v === 1 &&
      m.kind === "asset" &&
      m.set === ICON_SET &&
      ICON_KEYS.includes(m.key) &&
      m.legacyValue === legacyRaw
    )
      return { kind: "asset", raw: legacyRaw, key: m.key, unresolved: false };
  } catch {}
  return { kind: "legacy", raw: legacyRaw, unresolved: true };
}

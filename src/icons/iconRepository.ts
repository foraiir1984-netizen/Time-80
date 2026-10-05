import type { SQL } from "../types/domain";
import { iconMetaKey, resolveActivityIcon } from "./iconModel";
export async function loadIconMetadata(tx: SQL) {
  const rows = await tx.getAllAsync<{ key: string; value: string }>(
    "SELECT key,value FROM app_meta WHERE key GLOB 'activity_icon_ref:v1:*'",
  );
  return new Map(rows.map((r) => [r.key, r.value]));
}
export async function attachActivityIcons<
  T extends { id: number; icon: string },
>(tx: SQL, rows: T[]) {
  const meta = await loadIconMetadata(tx);
  return rows.map((a) => ({
    ...a,
    icon_view: resolveActivityIcon(
      a.id,
      a.icon,
      meta.get(iconMetaKey(a.id)) ?? null,
    ),
  }));
}

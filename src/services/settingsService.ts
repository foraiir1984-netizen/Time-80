import { transaction } from "../db/connection";
import { getSettings } from "../db/database";
import { getMeta, setMeta } from "../db/metaRepository";
import { ensureSlotHorizonTx, rebuildFutureSlots } from "./slotService";
import { validateSettings, minute, zoned, timezone } from "../utils/slots";
import type { AppSettings, Slot, Anchor } from "../types/domain";
export { validateSettings };
export async function applySettingsPatch(
  patch: Partial<AppSettings>,
  now = new Date(),
) {
  return transaction(async (tx) => {
    const old = await getSettings(tx),
      s = { ...old, ...patch };
    validateSettings(s);
    const oldZone = await getMeta(tx, "schedule_timezone"),
      zone = timezone();
    await ensureSlotHorizonTx(tx, now);
    const grid =
      old.interval_minutes !== s.interval_minutes ||
      old.day_start !== s.day_start ||
      old.day_end !== s.day_end ||
      JSON.stringify(old.active_days) !== JSON.stringify(s.active_days) ||
      oldZone !== zone;
    const current = await tx.getFirstAsync<Slot>(
      "SELECT * FROM expected_slots WHERE period_start<=? AND period_end>? ORDER BY period_start DESC LIMIT 1",
      now.toISOString(),
      now.toISOString(),
    );
    const effectiveAt = current?.period_end ?? now.toISOString();
    await tx.runAsync(
      "UPDATE settings SET notification_enabled=?,interval_minutes=?,day_start=?,day_end=?,active_days=?,sound_enabled=?,vibration_enabled=? WHERE id=1",
      s.notification_enabled,
      s.interval_minutes,
      s.day_start,
      s.day_end,
      JSON.stringify(s.active_days),
      s.sound_enabled,
      s.vibration_enabled,
    );
    if (grid) {
      const next = await tx.getFirstAsync<Slot>(
        "SELECT * FROM expected_slots WHERE period_start>=? ORDER BY period_start LIMIT 1",
        effectiveAt,
      );
      let a = JSON.parse(
        (await getMeta(tx, "schedule_anchor")) ?? "null",
      ) as Anchor | null;
      if (old.interval_minutes !== s.interval_minutes) {
        const p = zoned(
          new Date(current?.period_end ?? next?.period_start ?? effectiveAt),
          zone,
        );
        a = {
          effectiveAt,
          anchorLocalDate: p.toPlainDate().toString(),
          anchorLocalMinute:
            current || next ? p.hour * 60 + p.minute : minute(s.day_start),
          timezone: zone,
        };
      }
      if (old.day_start !== s.day_start && oldZone === zone) {
        const d = zoned(new Date(effectiveAt), zone);
        a = {
          effectiveAt,
          anchorLocalDate: d.toPlainDate().toString(),
          anchorLocalMinute: a?.anchorLocalMinute ?? minute(old.day_start),
          resetLocalDate: zoned(now, zone)
            .toPlainDate()
            .add({ days: 1 })
            .toString(),
          resetLocalMinute: minute(s.day_start),
          timezone: zone,
        };
      }
      if (oldZone !== zone || !a) {
        a = {
          effectiveAt,
          anchorLocalDate: zoned(new Date(effectiveAt))
            .toPlainDate()
            .toString(),
          anchorLocalMinute: minute(s.day_start),
          timezone: zone,
        };
      }
      await setMeta(tx, "schedule_anchor", JSON.stringify(a));
      await setMeta(tx, "schedule_effective_at", effectiveAt);
      await rebuildFutureSlots(tx, effectiveAt);
      await ensureSlotHorizonTx(tx, now, new Date(effectiveAt));
    }
    await setMeta(
      tx,
      "schedule_revision",
      String(Number((await getMeta(tx, "schedule_revision")) ?? 0) + 1),
    );
    await setMeta(tx, "schedule_dirty", "true");
    return { settings: s, effectiveAt };
  });
}

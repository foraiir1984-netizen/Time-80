import type { NotificationResponse, Notification } from "expo-notifications";
import { readSnapshot } from "../db/connection";
import type { Slot } from "../types/domain";
import { parseNotificationPayload, responseKey } from "./notificationContracts";
export type Resolution =
  | {
      kind: "resolved";
      slot: Slot;
      entryState: "logged" | "skipped" | "pending";
    }
  | { kind: "unresolved"; reason: string };
export async function resolveNotificationTarget(
  notification: Notification,
): Promise<Resolution> {
  const parsed = parseNotificationPayload(
    notification.request.content.data ?? {},
    notification.request.identifier,
  );
  if (parsed.kind === "unresolved") return parsed;
  return readSnapshot(async (tx) => {
    const slot = await tx.getFirstAsync<Slot>(
      "SELECT * FROM expected_slots WHERE period_start=? AND period_end=?",
      parsed.period.start,
      parsed.period.end,
    );
    if (!slot) return { kind: "unresolved", reason: "missing-slot" };
    if (
      slot.duration_minutes * 60000 !==
      +new Date(slot.period_end) - +new Date(slot.period_start)
    )
      return { kind: "unresolved", reason: "conflicting-fields" };
    const entry = await tx.getFirstAsync<{ status: string }>(
      "SELECT status FROM time_entries WHERE period_start=?",
      slot.period_start,
    );
    return {
      kind: "resolved",
      slot,
      entryState:
        entry?.status === "logged"
          ? "logged"
          : slot.state === "skipped"
            ? "skipped"
            : "pending",
    };
  });
}
export function createResponseCoordinator(handlers: {
  resolve: (n: Notification) => Promise<Resolution>;
  route: (r: Resolution) => Promise<void>;
  dismiss: (r: NotificationResponse) => Promise<void>;
  ack: (key: string) => Promise<void>;
  error: (e: unknown) => void;
}) {
  const pending = new Map<
      string,
      { response: NotificationResponse; routed: boolean; dismissed: boolean }
    >(),
    done = new Set<string>();
  let ready = false,
    running = false;
  async function drain() {
    if (!ready || running) return;
    running = true;
    try {
      for (const [key, item] of pending) {
        try {
          if (!item.routed) {
            if (
              item.response.notification.request.content.data?.kind !==
              "time80-test"
            )
              await handlers.route(
                await handlers.resolve(item.response.notification),
              );
            item.routed = true;
          }
          if (!item.dismissed) {
            try {
              await handlers.dismiss(item.response);
              item.dismissed = true;
            } catch (e) {
              handlers.error(e);
              continue;
            }
          }
          await handlers.ack(key);
          done.add(key);
          pending.delete(key);
        } catch (e) {
          handlers.error(e);
          break;
        }
      }
    } finally {
      running = false;
    }
  }
  return {
    enqueue(r: NotificationResponse) {
      if (
        !String(r.notification.request.content.data?.kind ?? "").startsWith(
          "time80-",
        )
      )
        return;
      const key = responseKey(r);
      if (!done.has(key) && !pending.has(key))
        pending.set(key, { response: r, routed: false, dismissed: false });
      void drain();
    },
    setReady(v: boolean) {
      ready = v;
      void drain();
    },
    retry: drain,
    size: () => pending.size,
  };
}

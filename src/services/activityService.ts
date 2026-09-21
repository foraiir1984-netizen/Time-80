import { db } from "../db/connection";
import { getActivities } from "../db/database";
import type { Activity } from "../types/domain";
import { zoned, iso } from "../utils/slots";
export async function getRankedActivities(now = new Date()) {
  const start = iso(zoned(now).startOfDay().subtract({ days: 6 }));
  const top4 = await (
    await db()
  ).getAllAsync<Activity>(
    `SELECT a.* FROM activities a JOIN time_entries e ON a.id=e.activity_id WHERE a.is_archived=0 AND e.status='logged' AND e.period_start>=? AND e.period_start<=? GROUP BY a.id ORDER BY COUNT(*) DESC,MAX(e.period_start) DESC,a.sort_order,a.id LIMIT 4`,
    start,
    now.toISOString(),
  );
  return { top4, allActivities: await getActivities() };
}

import type { SQL, Assignment } from "../types/domain";
import { SCHEME } from "../services/classificationDataset";
export async function resolveEntryClassification(tx: SQL, entryId: number) {
  return tx.getFirstAsync<Assignment>(
    "SELECT * FROM entry_classifications WHERE entry_id=? AND scheme_id=? AND is_current=1",
    entryId,
    SCHEME,
  );
}
export async function assignEntryClassification(
  tx: SQL,
  entryId: number,
  expected: number | null,
  value: Pick<
    Assignment,
    "code" | "method" | "source_activity_id" | "default_revision"
  >,
  reason: string | null = null,
) {
  const prev = await resolveEntryClassification(tx, entryId);
  if ((prev?.revision ?? null) !== expected)
    throw Error("اطلاعات دسته تغییر کرده؛ صفحه را تازه کن");
  if (
    value.code &&
    !(await tx.getFirstAsync(
      "SELECT code FROM classification_nodes WHERE scheme_id=? AND code=?",
      SCHEME,
      value.code,
    ))
  )
    throw Error("دسته نامعتبر است");
  if (
    prev &&
    ["code", "method", "source_activity_id", "default_revision"].every(
      (k) => (prev as any)[k] === (value as any)[k],
    )
  )
    return prev;
  if (prev)
    await tx.runAsync(
      "UPDATE entry_classifications SET is_current=0 WHERE id=?",
      prev.id,
    );
  await tx.runAsync(
    "INSERT INTO entry_classifications(entry_id,scheme_id,code,revision,is_current,supersedes_id,method,source_activity_id,default_revision,assigned_at,reason) VALUES(?,?,?,?,1,?,?,?,?,?,?)",
    entryId,
    SCHEME,
    value.code,
    (prev?.revision ?? 0) + 1,
    prev?.id ?? null,
    value.method,
    value.source_activity_id,
    value.default_revision,
    new Date().toISOString(),
    reason,
  );
  return (await resolveEntryClassification(tx, entryId))!;
}

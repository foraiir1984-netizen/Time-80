import dataset from "../data/icatus2016.json";
import translation from "../data/icatus-fa.json";
import type { Node } from "../types/domain";
export { dataset, translation };
export const SCHEME = "ICATUS:2016";
export function validateClassificationDataset() {
  const nodes: Node[] = JSON.parse(dataset.canonical),
    seen = new Map(nodes.map((n) => [n.code, n]));
  if (
    seen.size !== 230 ||
    [1, 2, 3].some(
      (l, i) => nodes.filter((n) => n.level === l).length !== [9, 56, 165][i],
    )
  )
    throw Error("فرهنگ ICATUS ناقص است");
  for (const n of nodes) {
    if (n.code.length !== n.level || !/^\d{1,3}$/.test(n.code))
      throw Error("کد نامعتبر");
    if (
      n.level === 1
        ? n.parent_code !== null
        : seen.get(n.parent_code ?? "")?.level !== n.level - 1
    )
      throw Error("والد نامعتبر");
  }
  const fa: Record<string, string> = JSON.parse(translation.canonical);
  return nodes.map((n) => ({ ...n, title_fa: fa[n.code] }));
}
export const nodes = validateClassificationDataset();
export function rootCode(code: string | null) {
  if (!code) return null;
  let n = nodes.find((n) => n.code === code);
  while (n?.parent_code) n = nodes.find((x) => x.code === n!.parent_code);
  return n?.code ?? null;
}

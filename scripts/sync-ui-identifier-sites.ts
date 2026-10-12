import ts from "typescript";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { collectUiIdentifierUses } from "./inspect-ui-identifiers";
import {
  uiIdentifiers,
  type UiIdentifierKey,
} from "../src/components/uiIdentifiers";

// Authoring utility: updates locations only. Explicit keys/codes/names/effects
// and history are never allocated or rewritten by this script.
const file = resolve("src/components/uiIdentifiers.ts"),
  source = readFileSync(file, "utf8");
const ast = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  ),
  uses = collectUiIdentifierUses();
const changes: { start: number; end: number; text: string }[] = [];
function visit(node: ts.Node) {
  if (
    ts.isPropertyAssignment(node) &&
    node.name.getText(ast) === "sites" &&
    ts.isPropertyAssignment(node.parent.parent)
  ) {
    const key = node.parent.parent.name.getText(ast) as UiIdentifierKey,
      e = uiIdentifiers[key];
    if (e?.status === "active") {
      const sites = uses
        .filter((u) => u.key === key)
        .map((u) => `${u.file}:${u.line} (${u.context})`);
      if (!sites.length) throw Error(`No source sites for ${e.code}`);
      changes.push({
        start: node.initializer.getStart(ast),
        end: node.initializer.end,
        text: JSON.stringify(sites),
      });
    }
  }
  ts.forEachChild(node, visit);
}
visit(ast);
let updated = source;
for (const change of changes.sort((a, b) => b.start - a.start))
  updated =
    updated.slice(0, change.start) + change.text + updated.slice(change.end);
writeFileSync(file, updated);

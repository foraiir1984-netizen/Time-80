import ts from "typescript";
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  uiIdentifiers,
  type UiIdentifierKey,
} from "../src/components/uiIdentifiers";

export type UiSourceUse = {
  key: UiIdentifierKey;
  code: string;
  file: string;
  line: number;
  context: string;
};
export function collectUiIdentifierUses(root = process.cwd()): UiSourceUse[] {
  const files = [
    "App.tsx",
    ...["src/screens", "src/components"].flatMap((dir) =>
      readdirSync(resolve(root, dir))
        .filter((f) => f.endsWith(".tsx"))
        .map((f) => `${dir}/${f}`),
    ),
  ];
  const uses: UiSourceUse[] = [];
  for (const file of files) {
    const ast = ts.createSourceFile(
      file,
      readFileSync(resolve(root, file), "utf8"),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    function context(node: ts.Node) {
      let n: ts.Node | undefined = node,
        property = "";
      while (n) {
        if (ts.isJsxAttribute(n))
          return `${(n.parent.parent as ts.JsxOpeningElement).tagName.getText(ast)}.${n.name.getText(ast)}`;
        if (ts.isPropertyAssignment(n) && !property)
          property = n.name.getText(ast);
        if (
          ts.isVariableDeclaration(n) &&
          ["modeCodes", "stackPageCodes"].includes(n.name.getText(ast))
        )
          return `${n.name.getText(ast)}.${property}`;
        if (
          ts.isCallExpression(n) &&
          n.expression.getText(ast) === "identifierAlert"
        )
          return `identifierAlert${property ? `.${property}` : ".title"}`;
        n = n.parent;
      }
      return "shared component default";
    }
    function visit(node: ts.Node) {
      if (
        ts.isPropertyAccessExpression(node) &&
        node.name.text === "code" &&
        ts.isPropertyAccessExpression(node.expression) &&
        node.expression.expression.getText(ast) === "uiIdentifiers"
      ) {
        const key = node.expression.name.text as UiIdentifierKey,
          e = uiIdentifiers[key];
        if (!e) throw Error(`Unknown registry key ${key} at ${file}`);
        const place = context(node);
        // Main's native stack header is explicitly hidden; it is not a display site.
        if (place !== "stackPageCodes.Main")
          uses.push({
            key,
            code: e.code,
            file,
            line:
              ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1,
            context: place,
          });
      }
      ts.forEachChild(node, visit);
    }
    visit(ast);
  }
  return uses;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const out = resolve(process.argv[2] ?? "docs/v0.3/rc3-id01");
  mkdirSync(out, { recursive: true });
  const uses = collectUiIdentifierUses();
  writeFileSync(
    resolve(out, "current-source-uses.json"),
    JSON.stringify(
      {
        note: "Source bindings, not runtime/native evidence. Generic badge propagation and repeated controls are covered by behavior tests.",
        uses,
      },
      null,
      2,
    ) + "\n",
  );
  for (const e of Object.values(uiIdentifiers)) {
    if (e.status === "active" && !uses.some((u) => u.code === e.code))
      throw Error(`Missing source binding ${e.code}`);
    if (e.status !== "active" && uses.some((u) => u.code === e.code))
      throw Error(`Reserved/retired binding ${e.code}`);
  }
  console.log(
    `${Object.values(uiIdentifiers).length} allocations, ${uses.length} explicit source bindings; reserved codes have no binding.`,
  );
}

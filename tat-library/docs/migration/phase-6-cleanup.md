# Phase 6 cleanup report

## Removed / retired syntax paths

- Removed `@reduce` from AST/parser/runtime directive surfaces.
- Removed `ReduceExprNode` and the terminal graph `ReduceExpr` branch.
- Removed old compute-style `@derive.count`, `@derive.edgeCount`, `@derive.exists`, `@derive.sum`, `@derive.min`, `@derive.max`, `@derive.avg`, and `@derive.abs` directive surfaces.
- Kept canonical `@compute.*` forms for calculations/reductions.
- Removed `@select.one` directive surfaces; canonical form is `@select.only`.
- Removed old `@match(root: relation: child)` parser compatibility path.
- Removed old block-style `@query { ... }` parser compatibility path.
- Removed old `@project ... { ... }` / `@project { ... }` parser compatibility path.
- Removed old projection V1 test file that encoded retired projection syntax.
- Removed stale VSCode `.vsix` package artifacts and stale compiled `dist/` output so the extension must be rebuilt from canonical source.

## Canonical forms retained

- `@query(node, { state: key }, { equals: value })`
- `@query(node, { meta: key }, { equals: value })`
- `@query(subject, { relation: relationName }, object)`
- `@match(edge)`
- `@match({ from, relation, to })`
- `@where(expression)`
- `@path.has`, `@path.first`, `@path.count`, `@path.through`
- `@select.only` and `@select.from(candidates) { where: @where(...) }`
- `@project(formatOrProjection, focus)`
- `@compute.*` for reductions/calculations

## Notes

- `all-directives-expanded.tat` remains a parse/validate smoke fixture, not a runtime fixture.
- `tat-vscode/dist/extension.js` is intentionally not included because it would be stale in this generated zip. Run `npm install && npm run compile` inside `tat-vscode/` locally.

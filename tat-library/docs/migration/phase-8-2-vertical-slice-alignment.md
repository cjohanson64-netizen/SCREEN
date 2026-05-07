# Phase 8.2 Vertical Slice Alignment

This pass reorganized `parser/`, `lexer/`, and `runtime/` toward the same semantic vertical-slice standard used by `ast/`.

## Goals

- Remove vague `core/` and legacy `projection/` folders where possible.
- Rename files to match canonical directive names.
- Move control-flow directives out of `action/` folders.
- Keep behavior unchanged while improving file placement.

## Parser changes

Canonical directive parser folders now include:

```txt
parser/directives/
  action/
    action.define.ts
    action.apply.ts
  control/
    if.ts
    repeat.ts
    when.ts
  graph/
    seed.ts
    compose.ts
    effect.ts
    graph.ts
  path/
    path.ts
  project/
    project.define.ts
    project.apply.ts
  query/
    query.ts
    match.edge.ts
    where.ts
    why.ts
    how.ts
```

## Lexer changes

Directive keyword groups now use semantic families:

```txt
lexer/tokens/directives/
  action.ts
  control.ts
  graph.ts
  inject.ts
  path.ts
  project.ts
  query.ts
  value.ts
```

`core.ts` and `projection.ts` were removed from lexer directive tokens.

## Runtime directive metadata changes

Directive descriptor files now mirror canonical families:

```txt
runtime/directives/
  action/
    action.define.ts
    action.apply.ts
  control/
    if.ts
    repeat.ts
    when.ts
  graph/
    seed.ts
    compose.ts
    effect.ts
    graph.ts
  path/
    path.ts
  project/
    project.define.ts
    project.apply.ts
  query/
    query.ts
    match.edge.ts
    where.ts
    why.ts
    how.ts
```

## Runtime execute changes

Execution helpers now move away from vague placement:

```txt
runtime/execute/control/
  if.ts
  repeat.ts
  when.ts

runtime/execute/action/
  applyAction.ts

runtime/execute/query/
  why.ts
```

`runtime/execute/ctx/` remains for now because legacy `CtxSetExpr` / `CtxClearExpr` cases still exist in the runtime action and graph-pipeline executor. It should be deleted only after those AST/runtime cases are fully retired.

## Validation

The following commands passed in this pass:

```bash
npx tsx run-module.ts tests/all-directives-expanded.tat --timing
npx tsx run-module.ts tests/semantic-directives-demo.tat --timing
npx tsx run-module.ts tests/phase7/import-compose-main.tat --timing
```

`npx tsc --noEmit` could not be run in the container because Node typings are unavailable in this environment, but no runtime import failures appeared in the validated fixtures.

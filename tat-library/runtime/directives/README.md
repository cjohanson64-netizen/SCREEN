# Runtime Directives

This folder is the runtime navigation layer for TAT directives.

Each directive has a source-aligned file path:

```txt
@derive.state  -> runtime/directives/derive/derive.state.ts
@graft.branch  -> runtime/directives/graft/graft.branch.ts
@ctx.set        -> runtime/directives/ctx/ctx.set.ts
@graph          -> runtime/directives/graph/graph.ts
```

The refactor keeps parser and lexer behavior stable. The directive files expose a typed `DirectiveDefinition` registry so runtime code, tooling, docs, tests, and future validator work can refer to directives through one source-aligned map.

## Current boundary

This pass does three things:

- adds a source-aligned directive module for each known directive
- groups directives by semantic/runtime family
- moves the simple action-pipeline mutation handlers for runtime/graft/prune/ctx directives out of `executeAction.ts`

`executeAction.ts` still owns orchestration, guard evaluation, `@repeat`, `@if`, and `@apply` behavior. Future passes can move those remaining action/control directives and then repeat the same pattern for graph-pipeline/program execution.

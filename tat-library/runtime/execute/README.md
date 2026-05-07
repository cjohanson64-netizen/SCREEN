# Runtime Execute Layer

This folder is the directive-facing runtime layer.

Directive files should stay thin when possible. If a directive needs deeper machinery, the implementation should live in the matching runtime subsystem:

- `execute/core/where.ts` delegates to `runtime/query/executeWhere.ts`
- `execute/graph/graph.ts` delegates to `runtime/graph/*`
- `execute/projection/project.ts` delegates to `runtime/projection/*`
- mutation directives such as `@graft.branch`, `@prune.state`, and `@ctx.set` live directly under their execute family folders because their behavior is currently small and concrete.

# Canonical TAT Syntax Update Notes

This folder has been updated to the current canonical TAT direction.

## Locked canonical forms

- Prefer bound graph seeds:
  - `graphName := @seed { ... }`
  - Unbound `@seed { ... }` is allowed only as a quick/demo shorthand and should trigger tooling guidance.
- Projection family:
  - `@project.define(Name, focus) { ... }`
  - `graph <> @project.apply(Name, focus)`
- Action family:
  - `@action.define(actionName) { when, do, project }`
  - `@action.apply(actionName)`
- Value family:
  - `@value.define(valueScopeName) { key: expression, }`
- Effects:
  - `@effect { -> ... }`
  - No separate `target` or `ops` list.
- Pipelines:
  - Every executable pipeline step starts with `->`.
- Object-like bodies:
  - Key-value entries are comma-separated.

## Retired as canonical

- `@seed:`
- `@projection ...`
- `@project(...)`
- `@action(...)`
- `@apply(...)`
- `@effect(target, ops)`
- `pipeline:` executable bodies
- `@bind.ctx`, `@bind.state`, `@bind.meta` variants
- `@ctx.set`, `@ctx.clear`
- object-wrapper `@query(...)`, `@match(...)`, `@path(...)`

## Updated in this pass

- `tests/all-directives-expanded.tat` now starts with bound seeded graphs instead of a free-standing seed.
- Major fixtures in `tests/` were migrated away from `@seed:`, `pipeline:`, and `@effect(target, ops)`.
- VSCode extension metadata, snippets, highlighting, and diagnostics were refreshed for the current canonical syntax.
- Runtime action history/error strings now refer to `@action.apply` instead of legacy `@apply` where applicable.

## Still worth a later deeper cleanup

- Some internal AST/runtime files still contain legacy compatibility types/helpers, especially around old context mutation and traversal-apply internals.
- A future deletion pass can remove unreachable legacy parser/runtime branches after a broader regression suite is added.
- The next performance-oriented pass should add runtime timing instrumentation, then root AST/injection fragment parse caching.

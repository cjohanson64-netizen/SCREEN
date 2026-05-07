# TAT Parser

The parser is being split into explicit language-structure nodes.

- `core/` contains the current parser engine and public parse mechanics.
- `symbols/` names structural token roles: open, close, separators, operators.
- `directives/` names directive-level parse shapes.
- `expressions/` reserves homes for reusable grammar pieces.
- `errors/` names parser error concepts that can later feed the VSCode linter and runtime logs.

This pass preserves parser behavior while making the grammar graph visible.

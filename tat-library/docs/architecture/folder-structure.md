# TAT folder-structure target

Phase 6 keeps the project organized around the language pipeline:

```txt
lexer -> parser -> ast -> validation -> runtime execution -> projection/explanation/history
```

## Layer responsibilities

- `lexer/`: token definitions and tokenization only.
- `parser/`: grammar and normalized AST construction.
- `ast/`: semantic node contracts.
- `runtime/validation/`: semantic correctness checks.
- `runtime/execute/`: execution behavior.
- `runtime/graph/`: graph data model, mutation, history, interaction, and composition helpers.
- `runtime/projection/`: semantic projection formats and named projection execution.
- `runtime/query/`: query and predicate evaluation helpers.
- `tat-vscode/`: editor support for canonical language syntax.
- `tests/`: syntax fixtures and semantic/runtime fixtures.

## Directive-family traceability

Each canonical directive should be easy to trace across layers. For example:

```txt
@query
  ast/query/GraphQueryExprNode.ts
  parser/core/Parser.ts or parser/directives/query/*
  runtime/validation/expressions/expressionValidators.ts
  runtime/query/executeQuery.ts
  tests/all-directives-expanded.tat
  tat-vscode/src/extension.ts
```

Phase 6 removes stale legacy syntax paths first. Larger folder moves should remain behavior-preserving and should only happen when a file has an obvious semantic home.

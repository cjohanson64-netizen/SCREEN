# TAT AST

The AST is TAT's semantic contract with JavaScript/TypeScript.

- `lexer/` recognizes tokens.
- `parser/` arranges tokens into syntax.
- `ast/` names the semantic shapes produced by the parser.
- `runtime/` interprets those shapes.

This folder now treats each AST file as a semantic node. Union files such as `StatementNode`, `ValueExprNode`, `MutationExprNode`, `QueryExprNode`, `DeriveExprNode`, and `EffectOpNode` act like semantic edges: they describe which node shapes are valid in a given position.

`nodeTypes.ts` is intentionally preserved as a compatibility surface while imports are migrated gradually to the explicit node files.

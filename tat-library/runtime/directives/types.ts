export type DirectiveFamily =
  | "core"
  | "projection"
  | "graph"
  | "action"
  | "bind"
  | "ctx"
  | "runtime"
  | "graft"
  | "prune"
  | "derive"
  | "compute"
  | "select";

export type DirectiveRuntimeSurface =
  | "program"
  | "graph-pipeline"
  | "action-pipeline"
  | "graph-control"
  | "projection"
  | "binding"
  | "parser-only";

export interface DirectiveDefinition {
  /** The source-level directive spelling. */
  name: string;

  /** Runtime navigation family. Mirrors runtime/directives/<family>. */
  family: DirectiveFamily;

  /** AST node type or parser construct that represents the directive. */
  astNode: string;

  /** Where this directive is evaluated today. */
  runtimeSurface: DirectiveRuntimeSurface | DirectiveRuntimeSurface[];

  /** Human-readable responsibility. Kept short so this file stays navigational. */
  responsibility: string;

  /** Optional notes for unsupported/partial runtime behavior. */
  notes?: string;
}

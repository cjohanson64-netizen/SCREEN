import { ACTION_DIRECTIVES } from "./action.js";
import { BIND_DIRECTIVES } from "./bind.js";
import { COMPUTE_DIRECTIVES } from "./compute.js";
import { CONTROL_DIRECTIVES } from "./control.js";
import { CTX_DIRECTIVES } from "./ctx.js";
import { DERIVE_DIRECTIVES } from "./derive.js";
import { GRAFT_DIRECTIVES } from "./graft.js";
import { GRAPH_DIRECTIVES } from "./graph.js";
import { INJECT_DIRECTIVES } from "./inject.js";
import { PATH_DIRECTIVES } from "./path.js";
import { PROJECT_DIRECTIVES } from "./project.js";
import { PRUNE_DIRECTIVES } from "./prune.js";
import { QUERY_DIRECTIVES } from "./query.js";
import { RUNTIME_DIRECTIVES } from "./runtime.js";
import { SELECT_DIRECTIVES } from "./select.js";
import { VALUE_DIRECTIVES } from "./value.js";

export {
  ACTION_DIRECTIVES,
  BIND_DIRECTIVES,
  COMPUTE_DIRECTIVES,
  CONTROL_DIRECTIVES,
  CTX_DIRECTIVES,
  DERIVE_DIRECTIVES,
  GRAFT_DIRECTIVES,
  GRAPH_DIRECTIVES,
  INJECT_DIRECTIVES,
  PATH_DIRECTIVES,
  PROJECT_DIRECTIVES,
  PRUNE_DIRECTIVES,
  QUERY_DIRECTIVES,
  RUNTIME_DIRECTIVES,
  SELECT_DIRECTIVES,
  VALUE_DIRECTIVES,
};

export const KEYWORDS = new Set<string>([
  ...ACTION_DIRECTIVES,
  ...BIND_DIRECTIVES,
  ...COMPUTE_DIRECTIVES,
  ...CONTROL_DIRECTIVES,
  ...CTX_DIRECTIVES,
  ...DERIVE_DIRECTIVES,
  ...GRAFT_DIRECTIVES,
  ...GRAPH_DIRECTIVES,
  ...INJECT_DIRECTIVES,
  ...PATH_DIRECTIVES,
  ...PROJECT_DIRECTIVES,
  ...PRUNE_DIRECTIVES,
  ...QUERY_DIRECTIVES,
  ...RUNTIME_DIRECTIVES,
  ...SELECT_DIRECTIVES,
  ...VALUE_DIRECTIVES,
]);

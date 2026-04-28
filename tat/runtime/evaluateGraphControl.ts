export const LOOP_SAFETY_CAP = 1000;
export const REACTIVE_TRIGGER_SAFETY_CAP = 1000;

export type { GraphControlScope } from "./graphControl/types.js";
export { evaluateGraphQuery } from "./graphControl/queryEvaluator.js";
export { evaluateGraphControlExpr } from "./graphControl/controlEvaluator.js";
export { evaluateLoopCount } from "./graphControl/loopEvaluator.js";
export {
  evaluateDeriveAbs,
  evaluateDeriveAvg,
  evaluateDeriveCollect,
  evaluateDeriveCount,
  evaluateDeriveEdgeCount,
  evaluateDeriveExists,
  evaluateDeriveExpr,
  evaluateDeriveMax,
  evaluateDeriveMeta,
  evaluateDeriveMin,
  evaluateDeriveState,
  evaluateDeriveSum,
} from "./graphControl/deriveEvaluator.js";
export { evaluateDerivePath } from "./graphControl/pathTraversal.js";

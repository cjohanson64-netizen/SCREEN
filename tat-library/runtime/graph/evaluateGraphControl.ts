export const LOOP_SAFETY_CAP = 1000;
export const REACTIVE_TRIGGER_SAFETY_CAP = 1000;

export type { GraphControlScope } from "../graphControl/types.js";
export { evaluateGraphQuery } from "../graphControl/queryEvaluator.js";
export { evaluateGraphControlExpr } from "../graphControl/controlEvaluator.js";
export { evaluateRepeatCount } from "../graphControl/repeatEvaluator.js";
export {
  evaluateComputeAbs,
  evaluateComputeAvg,
  evaluateDeriveCollect,
  evaluateComputeCount,
  evaluateComputeEdgeCount,
  evaluateComputeExists,
  evaluateDeriveExpr,
  evaluateComputeMax,
  evaluateDeriveMeta,
  evaluateComputeMin,
  evaluateDeriveState,
  evaluateComputeSum,
} from "../graphControl/deriveEvaluator.js";
export { evaluateDerivePath } from "../graphControl/pathTraversal.js";

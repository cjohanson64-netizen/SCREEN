import type { ActionPipelineStepNode } from "../../../ast/nodeTypes.js";
import { evaluateRepeatCount } from "../../graphControl/repeatEvaluator.js";
import { LOOP_SAFETY_CAP } from "../../graphControl/constants.js";
import type { ActionPipelineDirectiveContext } from "../actionPipelineContext.js";

export function executeRepeatAction(
  repeat: Extract<ActionPipelineStepNode, { type: "RepeatExpr" }>,
  context: ActionPipelineDirectiveContext,
): void {
  if (!repeat.pipeline.length) {
    throw new Error("@repeat requires a pipeline section");
  }

  if (!repeat.count) {
    throw new Error("@repeat requires an iteration count");
  }

  const count = evaluateRepeatCount(context.graph, repeat.count, { scope: context.scope });

  for (let iteration = 0; iteration < count; iteration += 1) {
    if (iteration >= LOOP_SAFETY_CAP) {
      throw new Error(`@repeat exceeded safety cap of ${LOOP_SAFETY_CAP} iterations`);
    }

    context.executePipeline(repeat.pipeline);
  }
}

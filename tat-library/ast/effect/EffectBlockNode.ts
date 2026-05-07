import type { BaseNode } from "../core/BaseNode.js";
import type { GraphPipelineStepNode } from "../action/GraphPipelineStepNode.js";

export interface EffectBlockNode extends BaseNode {
  type: "EffectBlock";
  name: "@effect";
  pipeline: GraphPipelineStepNode[];
}

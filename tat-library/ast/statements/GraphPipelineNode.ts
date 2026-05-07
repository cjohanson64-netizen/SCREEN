import type { BaseNode } from "../core/BaseNode.js";
import type { IdentifierNode } from "../literals/IdentifierNode.js";
import type { GraphSourceNode } from "../graph/GraphSourceNode.js";
import type { GraphPipelineStepNode } from "../action/GraphPipelineStepNode.js";
import type { TerminalGraphExprNode } from "../projection/TerminalGraphExprNode.js";

export interface GraphPipelineNode extends BaseNode {
  type: "GraphPipeline";
  name: IdentifierNode;
  source: GraphSourceNode;
  mutations: GraphPipelineStepNode[];
  projection: TerminalGraphExprNode | null;
}

import type { MutationExprNode } from "../mutation/MutationExprNode.js";
import type { IfExprNode } from "./IfExprNode.js";
import type { WhenExprNode } from "./WhenExprNode.js";
import type { RepeatExprNode } from "./RepeatExprNode.js";
import type { GraphInjectionStepNode } from "./GraphInjectionStepNode.js";

export type GraphPipelineStepNode = MutationExprNode | IfExprNode | WhenExprNode | RepeatExprNode | GraphInjectionStepNode;

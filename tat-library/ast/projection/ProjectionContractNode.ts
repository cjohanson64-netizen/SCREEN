import type { BaseNode } from "../core/BaseNode.js";

export interface ProjectionContractNode extends BaseNode {
  type: "ProjectionContract";
  entries: ProjectionContractFieldNode[];
}

export interface ProjectionContractFieldNode extends BaseNode {
  type: "ProjectionContractField";
  key: string;
  requirement: "required" | "optional";
}

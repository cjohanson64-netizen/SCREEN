import type { ImportDeclarationNode } from "./ImportDeclarationNode.js";
import type { ExportDeclarationNode } from "./ExportDeclarationNode.js";
import type { BindStatementNode } from "./BindStatementNode.js";
import type { ValueBindingNode } from "./ValueBindingNode.js";
import type { OperatorBindingNode } from "./OperatorBindingNode.js";
import type { ProjectionDefNode } from "../projection/ProjectionDefNode.js";
import type { SeedBlockNode } from "./SeedBlockNode.js";
import type { GraphPipelineNode } from "./GraphPipelineNode.js";
import type { GraphProjectionNode } from "./GraphProjectionNode.js";
import type { WhenExprNode } from "../action/WhenExprNode.js";
import type { GraphInteractionDefinitionNode } from "./GraphInteractionDefinitionNode.js";
import type { SystemRelationNode } from "./SystemRelationNode.js";
import type { QueryStatementNode } from "./QueryStatementNode.js";
import type { TopLevelInjectionStatementNode } from "./TopLevelInjectionStatementNode.js";
import type { ValueDefNode } from "../value/ValueDefNode.js";

export type StatementNode =
  | ImportDeclarationNode
  | ExportDeclarationNode
  | BindStatementNode
  | ValueBindingNode
  | OperatorBindingNode
  | ProjectionDefNode
  | SeedBlockNode
  | GraphPipelineNode
  | GraphProjectionNode
  | WhenExprNode
  | GraphInteractionDefinitionNode
  | SystemRelationNode
  | QueryStatementNode
  | TopLevelInjectionStatementNode
  | ValueDefNode;

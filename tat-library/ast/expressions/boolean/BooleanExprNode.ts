import type { IdentifierNode } from "../../literals/IdentifierNode.js";
import type { StringLiteralNode } from "../../literals/StringLiteralNode.js";
import type { NumberLiteralNode } from "../../literals/NumberLiteralNode.js";
import type { BooleanLiteralNode } from "../../literals/BooleanLiteralNode.js";
import type { RegexLiteralNode } from "../../literals/RegexLiteralNode.js";
import type { PropertyAccessNode } from "../PropertyAccessNode.js";
import type { DeriveStateExprNode } from "../../derive/DeriveStateExprNode.js";
import type { DeriveMetaExprNode } from "../../derive/DeriveMetaExprNode.js";
import type { ComputeCountExprNode } from "../../compute/ComputeCountExprNode.js";
import type { ComputeEdgeCountExprNode } from "../../compute/ComputeEdgeCountExprNode.js";
import type { ComputeExistsExprNode } from "../../compute/ComputeExistsExprNode.js";
import type { DerivePathExprNode } from "../../derive/DerivePathExprNode.js";
import type { DeriveCollectExprNode } from "../../derive/DeriveCollectExprNode.js";
import type { ComputeSumExprNode } from "../../compute/ComputeSumExprNode.js";
import type { ComputeMinExprNode } from "../../compute/ComputeMinExprNode.js";
import type { ComputeMaxExprNode } from "../../compute/ComputeMaxExprNode.js";
import type { ComputeAvgExprNode } from "../../compute/ComputeAvgExprNode.js";
import type { ComputeAbsExprNode } from "../../compute/ComputeAbsExprNode.js";
import type { DeriveBinaryExprNode } from "../../derive/DeriveBinaryExprNode.js";
import type { BinaryBooleanExprNode } from "./BinaryBooleanExprNode.js";
import type { UnaryBooleanExprNode } from "./UnaryBooleanExprNode.js";
import type { ComparisonExprNode } from "./ComparisonExprNode.js";
import type { GroupedBooleanExprNode } from "./GroupedBooleanExprNode.js";

export type BooleanExprNode =
  | BinaryBooleanExprNode
  | UnaryBooleanExprNode
  | ComparisonExprNode
  | GroupedBooleanExprNode
  | PropertyAccessNode
  | IdentifierNode
  | StringLiteralNode
  | NumberLiteralNode
  | BooleanLiteralNode
  | RegexLiteralNode
  | DeriveStateExprNode
  | DeriveMetaExprNode
  | ComputeCountExprNode
  | ComputeEdgeCountExprNode
  | ComputeExistsExprNode
  | DerivePathExprNode
  | DeriveCollectExprNode
  | ComputeSumExprNode
  | ComputeMinExprNode
  | ComputeMaxExprNode
  | ComputeAvgExprNode
  | ComputeAbsExprNode
  | DeriveBinaryExprNode;

import type { Token, TokenType } from "../../../lexer/tokenize.js";
import type {
  ActionExprNode,
  ActionGuardExprNode,
  ActionPipelineStepNode,
  ActionProjectExprNode,
  ApplyExprNode,
  ActionSegmentNode,
  ArgumentNode,
  ArrayLiteralNode,
  BaseNode,
  BindEntity,
  BindLayer,
  BindStatementNode,
  BinaryBooleanExprNode,
  BooleanExprNode,
  BooleanLiteralNode,
  BooleanValueNode,
  ComparisonExprNode,
  ComposeExprNode,
  CurrentValueNode,
  CtxClearExprNode,
  CtxExprNode,
  ComputeCountExprNode,
  DeriveBinaryExprNode,
  DeriveCollectExprNode,
  ComputeEdgeCountExprNode,
  DeriveExprNode,
  ComputeExistsExprNode,
  DerivePathExprNode,
  ComputeSumExprNode,
  ComputeMinExprNode,
  ComputeMaxExprNode,
  ComputeAvgExprNode,
  ComputeAbsExprNode,
  DirectiveCallExprNode,
  CtxSetExprNode,
  EdgeExprNode,
  EffectBlockNode,
  DeriveMetaExprNode,
  DeriveStateExprNode,
  EffectDeriveMetaOpNode,
  EffectDeriveStateOpNode,
  EffectGraftMetaOpNode,
  EffectGraftStateOpNode,
  EffectOpNode,
  EffectPruneMetaOpNode,
  EffectPruneStateOpNode,
  ExplicitGraphBridgeNode,
  ExportDeclarationNode,
  ExportSpecifierNode,
  GraftBranchExprNode,
  GraftMetaExprNode,
  GraftProgressExprNode,
  GraphControlExprNode,
  GraphInteractionDefinitionNode,
  GraphPipelineStepNode,
  GraphInjectionStepNode,
  GraphRefNode,
  GraftStateExprNode,
  GraphSourceNode,
  GraphPipelineNode,
  GraphProjectionNode,
  GraphQueryExprNode,
  AggregateQueryExprNode,
  GroupedBooleanExprNode,
  HowExprNode,
  IdentifierNode,
  ImplicitGraphBridgeNode,
  ImportDeclarationNode,
  ImportSpecifierNode,
  MatchExprNode,
  MutationExprNode,
  NodeCaptureNode,
  NodeShapeNode,
  NumberLiteralNode,
  ObjectLiteralNode,
  ObjectPropertyNode,
  OperatorBindingNode,
  OperatorExprNode,
  PathExprNode,
  ProjectionContractFieldNode,
  ProjectionContractNode,
  ProjectionDefNode,
  ProgramNode,
  ProjectExprNode,
  PropertyAccessNode,
  PreviousValueNode,
  PruneBranchExprNode,
  PruneEdgesExprNode,
  PruneMetaExprNode,
  PruneNodesExprNode,
  PruneStateExprNode,
  QueryExprNode,
  QueryStatementNode,
  RegexLiteralNode,
  RelationPatternNode,
  RuntimeGenerateNodeIdExprNode,
  RuntimeGenerateValueIdExprNode,
  RuntimeNextOrderExprNode,
  RuntimeAddNodeExprNode,
  RuntimeDeleteNodeExprNode,
  RuntimeUpdateNodeValueExprNode,
  RepeatCountExprNode,
  RepeatExprNode,
  IfExprNode,
  ChooseExprNode,
  InjectExprNode,
  SeedBlockNode,
  SeedEdgeBindingNode,
  SeedEdgeEntryNode,
  SeedNodeRefNode,
  SeedSourceNode,
  StatementNode,
  TopLevelInjectionStatementNode,
  StringLiteralNode,
  SystemRelationNode,
  TraversalExprNode,
  TraversalSegmentNode,
  UnaryBooleanExprNode,
  ValueBindingNode,
  ValueDefNode,
  ValueExprNode,
  WhenExprNode,
  WhereExprNode,
  WherePredicateNode,
  WhyExprNode,
  WhyTargetNode,
  WildcardNode,
  RootTargetNode,
  TerminalGraphExprNode,
  ComputeSourceNode,
} from "../../../ast/nodeTypes.js";

import { stripQuotes, splitRegexLiteral, identToToken, atomToToken, nodeToToken, makeNode } from "../../core/parserUtils.js";

export function parseRuntimeGenerateValueIdExprImpl(this: any): RuntimeGenerateValueIdExprNode {
    const start = this.expect("KEYWORD", "@runtime.generateValueId");
    this.skipNewlines();
    this.expect("LPAREN");
    this.skipNewlines();

    let prefix: StringLiteralNode | null = null;
    if (!this.checkType("RPAREN")) {
      prefix = this.parseStringLiteral();
      this.skipNewlines();
    }

    this.expect("RPAREN");

    return makeNode<RuntimeGenerateValueIdExprNode>(this, 
      "RuntimeGenerateValueIdExpr",
      {
        name: "@runtime.generateValueId",
        prefix,
      },
      start,
    );
  }

export function parseRuntimeGenerateNodeIdExprImpl(this: any): RuntimeGenerateNodeIdExprNode {
    const start = this.expect("KEYWORD", "@runtime.generateNodeId");
    this.skipNewlines();
    this.expect("LPAREN");
    this.skipNewlines();

    let prefix: StringLiteralNode | null = null;
    if (!this.checkType("RPAREN")) {
      prefix = this.parseStringLiteral();
      this.skipNewlines();
    }

    this.expect("RPAREN");

    return makeNode<RuntimeGenerateNodeIdExprNode>(this, 
      "RuntimeGenerateNodeIdExpr",
      {
        name: "@runtime.generateNodeId",
        prefix,
      },
      start,
    );
  }

export function parseRuntimeNextOrderExprImpl(this: any): RuntimeNextOrderExprNode {
    const start = this.expect("KEYWORD", "@runtime.nextOrder");
    this.skipNewlines();
    this.expect("LPAREN");
    this.skipNewlines();
    this.expect("RPAREN");

    return makeNode<RuntimeNextOrderExprNode>(this, 
      "RuntimeNextOrderExpr",
      {
        name: "@runtime.nextOrder",
      },
      start,
    );
  }


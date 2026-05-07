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

export function parseDirectiveCallExprImpl(this: any): DirectiveCallExprNode {
    const start = this.expectType("KEYWORD");
    this.skipNewlines();
    this.expect("LPAREN");
    const args = this.parseArguments();
    this.expect("RPAREN");
    this.skipNewlines();

    let where: WhereExprNode | null = null;
    if (this.match("LBRACE")) {
      this.skipNewlines();
      const sectionToken = this.expectType("IDENT");
      if (sectionToken.value !== "where") {
        throw this.error(sectionToken, `${start.value} body only supports where: @where(...)`);
      }
      this.expect("COLON");
      this.skipNewlines();
      where = this.parseWhereExpr();
      this.skipNewlines();
      if (this.checkType("RBRACE")) {
        // no-op
      } else if (!this.match("COMMA")) {
        throw this.error(this.peek(), `${start.value} body entries must be comma-separated`);
      }
      this.skipNewlines();
      this.expect("RBRACE");
    }

    return makeNode<DirectiveCallExprNode>(this, 
      "DirectiveCallExpr",
      {
        name: start.value,
        args,
        where,
      },
      start,
    );
  }

export function parseArgumentsImpl(this: any): ArgumentNode[] {
    const args: ArgumentNode[] = [];

    this.skipNewlines();
    if (this.checkType("RPAREN")) return args;

    while (true) {
      this.skipNewlines();
      const start = this.peek();

      if (this.checkType("IDENT") && this.peekNext().type === "COLON") {
        const key = this.parseIdentifier();
        this.expect("COLON");
        const value = this.parseValueExpr();
        args.push(makeNode<ArgumentNode>(this, "Argument", { key, value }, start));
      } else {
        const value = this.parseValueExpr();
        args.push(
          makeNode<ArgumentNode>(this, "Argument", { key: null, value }, start),
        );
      }

      this.skipNewlines();
      if (!this.match("COMMA")) break;
      this.skipNewlines();
    }

    this.skipNewlines();
    return args;
  }


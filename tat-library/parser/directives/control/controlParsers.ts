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

export function parseRepeatExprImpl(this: any): RepeatExprNode {
    const start = this.expect("KEYWORD", "@repeat");
    this.skipNewlines();
    this.expect("LPAREN");
    this.skipNewlines();
    const count = this.parseRepeatCountExpr();
    this.skipNewlines();
    this.expect("RPAREN");
    this.skipNewlines();

    this.expect("LBRACE");
    this.skipNewlines();
    const pipeline = this.parseActionPipelineSection();
    this.skipNewlines();
    this.expect("RBRACE");

    return makeNode<RepeatExprNode>(this,
      "RepeatExpr",
      {
        name: "@repeat",
        until: null,
        count,
        pipeline,
      },
      start,
    );
  }

export function parseIfExprImpl(this: any): IfExprNode {
    const start = this.expect("KEYWORD", "@if");
    this.skipNewlines();

    let when: GraphControlExprNode | null = null;

    this.expect("LPAREN");
    this.skipNewlines();
    when = this.parseGraphControlExpr();
    this.skipNewlines();
    this.expect("RPAREN");
    this.skipNewlines();

    this.expect("LBRACE");
    this.skipNewlines();
    let thenPipeline: GraphPipelineStepNode[] | null = null;
    let elsePipeline: GraphPipelineStepNode[] | null = null;

    while (!this.checkType("RBRACE")) {
      if (!(this.checkType("IDENT") && this.peekNext().type === "COLON")) {
        throw this.error(this.peek(), "Expected @if section name");
      }

      const sectionToken = this.expectType("IDENT");
      this.expect("COLON");
      this.skipNewlines();
      this.expect("LBRACE");
      this.skipNewlines();

      switch (sectionToken.value) {
        case "then":
          if (thenPipeline !== null) throw this.error(sectionToken, 'Duplicate @if section "then"');
          thenPipeline = this.parseGraphPipelineSection();
          break;
        case "else":
          if (elsePipeline !== null) throw this.error(sectionToken, 'Duplicate @if section "else"');
          elsePipeline = this.parseGraphPipelineSection();
          break;
        default:
          throw this.error(sectionToken, `Unknown @if section "${sectionToken.value}"`);
      }

      this.skipNewlines();
      this.expect("RBRACE");
      this.skipNewlines();
      if (this.checkType("RBRACE")) break;
      if (!this.match("COMMA")) throw this.error(this.peek(), "Expected comma between @if sections");
      this.skipNewlines();
    }

    this.expect("RBRACE");

    return makeNode<IfExprNode>(this,
      "IfExpr",
      {
        name: "@if",
        when,
        then: thenPipeline ?? [],
        else: elsePipeline,
      },
      start,
    );
  }

export function parseWhenExprImpl(this: any): WhenExprNode {
    const start = this.expect("KEYWORD", "@when");
    this.skipNewlines();

    this.expect("LPAREN");
    this.skipNewlines();
    const query = this.parseGraphControlExpr();
    this.skipNewlines();
    this.expect("RPAREN");
    this.skipNewlines();

    this.expect("LBRACE");
    this.skipNewlines();
    const pipeline = this.parseGraphPipelineSection();
    this.skipNewlines();
    this.expect("RBRACE");

    return makeNode<WhenExprNode>(this,
      "WhenExpr",
      {
        name: "@when",
        query,
        pipeline,
      },
      start,
    );
  }

export function parseGraphControlExprImpl(this: any): GraphControlExprNode {
    if (this.check("KEYWORD", "@query.edge") || this.check("KEYWORD", "@query.state") || this.check("KEYWORD", "@query.meta")) {
      return this.parseGraphQueryExpr();
    }

    return this.parseBooleanExpr();
  }

export function parseRepeatCountExprImpl(this: any): RepeatCountExprNode {
    if (this.checkType("NUMBER")) {
      return this.parseNumberLiteral();
    }

    if (this.check("KEYWORD", "@derive.state")) {
      return this.parseDeriveStateExpr();
    }

    if (this.check("KEYWORD", "@derive.meta")) {
      return this.parseDeriveMetaExpr();
    }

    if (this.check("KEYWORD", "@compute.count")) {
      return this.parseComputeCountExpr();
    }

    if (this.check("KEYWORD", "@compute.sum")) {
      return this.parseComputeSumExpr();
    }

    if (this.check("KEYWORD", "@compute.min")) {
      return this.parseComputeMinExpr();
    }

    if (this.check("KEYWORD", "@compute.max")) {
      return this.parseComputeMaxExpr();
    }

    if (this.check("KEYWORD", "@compute.avg")) {
      return this.parseComputeAvgExpr();
    }

    if (this.check("KEYWORD", "@compute.abs")) {
      return this.parseComputeAbsExpr();
    }

    if (this.check("KEYWORD", "@compute.edgeCount")) {
      return this.parseComputeEdgeCountExpr();
    }

    throw this.error(
      this.peek(),
      "Expected number literal or @derive.* expression for @repeat count",
    );
  }

export function parseChooseExprImpl(this: any): ChooseExprNode {
    const start = this.expectType("KEYWORD");
    if (start.value !== "@choose") {
      throw this.error(start, `Expected @choose, got ${start.value}`);
    }
    this.skipNewlines();

    let when: GraphControlExprNode | null = null;

    if (this.match("LPAREN")) {
      this.skipNewlines();
      when = this.parseGraphControlExpr();
      this.skipNewlines();
      this.expect("RPAREN");
      this.skipNewlines();
    }

    this.expect("LBRACE");
    this.skipNewlines();
    let thenValue: ValueExprNode | null = null;
    let elseValue: ValueExprNode | null = null;

    while (!this.checkType("RBRACE")) {
      if (!(this.checkType("IDENT") && this.peekNext().type === "COLON")) {
        throw this.error(this.peek(), "Expected @choose section name");
      }

      const sectionToken = this.expectType("IDENT");
      this.expect("COLON");
      this.skipNewlines();

      switch (sectionToken.value) {
        case "when":
          if (when !== null) {
            throw this.error(sectionToken, 'Duplicate @choose section "when"');
          }
          when = this.parseGraphControlExpr();
          break;

        case "then":
          if (thenValue !== null) {
            throw this.error(sectionToken, 'Duplicate @choose section "then"');
          }
          thenValue = this.parseValueExpr();
          break;

        case "else":
          if (elseValue !== null) {
            throw this.error(sectionToken, 'Duplicate @choose section "else"');
          }
          elseValue = this.parseValueExpr();
          break;

        default:
          throw this.error(
            sectionToken,
            `Unknown @choose section "${sectionToken.value}"`,
          );
      }

      this.skipNewlines();
      if (this.match("COMMA")) {
        this.skipNewlines();
      }
    }

    this.expect("RBRACE");

    if (when === null) {
      throw this.error(start, "@choose requires a boolean condition in parentheses or a when section");
    }
    if (thenValue === null || elseValue === null) {
      throw this.error(start, "@choose requires both then and else branches");
    }

    return makeNode<ChooseExprNode>(this, 
      "ChooseExpr",
      {
        name: "@choose",
        when,
        then: thenValue,
        else: elseValue,
      },
      start,
    );
  }


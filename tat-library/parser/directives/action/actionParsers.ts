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

export function parseActionExprImpl(this: any, startToken?: Token): ActionExprNode {
    const start = startToken ?? this.expect("KEYWORD", "@action.define");
    let guard: ActionGuardExprNode | null = null;
    let pipeline: ActionPipelineStepNode[] | null = null;
    let project: ActionProjectExprNode | null = null;

    this.skipNewlines();
    this.expect("LPAREN");
    this.skipNewlines();
    const actionName = this.parseIdentifier();
    this.skipNewlines();
    this.expect("RPAREN");
    this.skipNewlines();

    this.expect("LBRACE");
    this.skipNewlines();

    while (!this.checkType("RBRACE")) {
      if (!(this.checkType("IDENT") && this.peekNext().type === "COLON")) {
        throw this.error(this.peek(), "Expected @action.define section name");
      }

      const sectionToken = this.expectType("IDENT");
      const section = sectionToken.value;
      this.expect("COLON");
      this.skipNewlines();

      switch (section) {
        case "when":
          if (guard !== null) throw this.error(sectionToken, `Duplicate @action.define section "${section}"`);
          guard = this.parseActionGuardExpr();
          break;
        case "do":
          if (pipeline !== null) throw this.error(sectionToken, `Duplicate @action.define section "${section}"`);
          this.expect("LBRACE");
          this.skipNewlines();
          pipeline = this.parseActionPipelineSection();
          this.skipNewlines();
          this.expect("RBRACE");
          break;
        case "project":
          if (project !== null) throw this.error(sectionToken, `Duplicate @action.define section "${section}"`);
          project = this.parseActionProjectSection();
          break;
        default:
          throw this.error(sectionToken, `Unknown @action.define section "${section}"`);
      }

      this.skipNewlines();
      if (this.checkType("RBRACE")) break;
      if (!this.match("COMMA")) throw this.error(this.peek(), "Expected comma between @action.define sections");
      this.skipNewlines();
    }

    this.expect("RBRACE");

    if (pipeline === null) {
      throw this.error(start, `@action.define requires a do section`);
    }

    return makeNode<ActionExprNode>(this,
      "ActionExpr",
      {
        name: "@action.define",
        actionName,
        guard,
        pipeline,
        project,
      },
      start,
    );
  }

export function parseActionGuardExprImpl(this: any): ActionGuardExprNode {
    if (this.check("KEYWORD", "@query.edge") || this.check("KEYWORD", "@query.state") || this.check("KEYWORD", "@query.meta")) {
      return this.parseGraphQueryExpr();
    }

    return this.parseBooleanExpr();
  }

export function parseActionPipelineSectionImpl(this: any): ActionPipelineStepNode[] {
    const pipeline: ActionPipelineStepNode[] = [];

    this.skipNewlines();

    while (this.match("ARROW")) {
      pipeline.push(this.parseActionPipelineStep());
      this.skipNewlines();
    }

    if (pipeline.length === 0) {
      throw this.error(
        this.peek(),
        "@action pipeline must contain at least one step",
      );
    }

    return pipeline;
  }

export function parseActionPipelineStepImpl(this: any): ActionPipelineStepNode {
    if (this.check("KEYWORD", "@repeat")) {
      return this.parseRepeatExpr();
    }

    return this.parseGraphPipelineStep();
  }

export function parseActionProjectSectionImpl(this: any): ActionProjectExprNode {
    return this.parseValueExpr() as ActionProjectExprNode;
  }

export function parseOperatorExprImpl(this: any): OperatorExprNode {
    const keyword = this.expectType("KEYWORD");

    switch (keyword.value) {
      case "@action.define":
        return this.parseActionExpr(keyword);
      case "@ctx":
        throw this.error(keyword, "@ctx(nodeRef) is only valid in graph bridge syntax.");
      case "@project.apply":
        return this.parseProjectExpr(keyword);
      default:
        throw this.error(
          keyword,
          `Expected operator expression, got "${keyword.value}"`,
        );
    }
  }


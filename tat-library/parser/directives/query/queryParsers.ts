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

export function parseQueryExprImpl(this: any): QueryExprNode {
    if (this.check("KEYWORD", "@query.edge") || this.check("KEYWORD", "@query.state") || this.check("KEYWORD", "@query.meta")) return this.parseGraphQueryExpr();
    if (this.check("KEYWORD", "@match.edge")) return this.parseMatchExpr();
    if (this.isPathKeyword()) return this.parsePathExpr();
    if (this.check("KEYWORD", "@why")) return this.parseWhyExpr();
    if (this.check("KEYWORD", "@how")) return this.parseHowExpr();
    if (this.check("KEYWORD", "@where")) return this.parseWhereExpr();
    throw this.error(this.peek(), "Expected query expression");
  }

export function parseMatchExprImpl(this: any): MatchExprNode {
    const start = this.expect("KEYWORD", "@match.edge");
    this.expect("LPAREN");
    this.skipNewlines();

    const from = this.parsePatternAtom();
    this.skipNewlines();
    this.expect("COMMA");
    this.skipNewlines();
    const relation = this.parsePatternAtom();
    this.skipNewlines();
    this.expect("COMMA");
    this.skipNewlines();
    const to = this.parsePatternAtom();
    this.skipNewlines();
    this.expect("RPAREN");

    const pattern = makeNode<RelationPatternNode>(this,
      "RelationPattern",
      { left: from, relation, right: to },
      start,
    );

    return makeNode<MatchExprNode>(this,
      "MatchExpr",
      {
        edge: null,
        pattern,
        patterns: [pattern],
        where: null,
      },
      start,
    );
  }

export function parseExplicitMatchPatternImpl(this: any): RelationPatternNode {
    const start = this.expect("LBRACE");
    this.skipNewlines();

    let from: RelationPatternNode["left"] | null = null;
    let relation: RelationPatternNode["relation"] | null = null;
    let to: RelationPatternNode["right"] | null = null;

    while (!this.checkType("RBRACE")) {
      const fieldToken = this.expectType("IDENT");
      this.expect("COLON");
      this.skipNewlines();

      switch (fieldToken.value) {
        case "from":
          from = this.parsePatternAtom();
          break;
        case "relation":
          relation = this.parsePatternAtom();
          break;
        case "to":
          to = this.parsePatternAtom();
          break;
        default:
          throw this.error(fieldToken, `Unknown @match field "${fieldToken.value}"`);
      }

      this.skipNewlines();
      this.match("COMMA");
      this.skipNewlines();
    }

    this.expect("RBRACE");

    if (!from || !relation || !to) {
      throw this.error(start, '@match({ ... }) requires from, relation, and to');
    }

    return makeNode<RelationPatternNode>(this, 
      "RelationPattern",
      {
        left: from,
        relation: relation!,
        right: to,
      },
      start,
    );
  }

export function parsePathExprImpl(this: any): PathExprNode {
    const start = this.expectType("KEYWORD");
    if (!this.isPathKeywordValue(start.value)) {
      throw this.error(start, `Expected @path.has/@path.first/@path.count/@path.through, got ${start.value}`);
    }

    this.expect("LPAREN");
    this.skipNewlines();
    const from = this.parseValueExpr();
    this.skipNewlines();
    this.expect("COMMA");
    this.skipNewlines();
    const to = this.parseValueExpr();
    this.skipNewlines();

    if (this.match("COMMA")) {
      throw this.error(start, "Legacy @path options-in-arguments form is retired. Use @path.*(start, target) { relation, direction, depth }.");
    }

    this.expect("RPAREN");

    let options: ObjectLiteralNode | null = null;
    let where: BooleanExprNode | null = null;
    this.skipNewlines();

    if (this.checkType("LBRACE")) {
      options = this.parseObjectLiteral();
      this.skipNewlines();
    }

    if (this.check("KEYWORD", "@where")) {
      where = this.parseWhereClause();
    }

    return makeNode<PathExprNode>(this, 
      "PathExpr",
      {
        name: start.value as PathExprNode["name"],
        from,
        to,
        options,
        where,
      },
      start,
    );
  }

export function parseWhyExprImpl(this: any): WhyExprNode {
    const start = this.expect("KEYWORD", "@why");
    this.expect("LPAREN");
    const target = this.parseExplanationTarget("@why");
    this.expect("RPAREN");

    return makeNode<WhyExprNode>(this, 
      "WhyExpr",
      {
        target,
      },
      start,
    );
  }

export function parseHowExprImpl(this: any): HowExprNode {
    const start = this.expect("KEYWORD", "@how");
    this.expect("LPAREN");
    const target = this.parseExplanationTarget("@how");
    this.expect("RPAREN");

    return makeNode<HowExprNode>(this, 
      "HowExpr",
      {
        target,
      },
      start,
    );
  }

export function parseExplanationTargetImpl(this: any, wrapperName: "@why" | "@how"): WhyTargetNode {
    if (this.check("KEYWORD", "@query.edge") || this.check("KEYWORD", "@query.state") || this.check("KEYWORD", "@query.meta")) return this.parseGraphQueryExpr();
    if (this.check("KEYWORD", "@match.edge")) return this.parseMatchExpr();
    if (this.isPathKeyword()) return this.parsePathExpr();
    if (this.check("KEYWORD", "@project.apply")) return this.parseProjectExpr();
    if (
      this.check("KEYWORD", "@select.node") ||
      this.check("KEYWORD", "@select.targets") ||
      this.check("KEYWORD", "@select.sources") ||
      this.check("KEYWORD", "@select.first") ||
      this.check("KEYWORD", "@select.only") ||
      this.check("KEYWORD", "@select.from")
    ) {
      return this.parseDirectiveCallExpr();
    }
    if (this.isDeriveOrComputeExprStart()) {
      return this.parseDeriveExpr() as WhyTargetNode;
    }

    throw this.error(
      this.peek(),
      `${wrapperName}(...) must wrap a semantic result-producing directive`,
    );
  }

export function isPathKeywordImpl(this: any): boolean {
    return this.peek().type === "KEYWORD" && this.isPathKeywordValue(this.peek().value);
  }

export function isPathKeywordValueImpl(this: any, value: string): boolean {
    return (
      value === "@path.has" ||
      value === "@path.first" ||
      value === "@path.count" ||
      value === "@path.through"
    );
  }

export function parseWhereClauseImpl(this: any): BooleanExprNode {
    this.expect("KEYWORD", "@where");
    this.expect("LPAREN");
    const expr = this.parseBooleanExpr();
    this.expect("RPAREN");
    return expr;
  }

export function parseWhereExprImpl(this: any): WhereExprNode {
    const start = this.expect("KEYWORD", "@where");
    this.expect("LPAREN");
    const expression = this.parseBooleanExpr();
    this.expect("RPAREN");
    return makeNode<WhereExprNode>(this, "WhereExpr", { expression }, start);
  }

export function parseWherePredicateImpl(this: any): WherePredicateNode {
    const start = this.expect("KEYWORD", "@where");
    this.expect("LPAREN");
    const expression = this.parseBooleanExpr();
    this.expect("RPAREN");
    return makeNode<WherePredicateNode>(this, 
      "WherePredicate",
      { expression },
      start,
    );
  }

export function parseGraphQueryExprImpl(this: any): GraphQueryExprNode {
    const start = this.expectType("KEYWORD");
    this.skipNewlines();

    if (start.value !== "@query.edge" && start.value !== "@query.state" && start.value !== "@query.meta") {
      throw this.error(start, `Expected @query.edge/@query.state/@query.meta, got ${start.value}`);
    }

    this.expect("LPAREN");
    this.skipNewlines();

    if (start.value === "@query.edge") {
      const subject = this.parseIdentifier();
      this.skipNewlines();
      this.expect("COMMA");
      this.skipNewlines();
      const relationIdent = this.parseIdentifier();
      this.skipNewlines();
      this.expect("COMMA");
      this.skipNewlines();
      const object = this.parseIdentifier();
      this.skipNewlines();
      this.expect("RPAREN");

      const relation = makeNode<StringLiteralNode>(this,
        "StringLiteral",
        { value: relationIdent.name, raw: relationIdent.name },
        identToToken(relationIdent),
      );

      return makeNode<GraphQueryExprNode>(this,
        "GraphQueryExpr",
        {
          name: "@query.edge",
          subject,
          relation,
          object,
          node: null,
          state: null,
          meta: null,
          equals: null,
        },
        start,
      );
    }

    const node = this.parseIdentifier();
    this.skipNewlines();
    this.expect("COMMA");
    this.skipNewlines();
    const keyIdent = this.parseIdentifier();
    this.skipNewlines();
    this.expect("COMMA");
    this.skipNewlines();
    const equals = this.parseValueExpr();
    this.skipNewlines();
    this.expect("RPAREN");

    const key = makeNode<StringLiteralNode>(this,
      "StringLiteral",
      { value: keyIdent.name, raw: keyIdent.name },
      identToToken(keyIdent),
    );

    return makeNode<GraphQueryExprNode>(this,
      "GraphQueryExpr",
      {
        name: start.value as GraphQueryExprNode["name"],
        subject: null,
        relation: null,
        object: null,
        node,
        state: start.value === "@query.state" ? key : null,
        meta: start.value === "@query.meta" ? key : null,
        equals,
      },
      start,
    );
  }

export function parseGraphQueryCallExprImpl(this: any, start: Token): GraphQueryExprNode {
    this.skipNewlines();
    const anchor = this.parseIdentifier();
    this.skipNewlines();
    this.expect("COMMA");
    this.skipNewlines();
    const descriptor = this.parseObjectLiteral();
    this.skipNewlines();
    this.expect("COMMA");
    this.skipNewlines();

    const relationValue = this.getObjectPropertyValue(descriptor, "relation");

    if (relationValue) {
      const object = this.parseIdentifier();
      this.skipNewlines();
      this.expect("RPAREN");

      return makeNode<GraphQueryExprNode>(this, 
        "GraphQueryExpr",
        {
          name: "@query",
          subject: anchor,
          relation: this.valueToStringLiteral(relationValue, "relation"),
          object,
          node: null,
          state: null,
          meta: null,
          equals: null,
        },
        start,
      );
    }

    const condition = this.parseObjectLiteral();
    this.skipNewlines();
    this.expect("RPAREN");

    const stateValue = this.getObjectPropertyValue(descriptor, "state");
    const metaValue = this.getObjectPropertyValue(descriptor, "meta");
    const equals = this.getObjectPropertyValue(condition, "equals");

    if (!stateValue && !metaValue) {
      throw this.error(
        start,
        '@query(...) descriptor requires "state", "meta", or "relation"',
      );
    }

    return makeNode<GraphQueryExprNode>(this, 
      "GraphQueryExpr",
      {
        name: "@query",
        subject: null,
        relation: null,
        object: null,
        node: anchor,
        state: stateValue ? this.valueToStringLiteral(stateValue, "state") : null,
        meta: metaValue ? this.valueToStringLiteral(metaValue, "meta") : null,
        equals,
      },
      start,
    );
  }


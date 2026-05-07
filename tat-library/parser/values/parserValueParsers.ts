import type { Token, TokenType } from "../../lexer/tokenize.js";
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
} from "../../ast/nodeTypes.js";

import {
  stripQuotes,
  splitRegexLiteral,
  identToToken,
  atomToToken,
  nodeToToken,
  makeNode,
} from "../core/parserUtils.js";

export function parseRelationPatternImpl(this: any): RelationPatternNode {
  const left = this.parsePatternAtom();
  this.expect("COLON");
  const relation = this.parsePatternAtom();
  this.expect("COLON");
  const right = this.parsePatternAtom();

  return makeNode<RelationPatternNode>(
    this,
    "RelationPattern",
    {
      left,
      relation,
      right,
    },
    atomToToken(left),
  );
}

export function parsePatternAtomImpl(this: any) {
  if (this.checkType("WILDCARD")) return this.parseWildcard();
  if (this.checkType("REGEX")) return this.parseRegexLiteral();
  if (this.checkType("STRING")) return this.parseStringLiteral();
  if (this.checkType("NUMBER")) return this.parseNumberLiteral();
  if (this.checkType("BOOLEAN")) return this.parseBooleanLiteral();
  if (this.checkType("LANGLE")) return this.parseNodeCapture();
  if (this.checkType("IDENT")) return this.parseIdentifier();

  throw this.error(this.peek(), "Expected pattern atom");
}

export function parseValueExprImpl(this: any): ValueExprNode {
  if (this.check("KEYWORD", "@where")) return this.parseWhereExpr();
  if (this.check("KEYWORD", "@query.edge") || this.check("KEYWORD", "@query.state") || this.check("KEYWORD", "@query.meta")) return this.parseGraphQueryExpr() as unknown as ValueExprNode;
  if (this.isPathKeyword()) return this.parsePathExpr() as unknown as ValueExprNode;
  if (this.check("KEYWORD", "@choose")) return this.parseChooseExpr();
  if (this.isGraphProjectionExprStart()) {
    const source = this.parseIdentifier();
    this.skipNewlines();
    this.expect("PROJECT");
    const projection = this.parseTerminalGraphExpr();
    return {
      type: "ProjectionValueExpr",
      source,
      projection,
    } as unknown as ValueExprNode;
  }
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
  if (
    this.check("KEYWORD", "@derive.state") ||
    this.check("KEYWORD", "@derive.meta") ||
    this.check("KEYWORD", "@compute.count") ||
    this.check("KEYWORD", "@compute.edgeCount") ||
    this.check("KEYWORD", "@compute.exists") ||
    this.check("KEYWORD", "@derive.path") ||
    this.check("KEYWORD", "@derive.collect") ||
    this.check("KEYWORD", "@compute.sum") ||
    this.check("KEYWORD", "@compute.min") ||
    this.check("KEYWORD", "@compute.max") ||
    this.check("KEYWORD", "@compute.avg") ||
    this.check("KEYWORD", "@compute.abs")
  ) {
    return this.parseDeriveExpr();
  }
  if (this.check("KEYWORD", "@runtime.generateNodeId")) {
    return this.parseRuntimeGenerateNodeIdExpr();
  }
  if (this.check("KEYWORD", "@runtime.generateValueId")) {
    return this.parseRuntimeGenerateValueIdExpr();
  }
  if (this.check("KEYWORD", "@runtime.nextOrder")) {
    return this.parseRuntimeNextOrderExpr();
  }
  if (this.checkType("IDENT")) return this.parseBooleanValue() as ValueExprNode;
  if (this.checkType("STRING")) return this.parseStringLiteral();
  if (this.checkType("NUMBER")) return this.parseNumberLiteral();
  if (this.checkType("BOOLEAN")) return this.parseBooleanLiteral();
  if (this.checkType("LANGLE")) return this.parseNodeCapture();
  if (this.checkType("LBRACE")) return this.parseObjectLiteral();
  if (this.checkType("LBRACKET")) return this.parseArrayLiteral();

  throw this.error(this.peek(), "Expected value expression");
}

export function parseNodeCaptureImpl(this: any): NodeCaptureNode {
  const start = this.expect("LANGLE");

  this.skipNewlines();

  const shape = this.parseNodeShape();

  this.skipNewlines();

  this.expect("RANGLE");

  return makeNode<NodeCaptureNode>(
    this,
    "NodeCapture",
    {
      shape,
    },
    start,
  );
}

export function parseNodeShapeImpl(this: any): NodeShapeNode {
  if (this.looksLikeTraversalExpr()) {
    return this.parseTraversalExpr();
  }

  if (this.checkType("IDENT")) return this.parseIdentifier();
  if (this.checkType("STRING")) return this.parseStringLiteral();
  if (this.checkType("NUMBER")) return this.parseNumberLiteral();
  if (this.checkType("BOOLEAN")) return this.parseBooleanLiteral();
  if (this.checkType("LBRACE")) return this.parseObjectLiteral();

  throw this.error(this.peek(), "Expected node shape");
}

export function parseTraversalExprImpl(this: any): TraversalExprNode {
  const start = this.peek();
  const segments: TraversalSegmentNode[] = [];

  const first = this.parseActionSegment();
  segments.push(first);

  while (this.match("DDOT")) {
    const context = this.parseIdentifier();
    this.expect("DDOT");
    const segment = this.parseActionSegment();

    segments.push(
      this.node(
        "ContextLift",
        {
          context,
          segment,
        },
        identToToken(context),
      ),
    );
  }

  return makeNode<TraversalExprNode>(
    this,
    "TraversalExpr",
    {
      segments,
    },
    start,
  );
}

export function parseActionSegmentImpl(this: any): ActionSegmentNode {
  const start = this.peek();
  const from = this.parseTraversalValue();
  this.expect("DOT");
  const operator = this.parseIdentifier();
  this.expect("DOT");
  const to = this.parseTraversalValue();

  return makeNode<ActionSegmentNode>(
    this,
    "ActionSegment",
    {
      from,
      operator,
      to,
    },
    start,
  );
}

export function parseTraversalValueImpl(this: any): ValueExprNode {
  if (this.checkType("IDENT")) return this.parseIdentifier();
  if (this.checkType("STRING")) return this.parseStringLiteral();
  if (this.checkType("NUMBER")) return this.parseNumberLiteral();
  if (this.checkType("BOOLEAN")) return this.parseBooleanLiteral();
  if (this.checkType("LANGLE")) return this.parseNodeCapture();
  if (this.checkType("LBRACE")) return this.parseObjectLiteral();

  throw this.error(this.peek(), "Expected traversal value");
}

export function parseObjectLiteralImpl(this: any): ObjectLiteralNode {
  const start = this.expect("LBRACE");
  const properties: ObjectPropertyNode[] = [];

  this.skipNewlines();
  while (!this.checkType("RBRACE")) {
    this.skipNewlines();
    const keyToken = this.peek();

    let key: string;
    if (this.checkType("IDENT")) {
      key = this.advance().value;
    } else if (this.checkType("STRING")) {
      key = stripQuotes(this.advance().value);
    } else {
      throw this.error(this.peek(), "Expected object key");
    }

    this.expect("COLON");
    const value = this.parseValueExpr();

    properties.push(
      makeNode<ObjectPropertyNode>(
        this,
        "ObjectProperty",
        {
          key,
          value,
        },
        keyToken,
      ),
    );

    this.skipNewlines();
    if (this.checkType("RBRACE")) break;
    if (!this.match("COMMA")) {
      throw this.error(this.peek(), "Expected comma between object properties");
    }
    this.skipNewlines();
  }

  this.skipNewlines();
  this.expect("RBRACE");

  return makeNode<ObjectLiteralNode>(
    this,
    "ObjectLiteral",
    {
      properties,
    },
    start,
  );
}

export function parseArrayLiteralImpl(this: any): ArrayLiteralNode {
  const start = this.expect("LBRACKET");
  const elements: ValueExprNode[] = [];

  this.skipNewlines();
  while (!this.checkType("RBRACKET")) {
    this.skipNewlines();
    elements.push(this.parseValueExpr());
    this.skipNewlines();
    if (!this.match("COMMA")) break;
    this.skipNewlines();
  }

  this.skipNewlines();
  this.expect("RBRACKET");

  return makeNode<ArrayLiteralNode>(
    this,
    "ArrayLiteral",
    {
      elements,
    },
    start,
  );
}

export function parseBooleanExprImpl(this: any): BooleanExprNode {
  return this.parseOrExpr();
}

export function parseOrExprImpl(this: any): BooleanExprNode {
  let expr = this.parseAndExpr();

  while (this.matchLogical("||")) {
    const op = this.previous();
    const right = this.parseAndExpr();
    expr = makeNode<BinaryBooleanExprNode>(
      this,
      "BinaryBooleanExpr",
      {
        operator: "||",
        left: expr,
        right,
      },
      op,
    );
  }

  return expr;
}

export function parseAndExprImpl(this: any): BooleanExprNode {
  let expr = this.parseNotExpr();

  while (this.matchLogical("&&")) {
    const op = this.previous();
    const right = this.parseNotExpr();
    expr = makeNode<BinaryBooleanExprNode>(
      this,
      "BinaryBooleanExpr",
      {
        operator: "&&",
        left: expr,
        right,
      },
      op,
    );
  }

  return expr;
}

export function parseNotExprImpl(this: any): BooleanExprNode {
  if (this.matchLogical("!")) {
    const op = this.previous();
    const argument = this.parseNotExpr();
    return makeNode<UnaryBooleanExprNode>(
      this,
      "UnaryBooleanExpr",
      {
        operator: "!",
        argument,
      },
      op,
    );
  }

  return this.parseComparisonOrPrimary();
}

export function parseComparisonOrPrimaryImpl(this: any): BooleanExprNode {
  if (this.match("LPAREN")) {
    const start = this.previous();
    const expression = this.parseBooleanExpr();
    this.expect("RPAREN");
    return makeNode<GroupedBooleanExprNode>(
      this,
      "GroupedBooleanExpr",
      {
        expression,
      },
      start,
    );
  }

  const left = this.parseBooleanValue();

  if (this.matchComparison()) {
    const op = this.previous();
    const right = this.parseBooleanValue();
    return makeNode<ComparisonExprNode>(
      this,
      "ComparisonExpr",
      {
        operator: op.value as ComparisonExprNode["operator"],
        left,
        right,
      },
      op,
    );
  }

  return left;
}

export function parseBooleanValueImpl(this: any): BooleanValueNode {
  if (this.check("KEYWORD", "@query.edge") || this.check("KEYWORD", "@query.state") || this.check("KEYWORD", "@query.meta")) {
    return this.parseGraphQueryExpr() as unknown as BooleanValueNode;
  }

  if (this.check("KEYWORD", "@path.has")) {
    return this.parsePathExpr() as unknown as BooleanValueNode;
  }

  if (
    this.checkType("NUMBER") ||
    this.checkType("STRING") ||
    this.check("KEYWORD", "@derive.state") ||
    this.check("KEYWORD", "@derive.meta") ||
    this.check("KEYWORD", "@compute.count") ||
    this.check("KEYWORD", "@compute.edgeCount") ||
    this.check("KEYWORD", "@compute.exists") ||
    this.check("KEYWORD", "@derive.path") ||
    this.check("KEYWORD", "@derive.collect") ||
    this.check("KEYWORD", "@compute.sum") ||
    this.check("KEYWORD", "@compute.min") ||
    this.check("KEYWORD", "@compute.max") ||
    this.check("KEYWORD", "@compute.avg") ||
    this.check("KEYWORD", "@compute.abs") ||
    (this.checkType("IDENT") &&
      (this.peek().value === "current" || this.peek().value === "previous"))
  ) {
    return this.parseDeriveExpr() as BooleanValueNode;
  }

  if (this.checkType("IDENT")) {
    const ident = this.parseIdentifier();

    if (this.match("DOT")) {
      const property = this.parseIdentifier();
      const chain = [property];

      while (this.match("DOT")) {
        chain.push(this.parseIdentifier());
      }

      return makeNode<PropertyAccessNode>(
        this,
        "PropertyAccess",
        {
          object: ident,
          property,
          chain,
        },
        identToToken(ident),
      );
    }

    return ident;
  }

  if (this.checkType("STRING")) return this.parseStringLiteral();
  if (this.checkType("NUMBER")) return this.parseNumberLiteral();
  if (this.checkType("BOOLEAN")) return this.parseBooleanLiteral();
  if (this.checkType("REGEX")) return this.parseRegexLiteral();

  throw this.error(this.peek(), "Expected boolean value");
}

export function parseIdentifierImpl(this: any): IdentifierNode {
  const token = this.expectType("IDENT");
  return makeNode<IdentifierNode>(
    this,
    "Identifier",
    {
      name: token.value,
    },
    token,
  );
}

export function parseStringLiteralImpl(this: any): StringLiteralNode {
  const token = this.expectType("STRING");
  return makeNode<StringLiteralNode>(
    this,
    "StringLiteral",
    {
      value: stripQuotes(token.value),
      raw: token.value,
    },
    token,
  );
}

export function parseRelationLabelImpl(this: any): StringLiteralNode {
  if (this.checkType("STRING")) {
    return this.parseStringLiteral();
  }

  const token = this.expectType("IDENT");
  return makeNode<StringLiteralNode>(
    this,
    "StringLiteral",
    {
      value: token.value,
      raw: token.value,
    },
    token,
  );
}

export function parseNumberLiteralImpl(this: any): NumberLiteralNode {
  const token = this.expectType("NUMBER");
  return makeNode<NumberLiteralNode>(
    this,
    "NumberLiteral",
    {
      value: Number(token.value),
      raw: token.value,
    },
    token,
  );
}

export function parseBooleanLiteralImpl(this: any): BooleanLiteralNode {
  const token = this.expectType("BOOLEAN");
  return makeNode<BooleanLiteralNode>(
    this,
    "BooleanLiteral",
    {
      value: token.value === "true",
      raw: token.value,
    },
    token,
  );
}

export function parseRegexLiteralImpl(this: any): RegexLiteralNode {
  const token = this.expectType("REGEX");
  const { pattern, flags } = splitRegexLiteral(token.value);

  return makeNode<RegexLiteralNode>(
    this,
    "RegexLiteral",
    {
      pattern,
      flags,
      raw: token.value,
    },
    token,
  );
}

export function parseWildcardImpl(this: any): WildcardNode {
  const token = this.expectType("WILDCARD");
  return makeNode<WildcardNode>(
    this,
    "Wildcard",
    {
      raw: "_",
    },
    token,
  );
}

export function isTraversalValueStartImpl(this: any, token: Token): boolean {
  return (
    token.type === "IDENT" ||
    token.type === "STRING" ||
    token.type === "NUMBER" ||
    token.type === "BOOLEAN" ||
    token.type === "LANGLE" ||
    token.type === "LBRACE"
  );
}

export function isGraphPipelineStartImpl(this: any): boolean {
  if (this.peek().type !== "IDENT" || this.peekNext().type !== "COLON_EQUALS") {
    return false;
  }

  const rhs = this.peekN(2);
  if (rhs.type === "KEYWORD" && (rhs.value === "@seed" || rhs.value === "@compose")) {
    return true;
  }

  if (rhs.type === "IDENT") {
    let i = 3;
    while (this.peekN(i).type === "NEWLINE") i++;
    return this.peekN(i).type === "ARROW" || this.peekN(i).type === "INJECT_FLOW" || this.peekN(i).type === "PROJECT";
  }

  return false;
}

export function isGraphProjectionExprStartImpl(this: any): boolean {
  if (!this.checkType("IDENT")) return false;
  let i = 1;
  while (this.peekN(i).type === "NEWLINE") i++;
  return this.peekN(i).type === "PROJECT" || this.peekN(i).type === "ARROW" || this.peekN(i).type === "INJECT_FLOW";
}

export function parseGraphSourceImpl(this: any): GraphSourceNode {
  if (this.checkType("IDENT")) {
    const graphId = this.parseIdentifier();
    return makeNode<GraphRefNode>(
      this,
      "GraphRef",
      {
        name: "@graph",
        graphId,
      },
      identToToken(graphId),
    );
  }

  if (this.check("KEYWORD", "@seed")) {
    if (this.peekN(1).type === "LBRACE" || this.peekN(1).type === "NEWLINE") {
      let i = 1;
      while (this.peekN(i).type === "NEWLINE") i++;
      if (this.peekN(i).type === "LBRACE") {
        const seed = this.parseSeedBlock();
        return makeNode<SeedSourceNode>(
          this,
          "SeedSource",
          {
            name: "@seed",
            seed,
          },
          identToToken(seed.root),
        );
      }
    }

    const token = this.expect("KEYWORD", "@seed");
    return makeNode<SeedSourceNode>(
      this,
      "SeedSource",
      {
        name: "@seed",
      },
      token,
    );
  }

  if (this.match("KEYWORD", "@compose")) {
    const token = this.previous();
    this.expect("LBRACE");
    this.skipNewlines();

    let from: IdentifierNode[] | null = null;
    let keep: ObjectLiteralNode | null = null;
    let prune: ObjectLiteralNode | null = null;
    let merge: ObjectLiteralNode | null = null;

    while (!this.checkType("RBRACE")) {
      const fieldToken = this.expectType("IDENT");
      this.expect("COLON");
      this.skipNewlines();

      switch (fieldToken.value) {
        case "from":
          from = this.parseIdentifierArrayField("@compose from");
          break;
        case "keep":
          keep = this.parseObjectLiteral();
          break;
        case "prune":
          prune = this.parseObjectLiteral();
          break;
        case "merge":
          merge = this.parseObjectLiteral();
          break;
        default:
          throw this.error(
            fieldToken,
            `Unknown @compose field "${fieldToken.value}"`,
          );
      }

      this.skipNewlines();
      if (this.checkType("RBRACE")) break;
      if (!this.match("COMMA")) throw this.error(this.peek(), "Expected comma between @compose fields");
      this.skipNewlines();
    }

    this.expect("RBRACE");

    if (!from || from.length === 0) {
      throw this.error(
        token,
        "@compose requires from: [...] with at least one graph source",
      );
    }

    if (!merge) {
      throw this.error(token, "@compose requires merge: { ... }");
    }

    const root = this.getObjectPropertyValue(merge, "root");

    return makeNode<ComposeExprNode>(
      this,
      "ComposeExpr",
      {
        name: "@compose",
        from,
        keep,
        prune,
        mergePolicy: merge,
        assets: from,
        merge:
          root && root.type === "Identifier"
            ? root
            : makeNode<IdentifierNode>(
                this,
                "Identifier",
                { name: from[0].name },
                token,
              ),
      },
      token,
    );
  }

  throw this.error(this.peek(), `Expected graph source @seed or @compose(...)`);
}

export function parseIdentifierArrayFieldImpl(
  this: any,
  label: string,
): IdentifierNode[] {
  this.expect("LBRACKET");
  this.skipNewlines();

  const values: IdentifierNode[] = [];
  while (!this.checkType("RBRACKET")) {
    values.push(this.parseIdentifier());
    this.skipNewlines();
    if (!this.match("COMMA")) break;
    this.skipNewlines();
  }

  this.expect("RBRACKET");

  if (values.length === 0) {
    throw this.error(
      this.peek(),
      `${label} must include at least one identifier`,
    );
  }

  return values;
}

export function isSystemRelationStartImpl(this: any): boolean {
  if (this.peek().type !== "IDENT") return false;

  if (this.peekNext().type === "TCOLON" && this.peekN(2).type === "IDENT") {
    return true;
  }

  return (
    this.peekNext().type === "COLON" &&
    this.peekN(2).type === "STRING" &&
    this.peekN(3).type === "TCOLON" &&
    this.peekN(4).type === "IDENT"
  );
}

export function matchComparisonImpl(this: any): boolean {
  const token = this.peek();
  if (
    !["EQ2", "EQ3", "NEQ2", "NEQ3", "LTE", "GTE", "LANGLE", "RANGLE"].includes(
      token.type,
    )
  ) {
    return false;
  }
  this.current += 1;
  return true;
}

export function matchLogicalImpl(
  this: any,
  expected: "&&" | "||" | "!",
): boolean {
  const token = this.peek();

  if (expected === "&&" && token.type === "AND") {
    this.current += 1;
    return true;
  }

  if (expected === "||" && token.type === "OR") {
    this.current += 1;
    return true;
  }

  if (expected === "!" && token.type === "BANG") {
    this.current += 1;
    return true;
  }

  return false;
}

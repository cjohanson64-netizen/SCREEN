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

export function isDeriveOrComputeExprStartImpl(this: any): boolean {
    return (
      this.check("KEYWORD", "@derive.state") ||
      this.check("KEYWORD", "@derive.meta") ||
      this.check("KEYWORD", "@derive.collect") ||
      this.check("KEYWORD", "@compute.count") ||
      this.check("KEYWORD", "@compute.edgeCount") ||
      this.check("KEYWORD", "@compute.exists") ||
      this.check("KEYWORD", "@compute.sum") ||
      this.check("KEYWORD", "@compute.min") ||
      this.check("KEYWORD", "@compute.max") ||
      this.check("KEYWORD", "@compute.avg") ||
      this.check("KEYWORD", "@compute.abs") ||
      this.check("KEYWORD", "@derive.path")
    );
  }

export function parseDeriveStateExprImpl(this: any): DeriveStateExprNode {
    const start = this.expect("KEYWORD", "@derive.state");

    if (this.match("LPAREN")) {
      this.skipNewlines();
      const node = this.parseIdentifier();
      this.expect("COMMA");
      const key = this.parseRelationLabel();
      this.skipNewlines();
      this.expect("RPAREN");
      return makeNode<DeriveStateExprNode>(this, 
        "DeriveStateExpr",
        { name: "@derive.state", node, key },
        start,
      );
    }

    this.skipNewlines();
    this.expect("LBRACE");
    this.skipNewlines();

    let node: IdentifierNode | null = null;
    let key: StringLiteralNode | null = null;

    while (!this.checkType("RBRACE")) {
      if (!(this.checkType("IDENT") && this.peekNext().type === "COLON")) {
        throw this.error(this.peek(), "Expected @derive.state field name");
      }

      const fieldToken = this.expectType("IDENT");
      this.expect("COLON");
      this.skipNewlines();

      switch (fieldToken.value) {
        case "node":
          if (node !== null) {
            throw this.error(fieldToken, 'Duplicate @derive.state field "node"');
          }
          node = this.parseIdentifier();
          break;
        case "key":
          if (key !== null) {
            throw this.error(fieldToken, 'Duplicate @derive.state field "key"');
          }
          key = this.parseRelationLabel();
          break;
        default:
          throw this.error(fieldToken, `Unknown @derive.state field "${fieldToken.value}"`);
      }

      this.skipNewlines();
    }

    this.expect("RBRACE");

    return makeNode<DeriveStateExprNode>(this, "DeriveStateExpr", { name: "@derive.state", node, key }, start);
  }

export function parseDeriveMetaExprImpl(this: any): DeriveMetaExprNode {
    const start = this.expect("KEYWORD", "@derive.meta");

    if (this.match("LPAREN")) {
      this.skipNewlines();
      const node = this.parseIdentifier();
      this.expect("COMMA");
      const key = this.parseRelationLabel();
      this.skipNewlines();
      this.expect("RPAREN");
      return makeNode<DeriveMetaExprNode>(this, 
        "DeriveMetaExpr",
        { name: "@derive.meta", node, key },
        start,
      );
    }

    this.skipNewlines();
    this.expect("LBRACE");
    this.skipNewlines();

    let node: IdentifierNode | null = null;
    let key: StringLiteralNode | null = null;

    while (!this.checkType("RBRACE")) {
      if (!(this.checkType("IDENT") && this.peekNext().type === "COLON")) {
        throw this.error(this.peek(), "Expected @derive.meta field name");
      }

      const fieldToken = this.expectType("IDENT");
      this.expect("COLON");
      this.skipNewlines();

      switch (fieldToken.value) {
        case "node":
          if (node !== null) {
            throw this.error(fieldToken, 'Duplicate @derive.meta field "node"');
          }
          node = this.parseIdentifier();
          break;
        case "key":
          if (key !== null) {
            throw this.error(fieldToken, 'Duplicate @derive.meta field "key"');
          }
          key = this.parseRelationLabel();
          break;
        default:
          throw this.error(fieldToken, `Unknown @derive.meta field "${fieldToken.value}"`);
      }

      this.skipNewlines();
    }

    this.expect("RBRACE");

    return makeNode<DeriveMetaExprNode>(this, "DeriveMetaExpr", { name: "@derive.meta", node, key }, start);
  }

export function parseComputeCountExprImpl(this: any): ComputeCountExprNode {
    const start = this.expect("KEYWORD", "@compute.count");
    this.skipNewlines();
    this.expect("LPAREN");
    this.skipNewlines();
    this.expect("RPAREN");
    this.skipNewlines();
    const from = this.parseComputeSourceBlock();
    return makeNode<ComputeCountExprNode>(this, "ComputeCountExpr", {
      name: "@compute.count",
      nodes: null,
      from,
    }, start);
  }

export function parseComputeEdgeCountExprImpl(this: any): ComputeEdgeCountExprNode {
    const start = this.expect("KEYWORD", "@compute.edgeCount");
    this.skipNewlines();
    this.expect("LPAREN");
    this.skipNewlines();
    const node = this.parseIdentifier();
    this.skipNewlines();
    this.expect("RPAREN");
    this.skipNewlines();
    const source = this.parseComputeSourceBlock();
    let relation: StringLiteralNode | null = null;
    let direction: StringLiteralNode | null = null;
    let where: BooleanExprNode | null = null;
    if (source.type === "DerivePathExpr") {
      relation = source.relation && source.relation.type === "StringLiteral" ? source.relation : null;
      direction = source.direction;
      where = source.where;
    }
    return makeNode<ComputeEdgeCountExprNode>(this, "ComputeEdgeCountExpr", {
      name: "@compute.edgeCount",
      node,
      relation,
      direction,
      where,
    }, start);
  }

export function parseComputeExistsExprImpl(this: any): ComputeExistsExprNode {
    const start = this.expect("KEYWORD", "@compute.exists");
    this.skipNewlines();
    this.expect("LPAREN");
    this.skipNewlines();
    this.expect("RPAREN");
    this.skipNewlines();
    const source = this.parseComputeSourceBlock();
    const path = this.parseComputeExistsValue(source);
    return makeNode<ComputeExistsExprNode>(this, "ComputeExistsExpr", {
      name: "@compute.exists",
      path,
    }, start);
  }

export function parseDerivePathExprImpl(this: any): DerivePathExprNode {
    const start = this.expect("KEYWORD", "@derive.path");

    if (this.match("LPAREN")) {
      this.skipNewlines();
      const node = this.parseIdentifier();
      this.expect("COMMA");
      const relation = this.parseRelationLabel();
      this.expect("COMMA");
      const direction = this.parseRelationLabel();
      this.expect("COMMA");
      const depth = this.parseNumberLiteral();
      this.skipNewlines();
      this.expect("RPAREN");
      return makeNode<DerivePathExprNode>(this, 
        "DerivePathExpr",
        { name: "@derive.path", node, relation, direction, depth, where: null },
        start,
      );
    }

    this.skipNewlines();
    this.expect("LBRACE");
    this.skipNewlines();

    let node: IdentifierNode | null = null;
    let relation: StringLiteralNode | ArrayLiteralNode | null = null;
    let direction: StringLiteralNode | null = null;
    let depth: NumberLiteralNode | null = null;
    let where: BooleanExprNode | null = null;

    while (!this.checkType("RBRACE")) {
      if (!(this.checkType("IDENT") && this.peekNext().type === "COLON")) {
        throw this.error(this.peek(), "Expected @derive.path field name");
      }

      const fieldToken = this.expectType("IDENT");
      this.expect("COLON");
      this.skipNewlines();

      switch (fieldToken.value) {
        case "node":
          if (node !== null) throw this.error(fieldToken, 'Duplicate @derive.path field "node"');
          node = this.parseIdentifier();
          break;
        case "relation":
          if (relation !== null) throw this.error(fieldToken, 'Duplicate @derive.path field "relation"');
          if (this.checkType("LBRACKET")) relation = this.parseArrayLiteral();
          else relation = this.parseRelationLabel();
          break;
        case "direction":
          if (direction !== null) throw this.error(fieldToken, 'Duplicate @derive.path field "direction"');
          direction = this.parseRelationLabel();
          break;
        case "depth":
          if (depth !== null) throw this.error(fieldToken, 'Duplicate @derive.path field "depth"');
          depth = this.parseNumberLiteral();
          break;
        case "where":
          if (where !== null) throw this.error(fieldToken, 'Duplicate @derive.path field "where"');
          where = this.parseBooleanExpr();
          break;
        default:
          throw this.error(fieldToken, `Unknown @derive.path field "${fieldToken.value}"`);
      }

      this.skipNewlines();
    }

    this.expect("RBRACE");
    return makeNode<DerivePathExprNode>(this, "DerivePathExpr", { name: "@derive.path", node, relation, direction, depth, where }, start);
  }

export function parseDeriveCollectExprImpl(this: any): DeriveCollectExprNode {
    const start = this.expect("KEYWORD", "@derive.collect");

    let path: DerivePathExprNode | null = null;
    let layer: StringLiteralNode | null = null;
    let key: StringLiteralNode | null = null;

    if (this.match("LPAREN")) {
      this.skipNewlines();
      layer = this.parseRelationLabel();
      this.expect("COMMA");
      key = this.parseRelationLabel();
      this.skipNewlines();
      this.expect("RPAREN");
      this.skipNewlines();
      this.expect("LBRACE");
      this.skipNewlines();
      path = this.parseDerivePathExpr();
      this.skipNewlines();
      this.expect("RBRACE");
      return makeNode<DeriveCollectExprNode>(this, "DeriveCollectExpr", { name: "@derive.collect", path, layer, key }, start);
    }

    this.skipNewlines();
    this.expect("LBRACE");
    this.skipNewlines();

    while (!this.checkType("RBRACE")) {
      if (!(this.checkType("IDENT") && this.peekNext().type === "COLON")) {
        throw this.error(this.peek(), "Expected @derive.collect field name");
      }

      const fieldToken = this.expectType("IDENT");
      this.expect("COLON");
      this.skipNewlines();

      switch (fieldToken.value) {
        case "path":
          if (path !== null) throw this.error(fieldToken, 'Duplicate @derive.collect field "path"');
          path = this.parseDerivePathExpr();
          break;
        case "layer":
          if (layer !== null) throw this.error(fieldToken, 'Duplicate @derive.collect field "layer"');
          layer = this.parseRelationLabel();
          break;
        case "key":
          if (key !== null) throw this.error(fieldToken, 'Duplicate @derive.collect field "key"');
          key = this.parseRelationLabel();
          break;
        default:
          throw this.error(fieldToken, `Unknown @derive.collect field "${fieldToken.value}"`);
      }
      this.skipNewlines();
    }

    this.expect("RBRACE");
    return makeNode<DeriveCollectExprNode>(this, "DeriveCollectExpr", { name: "@derive.collect", path, layer, key }, start);
  }

export function parseComputeSumExprImpl(this: any): ComputeSumExprNode {
    const start = this.expect("KEYWORD", "@compute.sum");
    this.skipNewlines();
    this.expect("LPAREN");
    this.skipNewlines();
    const field = this.parseRelationLabel();
    this.skipNewlines();
    this.expect("RPAREN");
    this.skipNewlines();
    const from = this.parseComputeSourceBlock();
    return makeNode<ComputeSumExprNode>(this, "ComputeSumExpr", {
      name: "@compute.sum",
      collect: null,
      from,
      field,
    }, start);
  }

export function parseComputeMinExprImpl(this: any): ComputeMinExprNode {
    const start = this.expectType("KEYWORD");
    const name = start.value as "@compute.min";
    const { from, field } = this.parseFieldAggregate(name);
    return makeNode<ComputeMinExprNode>(this, "ComputeMinExpr", { name, from, field }, start);
  }

export function parseComputeMaxExprImpl(this: any): ComputeMaxExprNode {
    const start = this.expectType("KEYWORD");
    const name = start.value as "@compute.max";
    const { from, field } = this.parseFieldAggregate(name);
    return makeNode<ComputeMaxExprNode>(this, "ComputeMaxExpr", { name, from, field }, start);
  }

export function parseComputeAvgExprImpl(this: any): ComputeAvgExprNode {
    const start = this.expectType("KEYWORD");
    const name = start.value as "@compute.avg";
    const { from, field } = this.parseFieldAggregate(name);
    return makeNode<ComputeAvgExprNode>(this, "ComputeAvgExpr", { name, from, field }, start);
  }

export function parseComputeAbsExprImpl(this: any): ComputeAbsExprNode {
    const start = this.expectType("KEYWORD");
    const name = start.value as "@compute.abs";
    this.skipNewlines();
    this.expect("LPAREN");
    this.skipNewlines();
    const value = this.parseDeriveExpr();
    this.skipNewlines();
    this.expect("RPAREN");
    return makeNode<ComputeAbsExprNode>(this, "ComputeAbsExpr", { name, value }, start);
  }

export function parseFieldAggregateImpl(this: any, 
    name:
      | "@compute.min"
      | "@compute.max"
      | "@compute.avg",
  ): {
    from: ComputeSourceNode | null;
    field: StringLiteralNode | null;
  } {
    this.skipNewlines();
    this.expect("LPAREN");
    this.skipNewlines();
    const field = this.parseRelationLabel();
    this.skipNewlines();
    this.expect("RPAREN");
    this.skipNewlines();
    const from = this.parseComputeSourceBlock();
    return { from, field };
  }

export function parseComputeSourceBlockImpl(this: any): ComputeSourceNode {
    this.expect("LBRACE");
    this.skipNewlines();
    const source = this.parseComputeSource();
    this.skipNewlines();
    this.expect("RBRACE");
    return source;
  }

export function parseNamedArgumentsImpl(this: any, name: string): Array<{
    key: IdentifierNode;
    value: ValueExprNode | AggregateQueryExprNode | DeriveExprNode;
  }> {
    const fields: Array<{
      key: IdentifierNode;
      value: ValueExprNode | AggregateQueryExprNode | DeriveExprNode;
    }> = [];
    this.skipNewlines();
    while (!this.checkType("RPAREN")) {
      this.skipNewlines();
      if (!(this.checkType("IDENT") && this.peekNext().type === "COLON")) {
        throw this.error(this.peek(), `Expected ${name} field name`);
      }
      const key = this.parseIdentifier();
      this.expect("COLON");
      this.skipNewlines();
      const value = this.parseExtendedNamedArgumentValue();
      fields.push({ key, value });
      this.skipNewlines();
      if (!this.match("COMMA")) {
        break;
      }
      this.skipNewlines();
    }
    this.skipNewlines();
    return fields;
  }

export function parseExtendedNamedArgumentValueImpl(this: any):
    | ValueExprNode
    | AggregateQueryExprNode
    | DeriveExprNode {
    if (this.check("KEYWORD", "@query") && this.peekNext().type === "LPAREN") {
      return this.parseAggregateQueryExpr();
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

    return this.parseValueExpr();
  }

export function parseComputeSourceImpl(this: any): ComputeSourceNode {
    if (this.check("KEYWORD", "@derive.path")) {
      return this.parseDerivePathExpr();
    }

    throw this.error(
      this.peek(),
      "Expected @derive.path compute source",
    );
  }

export function parseComputeSourceValueImpl(this: any, 
    value: ValueExprNode | AggregateQueryExprNode | DeriveExprNode,
  ): ComputeSourceNode {
    if (
      value.type === "DerivePathExpr" ||
      value.type === "AggregateQueryExpr" ||
      value.type === "Identifier"
    ) {
      return value;
    }

    throw this.error(
      value.span
        ? ({
            type: "IDENT",
            value: "",
            line: value.span.line,
            column: value.span.column,
            index: value.span.start,
          } as Token)
        : this.peek(),
      "Expected @derive.path compute source",
    );
  }

export function parseComputeExistsValueImpl(this: any, 
    value: ValueExprNode | AggregateQueryExprNode | DeriveExprNode,
  ): DerivePathExprNode | IdentifierNode {
    if (value.type === "DerivePathExpr" || value.type === "Identifier") {
      return value;
    }

    throw this.error(
      value.span
        ? ({
            type: "IDENT",
            value: "",
            line: value.span.line,
            column: value.span.column,
            index: value.span.start,
          } as Token)
        : this.peek(),
      "Expected @derive.path or identifier source",
    );
  }

export function parseStringLiteralValueImpl(this: any, 
    value: ValueExprNode | AggregateQueryExprNode | DeriveExprNode,
    opName: string,
    fieldName: string,
  ): StringLiteralNode {
    if (value.type === "StringLiteral") {
      return value;
    }
    throw this.error(
      value.span
        ? ({
            type: "IDENT",
            value: "",
            line: value.span.line,
            column: value.span.column,
            index: value.span.start,
          } as Token)
        : this.peek(),
      `${opName} ${fieldName} must be a string literal`,
    );
  }

export function parseDeriveCollectValueImpl(this: any, 
    value: ValueExprNode | AggregateQueryExprNode | DeriveExprNode,
  ): DeriveCollectExprNode {
    if (value.type === "DeriveCollectExpr") {
      return value;
    }
    throw this.error(
      value.span
        ? ({
            type: "IDENT",
            value: "",
            line: value.span.line,
            column: value.span.column,
            index: value.span.start,
          } as Token)
        : this.peek(),
      "Expected @derive.collect value",
    );
  }

export function parseAggregateQueryExprImpl(this: any): AggregateQueryExprNode {
    const start = this.expect("KEYWORD", "@query");
    this.skipNewlines();
    this.expect("LPAREN");
    this.skipNewlines();

    let typeName: StringLiteralNode | null = null;
    while (!this.checkType("RPAREN")) {
      if (!(this.checkType("IDENT") && this.peekNext().type === "COLON")) {
        throw this.error(this.peek(), "Expected @query field name");
      }
      const fieldToken = this.expectType("IDENT");
      this.expect("COLON");
      this.skipNewlines();
      switch (fieldToken.value) {
        case "type":
          if (typeName !== null) {
            throw this.error(fieldToken, 'Duplicate @query field "type"');
          }
          typeName = this.parseStringLiteral();
          break;
        default:
          throw this.error(
            fieldToken,
            `Unknown @query field "${fieldToken.value}"`,
          );
      }
      this.skipNewlines();
      if (!this.match("COMMA")) {
        break;
      }
      this.skipNewlines();
    }

    this.expect("RPAREN");
    return makeNode<AggregateQueryExprNode>(this, 
      "AggregateQueryExpr",
      {
        name: "@query",
        typeName,
      },
      start,
    );
  }

export function parseDeriveExprImpl(this: any): DeriveExprNode {
    return this.parseDeriveAddition();
  }

export function parseDeriveAdditionImpl(this: any): DeriveExprNode {
    let expr = this.parseDeriveMultiplication();

    while (this.checkType("PLUS") || this.checkType("MINUS")) {
      const operator = this.advance();
      const right = this.parseDeriveMultiplication();
      expr = makeNode<DeriveBinaryExprNode>(this, 
        "DeriveBinaryExpr",
        {
          operator: operator.value as DeriveBinaryExprNode["operator"],
          left: expr,
          right,
        },
        operator,
      );
    }

    return expr;
  }

export function parseDeriveMultiplicationImpl(this: any): DeriveExprNode {
    let expr = this.parseDerivePrimary();

    while (
      this.checkType("STAR") ||
      this.checkType("SLASH") ||
      this.checkType("PERCENT")
    ) {
      const operator = this.advance();
      const right = this.parseDerivePrimary();
      expr = makeNode<DeriveBinaryExprNode>(this, 
        "DeriveBinaryExpr",
        {
          operator: operator.value as DeriveBinaryExprNode["operator"],
          left: expr,
          right,
        },
        operator,
      );
    }

    return expr;
  }

export function parseDerivePrimaryImpl(this: any): DeriveExprNode {
    if (this.checkType("IDENT")) {
      if (this.peek().value === "current") {
        const token = this.expectType("IDENT");
        return makeNode<CurrentValueNode>(this, 
          "CurrentValue",
          {
            name: "current",
          },
          token,
        );
      }

      if (this.peek().value === "previous") {
        const token = this.expectType("IDENT");
        return makeNode<PreviousValueNode>(this, 
          "PreviousValue",
          {
            name: "previous",
          },
          token,
        );
      }
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

    if (this.check("KEYWORD", "@compute.edgeCount")) {
      return this.parseComputeEdgeCountExpr();
    }

    if (this.check("KEYWORD", "@compute.exists")) {
      return this.parseComputeExistsExpr();
    }

    if (this.check("KEYWORD", "@derive.path")) {
      return this.parseDerivePathExpr();
    }

    if (this.check("KEYWORD", "@derive.collect")) {
      return this.parseDeriveCollectExpr();
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

    if (this.checkType("NUMBER")) return this.parseNumberLiteral();
    if (this.checkType("STRING")) return this.parseStringLiteral();

    throw this.error(this.peek(), "Expected derive expression");
  }


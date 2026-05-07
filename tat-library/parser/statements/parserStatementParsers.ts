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

import { stripQuotes, splitRegexLiteral, identToToken, atomToToken, nodeToToken, makeNode } from "../core/parserUtils.js";

export function parseTopLevelInjectionStatementImpl(this: any): TopLevelInjectionStatementNode {
    const start = this.expect("INJECT_FLOW");
    const inject = this.parseInjectExpr();

    return makeNode<TopLevelInjectionStatementNode>(this, 
      "TopLevelInjectionStatement",
      { inject },
      start,
    );
  }

export function parseInjectExprImpl(this: any): InjectExprNode {
    const start = this.expect("KEYWORD", "@inject");
    this.expect("LPAREN");
    const hookRef = this.parseIdentifier();
    this.expect("COMMA");
    const fileExtension = this.parseStringLiteral();
    let alias: IdentifierNode | null = null;

    if (this.match("COMMA")) {
      alias = this.parseIdentifier();
    }

    this.expect("RPAREN");

    return makeNode<InjectExprNode>(this, 
      "InjectExpr",
      {
        name: "@inject",
        hookRef,
        fileExtension,
        alias,
      },
      start,
    );
  }

export function parseImportDeclarationImpl(this: any): ImportDeclarationNode {
    const start = this.expectIdentifierValue("import");
    this.skipNewlines();
    this.expect("LBRACE");
    this.skipNewlines();

    const specifiers: ImportSpecifierNode[] = [];

    while (!this.checkType("RBRACE")) {
      const imported = this.parseIdentifier();
      let local = imported;

      if (this.checkTypeIdentifierValue("as")) {
        this.expectIdentifierValue("as");
        local = this.parseIdentifier();
      }

      specifiers.push(
        makeNode<ImportSpecifierNode>(this, 
          "ImportSpecifier",
          { imported, local },
          identToToken(imported),
        ),
      );

      this.skipNewlines();

      if (this.match("COMMA")) {
        this.skipNewlines();
        continue;
      }

      break;
    }

    this.skipNewlines();
    this.expect("RBRACE");
    this.skipNewlines();
    this.expectIdentifierValue("from");
    this.skipNewlines();
    const source = this.parseStringLiteral();

    return makeNode<ImportDeclarationNode>(this, 
      "ImportDeclaration",
      {
        specifiers,
        source,
      },
      start,
    );
  }

export function parseExportDeclarationImpl(this: any): ExportDeclarationNode {
    const start = this.expectIdentifierValue("export");
    this.skipNewlines();

    const specifiers: ExportSpecifierNode[] = [];

    if (this.match("LBRACE")) {
      this.skipNewlines();

      while (!this.checkType("RBRACE")) {
        const local = this.parseIdentifier();
        specifiers.push(
          makeNode<ExportSpecifierNode>(this, 
            "ExportSpecifier",
            { local },
            identToToken(local),
          ),
        );

        this.skipNewlines();
        if (this.match("COMMA")) {
          this.skipNewlines();
          continue;
        }
        break;
      }

      this.skipNewlines();
      this.expect("RBRACE");
    } else {
      const local = this.parseIdentifier();
      specifiers.push(
        makeNode<ExportSpecifierNode>(this, 
          "ExportSpecifier",
          { local },
          identToToken(local),
        ),
      );
    }

    return makeNode<ExportDeclarationNode>(this, 
      "ExportDeclaration",
      { specifiers },
      start,
    );
  }


export function parseValueDefinitionImpl(this: any): ValueDefNode {
  const start = this.expect("KEYWORD", "@value.define");
  this.expect("LPAREN");
  const scopeName = this.parseIdentifier();
  this.expect("RPAREN");
  this.skipNewlines();
  const body = this.parseObjectLiteral();

  return makeNode<ValueDefNode>(this,
    "ValueDef",
    {
      name: "@value.define",
      scopeName,
      entries: body.properties,
    },
    start,
  );
}
export function parseProjectionDefinitionImpl(this: any): ProjectionDefNode {
    const start = this.expect("KEYWORD", "@project.define");
    this.skipNewlines();
    this.expect("LPAREN");
    this.skipNewlines();
    const name = this.parseIdentifier();
    this.skipNewlines();

    let focus: ValueExprNode | null = null;

    if (this.match("COMMA")) {
      this.skipNewlines();
      focus = this.parseValueExpr();
      this.skipNewlines();
    }

    this.expect("RPAREN");
    this.skipNewlines();

    this.expect("LBRACE");
    this.skipNewlines();
    let contract: ProjectionContractNode | null = null;
    let fields: ObjectLiteralNode | null = null;

    while (!this.checkType("RBRACE")) {
      if (!(this.checkType("IDENT") && this.peekNext().type === "COLON")) {
        throw this.error(this.peek(), "Expected @project.define section name");
      }

      const sectionToken = this.expectType("IDENT");
      this.expect("COLON");
      this.skipNewlines();

      switch (sectionToken.value) {
        case "focus":
          if (focus !== null) {
            throw this.error(
              sectionToken,
              'Duplicate @project.define section "focus"',
            );
          }
          focus = this.parseValueExpr();
          break;

        case "contract":
          if (contract !== null) {
            throw this.error(
              sectionToken,
              'Duplicate @project.define section "contract"',
            );
          }
          contract = this.parseProjectionContract();
          break;

        case "fields":
          if (fields !== null) {
            throw this.error(
              sectionToken,
              'Duplicate @project.define section "fields"',
            );
          }
          fields = this.parseObjectLiteral();
          break;

        default:
          throw this.error(
            sectionToken,
            `Unknown @project.define section "${sectionToken.value}"`,
          );
      }

      this.skipNewlines();
      if (this.checkType("RBRACE")) break;
      if (!this.match("COMMA")) {
        throw this.error(this.peek(), "Expected comma between @project.define sections");
      }
      this.skipNewlines();
    }

    this.expect("RBRACE");

    if (fields === null) {
      throw this.error(start, "@project.define requires a fields section");
    }

    return makeNode<ProjectionDefNode>(this, 
      "ProjectionDef",
      {
        name,
        focus,
        contract,
        fields,
      },
      start,
    );
  }

export function parseProjectionContractImpl(this: any): ProjectionContractNode {
    const start = this.expect("LBRACE");
    const entries: ProjectionContractFieldNode[] = [];
    this.skipNewlines();

    while (!this.checkType("RBRACE")) {
      const keyToken = this.peek();
      let key: string;

      if (this.checkType("IDENT")) {
        key = this.advance().value;
      } else if (this.checkType("STRING")) {
        key = stripQuotes(this.advance().value);
      } else {
        throw this.error(this.peek(), "Expected contract field name");
      }

      this.expect("COLON");
      this.skipNewlines();

      let requirement: ProjectionContractFieldNode["requirement"];
      if (this.checkType("IDENT")) {
        const value = this.advance().value;
        if (value !== "required" && value !== "optional") {
          throw this.error(
            this.previous(),
            'Projection contract values must be "required" or "optional"',
          );
        }
        requirement = value;
      } else if (this.checkType("STRING")) {
        const value = stripQuotes(this.advance().value);
        if (value !== "required" && value !== "optional") {
          throw this.error(
            this.previous(),
            'Projection contract values must be "required" or "optional"',
          );
        }
        requirement = value;
      } else {
        throw this.error(this.peek(), "Expected projection contract value");
      }

      entries.push(
        makeNode<ProjectionContractFieldNode>(this, 
          "ProjectionContractField",
          { key, requirement },
          keyToken,
        ),
      );

      this.skipNewlines();
      if (this.checkType("RBRACE")) break;
      if (!this.match("COMMA")) {
        throw this.error(this.peek(), "Expected comma between projection contract fields");
      }
      this.skipNewlines();
    }

    this.skipNewlines();
    this.expect("RBRACE");

    return makeNode<ProjectionContractNode>(this, 
      "ProjectionContract",
      { entries },
      start,
    );
  }

export function parseBindingLikeStatementImpl(this: any): StatementNode {
    const ident = this.parseIdentifier();

    if (this.match("COLON_EQUALS")) {
      if (this.check("KEYWORD", "@graph")) {
        return this.parseGraphInteractionDefinition(ident);
      }

      if (
        this.check("KEYWORD", "@seed") ||
        this.check("KEYWORD", "@compose") ||
        this.isGraphProjectionExprStart()
      ) {
        return this.parseGraphPipelineAfterName(ident);
      }

      if (
        this.check("KEYWORD", "@query.edge") ||
        this.check("KEYWORD", "@query.state") ||
        this.check("KEYWORD", "@query.meta") ||
        this.isPathKeyword() ||
        this.check("KEYWORD", "@choose") ||
        this.check("KEYWORD", "@where") ||
        this.check("KEYWORD", "@select.node") ||
        this.check("KEYWORD", "@select.targets") ||
        this.check("KEYWORD", "@select.sources") ||
        this.check("KEYWORD", "@select.first") ||
        this.check("KEYWORD", "@select.only") ||
        this.check("KEYWORD", "@select.from") ||
        this.isDeriveOrComputeExprStart()
      ) {
        const value = this.parseValueExpr();
        return makeNode<ValueBindingNode>(this,
          "ValueBinding",
          { name: ident, value },
          identToToken(ident),
        );
      }

      const value = this.parseOperatorExpr();
      return makeNode<OperatorBindingNode>(this, 
        "OperatorBinding",
        {
          name: ident,
          value,
        },
        identToToken(ident),
      );
    }

    if (this.match("EQUALS")) {
      if (this.check("KEYWORD", "@seed") || this.check("KEYWORD", "@compose") || this.isGraphProjectionExprStart()) {
        throw this.error(this.peek(), 'Semantic graph/projection result bindings must use ":=".');
      }
      if (this.checkType("KEYWORD")) {
        throw this.error(this.peek(), 'Semantic operation result bindings must use ":=".');
      }

      const value = this.parseValueExpr();
      return makeNode<ValueBindingNode>(this, 
        "ValueBinding",
        {
          name: ident,
          value,
        },
        identToToken(ident),
      );
    }

    throw this.error(
      this.peek(),
      `Expected "=" or ":=" after identifier "${ident.name}"`,
    );
  }

export function isBindStatementStartImpl(this: any): boolean {
    if (!this.checkType("KEYWORD")) {
      return false;
    }

    return this.peek().value === "@bind";
  }

export function parseBindStatementImpl(this: any): BindStatementNode {
    const keyword = this.expectType("KEYWORD");
    const { layer, entity } = this.parseBindSelector(keyword);

    if (layer !== null || entity !== null) {
      throw this.error(keyword, 'Legacy @bind.* forms are no longer canonical. Use @bind(refName) { expression }.');
    }

    this.expect("LPAREN");
    const name = this.parseIdentifier();
    this.expect("RPAREN");
    this.skipNewlines();
    this.expect("LBRACE");
    this.skipNewlines();
    const expression = this.parseValueExpr();
    this.skipNewlines();
    this.expect("RBRACE");

    return makeNode<BindStatementNode>(this, 
      "BindStatement",
      {
        layer,
        entity,
        name,
        expression,
      },
      keyword,
    );
  }

export function parseBindSelectorImpl(this: any, keyword: Token): {
    layer: BindLayer | null;
    entity: BindEntity | null;
  } {
    const parts = keyword.value.split(".");

    if (parts[0] !== "@bind") {
      throw this.error(
        keyword,
        `Expected @bind statement, got "${keyword.value}"`,
      );
    }

    if (parts.length === 1) {
      return { layer: null, entity: null };
    }

    if (parts.length === 2) {
      return {
        layer: parts[1] as BindLayer,
        entity: null,
      };
    }

    if (parts.length === 3) {
      return {
        layer: parts[1] as BindLayer,
        entity: parts[2] as BindEntity,
      };
    }

    throw this.error(keyword, `Unsupported @bind form "${keyword.value}"`);
  }

export function parseSeedBlockImpl(this: any): SeedBlockNode {
    const start = this.expect("KEYWORD", "@seed");
    this.skipNewlines();
    this.expect("LBRACE");
    this.skipNewlines();

    let nodes: SeedNodeRefNode[] = [];
    let edges: SeedEdgeEntryNode[] = [];
    let state: ObjectLiteralNode | null = null;
    let meta: ObjectLiteralNode | null = null;
    let root: IdentifierNode | null = null;

    while (!this.checkType("RBRACE")) {
      this.skipNewlines();

      if (!(this.checkType("IDENT") && this.peekNext().type === "COLON")) {
        throw this.error(this.peek(), "Expected @seed field name");
      }

      const field = this.parseIdentifier().name;
      this.expect("COLON");

      switch (field) {
        case "nodes":
          nodes = this.parseSeedNodes();
          break;
        case "edges":
          edges = this.parseSeedEdges();
          break;
        case "state":
          state = this.parseObjectLiteral();
          break;
        case "meta":
          meta = this.parseObjectLiteral();
          break;
        case "root":
          root = this.parseIdentifier();
          break;
        default:
          throw this.error(this.peek(), `Unknown @seed field "${field}"`);
      }

      this.skipNewlines();
      if (this.checkType("RBRACE")) break;
      if (!this.match("COMMA")) {
        throw this.error(this.peek(), "Expected comma between @seed fields");
      }
      this.skipNewlines();
    }

    this.expect("RBRACE");

    if (!state) {
      state = makeNode<ObjectLiteralNode>(this, 
        "ObjectLiteral",
        { properties: [] },
        start,
      );
    }

    if (!meta) {
      meta = makeNode<ObjectLiteralNode>(this, 
        "ObjectLiteral",
        { properties: [] },
        start,
      );
    }

    if (!root) {
      throw this.error(start, `@seed requires a root field`);
    }

    return makeNode<SeedBlockNode>(this, 
      "SeedBlock",
      {
        nodes,
        edges,
        state,
        meta,
        root,
      },
      start,
    );
  }

export function parseSeedNodesImpl(this: any): SeedNodeRefNode[] {
    this.expect("LBRACKET");
    const nodes: SeedNodeRefNode[] = [];

    this.skipNewlines();

    while (!this.checkType("RBRACKET")) {
      this.skipNewlines();

      const ref = this.parseIdentifier();
      nodes.push(
        makeNode<SeedNodeRefNode>(this, "SeedNodeRef", { ref }, identToToken(ref)),
      );

      this.skipNewlines();

      if (this.match("COMMA")) {
        this.skipNewlines();
        continue;
      }

      break;
    }

    this.skipNewlines();
    this.expect("RBRACKET");
    return nodes;
  }

export function parseSeedEdgesImpl(this: any): SeedEdgeEntryNode[] {
    this.expect("LBRACKET");
    const edges: SeedEdgeEntryNode[] = [];

    this.skipNewlines();

    while (!this.checkType("RBRACKET")) {
      this.skipNewlines();
      edges.push(this.parseSeedEdgeEntry());

      this.skipNewlines();

      if (this.match("COMMA")) {
        this.skipNewlines();
        continue;
      }

      break;
    }

    this.skipNewlines();
    this.expect("RBRACKET");
    return edges;
  }

export function parseSeedEdgeEntryImpl(this: any): SeedEdgeEntryNode {
    if (
      this.checkType("IDENT") &&
      this.peekNext().type === "COLON_EQUALS" &&
      this.peekN(2).type === "LBRACKET"
    ) {
      const name = this.parseIdentifier();
      this.expect("COLON_EQUALS");
      this.expect("LBRACKET");
      this.skipNewlines();
      const edge = this.parseEdgeExpr();
      this.skipNewlines();
      this.expect("RBRACKET");
      return makeNode<SeedEdgeBindingNode>(this, 
        "SeedEdgeBinding",
        {
          name,
          edge,
        },
        identToToken(name),
      );
    }

    this.expect("LBRACKET");
    this.skipNewlines();
    const edge = this.parseEdgeExpr();
    this.skipNewlines();
    this.expect("RBRACKET");
    return edge;
  }
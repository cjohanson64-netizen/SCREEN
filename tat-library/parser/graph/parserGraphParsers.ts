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

export function parseEdgeExprImpl(this: any): EdgeExprNode {
    const left = this.parseIdentifier();
    this.expect("COLON");
    const relation = this.parseRelationLabel();
    this.expect("COLON");
    const right = this.parseIdentifier();

    return makeNode<EdgeExprNode>(this, 
      "EdgeExpr",
      {
        left,
        relation,
        right,
      },
      identToToken(left),
    );
  }

export function parseGraphInteractionDefinitionImpl(this: any, 
    name: IdentifierNode | null,
  ): GraphInteractionDefinitionNode {
    const start = name ? identToToken(name) : this.peek();
    const source = this.parseGraphRef();

    if (this.match("TCOLON")) {
      return this.parseModernGraphInteractionDefinition(
        name,
        start,
        source,
        "implicit",
      );
    }

    this.expect("COLON");

    if (this.peek().type === "KEYWORD" && this.peek().value === "@ctx") {
      return this.parseModernGraphInteractionDefinition(
        name,
        start,
        source,
        "explicit",
      );
    }

    return this.parseLegacyGraphInteractionDefinition(name, start, source);
  }

export function parseLegacyGraphInteractionDefinitionImpl(this: any, 
    name: IdentifierNode | null,
    start: Token,
    source: GraphRefNode,
  ): GraphInteractionDefinitionNode {
    const relation = this.parseStringLiteral();
    this.expect("COLON");

    const target = this.parseGraphRef();

    this.skipNewlines();
    this.expect("ARROW");

    const effect = this.parseEffectBlock();

    const through = makeNode<IdentifierNode>(this, 
      "Identifier",
      {
        name: relation.value,
      },
      start,
    );

    const bridge = makeNode<ImplicitGraphBridgeNode>(this, 
      "ImplicitGraphBridge",
      {},
      start,
    );

    return makeNode<GraphInteractionDefinitionNode>(this, 
      "GraphInteractionDefinition",
      {
        name,
        source,
        bridge,
        target,
        through,
        effect,
      },
      start,
    );
  }

export function parseModernGraphInteractionDefinitionImpl(this: any, 
    name: IdentifierNode | null,
    start: Token,
    source: GraphRefNode,
    bridgeMode: "implicit" | "explicit",
  ): GraphInteractionDefinitionNode {
    const bridge =
      bridgeMode === "implicit"
        ? makeNode<ImplicitGraphBridgeNode>(this, "ImplicitGraphBridge", {}, start)
        : this.parseExplicitGraphBridge(start);

    const target = this.parseGraphRef();

    this.skipNewlines();

    const { through, when } = this.parseGraphAttachBlock();

    this.skipNewlines();

    const effect = this.match("ARROW") ? this.parseEffectBlock() : undefined;

    return makeNode<GraphInteractionDefinitionNode>(this, 
      "GraphInteractionDefinition",
      {
        name,
        source,
        bridge,
        target,
        through,
        when,
        effect,
      },
      start,
    );
  }

export function parseExplicitGraphBridgeImpl(this: any, start: Token): ExplicitGraphBridgeNode {
    const ctx = this.parseCtxExpr();
    this.expect("DCOLON");

    return makeNode<ExplicitGraphBridgeNode>(this, 
      "ExplicitGraphBridge",
      {
        ctx,
      },
      start,
    );
  }

export function parseGraphAttachBlockImpl(this: any): {
    through: IdentifierNode;
    when?: QueryExprNode | BooleanExprNode;
  } {
    this.expect("LBRACE");
    this.skipNewlines();

    let through: IdentifierNode | null = null;
    let when: QueryExprNode | BooleanExprNode | undefined;

    while (!this.check("RBRACE") && !this.check("EOF")) {
      const key = this.expect("IDENT").value;
      this.expect("COLON");
      this.skipNewlines();

      if (key === "through") {
        through = this.parseIdentifier();
      } else if (key === "when" || key === "condition") {
        when = this.parseGraphRelationshipCondition();
      } else {
        throw this.error(
          this.peek(),
          `Unexpected @graph relationship field "${key}"`,
        );
      }

      this.skipNewlines();
      if (this.checkType("RBRACE")) break;
      if (!this.match("COMMA")) throw this.error(this.peek(), "Expected comma between @graph relationship fields");
      this.skipNewlines();
    }

    this.expect("RBRACE");

    if (!through) {
      throw this.error(
        this.peek(),
        '@graph relationship block requires "through"',
      );
    }

    return { through, when };
  }

export function parseGraphRelationshipConditionImpl(this: any): QueryExprNode | BooleanExprNode {
    if (
      this.check("KEYWORD", "@query.edge") ||
      this.check("KEYWORD", "@query.state") ||
      this.check("KEYWORD", "@query.meta")
    ) {
      return this.parseQueryExpr();
    }

    return this.parseBooleanExpr();
  }

export function parseGraphRefImpl(this: any): GraphRefNode {
    const start = this.expect("KEYWORD", "@graph");
    this.expect("LPAREN");
    const graphId = this.parseIdentifier();
    this.expect("RPAREN");

    return makeNode<GraphRefNode>(this, 
      "GraphRef",
      {
        name: "@graph",
        graphId,
      },
      start,
    );
  }

export function parseEffectBlockImpl(this: any): EffectBlockNode {
    const start = this.expect("KEYWORD", "@effect");
    this.skipNewlines();
    this.expect("LBRACE");
    this.skipNewlines();
    const pipeline = this.parseGraphPipelineSection();
    this.skipNewlines();
    this.expect("RBRACE");

    return makeNode<EffectBlockNode>(this,
      "EffectBlock",
      {
        name: "@effect",
        pipeline,
      },
      start,
    );
  }

export function parseEffectTargetImpl(this: any): RootTargetNode | IdentifierNode {
    if (this.checkType("IDENT") && this.peek().value === "root") {
      const token = this.expectType("IDENT");
      return makeNode<RootTargetNode>(this, 
        "RootTarget",
        {
          name: "root",
        },
        token,
      );
    }

    return this.parseIdentifier();
  }

export function parseEffectOpsImpl(this: any): EffectOpNode[] {
    this.expect("LBRACKET");
    this.skipNewlines();

    const ops: EffectOpNode[] = [];

    while (!this.checkType("RBRACKET")) {
      ops.push(this.parseEffectOp());
      this.skipNewlines();

      if (!this.match("COMMA")) {
        break;
      }

      this.skipNewlines();
    }

    this.expect("RBRACKET");
    return ops;
  }

export function parseEffectOpImpl(this: any): EffectOpNode {
    const keyword = this.expectType("KEYWORD");

    switch (keyword.value) {
      case "@graft.state": {
        this.expect("LPAREN");
        const node = this.parseIdentifier();
        this.expect("COMMA");
        const key = this.parseRelationLabel();
        this.expect("COMMA");
        const value = this.parseValueExpr();
        this.expect("RPAREN");
        return makeNode<EffectGraftStateOpNode>(this, 
          "EffectGraftStateOp",
          {
            name: "@graft.state",
            node,
            key,
            value,
          },
          keyword,
        );
      }

      case "@graft.meta": {
        this.expect("LPAREN");
        const node = this.parseIdentifier();
        this.expect("COMMA");
        const key = this.parseRelationLabel();
        this.expect("COMMA");
        const value = this.parseValueExpr();
        this.expect("RPAREN");
        return makeNode<EffectGraftMetaOpNode>(this, 
          "EffectGraftMetaOp",
          {
            name: "@graft.meta",
            node,
            key,
            value,
          },
          keyword,
        );
      }

      case "@prune.state": {
        this.expect("LPAREN");
        const node = this.parseIdentifier();
        this.expect("COMMA");
        const key = this.parseRelationLabel();
        this.expect("RPAREN");
        return makeNode<EffectPruneStateOpNode>(this, 
          "EffectPruneStateOp",
          {
            name: "@prune.state",
            node,
            key,
          },
          keyword,
        );
      }

      case "@prune.meta": {
        this.expect("LPAREN");
        const node = this.parseIdentifier();
        this.expect("COMMA");
        const key = this.parseRelationLabel();
        this.expect("RPAREN");
        return makeNode<EffectPruneMetaOpNode>(this, 
          "EffectPruneMetaOp",
          {
            name: "@prune.meta",
            node,
            key,
          },
          keyword,
        );
      }

      case "@derive.state": {
        this.expect("LPAREN");
        const key = this.parseRelationLabel();
        this.expect("COMMA");
        const expression = this.parseDeriveExpr();
        this.expect("RPAREN");
        return makeNode<EffectDeriveStateOpNode>(this, 
          "EffectDeriveStateOp",
          {
            name: "@derive.state",
            key,
            expression,
          },
          keyword,
        );
      }

      case "@derive.meta": {
        this.expect("LPAREN");
        const key = this.parseRelationLabel();
        this.expect("COMMA");
        const expression = this.parseDeriveExpr();
        this.expect("RPAREN");
        return makeNode<EffectDeriveMetaOpNode>(this, 
          "EffectDeriveMetaOp",
          {
            name: "@derive.meta",
            key,
            expression,
          },
          keyword,
        );
      }

      default:
        throw this.error(keyword, `Unsupported @effect op "${keyword.value}"`);
    }
  }

export function parseGraphPipelineImpl(this: any): GraphPipelineNode {
    const name = this.parseIdentifier();
    this.expect("COLON_EQUALS");
    return this.parseGraphPipelineAfterName(name);
  }

export function parseGraphPipelineAfterNameImpl(this: any, name: IdentifierNode): GraphPipelineNode {
    const start = identToToken(name);
    const source = this.parseGraphSource();

    const mutations: GraphPipelineStepNode[] = [];
    let projection: TerminalGraphExprNode | null = null;

    this.skipNewlines();

    while (true) {
      if (this.match("ARROW")) {
        const mutation = this.parseGraphPipelineStep();
        mutations.push(mutation);
        this.skipNewlines();
        continue;
      }

      if (this.match("INJECT_FLOW")) {
        mutations.push(this.parseGraphInjectionStep());
        this.skipNewlines();
        continue;
      }

      break;
    }

    if (this.match("PROJECT")) {
      projection = this.parseTerminalGraphExpr();
    }

    return makeNode<GraphPipelineNode>(this, 
      "GraphPipeline",
      {
        name,
        source,
        mutations,
        projection,
      },
      start,
    );
  }

export function parseGraphInjectionStepImpl(this: any): GraphInjectionStepNode {
    const start = this.previous();
    const inject = this.parseInjectExpr();

    return makeNode<GraphInjectionStepNode>(this, 
      "GraphInjectionStep",
      { inject },
      start,
    );
  }

export function parseGraphPipelineStepImpl(this: any): GraphPipelineStepNode {
    if (this.check("KEYWORD", "@if")) {
      return this.parseIfExpr();
    }

    if (this.check("KEYWORD", "@when")) {
      return this.parseWhenExpr();
    }

    if (this.check("KEYWORD", "@repeat")) {
      return this.parseRepeatExpr();
    }

    return this.parseMutationExpr();
  }

export function parseMutationExprImpl(this: any): MutationExprNode {
    const keyword = this.expectType("KEYWORD");

    switch (keyword.value) {
      case "@runtime.addNode": {
        this.expect("LPAREN");
        const node = this.check("KEYWORD", "@runtime.generateNodeId")
          ? this.parseRuntimeGenerateNodeIdExpr()
          : this.parseIdentifier();
        this.expect("COMMA");
        const value = this.parseValueExpr();
        this.expect("COMMA");
        const state = this.parseValueExpr();
        this.expect("COMMA");
        const meta = this.parseValueExpr();
        this.expect("RPAREN");
        return makeNode<RuntimeAddNodeExprNode>(this, 
          "RuntimeAddNodeExpr",
          {
            name: "@runtime.addNode",
            node,
            value,
            state,
            meta,
          },
          keyword,
        );
      }

      case "@runtime.updateNodeValue": {
        this.expect("LPAREN");
        const node = this.parseIdentifier();
        this.expect("COMMA");
        const patch = this.parseValueExpr();
        this.expect("RPAREN");
        return makeNode<RuntimeUpdateNodeValueExprNode>(this, 
          "RuntimeUpdateNodeValueExpr",
          {
            name: "@runtime.updateNodeValue",
            node,
            patch,
          },
          keyword,
        );
      }

      case "@runtime.deleteNode": {
        this.expect("LPAREN");
        const node = this.parseIdentifier();
        this.expect("RPAREN");
        return makeNode<RuntimeDeleteNodeExprNode>(this, 
          "RuntimeDeleteNodeExpr",
          {
            name: "@runtime.deleteNode",
            node,
          },
          keyword,
        );
      }

      case "@graft.branch": {
        this.expect("LPAREN");
        const subject = this.parseIdentifier();
        this.expect("COMMA");
        const relation = this.parseRelationLabel();
        this.expect("COMMA");
        const object = this.parseIdentifier();
        let metadata: ValueExprNode | null = null;
        if (this.match("COMMA")) {
          metadata = this.parseValueExpr();
        }
        this.expect("RPAREN");
        return makeNode<GraftBranchExprNode>(this, 
          "GraftBranchExpr",
          {
            name: "@graft.branch",
            subject,
            relation,
            object,
            metadata,
          },
          keyword,
        );
      }

      case "@graft.state": {
        this.expect("LPAREN");
        const node = this.parseIdentifier();
        this.expect("COMMA");
        const key = this.parseRelationLabel();
        this.expect("COMMA");
        const value = this.parseValueExpr();
        this.expect("RPAREN");
        return makeNode<GraftStateExprNode>(this, 
          "GraftStateExpr",
          {
            name: "@graft.state",
            node,
            key,
            value,
          },
          keyword,
        );
      }

      case "@graft.meta": {
        this.expect("LPAREN");
        const node = this.parseIdentifier();
        this.expect("COMMA");
        const key = this.parseRelationLabel();
        this.expect("COMMA");
        const value = this.parseValueExpr();
        this.expect("RPAREN");
        return makeNode<GraftMetaExprNode>(this, 
          "GraftMetaExpr",
          {
            name: "@graft.meta",
            node,
            key,
            value,
          },
          keyword,
        );
      }

      case "@graft.progress": {
        this.expect("LPAREN");
        const from = this.parseIdentifier();
        this.expect("COMMA");
        const relation = this.parseRelationLabel();
        this.expect("COMMA");
        const to = this.parseIdentifier();
        this.expect("RPAREN");
        return makeNode<GraftProgressExprNode>(this, 
          "GraftProgressExpr",
          {
            name: "@graft.progress",
            from,
            relation,
            to,
          },
          keyword,
        );
      }

      case "@prune.branch": {
        this.expect("LPAREN");
        const subject = this.parseIdentifier();
        this.expect("COMMA");
        const relation = this.parseRelationLabel();
        this.expect("COMMA");
        const object = this.parseIdentifier();
        let metadata: ValueExprNode | null = null;
        if (this.match("COMMA")) {
          metadata = this.parseValueExpr();
        }
        this.expect("RPAREN");
        return makeNode<PruneBranchExprNode>(this, 
          "PruneBranchExpr",
          {
            name: "@prune.branch",
            subject,
            relation,
            object,
            metadata,
          },
          keyword,
        );
      }

      case "@prune.state": {
        this.expect("LPAREN");
        const node = this.parseIdentifier();
        this.expect("COMMA");
        const key = this.parseRelationLabel();
        this.expect("RPAREN");
        return makeNode<PruneStateExprNode>(this, 
          "PruneStateExpr",
          {
            name: "@prune.state",
            node,
            key,
          },
          keyword,
        );
      }

      case "@prune.meta": {
        this.expect("LPAREN");
        const node = this.parseIdentifier();
        this.expect("COMMA");
        const key = this.parseRelationLabel();
        this.expect("RPAREN");
        return makeNode<PruneMetaExprNode>(this, 
          "PruneMetaExpr",
          {
            name: "@prune.meta",
            node,
            key,
          },
          keyword,
        );
      }

      case "@prune.nodes": {
        this.expect("LPAREN");
        const where = this.parseWherePredicate();
        this.expect("RPAREN");
        return makeNode<PruneNodesExprNode>(this, 
          "PruneNodesExpr",
          {
            name: "@prune.nodes",
            where,
          },
          keyword,
        );
      }

      case "@prune.edges": {
        this.expect("LPAREN");
        const where = this.parseWherePredicate();
        this.expect("RPAREN");
        return makeNode<PruneEdgesExprNode>(this, 
          "PruneEdgesExpr",
          {
            name: "@prune.edges",
            where,
          },
          keyword,
        );
      }

      case "@action.apply":
        return this.parseApplyExpr(keyword);

      default:
        throw this.error(
          keyword,
          `Unsupported mutation operator "${keyword.value}"`,
        );
    }
  }

export function parseApplyExprImpl(this: any, startToken: Token): ApplyExprNode {
    this.expect("LPAREN");
    this.skipNewlines();
    const target = this.parseIdentifier();
    this.skipNewlines();
    this.expect("RPAREN");

    return makeNode<ApplyExprNode>(this,
      "ApplyExpr",
      {
        name: "@action.apply",
        target,
      },
      startToken,
    );
  }

export function parseCtxSetExprImpl(this: any, startToken: Token): CtxSetExprNode {
    this.expect("LPAREN");
    const edge = this.parseIdentifier();
    this.expect("COMMA");
    const context = this.parseValueExpr();
    this.expect("RPAREN");

    return makeNode<CtxSetExprNode>(this, 
      "CtxSetExpr",
      {
        name: "@ctx.set",
        edge,
        context,
      },
      startToken,
    );
  }

export function parseCtxClearExprImpl(this: any, startToken: Token): CtxClearExprNode {
    this.expect("LPAREN");
    const edge = this.parseIdentifier();
    this.expect("RPAREN");

    return makeNode<CtxClearExprNode>(this, 
      "CtxClearExpr",
      {
        name: "@ctx.clear",
        edge,
      },
      startToken,
    );
  }

export function parseSystemRelationImpl(this: any): SystemRelationNode {
    const left = this.parseIdentifier();
    let relation: StringLiteralNode | null = null;

    if (this.match("COLON")) {
      relation = this.parseStringLiteral();
      this.expect("TCOLON");
    } else {
      this.expect("TCOLON");
    }

    const right = this.parseIdentifier();

    return makeNode<SystemRelationNode>(this, 
      "SystemRelation",
      {
        left,
        relation,
        right,
      },
      identToToken(left),
    );
  }
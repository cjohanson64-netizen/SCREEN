import type { Token, TokenType } from "../../lexer/tokenize.js";
import { ParseError } from "./ParseError.js";
import { identToToken, makeNode, nodeToToken } from "./parserUtils.js";
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
  parseTopLevelInjectionStatementImpl,
  parseInjectExprImpl,
  parseImportDeclarationImpl,
  parseExportDeclarationImpl,
  parseValueDefinitionImpl,
  parseProjectionDefinitionImpl,
  parseProjectionContractImpl,
  parseBindingLikeStatementImpl,
  isBindStatementStartImpl,
  parseBindStatementImpl,
  parseBindSelectorImpl,
  parseSeedBlockImpl,
  parseSeedNodesImpl,
  parseSeedEdgesImpl,
  parseSeedEdgeEntryImpl
} from "../statements/parserStatementParsers.js";
import {
  parseEdgeExprImpl,
  parseGraphInteractionDefinitionImpl,
  parseLegacyGraphInteractionDefinitionImpl,
  parseModernGraphInteractionDefinitionImpl,
  parseExplicitGraphBridgeImpl,
  parseGraphAttachBlockImpl,
  parseGraphRelationshipConditionImpl,
  parseGraphRefImpl,
  parseEffectBlockImpl,
  parseEffectTargetImpl,
  parseEffectOpsImpl,
  parseEffectOpImpl,
  parseGraphPipelineImpl,
  parseGraphPipelineAfterNameImpl,
  parseGraphInjectionStepImpl,
  parseGraphPipelineStepImpl,
  parseMutationExprImpl,
  parseApplyExprImpl,
  parseCtxSetExprImpl,
  parseCtxClearExprImpl,
  parseSystemRelationImpl
} from "../graph/parserGraphParsers.js";
import {
  parseQueryExprImpl,
  parseMatchExprImpl,
  parseExplicitMatchPatternImpl,
  parsePathExprImpl,
  parseWhyExprImpl,
  parseHowExprImpl,
  parseExplanationTargetImpl,
  isPathKeywordImpl,
  isPathKeywordValueImpl,
  isDeriveOrComputeExprStartImpl,
  parseWhereClauseImpl,
  parseWhereExprImpl,
  parseWherePredicateImpl,
  parseGraphQueryExprImpl,
  parseGraphQueryCallExprImpl,
  parseRepeatExprImpl,
  parseIfExprImpl,
  parseWhenExprImpl,
  parseGraphControlExprImpl,
  parseRepeatCountExprImpl,
  parseDeriveStateExprImpl,
  parseDeriveMetaExprImpl,
  parseComputeCountExprImpl,
  parseComputeEdgeCountExprImpl,
  parseComputeExistsExprImpl,
  parseDerivePathExprImpl,
  parseDeriveCollectExprImpl,
  parseComputeSumExprImpl,
  parseComputeMinExprImpl,
  parseComputeMaxExprImpl,
  parseComputeAvgExprImpl,
  parseComputeAbsExprImpl,
  parseFieldAggregateImpl,
  parseComputeSourceBlockImpl,
  parseNamedArgumentsImpl,
  parseExtendedNamedArgumentValueImpl,
  parseComputeSourceImpl,
  parseComputeSourceValueImpl,
  parseComputeExistsValueImpl,
  parseStringLiteralValueImpl,
  parseDeriveCollectValueImpl,
  parseAggregateQueryExprImpl,
  parseChooseExprImpl,
  parseDirectiveCallExprImpl,
  parseRuntimeGenerateValueIdExprImpl,
  parseRuntimeGenerateNodeIdExprImpl,
  parseRuntimeNextOrderExprImpl,
  parseDeriveExprImpl,
  parseDeriveAdditionImpl,
  parseDeriveMultiplicationImpl,
  parseDerivePrimaryImpl,
  parseOperatorExprImpl,
  parseActionExprImpl,
  parseActionGuardExprImpl,
  parseActionPipelineSectionImpl,
  parseActionPipelineStepImpl,
  parseGraphPipelineSectionImpl,
  parseActionProjectSectionImpl,
  parseCtxExprImpl,
  parseProjectExprImpl,
  parseTerminalGraphExprImpl,
  parseArgumentsImpl
} from "../directives/parserDirectiveParsers.js";
import {
  parseRelationPatternImpl,
  parsePatternAtomImpl,
  parseValueExprImpl,
  parseNodeCaptureImpl,
  parseNodeShapeImpl,
  parseTraversalExprImpl,
  parseActionSegmentImpl,
  parseTraversalValueImpl,
  parseObjectLiteralImpl,
  parseArrayLiteralImpl,
  parseBooleanExprImpl,
  parseOrExprImpl,
  parseAndExprImpl,
  parseNotExprImpl,
  parseComparisonOrPrimaryImpl,
  parseBooleanValueImpl,
  parseIdentifierImpl,
  parseStringLiteralImpl,
  parseRelationLabelImpl,
  parseNumberLiteralImpl,
  parseBooleanLiteralImpl,
  parseRegexLiteralImpl,
  parseWildcardImpl,
  isTraversalValueStartImpl,
  isGraphPipelineStartImpl,
  isGraphProjectionExprStartImpl,
  parseGraphSourceImpl,
  parseIdentifierArrayFieldImpl,
  isSystemRelationStartImpl,
  matchComparisonImpl,
  matchLogicalImpl
} from "../values/parserValueParsers.js";
export class Parser {
  private current = 0;

  constructor(private readonly tokens: Token[]) {}

  parseProgram(): ProgramNode {
    const body: StatementNode[] = [];
    const start = this.peek();

    this.skipNewlines();

    while (!this.isAtEnd()) {
      body.push(this.parseStatement());
      this.skipNewlines();
    }

    return makeNode<ProgramNode>(this, 
      "Program",
      {
        body,
      },
      start,
    );
  }

  parseGraphPipelineFragment(): GraphPipelineStepNode[] {
    const steps: GraphPipelineStepNode[] = [];

    this.skipNewlines();

    while (!this.isAtEnd()) {
      if (this.match("ARROW")) {
        steps.push(this.parseGraphPipelineStep());
      } else if (this.match("INJECT_FLOW")) {
        steps.push(this.parseGraphInjectionStep());
      } else {
        throw this.error(this.peek(), 'Expected "->" or "<-" in graph pipeline fragment');
      }

      this.skipNewlines();
    }

    return steps;
  }

  private parseStatement(): StatementNode {
    this.skipNewlines();

    if (this.check("INJECT_FLOW")) {
      return this.parseTopLevelInjectionStatement();
    }

    if (this.checkTypeIdentifierValue("import")) {
      return this.parseImportDeclaration();
    }

    if (this.checkTypeIdentifierValue("export")) {
      return this.parseExportDeclaration();
    }

    if (this.check("KEYWORD", "@seed")) {
      return this.parseSeedBlock();
    }

    if (this.check("KEYWORD", "@value.define")) {
      return this.parseValueDefinition();
    }

    if (this.check("KEYWORD", "@project.define")) {
      return this.parseProjectionDefinition();
    }

    if (this.check("KEYWORD", "@graph")) {
      return this.parseGraphInteractionDefinition(null);
    }

    if (this.check("KEYWORD", "@action.define")) {
      const value = this.parseActionExpr();
      return makeNode<OperatorBindingNode>(this,
        "OperatorBinding",
        {
          name: value.actionName,
          value,
        },
        identToToken(value.actionName),
      );
    }

    if (this.check("KEYWORD", "@when")) {
      return this.parseWhenExpr();
    }

    if (this.isGraphPipelineStart()) {
      return this.parseGraphPipeline();
    }

    if (this.isSystemRelationStart()) {
      return this.parseSystemRelation();
    }

    if (
      this.check("KEYWORD", "@query.edge") || this.check("KEYWORD", "@query.state") || this.check("KEYWORD", "@query.meta") ||
      this.check("KEYWORD", "@match.edge") ||
      this.isPathKeyword() ||
      this.check("KEYWORD", "@why") ||
      this.check("KEYWORD", "@how") ||
      this.check("KEYWORD", "@where")
    ) {
      const expr = this.parseQueryExpr();
      return makeNode<QueryStatementNode>(this, 
        "QueryStatement",
        { expr },
        this.previousOrPeek(),
      );
    }

    if (this.isBindStatementStart()) {
      return this.parseBindStatement();
    }

    if (this.checkType("IDENT")) {
      return this.parseBindingLikeStatement();
    }

    throw this.error(this.peek(), `Unexpected token "${this.peek().value}"`);
  }

private parseTopLevelInjectionStatement(): TopLevelInjectionStatementNode {
    return parseTopLevelInjectionStatementImpl.call(this);
  }

private parseInjectExpr(): InjectExprNode {
    return parseInjectExprImpl.call(this);
  }

private parseImportDeclaration(): ImportDeclarationNode {
    return parseImportDeclarationImpl.call(this);
  }

private parseExportDeclaration(): ExportDeclarationNode {
    return parseExportDeclarationImpl.call(this);
  }


private parseValueDefinition(): ValueDefNode {
    return parseValueDefinitionImpl.call(this);
  }

private parseProjectionDefinition(): ProjectionDefNode {
    return parseProjectionDefinitionImpl.call(this);
  }

private parseProjectionContract(): ProjectionContractNode {
    return parseProjectionContractImpl.call(this);
  }

private parseBindingLikeStatement(): StatementNode {
    return parseBindingLikeStatementImpl.call(this);
  }

private isBindStatementStart(): boolean {
    return isBindStatementStartImpl.call(this);
  }

private parseBindStatement(): BindStatementNode {
    return parseBindStatementImpl.call(this);
  }

private parseBindSelector(keyword: Token): {
    layer: BindLayer | null;
    entity: BindEntity | null;
  } {
    return parseBindSelectorImpl.call(this, keyword);
  }

private parseSeedBlock(): SeedBlockNode {
    return parseSeedBlockImpl.call(this);
  }

private parseSeedNodes(): SeedNodeRefNode[] {
    return parseSeedNodesImpl.call(this);
  }

private parseSeedEdges(): SeedEdgeEntryNode[] {
    return parseSeedEdgesImpl.call(this);
  }

private parseSeedEdgeEntry(): SeedEdgeEntryNode {
    return parseSeedEdgeEntryImpl.call(this);
  }

private parseEdgeExpr(): EdgeExprNode {
    return parseEdgeExprImpl.call(this);
  }

private parseGraphInteractionDefinition(
    name: IdentifierNode | null,
  ): GraphInteractionDefinitionNode {
    return parseGraphInteractionDefinitionImpl.call(this, name);
  }

private parseLegacyGraphInteractionDefinition(
    name: IdentifierNode | null,
    start: Token,
    source: GraphRefNode,
  ): GraphInteractionDefinitionNode {
    return parseLegacyGraphInteractionDefinitionImpl.call(this, name, start, source);
  }

private parseModernGraphInteractionDefinition(
    name: IdentifierNode | null,
    start: Token,
    source: GraphRefNode,
    bridgeMode: "implicit" | "explicit",
  ): GraphInteractionDefinitionNode {
    return parseModernGraphInteractionDefinitionImpl.call(this, name, start, source, bridgeMode);
  }

private parseExplicitGraphBridge(start: Token): ExplicitGraphBridgeNode {
    return parseExplicitGraphBridgeImpl.call(this, start);
  }

private parseGraphAttachBlock(): {
    through: IdentifierNode;
    when?: QueryExprNode | BooleanExprNode;
  } {
    return parseGraphAttachBlockImpl.call(this);
  }

private parseGraphRelationshipCondition(): QueryExprNode | BooleanExprNode {
    return parseGraphRelationshipConditionImpl.call(this);
  }

private parseGraphRef(): GraphRefNode {
    return parseGraphRefImpl.call(this);
  }

private parseEffectBlock(): EffectBlockNode {
    return parseEffectBlockImpl.call(this);
  }

private parseEffectTarget(): RootTargetNode | IdentifierNode {
    return parseEffectTargetImpl.call(this);
  }

private parseEffectOps(): EffectOpNode[] {
    return parseEffectOpsImpl.call(this);
  }

private parseEffectOp(): EffectOpNode {
    return parseEffectOpImpl.call(this);
  }

private parseGraphPipeline(): GraphPipelineNode {
    return parseGraphPipelineImpl.call(this);
  }

private parseGraphPipelineAfterName(name: IdentifierNode): GraphPipelineNode {
    return parseGraphPipelineAfterNameImpl.call(this, name);
  }

private parseGraphInjectionStep(): GraphInjectionStepNode {
    return parseGraphInjectionStepImpl.call(this);
  }

private parseGraphPipelineStep(): GraphPipelineStepNode {
    return parseGraphPipelineStepImpl.call(this);
  }

private parseMutationExpr(): MutationExprNode {
    return parseMutationExprImpl.call(this);
  }

private parseApplyExpr(startToken: Token): ApplyExprNode {
    return parseApplyExprImpl.call(this, startToken);
  }

private parseCtxSetExpr(startToken: Token): CtxSetExprNode {
    return parseCtxSetExprImpl.call(this, startToken);
  }

private parseCtxClearExpr(startToken: Token): CtxClearExprNode {
    return parseCtxClearExprImpl.call(this, startToken);
  }

private parseSystemRelation(): SystemRelationNode {
    return parseSystemRelationImpl.call(this);
  }

private parseQueryExpr(): QueryExprNode {
    return parseQueryExprImpl.call(this);
  }

private parseMatchExpr(): MatchExprNode {
    return parseMatchExprImpl.call(this);
  }

private parseExplicitMatchPattern(): RelationPatternNode {
    return parseExplicitMatchPatternImpl.call(this);
  }

private parsePathExpr(): PathExprNode {
    return parsePathExprImpl.call(this);
  }

private parseWhyExpr(): WhyExprNode {
    return parseWhyExprImpl.call(this);
  }

private parseHowExpr(): HowExprNode {
    return parseHowExprImpl.call(this);
  }

private parseExplanationTarget(wrapperName: "@why" | "@how"): WhyTargetNode {
    return parseExplanationTargetImpl.call(this, wrapperName);
  }

private isPathKeyword(): boolean {
    return isPathKeywordImpl.call(this);
  }

private isPathKeywordValue(value: string): boolean {
    return isPathKeywordValueImpl.call(this, value);
  }

private isDeriveOrComputeExprStart(): boolean {
    return isDeriveOrComputeExprStartImpl.call(this);
  }

private parseWhereClause(): BooleanExprNode {
    return parseWhereClauseImpl.call(this);
  }

private parseWhereExpr(): WhereExprNode {
    return parseWhereExprImpl.call(this);
  }

private parseWherePredicate(): WherePredicateNode {
    return parseWherePredicateImpl.call(this);
  }

private parseGraphQueryExpr(): GraphQueryExprNode {
    return parseGraphQueryExprImpl.call(this);
  }

private parseGraphQueryCallExpr(start: Token): GraphQueryExprNode {
    return parseGraphQueryCallExprImpl.call(this, start);
  }

  private getObjectPropertyValue(
    object: ObjectLiteralNode,
    key: string,
  ): ValueExprNode | null {
    return object.properties.find((property) => property.key === key)?.value ?? null;
  }

  private valueToStringLiteral(
    value: ValueExprNode,
    fieldName: string,
  ): StringLiteralNode {
    if (value.type === "StringLiteral") {
      return value;
    }

    if (value.type === "Identifier") {
      return makeNode<StringLiteralNode>(this, 
        "StringLiteral",
        {
          value: value.name,
          raw: value.name,
        },
        identToToken(value),
      );
    }

    throw this.error(
      nodeToToken(value),
      `@query ${fieldName} must be a string literal or identifier`,
    );
  }

private parseRepeatExpr(): RepeatExprNode {
    return parseRepeatExprImpl.call(this);
  }

private parseIfExpr(): IfExprNode {
    return parseIfExprImpl.call(this);
  }

private parseWhenExpr(): WhenExprNode {
    return parseWhenExprImpl.call(this);
  }

private parseGraphControlExpr(): GraphControlExprNode {
    return parseGraphControlExprImpl.call(this);
  }

private parseRepeatCountExpr(): RepeatCountExprNode {
    return parseRepeatCountExprImpl.call(this);
  }

private parseDeriveStateExpr(): DeriveStateExprNode {
    return parseDeriveStateExprImpl.call(this);
  }
private parseDeriveMetaExpr(): DeriveMetaExprNode {
    return parseDeriveMetaExprImpl.call(this);
  }
private parseComputeCountExpr(): ComputeCountExprNode {
    return parseComputeCountExprImpl.call(this);
  }

private parseComputeEdgeCountExpr(): ComputeEdgeCountExprNode {
    return parseComputeEdgeCountExprImpl.call(this);
  }

private parseComputeExistsExpr(): ComputeExistsExprNode {
    return parseComputeExistsExprImpl.call(this);
  }

private parseDerivePathExpr(): DerivePathExprNode {
    return parseDerivePathExprImpl.call(this);
  }
private parseDeriveCollectExpr(): DeriveCollectExprNode {
    return parseDeriveCollectExprImpl.call(this);
  }
private parseComputeSumExpr(): ComputeSumExprNode {
    return parseComputeSumExprImpl.call(this);
  }

private parseComputeMinExpr(): ComputeMinExprNode {
    return parseComputeMinExprImpl.call(this);
  }
private parseComputeMaxExpr(): ComputeMaxExprNode {
    return parseComputeMaxExprImpl.call(this);
  }
private parseComputeAvgExpr(): ComputeAvgExprNode {
    return parseComputeAvgExprImpl.call(this);
  }
private parseComputeAbsExpr(): ComputeAbsExprNode {
    return parseComputeAbsExprImpl.call(this);
  }
private parseFieldAggregate(
    name:
      | "@compute.min"
      | "@compute.max"
      | "@compute.avg",
  ): {
    from: ComputeSourceNode | null;
    field: StringLiteralNode | null;
  } {
    return parseFieldAggregateImpl.call(this, name);
  }

private parseComputeSourceBlock(): ComputeSourceNode {
    return parseComputeSourceBlockImpl.call(this);
  }

private parseNamedArguments(name: string): Array<{
    key: IdentifierNode;
    value: ValueExprNode | AggregateQueryExprNode | DeriveExprNode;
  }> {
    return parseNamedArgumentsImpl.call(this, name);
  }

private parseExtendedNamedArgumentValue():
    | ValueExprNode
    | AggregateQueryExprNode
    | DeriveExprNode {
    return parseExtendedNamedArgumentValueImpl.call(this);
  }

private parseComputeSource(): ComputeSourceNode {
    return parseComputeSourceImpl.call(this);
  }

private parseComputeSourceValue(
    value: ValueExprNode | AggregateQueryExprNode | DeriveExprNode,
  ): ComputeSourceNode {
    return parseComputeSourceValueImpl.call(this, value);
  }

private parseComputeExistsValue(
    value: ValueExprNode | AggregateQueryExprNode | DeriveExprNode,
  ): DerivePathExprNode | IdentifierNode {
    return parseComputeExistsValueImpl.call(this, value);
  }

private parseStringLiteralValue(
    value: ValueExprNode | AggregateQueryExprNode | DeriveExprNode,
    opName: string,
    fieldName: string,
  ): StringLiteralNode {
    return parseStringLiteralValueImpl.call(this, value, opName, fieldName);
  }

private parseDeriveCollectValue(
    value: ValueExprNode | AggregateQueryExprNode | DeriveExprNode,
  ): DeriveCollectExprNode {
    return parseDeriveCollectValueImpl.call(this, value);
  }

private parseAggregateQueryExpr(): AggregateQueryExprNode {
    return parseAggregateQueryExprImpl.call(this);
  }

private parseRelationPattern(): RelationPatternNode {
    return parseRelationPatternImpl.call(this);
  }

private parsePatternAtom() {
    return parsePatternAtomImpl.call(this);
  }

private parseValueExpr(): ValueExprNode {
    return parseValueExprImpl.call(this);
  }

private parseChooseExpr(): ChooseExprNode {
    return parseChooseExprImpl.call(this);
  }

private parseDirectiveCallExpr(): DirectiveCallExprNode {
    return parseDirectiveCallExprImpl.call(this);
  }

private parseRuntimeGenerateValueIdExpr(): RuntimeGenerateValueIdExprNode {
    return parseRuntimeGenerateValueIdExprImpl.call(this);
  }

private parseRuntimeGenerateNodeIdExpr(): RuntimeGenerateNodeIdExprNode {
    return parseRuntimeGenerateNodeIdExprImpl.call(this);
  }

private parseRuntimeNextOrderExpr(): RuntimeNextOrderExprNode {
    return parseRuntimeNextOrderExprImpl.call(this);
  }

private parseDeriveExpr(): DeriveExprNode {
    return parseDeriveExprImpl.call(this);
  }

private parseDeriveAddition(): DeriveExprNode {
    return parseDeriveAdditionImpl.call(this);
  }

private parseDeriveMultiplication(): DeriveExprNode {
    return parseDeriveMultiplicationImpl.call(this);
  }

private parseDerivePrimary(): DeriveExprNode {
    return parseDerivePrimaryImpl.call(this);
  }

private parseOperatorExpr(): OperatorExprNode {
    return parseOperatorExprImpl.call(this);
  }

private parseActionExpr(startToken?: Token): ActionExprNode {
    return parseActionExprImpl.call(this, startToken);
  }

private parseActionGuardExpr(): ActionGuardExprNode {
    return parseActionGuardExprImpl.call(this);
  }

private parseActionPipelineSection(): ActionPipelineStepNode[] {
    return parseActionPipelineSectionImpl.call(this);
  }

private parseActionPipelineStep(): ActionPipelineStepNode {
    return parseActionPipelineStepImpl.call(this);
  }

private parseGraphPipelineSection(): GraphPipelineStepNode[] {
    return parseGraphPipelineSectionImpl.call(this);
  }

private parseActionProjectSection(): ActionProjectExprNode {
    return parseActionProjectSectionImpl.call(this);
  }

private parseCtxExpr(startToken?: Token): CtxExprNode {
    return parseCtxExprImpl.call(this, startToken);
  }

private parseProjectExpr(startToken?: Token): ProjectExprNode {
    return parseProjectExprImpl.call(this, startToken);
  }

  private normalizeProjectInvocation(
    projectionName: IdentifierNode | null,
    args: ArgumentNode[],
    start: Token,
  ): { projectionName: IdentifierNode | null; args: ArgumentNode[] } {
    if (projectionName || args.length === 0) {
      return { projectionName, args };
    }

    const [selectorArg, focusArg, ...rest] = args;
    if (selectorArg.key !== null || selectorArg.value.type !== "Identifier") {
      return { projectionName, args };
    }

    const normalizedProjectionName = selectorArg.value;
    const normalizedArgs: ArgumentNode[] = [];

    if (focusArg) {
      normalizedArgs.push(
        makeNode<ArgumentNode>(this, 
          "Argument",
          {
            key: makeNode<IdentifierNode>(this, "Identifier", { name: "focus" }, start),
            value: focusArg.value,
          },
          start,
        ),
      );
    }

    normalizedArgs.push(...rest);

    return {
      projectionName: normalizedProjectionName,
      args: normalizedArgs,
    };
  }

private parseTerminalGraphExpr(): TerminalGraphExprNode {
    return parseTerminalGraphExprImpl.call(this);
  }


private parseArguments(): ArgumentNode[] {
    return parseArgumentsImpl.call(this);
  }

  private looksLikeNamedArgumentStart(): boolean {
    return this.checkType("IDENT") && this.peekNext().type === "COLON";
  }

private parseNodeCapture(): NodeCaptureNode {
    return parseNodeCaptureImpl.call(this);
  }

private parseNodeShape(): NodeShapeNode {
    return parseNodeShapeImpl.call(this);
  }

private parseTraversalExpr(): TraversalExprNode {
    return parseTraversalExprImpl.call(this);
  }

private parseActionSegment(): ActionSegmentNode {
    return parseActionSegmentImpl.call(this);
  }

private parseTraversalValue(): ValueExprNode {
    return parseTraversalValueImpl.call(this);
  }

private parseObjectLiteral(): ObjectLiteralNode {
    return parseObjectLiteralImpl.call(this);
  }

private parseArrayLiteral(): ArrayLiteralNode {
    return parseArrayLiteralImpl.call(this);
  }

private parseBooleanExpr(): BooleanExprNode {
    return parseBooleanExprImpl.call(this);
  }

private parseOrExpr(): BooleanExprNode {
    return parseOrExprImpl.call(this);
  }

private parseAndExpr(): BooleanExprNode {
    return parseAndExprImpl.call(this);
  }

private parseNotExpr(): BooleanExprNode {
    return parseNotExprImpl.call(this);
  }

private parseComparisonOrPrimary(): BooleanExprNode {
    return parseComparisonOrPrimaryImpl.call(this);
  }

private parseBooleanValue(): BooleanValueNode {
    return parseBooleanValueImpl.call(this);
  }

private parseIdentifier(): IdentifierNode {
    return parseIdentifierImpl.call(this);
  }

private parseStringLiteral(): StringLiteralNode {
    return parseStringLiteralImpl.call(this);
  }

private parseRelationLabel(): StringLiteralNode {
    return parseRelationLabelImpl.call(this);
  }

private parseNumberLiteral(): NumberLiteralNode {
    return parseNumberLiteralImpl.call(this);
  }

private parseBooleanLiteral(): BooleanLiteralNode {
    return parseBooleanLiteralImpl.call(this);
  }

private parseRegexLiteral(): RegexLiteralNode {
    return parseRegexLiteralImpl.call(this);
  }

private parseWildcard(): WildcardNode {
    return parseWildcardImpl.call(this);
  }

  /* =========================
     Helpers
     ========================= */

  private captureBraceBodyRaw(): string {
    const start = this.expect("LBRACE");
    let depth = 1;
    let raw = "{";

    while (!this.isAtEnd() && depth > 0) {
      const token = this.advance();

      if (token.type === "LBRACE") depth += 1;
      if (token.type === "RBRACE") depth -= 1;

      raw += token.value;
    }

    if (depth !== 0) {
      throw this.error(start, "Unterminated action body");
    }

    return raw;
  }

  private looksLikeTraversalExpr(): boolean {
    if (!this.isTraversalValueStart(this.peek())) return false;
    if (this.peekNext().type !== "DOT") return false;
    if (this.peekN(2).type !== "IDENT") return false;
    if (this.peekN(3).type !== "DOT") return false;
    return this.isTraversalValueStart(this.peekN(4));
  }

private isTraversalValueStart(token: Token): boolean {
    return isTraversalValueStartImpl.call(this, token);
  }

  private looksLikeEdgeExpr(): boolean {
    return (
      this.peek().type === "IDENT" &&
      this.peekNext().type === "COLON" &&
      this.peekN(2).type === "STRING" &&
      this.peekN(3).type === "COLON" &&
      this.peekN(4).type === "IDENT"
    );
  }

private isGraphPipelineStart(): boolean {
    return isGraphPipelineStartImpl.call(this);
  }

  // Returns true when the cursor is at `IDENT` and the next non-newline token
  // is a PROJECT (`<>`) token, indicating `name = graphId <> @project(...)`.
private isGraphProjectionExprStart(): boolean {
    return isGraphProjectionExprStartImpl.call(this);
  }

private parseGraphSource(): GraphSourceNode {
    return parseGraphSourceImpl.call(this);
  }

private parseIdentifierArrayField(label: string): IdentifierNode[] {
    return parseIdentifierArrayFieldImpl.call(this, label);
  }

private isSystemRelationStart(): boolean {
    return isSystemRelationStartImpl.call(this);
  }

private matchComparison(): boolean {
    return matchComparisonImpl.call(this);
  }

private matchLogical(expected: "&&" | "||" | "!"): boolean {
    return matchLogicalImpl.call(this, expected);
  }

  private skipNewlines(): void {
    while (this.match("NEWLINE")) {
      // consume
    }
  }

  private expect(type: TokenType, value?: string): Token {
    const token = this.peek();

    if (token.type !== type) {
      throw this.error(token, `Expected ${value ?? type}, got ${token.type}`);
    }

    if (value !== undefined && token.value !== value) {
      throw this.error(token, `Expected ${value}, got ${token.value}`);
    }

    this.current += 1;
    return token;
  }

  private expectType(type: TokenType): Token {
    return this.expect(type);
  }

  private match(type: TokenType, value?: string): boolean {
    if (!this.checkType(type)) return false;
    if (value !== undefined && this.peek().value !== value) return false;
    this.current += 1;
    return true;
  }

  private check(type: TokenType, value?: string): boolean {
    if (!this.checkType(type)) return false;
    if (value !== undefined && this.peek().value !== value) return false;
    return true;
  }

  private checkType(type: TokenType): boolean {
    if (this.isAtEnd()) return type === "EOF";
    return this.peek().type === type;
  }

  private checkTypeIdentifierValue(value: string): boolean {
    return this.checkType("IDENT") && this.peek().value === value;
  }

  private expectIdentifierValue(value: string): Token {
    const token = this.expectType("IDENT");
    if (token.value !== value) {
      throw this.error(token, `Expected ${value}, got ${token.value}`);
    }
    return token;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current += 1;
    return this.tokens[this.current - 1];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private previousOrPeek(): Token {
    return this.current > 0 ? this.previous() : this.peek();
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private peekNext(): Token {
    return this.peekN(1);
  }

  private peekN(offset: number): Token {
    return this.tokens[Math.min(this.current + offset, this.tokens.length - 1)];
  }

  private isAtEnd(): boolean {
    return this.peek().type === "EOF";
  }

  private error(token: Token, message: string): ParseError {
    return new ParseError(message, token);
  }

  private warn(token: Token, message: string): void {
    console.warn(
      `[TAT parse warning] ${message} at ${token.line}:${token.column}`,
    );
  }

  private node<T extends BaseNode>(
    type: T["type"],
    props: Omit<T, "type" | "span">,
    token: Token,
  ): T {
    return {
      type,
      ...props,
      span: {
        start: token.index,
        end: token.index + token.value.length,
        line: token.line,
        column: token.column,
      },
    } as T;
  }
}


import type {
  ActionExprNode,
  ActionGuardExprNode,
  ActionProjectExprNode,
  AggregateQueryExprNode,
  ArgumentNode,
  ArrayLiteralNode,
  BindStatementNode,
  BinaryBooleanExprNode,
  BooleanExprNode,
  BooleanLiteralNode,
  BooleanValueNode,
  ComparisonExprNode,
  ComposeExprNode,
  CurrentValueNode,
  CtxExprNode,
  ComputeAbsExprNode,
  ComputeAvgExprNode,
  DeriveCollectExprNode,
  ComputeCountExprNode,
  ComputeEdgeCountExprNode,
  ComputeExistsExprNode,
  ComputeMaxExprNode,
  DerivePathExprNode,
  DeriveMetaExprNode,
  ComputeMinExprNode,
  DeriveStateExprNode,
  ComputeSumExprNode,
  DeriveBinaryExprNode,
  DeriveExprNode,
  DirectiveCallExprNode,
  EdgeExprNode,
  EffectBlockNode,
  EffectOpNode,
  ExportDeclarationNode,
  GraphControlExprNode,
  GraphInteractionDefinitionNode,
  GraphPipelineNode,
  GraphPipelineStepNode,
  GraphQueryExprNode,
  GraphRefNode,
  GraphBridgeNode,
  GroupedBooleanExprNode,
  HowExprNode,
  IdentifierNode,
  IfExprNode,
  InjectExprNode,
  ImportDeclarationNode,
  MatchExprNode,
  MutationExprNode,
  NodeCaptureNode,
  NumberLiteralNode,
  ObjectLiteralNode,
  ObjectPropertyNode,
  OperatorBindingNode,
  PathExprNode,
  ProjectionDefNode,
  ProgramNode,
  ProjectExprNode,
  PropertyAccessNode,
  PreviousValueNode,
  PruneEdgesExprNode,
  PruneNodesExprNode,
  QueryStatementNode,
  RegexLiteralNode,
  RelationPatternNode,
  RootTargetNode,
  RuntimeGenerateNodeIdExprNode,
  RuntimeGenerateValueIdExprNode,
  RuntimeNextOrderExprNode,
  ChooseExprNode,
  SeedBlockNode,
  SeedEdgeBindingNode,
  SeedEdgeEntryNode,
  StringLiteralNode,
  SystemRelationNode,
  TraversalExprNode,
  UnaryBooleanExprNode,
  ValueBindingNode,
  ValueExprNode,
  WhenExprNode,
  WhereExprNode,
  WhyExprNode,
  WildcardNode,
  StatementNode,
  TopLevelInjectionStatementNode,
  WherePredicateNode,
  RepeatExprNode,
  TerminalGraphExprNode,
} from "../nodeTypes.js";

import {
  printActionGuardInline,
  printActionProjectExprInline,
  printArgumentInline,
  printArrayLiteralInline,
  printBooleanExprInline,
  printComposeInline,
  printCtxExprInline,
  printDeriveExprInline,
  printEdgeExprInline,
  printEffectOpInline,
  printEffectTargetInline,
  printExportInline,
  printGraphBridgeInline,
  printGraphControlExprInline,
  printGraphQueryInline,
  printGraphRefInline,
  printImportInline,
  printInjectInline,
  printRepeatCountInline,
  printMatchExpr,
  printPathExpr,
  printWhyExpr,
  printHowExpr,
  printWhereExpr,
  printMutationInline,
  printNodeCaptureInline,
  printObjectLiteralInline,
  printProjectExprInline,
  printPropertyAccessInline,
  printRelationPatternInline,
  printRuntimeGenerateNodeIdExprInline,
  printRuntimeGenerateValueIdExprInline,
  printSeedEdgeEntryInline,
  printTerminalGraphExprInline,
  printTraversalInline,
  printValueExprInline,
  printWherePredicateInline,
  printWhyTargetInline,
} from "./printInline.js";

type PrintableNode =
  | ProgramNode
  | StatementNode
  | ImportDeclarationNode
  | ExportDeclarationNode
  | ActionExprNode
  | ComposeExprNode
  | GraphRefNode
  | EffectBlockNode
  | GraphInteractionDefinitionNode
  | WhenExprNode
  | CtxExprNode
  | ProjectionDefNode
  | ProjectExprNode
  | WherePredicateNode
  | NodeCaptureNode
  | TraversalExprNode
  | ObjectLiteralNode
  | ArrayLiteralNode
  | IdentifierNode
  | StringLiteralNode
  | NumberLiteralNode
  | BooleanLiteralNode
  | RuntimeGenerateNodeIdExprNode
  | RuntimeGenerateValueIdExprNode
  | RuntimeNextOrderExprNode
  | DirectiveCallExprNode
  | ChooseExprNode
  | CurrentValueNode
  | PreviousValueNode
  | DeriveStateExprNode
  | DeriveMetaExprNode
  | ComputeCountExprNode
  | ComputeEdgeCountExprNode
  | ComputeExistsExprNode
  | DerivePathExprNode
  | DeriveCollectExprNode
  | ComputeSumExprNode
  | RegexLiteralNode
  | WildcardNode
  | MatchExprNode
  | PathExprNode
  | WhyExprNode
  | HowExprNode
  | WhereExprNode
  | GraphQueryExprNode
  | RelationPatternNode
  | EdgeExprNode
  | BinaryBooleanExprNode
  | UnaryBooleanExprNode
  | GroupedBooleanExprNode
  | ComparisonExprNode
  | DeriveBinaryExprNode
  | PropertyAccessNode
  | MutationExprNode
  | EffectOpNode
  | RepeatExprNode
  | IfExprNode
  | PruneNodesExprNode
  | PruneEdgesExprNode
  | RootTargetNode;

export function printNode(node: PrintableNode, indent: number, lines: string[]): void {
  const pad = "  ".repeat(indent);

  switch (node.type) {
    case "Program":
      lines.push(`${pad}Program`);
      for (const statement of node.body) {
        printNode(statement, indent + 1, lines);
      }
      return;

    case "ValueBinding":
      printValueBinding(node, indent, lines);
      return;

    case "BindStatement":
      printBindStatement(node, indent, lines);
      return;

    case "ImportDeclaration":
      lines.push(`${pad}${printImportInline(node)}`);
      return;

    case "ExportDeclaration":
      lines.push(`${pad}${printExportInline(node)}`);
      return;

    case "TopLevelInjectionStatement":
      lines.push(`${pad}<- ${printInjectInline(node.inject)}`);
      return;

    case "OperatorBinding":
      printOperatorBinding(node, indent, lines);
      return;

    case "ProjectionDef":
      lines.push(`${pad}@project.define(${node.name.name})`);
      return;

    case "SeedBlock":
      printSeedBlock(node, indent, lines);
      return;

    case "GraphPipeline":
      printGraphPipeline(node, indent, lines);
      return;

    case "GraphInteractionDefinition":
      printGraphInteractionDefinition(node, indent, lines);
      return;

    case "WhenExpr":
      printWhenExpr(node, indent, lines);
      return;

    case "SystemRelation":
      printSystemRelation(node, indent, lines);
      return;

    case "QueryStatement":
      printQueryStatement(node, indent, lines);
      return;

    case "ActionExpr":
      printActionExpr(node, indent, lines);
      return;

    case "CtxExpr":
      printCtxExpr(node, indent, lines);
      return;

    case "ProjectExpr":
      printProjectExpr(node, indent, lines);
      return;

    case "DirectiveCallExpr":
      lines.push(`${pad}${node.name}(${node.args.map(printArgumentInline).join(", ")})`);
      return;

    case "ChooseExpr":
      lines.push(`${pad}${node.name} { ... }`);
      return;

    case "ComposeExpr":
      lines.push(`${pad}${printComposeInline(node)}`);
      return;

    case "GraphRef":
      lines.push(`${pad}${printGraphRefInline(node)}`);
      return;

    case "EffectBlock":
      printEffectBlock(node, indent, lines);
      return;

    case "WherePredicate":
      lines.push(`${pad}${printWherePredicateInline(node)}`);
      return;

    case "NodeCapture":
      lines.push(`${pad}${printNodeCaptureInline(node)}`);
      return;

    case "TraversalExpr":
      lines.push(`${pad}${printTraversalInline(node)}`);
      return;

    case "ObjectLiteral":
      lines.push(`${pad}${printObjectLiteralInline(node)}`);
      return;

    case "ArrayLiteral":
      lines.push(`${pad}${printArrayLiteralInline(node)}`);
      return;

    case "Identifier":
      lines.push(`${pad}${node.name}`);
      return;

    case "StringLiteral":
      lines.push(`${pad}${node.raw}`);
      return;

    case "NumberLiteral":
      lines.push(`${pad}${node.raw}`);
      return;

    case "BooleanLiteral":
      lines.push(`${pad}${node.raw}`);
      return;

    case "RuntimeGenerateNodeIdExpr":
      lines.push(`${pad}${printRuntimeGenerateNodeIdExprInline(node)}`);
      return;

    case "RuntimeGenerateValueIdExpr":
    case "RuntimeNextOrderExpr":
      lines.push(`${pad}${printRuntimeGenerateValueIdExprInline(node)}`);
      return;

    case "CurrentValue":
      lines.push(`${pad}${node.name}`);
      return;

    case "PreviousValue":
      lines.push(`${pad}${node.name}`);
      return;

    case "DeriveStateExpr":
    case "DeriveMetaExpr":
    case "ComputeCountExpr":
      lines.push(`${pad}${printRepeatCountInline(node)}`);
      return;

    case "RegexLiteral":
      lines.push(`${pad}${node.raw}`);
      return;

    case "Wildcard":
      lines.push(`${pad}_`);
      return;

    case "MatchExpr":
      printMatchExpr(node, indent, lines);
      return;

    case "PathExpr":
      printPathExpr(node, indent, lines);
      return;

    case "WhyExpr":
      printWhyExpr(node, indent, lines);
      return;

    case "HowExpr":
      printHowExpr(node, indent, lines);
      return;

    case "WhereExpr":
      printWhereExpr(node, indent, lines);
      return;

    case "GraphQueryExpr":
      lines.push(`${pad}${printGraphQueryInline(node)}`);
      return;

    case "RelationPattern":
      lines.push(`${pad}${printRelationPatternInline(node)}`);
      return;

    case "EdgeExpr":
      lines.push(`${pad}${printEdgeExprInline(node)}`);
      return;

    case "BinaryBooleanExpr":
    case "UnaryBooleanExpr":
    case "GroupedBooleanExpr":
    case "ComparisonExpr":
      lines.push(`${pad}${printBooleanExprInline(node)}`);
      return;

    case "DeriveBinaryExpr":
      lines.push(`${pad}${printDeriveExprInline(node)}`);
      return;

    case "PropertyAccess":
      lines.push(`${pad}${printPropertyAccessInline(node)}`);
      return;

    case "GraftBranchExpr":
    case "GraftStateExpr":
    case "GraftMetaExpr":
    case "GraftProgressExpr":
    case "PruneBranchExpr":
    case "PruneStateExpr":
    case "PruneMetaExpr":
    case "PruneNodesExpr":
    case "PruneEdgesExpr":
    case "RepeatExpr":
    case "IfExpr":
      lines.push(`${pad}${printMutationInline(node)}`);
      return;
    case "WhenExpr":
      lines.push(`${pad}${printMutationInline(node)}`);
      return;

    case "EffectGraftStateOp":
    case "EffectGraftMetaOp":
    case "EffectPruneStateOp":
    case "EffectPruneMetaOp":
    case "EffectDeriveStateOp":
    case "EffectDeriveMetaOp":
      lines.push(`${pad}${printEffectOpInline(node)}`);
      return;

    case "RootTarget":
      lines.push(`${pad}${node.name}`);
      return;
  }
}

function printValueBinding(
  node: ValueBindingNode,
  indent: number,
  lines: string[],
): void {
  const pad = "  ".repeat(indent);
  lines.push(`${pad}ValueBinding ${node.name.name}`);
  lines.push(`${"  ".repeat(indent + 1)}${printValueExprInline(node.value)}`);
}

function printBindStatement(
  node: BindStatementNode,
  indent: number,
  lines: string[],
): void {
  const pad = "  ".repeat(indent);
  const parts = ["@bind"];

  if (node.layer) {
    parts.push(node.layer);
  }

  if (node.entity) {
    parts.push(node.entity);
  }

  lines.push(`${pad}BindStatement ${parts.join(".")} ${node.name.name}`);
  lines.push(`${"  ".repeat(indent + 1)}${printValueExprInline(node.expression)}`);
}

function printOperatorBinding(
  node: OperatorBindingNode,
  indent: number,
  lines: string[],
): void {
  const pad = "  ".repeat(indent);
  lines.push(`${pad}OperatorBinding ${node.name.name}`);
  printNode(node.value, indent + 1, lines);
}

function printSeedBlock(
  node: SeedBlockNode,
  indent: number,
  lines: string[],
): void {
  const pad = "  ".repeat(indent);
  lines.push(`${pad}SeedBlock @seed`);

  lines.push(`${pad}  nodes`);
  for (const nodeRef of node.nodes) {
    lines.push(`${pad}    ${nodeRef.ref.name}`);
  }

  lines.push(`${pad}  edges`);
  for (const edge of node.edges) {
    lines.push(`${pad}    ${printSeedEdgeEntryInline(edge)}`);
  }

  lines.push(`${pad}  state ${printObjectLiteralInline(node.state)}`);
  lines.push(`${pad}  meta ${printObjectLiteralInline(node.meta)}`);
  lines.push(`${pad}  root ${node.root.name}`);
}

function printGraphPipeline(
  node: GraphPipelineNode,
  indent: number,
  lines: string[],
): void {
  const pad = "  ".repeat(indent);
  lines.push(`${pad}GraphPipeline ${node.name.name}`);
  if (node.source.type === "SeedSource") {
    lines.push(`${pad}  source ${node.source.name}`);
  } else if (node.source.type === "GraphRef") {
    lines.push(`${pad}  source ${printGraphRefInline(node.source)}`);
  } else {
    lines.push(`${pad}  source ${printComposeInline(node.source)}`);
  }

  lines.push(`${pad}  mutations`);
  if (node.mutations.length === 0) {
    lines.push(`${pad}    (none)`);
  } else {
    for (const mutation of node.mutations) {
      lines.push(`${pad}    ${printMutationInline(mutation)}`);
    }
  }

  if (node.projection) {
    lines.push(`${pad}  projection ${printTerminalGraphExprInline(node.projection)}`);
  }
}

function printGraphInteractionDefinition(
  node: GraphInteractionDefinitionNode,
  indent: number,
  lines: string[],
): void {
  const pad = "  ".repeat(indent);

  lines.push(
    `${pad}GraphInteractionDefinition`,
    `${pad}  source: ${printGraphRefInline(node.source)}`,
    `${pad}  bridge: ${printGraphBridgeInline(node.bridge)}`,
    `${pad}  target: ${printGraphRefInline(node.target)}`,
    `${pad}  through: ${node.through.name}`,
  );

  if (node.when) {
    lines.push(`${pad}  when: ${node.when.type}`);
  }

  if (node.effect) {
    printEffectBlock(node.effect, indent + 1, lines);
  }
}

function printWhenExpr(
  node: WhenExprNode,
  indent: number,
  lines: string[],
): void {
  const pad = "  ".repeat(indent);
  lines.push(`${pad}@when`);
  lines.push(
    `${pad}  query ${node.query ? printGraphControlExprInline(node.query) : "(missing)"}`,
  );
  lines.push(`${pad}  pipeline`);

  if (node.pipeline.length === 0) {
    lines.push(`${pad}    (none)`);
    return;
  }

  for (const step of node.pipeline) {
    lines.push(`${pad}    ${printMutationInline(step)}`);
  }
}

function printEffectBlock(
  node: EffectBlockNode,
  indent: number,
  lines: string[],
): void {
  const pad = "  ".repeat(indent);
  lines.push(`${pad}EffectBlock ${node.name}`);
  lines.push(`${pad}  pipeline`);
  for (const step of node.pipeline) {
    lines.push(`${pad}    -> ${printMutationInline(step)}`);
  }
}

function printSystemRelation(
  node: SystemRelationNode,
  indent: number,
  lines: string[],
): void {
  const pad = "  ".repeat(indent);
  if (node.relation) {
    lines.push(
      `${pad}SystemRelation ${node.left.name} : ${node.relation.raw} ::: ${node.right.name}`,
    );
  } else {
    lines.push(`${pad}SystemRelation ${node.left.name} ::: ${node.right.name}`);
  }
}

function printQueryStatement(
  node: QueryStatementNode,
  indent: number,
  lines: string[],
): void {
  const pad = "  ".repeat(indent);
  lines.push(`${pad}QueryStatement`);
  printNode(node.expr, indent + 1, lines);
}

function printActionExpr(
  node: ActionExprNode,
  indent: number,
  lines: string[],
): void {
  const pad = "  ".repeat(indent);
  lines.push(`${pad}@action.define(${node.actionName.name})`);

  if (node.guard) {
    lines.push(`${pad}  when: ${printActionGuardInline(node.guard)}`);
  }

  lines.push(`${pad}  do`);
  if (node.pipeline.length === 0) {
    lines.push(`${pad}    (none)`);
  } else {
    for (const step of node.pipeline) {
      lines.push(`${pad}    -> ${printMutationInline(step)}`);
    }
  }

  if (node.project) {
    lines.push(`${pad}  project: ${printActionProjectExprInline(node.project)}`);
  }
}

function printCtxExpr(
  node: CtxExprNode,
  indent: number,
  lines: string[],
): void {
  const pad = "  ".repeat(indent);
  lines.push(`${pad}${printCtxExprInline(node)}`);
}

function printProjectExpr(
  node: ProjectExprNode,
  indent: number,
  lines: string[],
): void {
  const pad = "  ".repeat(indent);
  lines.push(`${pad}${printProjectExprInline(node)}`);
}


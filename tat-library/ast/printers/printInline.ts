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


export function printImportInline(node: ImportDeclarationNode): string {
  const specs = node.specifiers.map((spec) =>
    spec.imported.name === spec.local.name
      ? spec.imported.name
      : `${spec.imported.name} as ${spec.local.name}`,
  );
  return `import { ${specs.join(", ")} } from ${node.source.raw}`;
}

export function printExportInline(node: ExportDeclarationNode): string {
  return `export { ${node.specifiers.map((spec) => spec.local.name).join(", ")} }`;
}

export function printComposeInline(node: ComposeExprNode): string {
  return `@compose([${node.assets.map((asset) => asset.name).join(", ")}], merge: ${node.merge.name})`;
}

export function printGraphRefInline(node: GraphRefNode): string {
  return `${node.name}(${node.graphId.name})`;
}

export function printGraphBridgeInline(node: GraphBridgeNode): string {
  switch (node.type) {
    case "ExplicitGraphBridge":
      return `: ${node.ctx.type} ::`;

    case "ImplicitGraphBridge":
      return ":::";
  }
}

export function printWherePredicateInline(node: WherePredicateNode): string {
  return `@where(${printBooleanExprInline(node.expression)})`;
}

export function printMatchExpr(
  node: MatchExprNode,
  indent: number,
  lines: string[],
): void {
  const pad = "  ".repeat(indent);
  lines.push(`${pad}MatchExpr`);
  for (const pattern of node.patterns) {
    lines.push(`${pad}  ${printRelationPatternInline(pattern)}`);
  }
  if (node.where) {
    lines.push(`${pad}  where ${printBooleanExprInline(node.where)}`);
  }
}

export function printPathExpr(
  node: PathExprNode,
  indent: number,
  lines: string[],
): void {
  const pad = "  ".repeat(indent);
  let line = `${pad}PathExpr ${printValueExprInline(node.from)} -> ${printValueExprInline(node.to)}`;
  if (node.where) {
    line += ` where ${printBooleanExprInline(node.where)}`;
  }
  lines.push(line);
}

export function printWhyExpr(
  node: WhyExprNode,
  indent: number,
  lines: string[],
): void {
  const pad = "  ".repeat(indent);
  lines.push(`${pad}WhyExpr ${printWhyTargetInline(node.target)}`);
}

export function printHowExpr(
  node: HowExprNode,
  indent: number,
  lines: string[],
): void {
  const pad = "  ".repeat(indent);
  lines.push(`${pad}HowExpr ${printWhyTargetInline(node.target)}`);
}

export function printWhereExpr(
  node: WhereExprNode,
  indent: number,
  lines: string[],
): void {
  const pad = "  ".repeat(indent);
  lines.push(`${pad}WhereExpr ${printBooleanExprInline(node.expression)}`);
}

export function printActionGuardInline(node: ActionGuardExprNode): string {
  if (node.type === "GraphQueryExpr") {
    return printGraphQueryInline(node);
  }

  return printBooleanExprInline(node);
}

export function printGraphQueryInline(node: GraphQueryExprNode): string {
  if (node.subject && node.relation && node.object) {
    return `@query.edge(${node.subject.name}, ${node.relation.value}, ${node.object.name})`;
  }

  if (node.node && node.state && node.equals) {
    return `@query.state(${node.node.name}, ${node.state.value}, ${printValueExprInline(node.equals)})`;
  }

  if (node.node && node.meta && node.equals) {
    return `@query.meta(${node.node.name}, ${node.meta.value}, ${printValueExprInline(node.equals)})`;
  }

  return "@query.edge(/* incomplete */)";
}

export function printGraphControlExprInline(node: GraphControlExprNode): string {
  if (node.type === "GraphQueryExpr") {
    return printGraphQueryInline(node);
  }

  return printBooleanExprInline(node);
}

export function printWhyTargetInline(target: WhyExprNode["target"]): string {
  switch (target.type) {
    case "MatchExpr":
      return target.edge
        ? `@match.edge(${target.edge.name})`
        : target.pattern
          ? `@match.edge(${printPatternAtomInline(target.pattern.left)}, ${printPatternAtomInline(target.pattern.relation)}, ${printPatternAtomInline(target.pattern.right)})`
          : `@match.edge(${target.patterns.map(printRelationPatternInline).join(", ")})`;
    case "PathExpr":
      return `${target.name}(${printValueExprInline(target.from)}, ${printValueExprInline(target.to)})`;
    case "GraphQueryExpr":
      return printGraphQueryInline(target);
    case "DirectiveCallExpr":
      return `${target.name}(${target.args.map(printArgumentInline).join(", ")})`;
    case "ProjectExpr":
      return printProjectExprInline(target);
    case "DeriveStateExpr":
    case "DeriveMetaExpr":
    case "ComputeCountExpr":
    case "ComputeEdgeCountExpr":
    case "ComputeExistsExpr":
    case "DeriveCollectExpr":
    case "ComputeSumExpr":
    case "ComputeMinExpr":
    case "ComputeMaxExpr":
    case "ComputeAvgExpr":
    case "ComputeAbsExpr":
      return printDeriveExprInline(target);
  }
}

export function printRelationPatternInline(node: RelationPatternNode): string {
  return `${printPatternAtomInline(node.left)} : ${printPatternAtomInline(node.relation)} : ${printPatternAtomInline(node.right)}`;
}

export function printPatternAtomInline(
  node:
    | IdentifierNode
    | StringLiteralNode
    | NumberLiteralNode
    | BooleanLiteralNode
    | RegexLiteralNode
    | WildcardNode
    | NodeCaptureNode,
): string {
  switch (node.type) {
    case "Identifier":
      return node.name;
    case "StringLiteral":
      return node.raw;
    case "NumberLiteral":
      return node.raw;
    case "BooleanLiteral":
      return node.raw;
    case "RegexLiteral":
      return node.raw;
    case "Wildcard":
      return "_";
    case "NodeCapture":
      return printNodeCaptureInline(node);
  }
}

export function printEdgeExprInline(node: EdgeExprNode): string {
  return `${node.left.name} : ${node.relation.raw} : ${node.right.name}`;
}

export function printCtxExprInline(node: CtxExprNode): string {
  return `@ctx(${node.args.map(printArgumentInline).join(", ")})`;
}

export function printTerminalGraphExprInline(node: TerminalGraphExprNode): string {
  return printProjectExprInline(node);
}

export function printProjectExprInline(node: ProjectExprNode): string {
  const selector = node.projectionName ? `${node.projectionName.name}${node.args.length ? ", " : ""}` : "";
  return `@project.apply(${selector}${node.args.map(printArgumentInline).join(", ")})`;
}

export function printArgumentInline(arg: ArgumentNode): string {
  if (arg.key) {
    return `${arg.key.name}: ${printValueExprInline(arg.value)}`;
  }
  return printValueExprInline(arg.value);
}

export function printNodeCaptureInline(node: NodeCaptureNode): string {
  return `<${printNodeShapeInline(node.shape)}>`;
}

export function printNodeShapeInline(node: NodeCaptureNode["shape"]): string {
  switch (node.type) {
    case "Identifier":
      return node.name;
    case "StringLiteral":
      return node.raw;
    case "NumberLiteral":
      return node.raw;
    case "BooleanLiteral":
      return node.raw;
    case "ObjectLiteral":
      return printObjectLiteralInline(node);
    case "TraversalExpr":
      return printTraversalInline(node);
  }
}

export function printTraversalInline(node: TraversalExprNode): string {
  const parts: string[] = [];

  for (const segment of node.segments) {
    if (segment.type === "ActionSegment") {
      parts.push(
        `${printValueExprInline(segment.from)}.${segment.operator.name}.${printValueExprInline(segment.to)}`,
      );
    } else {
      parts.push(
        `..${segment.context.name}..${printValueExprInline(segment.segment.from)}.${segment.segment.operator.name}.${printValueExprInline(segment.segment.to)}`,
      );
    }
  }

  return parts.join("");
}

export function printValueExprInline(node: ValueExprNode): string {
  switch (node.type) {
    case "WhereExpr":
      return `@where(${printBooleanExprInline(node.expression)})`;
    case "Identifier":
      return node.name;
    case "StringLiteral":
      return node.raw;
    case "NumberLiteral":
      return node.raw;
    case "BooleanLiteral":
      return node.raw;
    case "RuntimeGenerateValueIdExpr":
      return printRuntimeGenerateValueIdExprInline(node);
    case "RuntimeGenerateNodeIdExpr":
      return printRuntimeGenerateNodeIdExprInline(node);
    case "RuntimeNextOrderExpr":
      return "@runtime.nextOrder()";
    case "NodeCapture":
      return printNodeCaptureInline(node);
    case "ObjectLiteral":
      return printObjectLiteralInline(node);
    case "ArrayLiteral":
      return printArrayLiteralInline(node);
    case "DirectiveCallExpr":
      return `${node.name}(${node.args.map(printArgumentInline).join(", ")})`;
    case "ChooseExpr":
      return `${node.name} { when: ${node.when ? printBooleanExprInline(node.when as BooleanExprNode) : "?"}, then: ${node.then ? printValueExprInline(node.then) : "null"}, else: ${node.else ? printValueExprInline(node.else) : "null"} }`;
    case "PropertyAccess":
      return printPropertyAccessInline(node);
    case "DeriveStateExpr":
    case "DeriveMetaExpr":
    case "ComputeCountExpr":
    case "ComputeEdgeCountExpr":
    case "ComputeExistsExpr":
    case "DerivePathExpr":
    case "DeriveCollectExpr":
    case "ComputeSumExpr":
    case "ComputeMinExpr":
    case "ComputeMaxExpr":
    case "ComputeAvgExpr":
    case "ComputeAbsExpr":
    case "DeriveBinaryExpr":
      return printDeriveExprInline(node);
  }

  return "[derive]";
}

export function printDeriveExprInline(node: DeriveExprNode): string {
  switch (node.type) {
    case "CurrentValue":
      return node.name;
    case "PreviousValue":
      return node.name;
    case "NumberLiteral":
      return node.raw;
    case "StringLiteral":
      return node.raw;
    case "DeriveStateExpr":
      return `${node.name} { node: ${node.node?.name ?? "?"}, key: ${node.key?.raw ?? "?"} }`;
    case "DeriveMetaExpr":
      return `${node.name} { node: ${node.node?.name ?? "?"}, key: ${node.key?.raw ?? "?"} }`;
    case "ComputeCountExpr":
      if (node.from) {
        return `${node.name}(from: ${printComputeSourceInline(node.from)})`;
      }
      if (node.nodes) {
        return `${node.name} { nodes: ${printDeriveExprInline(node.nodes)} }`;
      }
      return `${node.name} { nodes: ? }`;
    case "ComputeEdgeCountExpr":
      return `${node.name} { node: ${node.node?.name ?? "?"}, relation: ${node.relation?.raw ?? "?"}, direction: ${node.direction?.raw ?? "?"}${node.where ? `, where: ${printBooleanExprInline(node.where)}` : ""} }`;
    case "ComputeExistsExpr":
      return `${node.name} { path: ${node.path ? "name" in node.path ? node.path.name : printDeriveExprInline(node.path) : "?"} }`;
    case "DerivePathExpr":
      return `${node.name} { node: ${node.node?.name ?? "?"}, relation: ${node.relation ? printValueExprInline(node.relation) : "?"}, direction: ${node.direction?.raw ?? "?"}, depth: ${node.depth?.raw ?? "?"}${node.where ? `, where: ${printBooleanExprInline(node.where)}` : ""} }`;
    case "DeriveCollectExpr":
      return `${node.name} { path: ${node.path ? printDeriveExprInline(node.path) : "?"}, layer: ${node.layer?.raw ?? "?"}, key: ${node.key?.raw ?? "?"} }`;
    case "ComputeSumExpr":
      if (node.from || node.field) {
        return `${node.name}(from: ${node.from ? printComputeSourceInline(node.from) : "?"}, field: ${node.field?.raw ?? "?"})`;
      }
      return `${node.name} { collect: ${node.collect ? printDeriveExprInline(node.collect) : "?"} }`;
    case "ComputeMinExpr":
      return `${node.name}(from: ${node.from ? printComputeSourceInline(node.from) : "?"}, field: ${node.field?.raw ?? "?"})`;
    case "ComputeMaxExpr":
      return `${node.name}(from: ${node.from ? printComputeSourceInline(node.from) : "?"}, field: ${node.field?.raw ?? "?"})`;
    case "ComputeAvgExpr":
      return `${node.name}(from: ${node.from ? printComputeSourceInline(node.from) : "?"}, field: ${node.field?.raw ?? "?"})`;
    case "ComputeAbsExpr":
      return `${node.name}(${node.value ? printDeriveExprInline(node.value) : "?"})`;
    case "DeriveBinaryExpr":
      return `${printDeriveExprInline(node.left)} ${node.operator} ${printDeriveExprInline(node.right)}`;
  }

  return exhaustiveNever(node);
}

export function printAggregateQueryInline(node: AggregateQueryExprNode): string {
  return `@query(type: ${node.typeName?.raw ?? "?"})`;
}

export function printComputeSourceInline(
  node: ComputeCountExprNode["from"],
): string {
  if (!node) {
    return "?";
  }

  if (node.type === "AggregateQueryExpr") {
    return printAggregateQueryInline(node);
  }

  if (node.type === "Identifier") {
    return node.name;
  }

  return printDeriveExprInline(node);
}

export function printActionProjectExprInline(node: ActionProjectExprNode): string {
  switch (node.type) {
    case "Identifier":
      return node.name;
    case "PropertyAccess":
      return printPropertyAccessInline(node);
    case "StringLiteral":
      return node.raw;
    case "NumberLiteral":
      return node.raw;
    case "BooleanLiteral":
      return node.raw;
    case "RuntimeGenerateValueIdExpr":
      return printRuntimeGenerateValueIdExprInline(node);
    case "RuntimeGenerateNodeIdExpr":
      return printRuntimeGenerateNodeIdExprInline(node);
    case "RuntimeNextOrderExpr":
      return "@runtime.nextOrder()";
    case "NodeCapture":
      return printNodeCaptureInline(node);
    case "ObjectLiteral":
      return printObjectLiteralInline(node);
    case "ArrayLiteral":
      return printArrayLiteralInline(node);
  }

  return exhaustiveNever(node);
}

export function printRuntimeGenerateValueIdExprInline(
  node: RuntimeGenerateValueIdExprNode | RuntimeNextOrderExprNode,
): string {
  if (node.type === "RuntimeNextOrderExpr") {
    return "@runtime.nextOrder()";
  }

  return `@runtime.generateValueId(${node.prefix?.raw ?? ""})`;
}

export function printRuntimeGenerateNodeIdExprInline(
  node: RuntimeGenerateNodeIdExprNode,
): string {
  return `@runtime.generateNodeId(${node.prefix?.raw ?? ""})`;
}

export function printRepeatCountInline(
  node: RepeatExprNode["count"],
): string {
  if (!node) {
    return "(none)";
  }

  if (node.type === "NumberLiteral") {
    return node.raw;
  }

  return printDeriveExprInline(node);
}

export function printObjectLiteralInline(node: ObjectLiteralNode): string {
  return `{${node.properties.map(printObjectPropertyInline).join(", ")}}`;
}

export function printObjectPropertyInline(node: ObjectPropertyNode): string {
  return `${node.key}: ${printValueExprInline(node.value)}`;
}

export function printArrayLiteralInline(node: ArrayLiteralNode): string {
  return `[${node.elements.map(printValueExprInline).join(", ")}]`;
}

export function printBooleanExprInline(node: BooleanExprNode): string {
  switch (node.type) {
    case "BinaryBooleanExpr":
      return `${printBooleanExprInline(node.left)} ${node.operator} ${printBooleanExprInline(node.right)}`;
    case "UnaryBooleanExpr":
      return `${node.operator}${printBooleanExprInline(node.argument)}`;
    case "GroupedBooleanExpr":
      return `(${printBooleanExprInline(node.expression)})`;
    case "ComparisonExpr":
      return `${printBooleanValueInline(node.left)} ${node.operator} ${printBooleanValueInline(node.right)}`;
    case "PropertyAccess":
      return printPropertyAccessInline(node);
    case "Identifier":
      return node.name;
    case "StringLiteral":
      return node.raw;
    case "NumberLiteral":
      return node.raw;
    case "BooleanLiteral":
      return node.raw;
    case "RegexLiteral":
      return node.raw;
    case "DeriveStateExpr":
    case "DeriveMetaExpr":
    case "ComputeCountExpr":
    case "ComputeEdgeCountExpr":
    case "ComputeExistsExpr":
    case "DerivePathExpr":
    case "DeriveCollectExpr":
    case "ComputeSumExpr":
    case "ComputeMinExpr":
    case "ComputeMaxExpr":
    case "ComputeAvgExpr":
    case "ComputeAbsExpr":
    case "DeriveBinaryExpr":
      return printDeriveExprInline(node);
  }

  return exhaustiveNever(node);
}

export function printBooleanValueInline(
  node: BooleanValueNode,
): string {
  switch (node.type) {
    case "Identifier":
      return node.name;
    case "PropertyAccess":
      return printPropertyAccessInline(node);
    case "StringLiteral":
      return node.raw;
    case "NumberLiteral":
      return node.raw;
    case "BooleanLiteral":
      return node.raw;
    case "RegexLiteral":
      return node.raw;
    case "DeriveStateExpr":
    case "DeriveMetaExpr":
    case "ComputeCountExpr":
    case "ComputeEdgeCountExpr":
    case "ComputeExistsExpr":
    case "DerivePathExpr":
    case "DeriveCollectExpr":
    case "ComputeSumExpr":
    case "ComputeMinExpr":
    case "ComputeMaxExpr":
    case "ComputeAvgExpr":
    case "ComputeAbsExpr":
    case "DeriveBinaryExpr":
      return printDeriveExprInline(node);
  }

  return exhaustiveNever(node);
}

export function printInjectInline(node: InjectExprNode): string {
  return `@inject(${node.hookRef.name}, ${node.fileExtension.raw})`;
}

export function printPropertyAccessInline(node: PropertyAccessNode): string {
  return `${node.object.name}.${node.chain.map((part) => part.name).join(".")}`;
}


export function printEffectTargetInline(node: RootTargetNode | IdentifierNode): string {
  if (node.type === "RootTarget") {
    return node.name;
  }

  return node.name;
}

export function printMutationInline(
  node: RepeatExprNode | IfExprNode | GraphPipelineStepNode | MutationExprNode,
): string {
  switch (node.type) {
    case "RuntimeAddNodeExpr":
      return `@runtime.addNode(${node.node.type === "Identifier" ? node.node.name : printRuntimeGenerateNodeIdExprInline(node.node)}, ${printValueExprInline(node.value)}, ${printValueExprInline(node.state)}, ${printValueExprInline(node.meta)})`;
    case "RuntimeUpdateNodeValueExpr":
      return `@runtime.updateNodeValue(${node.node.name}, ${printValueExprInline(node.patch)})`;
    case "RuntimeDeleteNodeExpr":
      return `@runtime.deleteNode(${node.node.name})`;
    case "GraftBranchExpr":
      return `@graft.branch(${node.subject.name}, ${node.relation.raw}, ${node.object.name}${node.metadata ? `, ${printValueExprInline(node.metadata)}` : ""})`;
    case "GraftStateExpr":
      return `@graft.state(${node.node.name}, ${node.key.raw}, ${printValueExprInline(node.value)})`;
    case "GraftMetaExpr":
      return `@graft.meta(${node.node.name}, ${node.key.raw}, ${printValueExprInline(node.value)})`;
    case "GraftProgressExpr":
      return `@graft.progress(${node.from.name}, ${node.relation.raw}, ${node.to.name})`;
    case "PruneBranchExpr":
      return `@prune.branch(${node.subject.name}, ${node.relation.raw}, ${node.object.name}${node.metadata ? `, ${printValueExprInline(node.metadata)}` : ""})`;
    case "PruneStateExpr":
      return `@prune.state(${node.node.name}, ${node.key.raw})`;
    case "PruneMetaExpr":
      return `@prune.meta(${node.node.name}, ${node.key.raw})`;
    case "PruneNodesExpr":
      return `@prune.nodes(${printWherePredicateInline(node.where)})`;
    case "PruneEdgesExpr":
      return `@prune.edges(${printWherePredicateInline(node.where)})`;
    case "CtxSetExpr":
      return `@ctx.set(${node.edge.name}, ${printValueExprInline(node.context)})`;
    case "CtxClearExpr":
      return `@ctx.clear(${node.edge.name})`;
    case "ApplyExpr":
      if (node.target.type === "Identifier") {
        return `@action.apply(${node.target.name})`;
      }
      return `@action.apply(${printNodeCaptureInline(node.target)})`;
    case "GraphInjectionStep":
      return `<- ${printInjectInline(node.inject)}`;
    case "IfExpr": {
      const sections = [
        `when: ${node.when ? printGraphControlExprInline(node.when) : "(missing)"}`,
        `then: ${node.then.map(printMutationInline).join(" -> ") || "(none)"}`,
      ];

      if (node.else) {
        sections.push(
          `else: ${node.else.map(printMutationInline).join(" -> ") || "(none)"}`,
        );
      }

      return `@if(${node.when ? printGraphControlExprInline(node.when) : "/* missing */"}) { ${sections.filter((section) => !section.startsWith("when:")).join(", ")} }`;
    }
    case "RepeatExpr": {
      const body = node.pipeline.map((step) => `-> ${printMutationInline(step)}`).join(" ");
      return `@repeat(${node.count ? printRepeatCountInline(node.count) : "/* missing */"}) { ${body} }`;
    }
    case "WhenExpr": {
      const sections = [
        `query: ${node.query ? printGraphControlExprInline(node.query) : "(missing)"}`,
        `pipeline: ${node.pipeline.map(printMutationInline).join(" -> ") || "(none)"}`,
      ];

      return `@when(${node.query ? printGraphControlExprInline(node.query) : "/* missing */"}) { ${sections.filter((section) => !section.startsWith("query:")).join(", ")} }`;
    }
  }
}

export function printEffectOpInline(node: EffectOpNode): string {
  switch (node.type) {
    case "EffectGraftStateOp":
      return `@graft.state(${node.node.name}, ${node.key.raw}, ${printValueExprInline(node.value)})`;
    case "EffectGraftMetaOp":
      return `@graft.meta(${node.node.name}, ${node.key.raw}, ${printValueExprInline(node.value)})`;
    case "EffectPruneStateOp":
      return `@prune.state(${node.node.name}, ${node.key.raw})`;
    case "EffectPruneMetaOp":
      return `@prune.meta(${node.node.name}, ${node.key.raw})`;
    case "EffectDeriveStateOp":
      return `@derive.state(${node.key.raw}, ${printDeriveExprInline(node.expression)})`;
    case "EffectDeriveMetaOp":
      return `@derive.meta(${node.key.raw}, ${printDeriveExprInline(node.expression)})`;
  }

  return exhaustiveNever(node);
}

export function exhaustiveNever(value: never): never {
  throw new Error(`Unhandled AST print node: ${JSON.stringify(value)}`);
}

export function printSeedEdgeEntryInline(node: SeedEdgeEntryNode): string {
  if (node.type === "SeedEdgeBinding") {
    return `${node.name.name} := [${printEdgeExprInline(node.edge)}]`;
  }
  return printEdgeExprInline(node);
}

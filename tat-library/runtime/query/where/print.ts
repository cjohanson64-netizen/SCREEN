import type {
  ArrayLiteralNode,
  BooleanExprNode,
  BooleanValueNode,
  ComputeSourceNode,
  DeriveExprNode,
  StringLiteralNode,
} from "../../../ast/nodeTypes.js";

export function printBooleanExpr(expr: BooleanExprNode): string {
  switch (expr.type) {
    case "BinaryBooleanExpr":
      return `${printBooleanExpr(expr.left)} ${expr.operator} ${printBooleanExpr(expr.right)}`;

    case "UnaryBooleanExpr":
      return `!${printBooleanExpr(expr.argument)}`;

    case "GroupedBooleanExpr":
      return `(${printBooleanExpr(expr.expression)})`;

    case "ComparisonExpr":
      return `${printBooleanValue(expr.left)} ${expr.operator} ${printBooleanValue(expr.right)}`;

    case "PropertyAccess":
      return `${expr.object.name}.${expr.chain.map((c) => c.name).join(".")}`;

    case "Identifier":
      return expr.name;

    case "StringLiteral":
      return expr.raw;

    case "NumberLiteral":
      return expr.raw;

    case "BooleanLiteral":
      return expr.raw;

    case "RegexLiteral":
      return expr.raw;

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
      return printDeriveExpr(expr);

    default: {
      const _exhaustive: never = expr;
      throw new Error(`Unsupported boolean print expression: ${JSON.stringify(_exhaustive)}`);
    }
  }
}

function printBooleanValue(value: BooleanValueNode): string {
  switch (value.type) {
    case "Identifier":
      return value.name;

    case "PropertyAccess":
      return `${value.object.name}.${value.chain.map((c) => c.name).join(".")}`;

    case "StringLiteral":
      return value.raw;

    case "NumberLiteral":
      return value.raw;

    case "BooleanLiteral":
      return value.raw;

    case "RegexLiteral":
      return value.raw;

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
      return printDeriveExpr(value);

    default: {
      const _exhaustive: never = value;
      throw new Error(`Unsupported boolean print value: ${JSON.stringify(_exhaustive)}`);
    }
  }
}

function printDeriveExpr(
  expr: Extract<
    BooleanValueNode,
    {
      type:
        | "DeriveStateExpr"
        | "DeriveMetaExpr"
        | "ComputeCountExpr"
        | "ComputeEdgeCountExpr"
        | "ComputeExistsExpr"
        | "DerivePathExpr"
        | "DeriveCollectExpr"
        | "ComputeSumExpr"
        | "ComputeMinExpr"
        | "ComputeMaxExpr"
        | "ComputeAvgExpr"
        | "ComputeAbsExpr"
        | "DeriveBinaryExpr";
    }
  >,
): string {
  switch (expr.type) {
    case "DeriveStateExpr":
      return `${expr.name} { node: ${expr.node?.name ?? "?"}, key: ${expr.key?.raw ?? "?"} }`;
    case "DeriveMetaExpr":
      return `${expr.name} { node: ${expr.node?.name ?? "?"}, key: ${expr.key?.raw ?? "?"} }`;
    case "ComputeCountExpr":
      if (expr.from) {
        return `${expr.name}(from: ${printComputeSourceExpr(expr.from)})`;
      }
      if (expr.nodes) {
        return `${expr.name} { nodes: ${printDeriveExpr(expr.nodes)} }`;
      }
      return `${expr.name} { nodes: ? }`;
    case "ComputeEdgeCountExpr":
      return `${expr.name} { node: ${expr.node?.name ?? "?"}, relation: ${expr.relation?.raw ?? "?"}, direction: ${expr.direction?.raw ?? "?"} }`;
    case "ComputeExistsExpr":
      return `${expr.name} { path: ${expr.path ? expr.path.type === "Identifier" ? expr.path.name : printDeriveExpr(expr.path) : "?"} }`;
    case "DerivePathExpr":
      return `${expr.name} { node: ${expr.node?.name ?? "?"}, relation: ${expr.relation ? printDeriveRelation(expr.relation) : "?"}, direction: ${expr.direction?.raw ?? "?"}, depth: ${expr.depth?.raw ?? "?"}${expr.where ? `, where: ${printBooleanExpr(expr.where)}` : ""} }`;
    case "DeriveCollectExpr":
      return `${expr.name} { path: ${expr.path ? printDeriveExpr(expr.path) : "?"}, layer: ${expr.layer?.raw ?? "?"}, key: ${expr.key?.raw ?? "?"} }`;
    case "ComputeSumExpr":
      return expr.from || expr.field
        ? `${expr.name}(from: ${expr.from ? printComputeSourceExpr(expr.from) : "?"}, field: ${expr.field?.raw ?? "?"})`
        : `${expr.name} { collect: ${expr.collect ? printDeriveExpr(expr.collect) : "?"} }`;
    case "ComputeMinExpr":
      return `${expr.name}(from: ${expr.from ? printComputeSourceExpr(expr.from) : "?"}, field: ${expr.field?.raw ?? "?"})`;
    case "ComputeMaxExpr":
      return `${expr.name}(from: ${expr.from ? printComputeSourceExpr(expr.from) : "?"}, field: ${expr.field?.raw ?? "?"})`;
    case "ComputeAvgExpr":
      return `${expr.name}(from: ${expr.from ? printComputeSourceExpr(expr.from) : "?"}, field: ${expr.field?.raw ?? "?"})`;
    case "ComputeAbsExpr":
      return `${expr.name}(${expr.value ? printDeriveOperand(expr.value) : "?"})`;
    case "DeriveBinaryExpr":
      return `${printDeriveOperand(expr.left)} ${expr.operator} ${printDeriveOperand(expr.right)}`;
  }

  throw new Error(`Unsupported derive print expression: ${JSON.stringify(expr)}`);
}

function printComputeSourceExpr(expr: ComputeSourceNode): string {
  if (expr.type === "AggregateQueryExpr") {
    return `@query(type: ${expr.typeName?.raw ?? "?"})`;
  }

  if (expr.type === "Identifier") {
    return expr.name;
  }

  return printDeriveExpr(expr);
}

function printDeriveOperand(expr: DeriveExprNode): string {
  switch (expr.type) {
    case "CurrentValue":
      return expr.name;
    case "PreviousValue":
      return expr.name;
    case "NumberLiteral":
      return expr.raw;
    case "StringLiteral":
      return expr.raw;
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
      return printDeriveExpr(expr);
  }

  throw new Error(`Unsupported derive operand: ${JSON.stringify(expr)}`);
}

function printDeriveRelation(value: StringLiteralNode | ArrayLiteralNode): string {
  if (value.type === "StringLiteral") {
    return value.raw;
  }

  return `[${value.elements
    .map((element) =>
      element.type === "StringLiteral" ? element.raw : JSON.stringify(element),
    )
    .join(", ")}]`;
}


import type {
  ActionExprNode,
  ActionGuardExprNode,
  ActionPipelineStepNode,
  AggregateQueryExprNode,
  ArrayLiteralNode,
  ComputeAbsExprNode,
  ComputeAvgExprNode,
  DeriveCollectExprNode,
  ComputeCountExprNode,
  ComputeEdgeCountExprNode,
  DeriveExprNode,
  ComputeExistsExprNode,
  ComputeMaxExprNode,
  DeriveMetaExprNode,
  ComputeMinExprNode,
  DerivePathExprNode,
  DeriveStateExprNode,
  ComputeSumExprNode,
  GraphControlExprNode,
  GraphPipelineStepNode,
  GraphInjectionStepNode,
  IdentifierNode,
  IfExprNode,
  RepeatCountExprNode,
  RepeatExprNode,
  MutationExprNode,
  ObjectLiteralNode,
  ValueBindingNode,
  WhenExprNode,
} from "../../../ast/nodeTypes.js";
import { pushIssue, type ValidationState } from "../validationState.js";
import { validateIdentifier } from "./shared.js";
import { validateGraphControlExpr } from "./validateControl.js";

export function validateDeriveStateExpr(
  expr: DeriveStateExprNode,
  state: ValidationState,
): void {
  if (!expr.node) {
    pushIssue(state, "error", expr.span, "@derive.state requires a node field");
  } else {
    validateIdentifier(expr.node.name, expr.node.span, state);
  }

  if (!expr.key) {
    pushIssue(state, "error", expr.span, "@derive.state requires a key field");
  }
}

export function validateDeriveMetaExpr(
  expr: DeriveMetaExprNode,
  state: ValidationState,
): void {
  if (!expr.node) {
    pushIssue(state, "error", expr.span, "@derive.meta requires a node field");
  } else {
    validateIdentifier(expr.node.name, expr.node.span, state);
  }

  if (!expr.key) {
    pushIssue(state, "error", expr.span, "@derive.meta requires a key field");
  }
}

export function validateComputeCountExpr(
  expr: ComputeCountExprNode,
  state: ValidationState,
): void {
  if (expr.from) {
    validateComputeSourceExpr(expr.from, state);
    return;
  }

  if (!expr.nodes) {
    pushIssue(
      state,
      "error",
      expr.span,
      "@compute.count requires a nodes field or from field",
    );
    return;
  }

  validateDerivePathExpr(expr.nodes, state);
}

export function validateComputeEdgeCountExpr(
  expr: ComputeEdgeCountExprNode,
  state: ValidationState,
): void {
  if (!expr.node) {
    pushIssue(
      state,
      "error",
      expr.span,
      "@compute.edgeCount requires a node field",
    );
  } else {
    validateIdentifier(expr.node.name, expr.node.span, state);
  }

  if (!expr.relation) {
    pushIssue(
      state,
      "error",
      expr.span,
      "@compute.edgeCount requires a relation field",
    );
  }

  if (!expr.direction) {
    pushIssue(
      state,
      "error",
      expr.span,
      "@compute.edgeCount requires a direction field",
    );
  } else if (
    expr.direction.value !== "incoming" &&
    expr.direction.value !== "outgoing"
  ) {
    pushIssue(
      state,
      "error",
      expr.direction.span,
      '@compute.edgeCount direction must be "incoming" or "outgoing"',
    );
  }

  if (expr.where) {
    validateGraphControlExpr(expr.where, state, "@compute.edgeCount where");
  }
}

export function validateDerivePathExpr(
  expr: DerivePathExprNode,
  state: ValidationState,
): void {
  if (!expr.node) {
    pushIssue(state, "error", expr.span, "@derive.path requires a node field");
  } else {
    validateIdentifier(expr.node.name, expr.node.span, state);
  }

  if (!expr.relation) {
    pushIssue(
      state,
      "error",
      expr.span,
      "@derive.path requires a relation field",
    );
  } else if (expr.relation.type === "ArrayLiteral") {
    validateDerivePathRelationArray(expr.relation, state);
  }

  if (!expr.direction) {
    pushIssue(
      state,
      "error",
      expr.span,
      "@derive.path requires a direction field",
    );
  } else if (
    expr.direction.value !== "incoming" &&
    expr.direction.value !== "outgoing" &&
    expr.direction.value !== "both"
  ) {
    pushIssue(
      state,
      "error",
      expr.direction.span,
      '@derive.path direction must be "incoming", "outgoing", or "both"',
    );
  }

  if (!expr.depth) {
    pushIssue(state, "error", expr.span, "@derive.path requires a depth field");
  } else if (!Number.isInteger(expr.depth.value) || expr.depth.value < 1) {
    pushIssue(
      state,
      "error",
      expr.depth.span,
      "@derive.path depth must be an integer >= 1",
    );
  }

  if (expr.where) {
    validateGraphControlExpr(expr.where, state, "@derive.path where");
  }
}

export function validateComputeExistsExpr(
  expr: ComputeExistsExprNode,
  state: ValidationState,
): void {
  if (!expr.path) {
    pushIssue(
      state,
      "error",
      expr.span,
      "@compute.exists requires a path field",
    );
    return;
  }

  if (expr.path.type === "Identifier") {
    validateIdentifier(expr.path.name, expr.path.span, state);
    return;
  }

  validateDerivePathExpr(expr.path, state);
}

export function validateDeriveCollectExpr(
  expr: DeriveCollectExprNode,
  state: ValidationState,
): void {
  if (!expr.path) {
    pushIssue(
      state,
      "error",
      expr.span,
      "@derive.collect requires a path field",
    );
  } else {
    validateDerivePathExpr(expr.path, state);
  }

  if (!expr.layer) {
    pushIssue(
      state,
      "error",
      expr.span,
      "@derive.collect requires a layer field",
    );
  } else if (
    expr.layer.value !== "value" &&
    expr.layer.value !== "state" &&
    expr.layer.value !== "meta"
  ) {
    pushIssue(
      state,
      "error",
      expr.layer.span,
      '@derive.collect layer must be "value", "state", or "meta"',
    );
  }

  if (!expr.key) {
    pushIssue(
      state,
      "error",
      expr.span,
      "@derive.collect requires a key field",
    );
  }
}

export function validateComputeSumExpr(
  expr: ComputeSumExprNode,
  state: ValidationState,
): void {
  if (expr.from || expr.field) {
    if (!expr.from) {
      pushIssue(state, "error", expr.span, "@compute.sum requires a from field");
    } else {
      validateComputeSourceExpr(expr.from, state);
    }

    if (!expr.field) {
      pushIssue(
        state,
        "error",
        expr.span,
        "@compute.sum requires a field field",
      );
    }
    return;
  }

  if (!expr.collect) {
    pushIssue(
      state,
      "error",
      expr.span,
      "@compute.sum requires a collect field or from/field",
    );
    return;
  }

  validateDeriveCollectExpr(expr.collect, state);
}

export function validateComputeMinExpr(
  expr: ComputeMinExprNode,
  state: ValidationState,
): void {
  validateFieldAggregateExpr(
    expr.name,
    expr.from,
    expr.field,
    expr.span,
    state,
  );
}

export function validateComputeMaxExpr(
  expr: ComputeMaxExprNode,
  state: ValidationState,
): void {
  validateFieldAggregateExpr(
    expr.name,
    expr.from,
    expr.field,
    expr.span,
    state,
  );
}

export function validateComputeAvgExpr(
  expr: ComputeAvgExprNode,
  state: ValidationState,
): void {
  validateFieldAggregateExpr(
    expr.name,
    expr.from,
    expr.field,
    expr.span,
    state,
  );
}

export function validateComputeAbsExpr(
  expr: ComputeAbsExprNode,
  state: ValidationState,
): void {
  if (!expr.value) {
    pushIssue(
      state,
      "error",
      expr.span,
      "@compute.abs requires a value expression",
    );
    return;
  }

  validateDeriveExpr(expr.value, state);
}

export function validateFieldAggregateExpr(
  name: string,
  from: AggregateQueryExprNode | DerivePathExprNode | IdentifierNode | null,
  field: ComputeSumExprNode["field"],
  span: DeriveExprNode["span"],
  state: ValidationState,
): void {
  if (!from) {
    pushIssue(state, "error", span, `${name} requires a from field`);
  } else {
    validateComputeSourceExpr(from, state);
  }

  if (!field) {
    pushIssue(state, "error", span, `${name} requires a field field`);
  }
}

export function validateComputeSourceExpr(
  expr: AggregateQueryExprNode | DerivePathExprNode | IdentifierNode,
  state: ValidationState,
): void {
  if (expr.type === "DerivePathExpr") {
    validateDerivePathExpr(expr, state);
    return;
  }

  if (expr.type === "Identifier") {
    validateIdentifier(expr.name, expr.span, state);
    return;
  }

  validateAggregateQueryExpr(expr, state);
}

export function validateAggregateQueryExpr(
  expr: AggregateQueryExprNode,
  state: ValidationState,
): void {
  if (!expr.typeName) {
    pushIssue(
      state,
      "error",
      expr.span,
      "@query(...) compute source requires a type field",
    );
  }
}

export function validateDerivePathRelationArray(
  relation: ArrayLiteralNode,
  state: ValidationState,
): void {
  for (const element of relation.elements) {
    if (element.type !== "StringLiteral") {
      pushIssue(
        state,
        "error",
        element.span,
        "@derive.path relation arrays must contain only string literals",
      );
    }
  }
}

export function validateDeriveExpr(
  expr: DeriveExprNode,
  state: ValidationState,
): void {
  switch (expr.type) {
    case "DeriveStateExpr":
      validateDeriveStateExpr(expr, state);
      return;

    case "DeriveMetaExpr":
      validateDeriveMetaExpr(expr, state);
      return;

    case "ComputeCountExpr":
      validateComputeCountExpr(expr, state);
      return;

    case "ComputeEdgeCountExpr":
      validateComputeEdgeCountExpr(expr, state);
      return;

    case "ComputeExistsExpr":
      validateComputeExistsExpr(expr, state);
      return;

    case "DerivePathExpr":
      validateDerivePathExpr(expr, state);
      return;

    case "DeriveCollectExpr":
      validateDeriveCollectExpr(expr, state);
      return;

    case "ComputeSumExpr":
      validateComputeSumExpr(expr, state);
      return;

    case "ComputeMinExpr":
      validateComputeMinExpr(expr, state);
      return;

    case "ComputeMaxExpr":
      validateComputeMaxExpr(expr, state);
      return;

    case "ComputeAvgExpr":
      validateComputeAvgExpr(expr, state);
      return;

    case "ComputeAbsExpr":
      validateComputeAbsExpr(expr, state);
      return;

    case "DeriveBinaryExpr":
      validateDeriveExpr(expr.left, state);
      validateDeriveExpr(expr.right, state);
      return;

    default:
      return;
  }
}


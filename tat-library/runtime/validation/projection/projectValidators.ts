import type {
  ArrayLiteralNode,
  GraphPipelineNode,
  GraphProjectionNode,
  ProjectExprNode,
} from "../../../ast/nodeTypes.js";
import {
  PROJECT_FORMAT_RULES,
  isProjectFormat,
  isProjectIncludeKey,
} from "../../projection/projection.js";
import { pushIssue, type ValidationState } from "../validationState.js";
import { validateProjectionExpression } from "../expressions/expressionValidators.js";

export function validateTerminalGraphExpr(
  projection:
    | GraphProjectionNode["projection"]
    | GraphPipelineNode["projection"],
  state: ValidationState,
): void {
  if (!projection) {
    return;
  }

  validateProjectExpr(projection, state);
}

export function validateProjectExpr(
  projection: ProjectExprNode,
  state: ValidationState,
): void {
  if (!projection.projectionName) {
    pushIssue(
      state,
      "error",
      projection.span,
      "@project requires a projection selector as its first argument",
    );
    return;
  }

  const selector = projection.projectionName.name;
  if (!isProjectFormat(selector) && !state.projectionBindings.has(selector)) {
    pushIssue(
      state,
      "error",
      projection.projectionName.span,
      `Unknown projection selector "${selector}"`,
    );
    return;
  }

  for (const arg of projection.args) {
    validateProjectionExpression(arg.value, state);
  }
}

function validateProjectFocus(
  value: ProjectExprNode["args"][number]["value"],
  state: ValidationState,
): void {
  validateProjectionExpression(value, state);
}

function validateProjectInclude(
  format: keyof typeof PROJECT_FORMAT_RULES,
  value: ProjectExprNode["args"][number]["value"],
  state: ValidationState,
): void {
  if (value.type !== "ArrayLiteral") {
    pushIssue(
      state,
      "error",
      value.span,
      "@project include must be an array literal",
    );
    return;
  }

  const rule = PROJECT_FORMAT_RULES[format];
  const allowed = new Set([...rule.core, ...rule.allowed]);
  const seen = new Set<string>();

  for (const element of value.elements) {
    if (element.type !== "Identifier" && element.type !== "StringLiteral") {
      pushIssue(
        state,
        "error",
        element.span,
        "@project include entries must be identifiers or string literals",
      );
      continue;
    }

    const includeKey =
      element.type === "Identifier" ? element.name : element.value;

    if (!isProjectIncludeKey(includeKey)) {
      pushIssue(
        state,
        "error",
        element.span,
        `Invalid @project include key "${includeKey}"`,
      );
      continue;
    }

    if (!allowed.has(includeKey)) {
      pushIssue(
        state,
        "error",
        element.span,
        `@project format "${format}" does not allow include key "${includeKey}"`,
      );
      continue;
    }

    seen.add(includeKey);
  }

  for (const required of rule.core) {
    if (!seen.has(required)) {
      pushIssue(
        state,
        "error",
        value.span,
        `@project format "${format}" requires include key "${required}"`,
      );
    }
  }
}


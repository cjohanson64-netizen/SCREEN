import type {
  GraphInteractionDefinitionNode,
  GraphPipelineNode,
  GraphProjectionNode,
  ProjectionDefNode,
  QueryStatementNode,
  SeedBlockNode,
  TopLevelInjectionStatementNode,
  StatementNode,
  ValueBindingNode,
} from "../../ast/nodeTypes.js";
import {
  isTopLevelNameTaken,
  pushIssue,
  validateStatementAfterTerminalProject,
  type ValidationState,
} from "./validationState.js";
import {
  validateAction,
  validateDeriveExpr,
  validateGraphControlExpr,
  validateGraphPipelineStep,
  validateGraphQueryExpr,
  validateNodeCapture,
  validateProjectionExpression,
  validateWhenExpr,
} from "./expressions/expressionValidators.js";
import {
  validateProjectExpr,
  validateTerminalGraphExpr,
} from "./projection/projectValidators.js";

export function validateStatement(
  statement: StatementNode,
  state: ValidationState,
): void {
  switch (statement.type) {
    case "ImportDeclaration":
    case "ExportDeclaration":
      return;

    case "TopLevelInjectionStatement":
      validateTopLevelInjectionStatement(statement, state);
      return;

    case "BindStatement":
      validateStatementAfterTerminalProject(statement.type, state);
      return;

    case "ValueBinding":
      validateValueBinding(statement, state);
      return;

    case "OperatorBinding":
      validateOperatorBinding(statement, state);
      return;

    case "ProjectionDef":
      validateProjectionDefinition(statement, state);
      return;

    case "SeedBlock":
      validateSeedBlock(statement, state);
      return;

    case "GraphPipeline":
      validateGraphPipeline(statement, state);
      return;

    case "GraphProjection":
      validateGraphProjection(statement, state);
      return;

    case "WhenExpr":
      validateWhenExpr(statement, state);
      return;

    case "GraphInteractionDefinition":
      validateGraphInteractionDefinition(statement, state);
      return;

    case "QueryStatement":
      validateQueryStatement(statement, state);
      return;

    default:
      return;
  }
}

function validateTopLevelInjectionStatement(
  statement: TopLevelInjectionStatementNode,
  state: ValidationState,
): void {
  if (!statement.inject.hookRef.name) {
    pushIssue(state, "error", statement.span, "@inject requires a hookRef identifier");
  }

  if (!statement.inject.fileExtension.value) {
    pushIssue(state, "error", statement.span, "@inject requires a file extension");
  }

  if (statement.inject.alias) {
    const alias = statement.inject.alias.name;
    if (isTopLevelNameTaken(alias, state)) {
      pushIssue(state, "error", statement.inject.alias.span, `Duplicate binding "${alias}"`);
    } else {
      state.graphBindings.add(alias);
    }
  }
}

function validateValueBinding(
  statement: ValueBindingNode,
  state: ValidationState,
): void {
  const name = statement.name.name;

  if (isTopLevelNameTaken(name, state)) {
    pushIssue(
      state,
      "error",
      statement.name.span,
      `Duplicate binding "${name}"`,
    );
    return;
  }

  state.valueBindings.add(name);

  if (statement.value.type === "NodeCapture") {
    state.nodeBindings.add(name);
    validateNodeCapture(statement, state);
  }
}

function validateOperatorBinding(
  statement: Extract<StatementNode, { type: "OperatorBinding" }>,
  state: ValidationState,
): void {
  const name = statement.name.name;

  if (isTopLevelNameTaken(name, state)) {
    pushIssue(
      state,
      "error",
      statement.name.span,
      `Duplicate binding "${name}"`,
    );
    return;
  }

  state.operatorBindings.add(name);

  if (statement.value.type === "ActionExpr") {
    state.actionBindings.add(name);
    validateAction(statement.value, state);
    return;
  }

  if (statement.value.type === "ProjectExpr") {
    validateProjectExpr(statement.value, state);
    return;
  }

}

function validateProjectionDefinition(
  statement: ProjectionDefNode,
  state: ValidationState,
): void {
  const name = statement.name.name;

  if (isTopLevelNameTaken(name, state)) {
    pushIssue(
      state,
      "error",
      statement.name.span,
      `Duplicate binding "${name}"`,
    );
    return;
  }

  state.valueBindings.add(name);
  state.projectionBindings.add(name);

  if (statement.focus) {
    validateProjectionExpression(statement.focus, state);
  }

  for (const property of statement.fields.properties) {
    validateProjectionExpression(property.value, state);
  }
}

function validateSeedBlock(
  statement: SeedBlockNode,
  state: ValidationState,
): void {
  if (state.hasSeed) {
    pushIssue(
      state,
      "error",
      statement.span,
      "Multiple @seed blocks are not allowed",
    );
  }

  state.hasSeed = true;
}

function validateGraphPipeline(
  statement: GraphPipelineNode,
  state: ValidationState,
): void {
  const name = statement.name.name;

  if (isTopLevelNameTaken(name, state)) {
    pushIssue(
      state,
      "error",
      statement.name.span,
      `Duplicate graph name "${name}"`,
    );
    return;
  }

  if (statement.projection) {
    state.valueBindings.add(name);
    validateTerminalGraphExpr(statement.projection, state);
    state.terminalProjectReached = true;
  } else {
    state.graphBindings.add(name);
  }

  for (const step of statement.mutations) {
    validateGraphPipelineStep(step, state);
  }
}

function validateGraphProjection(
  statement: GraphProjectionNode,
  state: ValidationState,
): void {
  const name = statement.name.name;

  if (isTopLevelNameTaken(name, state)) {
    pushIssue(
      state,
      "error",
      statement.name.span,
      `Duplicate binding "${name}"`,
    );
    return;
  }

  state.valueBindings.add(name);

  if (
    statement.projection.type === "ProjectExpr" &&
    !state.graphBindings.has(statement.source.name)
  ) {
    pushIssue(
      state,
      "error",
      statement.source.span,
      `@project source "${statement.source.name}" is not a known graph binding`,
    );
  }

  validateTerminalGraphExpr(statement.projection, state);
}

function validateGraphInteractionDefinition(
  statement: GraphInteractionDefinitionNode,
  state: ValidationState,
): void {
  if (statement.name) {
    const name = statement.name.name;

    if (isTopLevelNameTaken(name, state)) {
      pushIssue(
        state,
        "error",
        statement.name.span,
        `Duplicate binding "${name}"`,
      );
      return;
    }

    state.operatorBindings.add(name);
  }

  if (statement.effect) {
    for (const step of statement.effect.pipeline) {
      if (step.type === "IfExpr") {
        for (const branchStep of step.then) validateGraphPipelineStep(branchStep, state);
        if (step.else) for (const branchStep of step.else) validateGraphPipelineStep(branchStep, state);
      }
    }
  }
}

function validateQueryStatement(
  statement: QueryStatementNode,
  state: ValidationState,
): void {
  if (statement.expr.type === "GraphQueryExpr") {
    validateGraphQueryExpr(statement.expr, state);
  }
}


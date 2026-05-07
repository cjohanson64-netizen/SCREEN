export interface ValidationIssue {
  severity: "error" | "warning";
  message: string;
  span?: { line: number; column: number };
}

export interface ValidationState {
  valueBindings: Set<string>;
  nodeBindings: Set<string>;
  operatorBindings: Set<string>;
  actionBindings: Set<string>;
  graphBindings: Set<string>;
  projectionBindings: Set<string>;
  hasSeed: boolean;
  terminalProjectReached: boolean;
  issues: ValidationIssue[];
}

export function createValidationState(): ValidationState {
  return {
    valueBindings: new Set(),
    nodeBindings: new Set(),
    operatorBindings: new Set(),
    actionBindings: new Set(),
    graphBindings: new Set(),
    projectionBindings: new Set(),
    hasSeed: false,
    terminalProjectReached: false,
    issues: [],
  };
}

export function pushIssue(
  state: ValidationState,
  severity: "error" | "warning",
  span: { line: number; column: number } | undefined,
  message: string,
): void {
  state.issues.push({
    severity,
    message,
    span,
  });
}

export function isTopLevelNameTaken(
  name: string,
  state: ValidationState,
): boolean {
  return (
    state.valueBindings.has(name) ||
    state.operatorBindings.has(name) ||
    state.graphBindings.has(name)
  );
}

export function validateStatementAfterTerminalProject(
  statementType: string,
  state: ValidationState,
): void {
  if (!state.terminalProjectReached) {
    return;
  }

  pushIssue(
    state,
    "error",
    undefined,
    `${statementType} cannot appear after terminal @project.apply(...)`,
  );
}

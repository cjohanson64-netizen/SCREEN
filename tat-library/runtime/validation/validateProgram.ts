import type { ProgramNode } from "../../ast/nodeTypes.js";
import {
  createValidationState,
  type ValidationIssue,
  type ValidationState,
} from "./validationState.js";
import { validateStatement } from "./validationRules.js";

export type { ValidationIssue, ValidationState } from "./validationState.js";

export function validateProgram(program: ProgramNode): ValidationIssue[] {
  const state = createValidationState();

  for (const statement of program.body) {
    validateStatement(statement, state);
  }

  return state.issues;
}

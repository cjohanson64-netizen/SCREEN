import type {
  ActionPipelineStepNode,
  GraphInjectionStepNode,
  GraphPipelineStepNode,
  InjectExprNode,
  ProgramNode,
  TopLevelInjectionStatementNode,
} from "../../../ast/nodeTypes.js";
import { tokenize } from "../../../lexer/tokenize.js";
import { parse, Parser } from "../../../parser/parse.js";
import { validateProgram } from "../../validation/validateProgram.js";
import { createValidationState } from "../../validation/validationState.js";
import { validateGraphPipelineStep } from "../../validation/expressions/expressionValidators.js";
import type {
  InjectionHistoryEntry,
  InjectionPayload,
  RuntimeState,
} from "../../engine/runtimeState.js";
import { measureTiming } from "../../instrumentation/timing.js";
import {
  recordInjectionParseCacheHit,
  recordInjectionParseCacheMiss,
} from "../../cache/injectionFragmentCache.js";

export function resolveInjectionPayload(
  inject: InjectExprNode,
  state: RuntimeState,
): InjectionPayload {
  const hookRef = inject.hookRef.name;
  const expectedExtension = inject.fileExtension.value;
  const payload = state.injections[hookRef];

  if (!payload) {
    throw new Error(
      `Missing injection hook "${hookRef}" for source "${expectedExtension}"`,
    );
  }

  if (!payload.fileExtension) {
    throw new Error(`Missing file extension for injection hook "${hookRef}"`);
  }

  if (payload.fileExtension !== expectedExtension) {
    throw new Error(
      `Injection hook "${hookRef}" expected "${expectedExtension}" but received "${payload.fileExtension}"`,
    );
  }

  return payload;
}

export function parseInjectedProgram(source: string): ProgramNode {
  return parse(tokenize(source));
}

export function parseInjectedGraphPipelineFragment(
  source: string,
): GraphPipelineStepNode[] {
  const parser = new Parser(tokenize(source));
  return parser.parseGraphPipelineFragment();
}

export function assertNoNestedInjectionInProgram(program: ProgramNode): void {
  for (const statement of program.body) {
    if (statement.type === "TopLevelInjectionStatement") {
      throw new Error("Nested injection is not supported in Phase 4 V1.");
    }

    if (statement.type === "GraphPipeline") {
      assertNoNestedInjectionInSteps(statement.mutations);
    }

    if (statement.type === "OperatorBinding" && statement.value.type === "ActionExpr") {
      assertNoNestedInjectionInSteps(statement.value.pipeline);
    }
  }
}

export function assertNoNestedInjectionInSteps(
  steps: Array<GraphPipelineStepNode | ActionPipelineStepNode>,
): void {
  for (const step of steps) {
    if (step.type === "GraphInjectionStep") {
      throw new Error("Nested injection is not supported in Phase 4 V1.");
    }

    if (step.type === "IfExpr") {
      assertNoNestedInjectionInSteps(step.then);
      if (step.else) {
        assertNoNestedInjectionInSteps(step.else);
      }
    }

    if (step.type === "WhenExpr") {
      assertNoNestedInjectionInSteps(step.pipeline);
    }

    if (step.type === "RepeatExpr") {
      assertNoNestedInjectionInSteps(step.pipeline);
    }
  }
}

export function validateInjectedProgram(program: ProgramNode): void {
  const issues = validateProgram(program);
  const errors = issues.filter((issue) => issue.severity === "error");

  if (errors.length === 0) {
    return;
  }

  throw new Error(
    `Injected TAT program failed validation: ${errors
      .map((issue) => issue.message)
      .join("; ")}`,
  );
}

export function validateInjectedGraphPipelineSteps(
  steps: GraphPipelineStepNode[],
  state: RuntimeState,
): void {
  const validationState = createValidationState();

  for (const name of state.bindings.values.keys()) {
    validationState.valueBindings.add(name);
  }

  for (const name of state.bindings.nodes.keys()) {
    validationState.nodeBindings.add(name);
  }

  for (const name of state.actions.keys()) {
    validationState.actionBindings.add(name);
  }

  for (const name of state.graphs.keys()) {
    validationState.graphBindings.add(name);
  }

  for (const step of steps) {
    validateGraphPipelineStep(step, validationState);
  }

  const errors = validationState.issues.filter(
    (issue) => issue.severity === "error",
  );

  if (errors.length === 0) {
    return;
  }

  throw new Error(
    `Injected graph pipeline failed validation: ${errors
      .map((issue) => issue.message)
      .join("; ")}`,
  );
}

export function recordInjectionHistory(
  state: RuntimeState,
  inject: InjectExprNode,
  payload: InjectionPayload,
  context: InjectionHistoryEntry["context"],
  status: InjectionHistoryEntry["status"],
  details: { executedStepCount?: number; error?: string } = {},
): void {
  state.injectionHistory.push({
    id: makeInjectionEventId(),
    op: "@inject",
    hookRef: inject.hookRef.name,
    fileExtension: inject.fileExtension.value,
    source: payload.source,
    context,
    status,
    executedStepCount: details.executedStepCount,
    error: details.error,
    startedAt: Date.now(),
  });
}

export function resolveParseValidateTopLevelInjection(
  statement: TopLevelInjectionStatementNode,
  state: RuntimeState,
): { payload: InjectionPayload; program: ProgramNode } {
  const payload = resolveInjectionPayload(statement.inject, state);
  const hookRef = statement.inject.hookRef.name;
  const fileExtension = statement.inject.fileExtension.value;
  const cached = state.injectionFragmentCache?.getTopLevel(
    hookRef,
    fileExtension,
    payload.source,
  );

  let program: ProgramNode;
  if (cached) {
    recordInjectionParseCacheHit(state.timing, "topLevel");
    program = cached.program;
  } else {
    recordInjectionParseCacheMiss(state.timing, "topLevel");
    program = measureTiming(state.timing, "inject.topLevel.parse", () =>
      parseInjectedProgram(payload.source),
    );
    state.injectionFragmentCache?.setTopLevel(
      hookRef,
      fileExtension,
      payload.source,
      program,
    );
  }

  measureTiming(state.timing, "inject.topLevel.validate", () => {
    assertNoNestedInjectionInProgram(program);
    validateInjectedProgram(program);
  });
  return { payload, program };
}

export function resolveParseValidateGraphInjection(
  step: GraphInjectionStepNode,
  state: RuntimeState,
): { payload: InjectionPayload; steps: GraphPipelineStepNode[] } {
  const payload = resolveInjectionPayload(step.inject, state);
  const hookRef = step.inject.hookRef.name;
  const fileExtension = step.inject.fileExtension.value;
  const cached = state.injectionFragmentCache?.getGraphPipeline(
    hookRef,
    fileExtension,
    payload.source,
  );

  let steps: GraphPipelineStepNode[];
  if (cached) {
    recordInjectionParseCacheHit(state.timing, "graphPipeline");
    steps = cached.steps;
  } else {
    recordInjectionParseCacheMiss(state.timing, "graphPipeline");
    steps = measureTiming(state.timing, "inject.graphFlow.parse", () =>
      parseInjectedGraphPipelineFragment(payload.source),
    );
    state.injectionFragmentCache?.setGraphPipeline(
      hookRef,
      fileExtension,
      payload.source,
      steps,
    );
  }

  measureTiming(state.timing, "inject.graphFlow.validate", () => {
    assertNoNestedInjectionInSteps(steps);
    validateInjectedGraphPipelineSteps(steps, state);
  });
  return { payload, steps };
}

function makeInjectionEventId(): string {
  return `inj_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

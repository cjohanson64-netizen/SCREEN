import type { ProgramNode } from "../../ast/nodeTypes.js";
import { executeStatement } from "../execute/statements/executeStatement.js";
import { createRuntimeTimingCollector, measureTiming } from "../instrumentation/timing.js";
import { createRuntimeProfiler } from "../instrumentation/profiler.js";
import { resolveRuntimeInjectionFragmentCache } from "../cache/injectionFragmentCache.js";
import {
  createRuntimeState,
  type ExecuteProgramOptions,
  type ExecuteProgramResult,
  type ReactiveCycleState,
  type ReactiveTriggerRegistration,
  type RuntimeAssetKind,
  type RuntimeState,
  type InjectionHistoryEntry,
  type InjectionPayload,
  type InjectionRegistry,
} from "./runtimeState.js";

export type {
  ExecuteProgramOptions,
  ExecuteProgramResult,
  ReactiveCycleState,
  ReactiveTriggerRegistration,
  RuntimeAssetKind,
  RuntimeState,
  InjectionHistoryEntry,
  InjectionPayload,
  InjectionRegistry,
} from "./runtimeState.js";

export type {
  RuntimeApplyActionRequest,
  RuntimeFocusRequest,
  RuntimeProjectionOptions,
} from "./runtimeRequests.js";

export { reprojectRuntimeState, setRuntimeFocus } from "./runtimeProjection.js";
export { applyRuntimeAction, applyRuntimeActionToGraph } from "./runtimeActions.js";

export function executeProgram(
  program: ProgramNode,
  options?: ExecuteProgramOptions,
): ExecuteProgramResult {
  const timing = options?.timingCollector ?? (options?.timing ? createRuntimeTimingCollector() : undefined);
  const profiler = options?.profiler ?? (options?.profile ? createRuntimeProfiler() : undefined);
  const state = createRuntimeState({
    ...options?.initialState,
    injections: options?.injections ?? options?.initialState?.injections,
    timing,
    profiler,
    injectionFragmentCache: resolveRuntimeInjectionFragmentCache(
      options?.injectionFragmentCache ?? options?.initialState?.injectionFragmentCache,
    ),
  });

  measureTiming(timing, "executeProgram", () => {
    for (const statement of program.body) {
      executeStatement(statement, state);
    }
  });

  return { state, timing: timing?.report(), profile: profiler?.report() };
}

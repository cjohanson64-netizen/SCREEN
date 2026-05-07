# TAT Phase 8.3 Hotspot Report

Generated: 2026-05-06T02:35:26.367Z

## Purpose

Phase 8.3 turns Phase 8.1 runtime timing and Phase 8.2 code-health metrics into a ranked refactor plan. This report is evidence-gathering only; it does not change runtime behavior.

## Snapshot

- Source files scanned: 488
- Approximate non-empty LOC: 28,583
- Ranked hotspots found: 25
- Files with legacy-pattern hits: 33

## Runtime timing hotspots

Timing snapshots were not requested. Run with `--include-timing` to execute canonical fixtures and include timing data.

## Ranked code hotspots

```txt
Rank | Score | File                                        | LOC  | Fns | Imports | Cases | Depth
---- | ----- | ------------------------------------------- | ---- | --- | ------- | ----- | -----
1    | 72    | runtime/query/executeWhere.ts               | 922  | 30  | 8       | 132   | 5    
2    | 66    | ast/printers/printInline.ts                 | 651  | 45  | 1       | 153   | 4    
3    | 50    | runtime/query/relationshipComparison.ts     | 1271 | 38  | 1       | 10    | 5    
4    | 50    | runtime/execute/action/valueEvaluator.ts    | 886  | 27  | 9       | 143   | 5    
5    | 38    | runtime/graph/executeGraphInteraction.ts    | 663  | 24  | 2       | 50    | 6    
6    | 36    | runtime/graph/graph.ts                      | 609  | 34  | 0       | 0     | 5    
7    | 32    | parser/core/Parser.ts                       | 990  | 0   | 8       | 0     | 5    
8    | 32    | parser/graph/parserGraphParsers.ts          | 816  | 21  | 3       | 19    | 4    
9    | 32    | runtime/query/evaluateNodeCapture.ts        | 452  | 27  | 4       | 77    | 4    
10   | 30    | runtime/query/executeQuery.ts               | 467  | 22  | 10      | 41    | 5    
11   | 30    | tat-vscode/src/diagnostics.ts               | 462  | 16  | 2       | 0     | 5    
12   | 30    | tools/code-health/hotspots.ts               | 460  | 15  | 3       | 2     | 5    
13   | 28    | parser/values/parserValueParsers.ts         | 813  | 31  | 3       | 4     | 5    
14   | 28    | runtime/index.ts                            | 792  | 35  | 10      | 5     | 6    
15   | 28    | parser/directives/compute/computeParsers.ts | 778  | 27  | 3       | 13    | 4    
```

## Hotspot explanations

### 1. runtime/query/executeWhere.ts

Score: **72**

Signals:

- oversized file (922 LOC)
- moderate function count (30)
- large switch/case dispatch (132 cases)
- high conditional density (84 ifs)
- legacy directive references (1)

Recommended action:

Split comparison, relationship, where, and path/query evaluators by semantic responsibility.

### 2. ast/printers/printInline.ts

Score: **66**

Signals:

- large file (651 LOC)
- high function count (45)
- large switch/case dispatch (153 cases)
- legacy directive references (4)

Recommended action:

Review legacy references; keep only migration diagnostics/docs and remove active legacy paths.

### 3. runtime/query/relationshipComparison.ts

Score: **50**

Signals:

- oversized file (1271 LOC)
- high function count (38)

Recommended action:

Split comparison, relationship, where, and path/query evaluators by semantic responsibility.

### 4. runtime/execute/action/valueEvaluator.ts

Score: **50**

Signals:

- large file (886 LOC)
- moderate function count (27)
- large switch/case dispatch (143 cases)
- legacy directive references (1)

Recommended action:

Split action execution into define/apply/pipeline/value-evaluation modules.

### 5. runtime/graph/executeGraphInteraction.ts

Score: **38**

Signals:

- large file (663 LOC)
- moderate function count (24)
- moderate switch/case dispatch (50 cases)

Recommended action:

Monitor and refactor if this file grows during the next phase.

### 6. runtime/graph/graph.ts

Score: **36**

Signals:

- large file (609 LOC)
- moderate function count (34)
- legacy directive references (4)

Recommended action:

Review legacy references; keep only migration diagnostics/docs and remove active legacy paths.

### 7. parser/core/Parser.ts

Score: **32**

Signals:

- oversized file (990 LOC)
- legacy directive references (1)

Recommended action:

Keep as parser shell only; move semantic parsing behavior into parser/shared and directive slices.

### 8. parser/graph/parserGraphParsers.ts

Score: **32**

Signals:

- large file (816 LOC)
- moderate function count (21)
- legacy directive references (2)

Recommended action:

Review legacy references; keep only migration diagnostics/docs and remove active legacy paths.

### 9. runtime/query/evaluateNodeCapture.ts

Score: **32**

Signals:

- moderately large file (452 LOC)
- moderate function count (27)
- moderate switch/case dispatch (77 cases)
- legacy directive references (1)

Recommended action:

Split comparison, relationship, where, and path/query evaluators by semantic responsibility.

### 10. runtime/query/executeQuery.ts

Score: **30**

Signals:

- moderately large file (467 LOC)
- moderate function count (22)
- moderate switch/case dispatch (41 cases)

Recommended action:

Split comparison, relationship, where, and path/query evaluators by semantic responsibility.

## Legacy drift hotspots

```txt
File                                                    | Hits                                                                                                                                      
------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------
ast/action/ActionExprNode.ts                            | pipeline::1                                                                                                                               
ast/action/RepeatExprNode.ts                            | pipeline::1                                                                                                                               
ast/action/WhenExprNode.ts                              | pipeline::1                                                                                                                               
ast/ctx/CtxClearExprNode.ts                             | @ctx.clear:1                                                                                                                              
ast/ctx/CtxSetExprNode.ts                               | @ctx.set:1                                                                                                                                
ast/effect/EffectBlockNode.ts                           | pipeline::1                                                                                                                               
ast/printers/printInline.ts                             | @query(:1, @ctx.set:1, @ctx.clear:1, pipeline::1                                                                                          
parser/core/Parser.ts                                   | @project(:1                                                                                                                               
parser/directives/action/actionParsers.ts               | pipeline::2                                                                                                                               
parser/directives/graph/graphParsers.ts                 | pipeline::1                                                                                                                               
parser/directives/query/queryParsers.ts                 | @query(:1, @match(:1                                                                                                                      
parser/graph/parserGraphParsers.ts                      | @ctx.set:1, @ctx.clear:1                                                                                                                  
parser/statements/parserStatementParsers.ts             | @bind.:1                                                                                                                                  
runtime/directives/action/actionPipelineContext.ts      | pipeline::1                                                                                                                               
runtime/engine/actionRegistry.ts                        | pipeline::2                                                                                                                               
runtime/engine/runtimeState.ts                          | pipeline::1                                                                                                                               
runtime/execute/action/applyAction.ts                   | pipeline::1                                                                                                                               
runtime/execute/action/valueEvaluator.ts                | @query(:1                                                                                                                                 
runtime/execute/actionPipelineContext.ts                | pipeline::1                                                                                                                               
runtime/execute/graphPipeline/graphPipelineExecution.ts | pipeline::1                                                                                                                               
runtime/execute/graphPipeline/graphPipelineStep.ts      | pipeline::1                                                                                                                               
runtime/execute/graphPipeline/whenExecution.ts          | pipeline::1                                                                                                                               
runtime/execute/query/why.ts                            | @match(:1                                                                                                                                 
runtime/execute/statements/bindingsExecution.ts         | @bind.:3, pipeline::1                                                                                                                     
runtime/graph/graph.ts                                  | @ctx.set:2, @ctx.clear:2                                                                                                                  
runtime/graphControl/computeSourceEvaluator.ts          | @query(:1                                                                                                                                 
runtime/query/evaluateNodeCapture.ts                    | pipeline::1                                                                                                                               
runtime/query/executeWhere.ts                           | @query(:1                                                                                                                                 
runtime/query/where/print.ts                            | @query(:1                                                                                                                                 
runtime/validation/expressions/validateDerive.ts        | @query(:1                                                                                                                                 
tat-vscode/src/diagnostics.ts                           | @apply:4, @projection:4, @project(:1, @action(:1, @bind.:10, @ctx.set:3, @ctx.clear:2, pipeline::1                                        
tools/code-health/audit.ts                              | @apply:2, @projection:2, @project(:1, @action(:1, @query(:1, @match(:1, @path(:1, @bind.:1, @ctx.set:1, @ctx.clear:1, pipeline::1, @loop:2
tools/code-health/hotspots.ts                           | @apply:2, @projection:2, @project(:1, @action(:1, @query(:1, @match(:1, @path(:1, @bind.:1, @ctx.set:1, @ctx.clear:1, pipeline::1, @loop:2
```

### Legacy pattern totals

```txt
Pattern     | Hits
----------- | ----
pipeline:   | 22  
@bind.      | 16  
@ctx.set    | 10  
@ctx.clear  | 9   
@query(     | 9   
@apply      | 8   
@projection | 8   
@project(   | 4   
@match(     | 4   
@loop       | 4   
@action(    | 3   
@path(      | 2   
```

## Recommended 8.4 refactor order

1. Split the highest-scoring parser directive hotspots into smaller semantic parser modules and shared parser helpers.
2. Split the highest-scoring runtime execution hotspot into focused action/apply/pipeline/value files.
3. Split validation hotspots so control, mutation, action, project, value, and query validators are separate.
4. Keep legacy strings only in migration diagnostics/docs; remove active legacy AST/runtime/parser paths.
5. After structural pruning, rerun this report and compare hotspot scores before adding caches.

## Command

```bash
npx tsx tools/code-health/hotspots.ts --include-timing --out docs/reports/phase-8-3-hotspots.md
```

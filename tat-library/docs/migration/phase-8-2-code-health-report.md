# TAT Phase 8.2 Code Health Report

Generated: 2026-05-05T22:07:03.618Z

## Snapshot

- Source files scanned: 457
- Approximate non-empty LOC: 26,893
- Files over 900 LOC: 6
- Files with legacy-pattern hits: 29

## Largest files

```txt
File                                                   | LOC  | Fns | Imports | Switch | Case | If  | Depth | @refs
------------------------------------------------------ | ---- | --- | ------- | ------ | ---- | --- | ----- | -----
parser/directives/parserDirectiveParsers.ts            | 1608 | 62  | 3       | 10     | 27   | 119 | 4     | 215  
runtime/query/executeWhere.ts                          | 1277 | 53  | 4       | 17     | 216  | 118 | 5     | 29   
runtime/query/relationshipComparison.ts                | 1271 | 38  | 1       | 1      | 10   | 57  | 5     | 0    
runtime/execute/action.ts                              | 1178 | 44  | 27      | 13     | 168  | 106 | 5     | 33   
runtime/validation/expressions/expressionValidators.ts | 1032 | 36  | 2       | 5      | 85   | 96  | 4     | 56   
parser/core/Parser.ts                                  | 990  | 0   | 8       | 0      | 0    | 37  | 5     | 20   
parser/graph/parserGraphParsers.ts                     | 816  | 21  | 3       | 2      | 19   | 19  | 4     | 56   
parser/values/parserValueParsers.ts                    | 813  | 31  | 3       | 1      | 4    | 75  | 5     | 58   
runtime/index.ts                                       | 792  | 35  | 10      | 1      | 5    | 39  | 6     | 5    
parser/statements/parserStatementParsers.ts            | 674  | 15  | 3       | 2      | 8    | 43  | 4     | 39   
runtime/graph/executeGraphInteraction.ts               | 663  | 24  | 2       | 10     | 50   | 25  | 6     | 32   
ast/printers/printInline.ts                            | 651  | 45  | 1       | 11     | 153  | 23  | 4     | 44   
runtime/graph/graph.ts                                 | 609  | 34  | 0       | 0      | 0    | 17  | 5     | 26   
ast/printers/printNode.ts                              | 570  | 14  | 2       | 1      | 74   | 13  | 3     | 5    
runtime/query/executeQuery.ts                          | 467  | 22  | 10      | 6      | 41   | 19  | 5     | 5    
```

## Highest warning density

```txt
File                                                   | Warnings | LOC  | Fns | Imports | Cases | Depth | Legacy                                                                                            
------------------------------------------------------ | -------- | ---- | --- | ------- | ----- | ----- | --------------------------------------------------------------------------------------------------
runtime/execute/action.ts                              | 5        | 1178 | 44  | 27      | 168   | 5     | @query(:1                                                                                         
runtime/query/executeWhere.ts                          | 4        | 1277 | 53  | 4       | 216   | 5     | @query(:2                                                                                         
runtime/validation/expressions/expressionValidators.ts | 4        | 1032 | 36  | 2       | 85    | 4     | @query(:1                                                                                         
parser/directives/parserDirectiveParsers.ts            | 3        | 1608 | 62  | 3       | 27    | 4     | @query(:1, @match(:1, pipeline::3                                                                 
ast/printers/printInline.ts                            | 3        | 651  | 45  | 1       | 153   | 4     | @query(:1, @ctx.set:1, @ctx.clear:1, pipeline::1                                                  
runtime/query/relationshipComparison.ts                | 2        | 1271 | 38  | 1       | 10    | 5     | -                                                                                                 
parser/core/Parser.ts                                  | 2        | 990  | 0   | 8       | 0     | 5     | @project(:1                                                                                       
parser/graph/parserGraphParsers.ts                     | 1        | 816  | 21  | 3       | 19    | 4     | @ctx.set:1, @ctx.clear:1                                                                          
parser/statements/parserStatementParsers.ts            | 1        | 674  | 15  | 3       | 8     | 4     | @bind.:1                                                                                          
runtime/graph/graph.ts                                 | 1        | 609  | 34  | 0       | 0     | 5     | @ctx.set:2, @ctx.clear:2                                                                          
tat-vscode/src/diagnostics.ts                          | 1        | 462  | 16  | 2       | 0     | 5     | @apply:4, @projection:4, @project(:1, @action(:1, @bind.:10, @ctx.set:3, @ctx.clear:2, pipeline::1
runtime/query/evaluateNodeCapture.ts                   | 1        | 452  | 27  | 4       | 77    | 4     | pipeline::1                                                                                       
runtime/execute/graphPipeline/graphPipelineStep.ts     | 1        | 377  | 8   | 14      | 15    | 5     | pipeline::1                                                                                       
runtime/execute/apply.ts                               | 1        | 289  | 13  | 6       | 64    | 5     | pipeline::1                                                                                       
runtime/execute/statements/bindingsExecution.ts        | 1        | 256  | 10  | 9       | 25    | 3     | @bind.:3, pipeline::1                                                                             
```

## Import coupling hot spots

```txt
File                                               | Imports | LOC 
-------------------------------------------------- | ------- | ----
runtime/directives/registry.ts                     | 53      | 119 
runtime/execute/action.ts                          | 27      | 1178
ast/expressions/boolean/BooleanExprNode.ts         | 23      | 47  
ast/expressions/boolean/BooleanValueNode.ts        | 19      | 39  
ast/query/WhyExprNode.ts                           | 17      | 38  
ast/expressions/ValueExprNode.ts                   | 16      | 33  
ast/mutation/MutationExprNode.ts                   | 15      | 31  
ast/statements/StatementNode.ts                    | 15      | 31  
runtime/execute/graphPipeline/graphPipelineStep.ts | 14      | 377 
lexer/tokens/directives/index.ts                   | 12      | 40  
runtime/execute/statements/executeStatement.ts     | 12      | 123 
ast/expressions/ActionProjectExprNode.ts           | 11      | 23  
runtime/engine/executeModule.ts                    | 11      | 295 
ast/action/RepeatCountExprNode.ts                  | 10      | 21  
ast/derive/DeriveExprNode.ts                       | 10      | 21  
```

## Legacy-pattern totals

```txt
Pattern     | Hits
----------- | ----
pipeline:   | 21  
@bind.      | 15  
@ctx.set    | 9   
@ctx.clear  | 8   
@query(     | 8   
@apply      | 6   
@projection | 6   
@project(   | 3   
@match(     | 3   
@action(    | 2   
@loop       | 2   
@path(      | 1   
```

## Legacy-pattern files

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
parser/directives/parserDirectiveParsers.ts             | @query(:1, @match(:1, pipeline::3                                                                                                         
parser/graph/parserGraphParsers.ts                      | @ctx.set:1, @ctx.clear:1                                                                                                                  
parser/statements/parserStatementParsers.ts             | @bind.:1                                                                                                                                  
runtime/directives/action/actionPipelineContext.ts      | pipeline::1                                                                                                                               
runtime/engine/actionRegistry.ts                        | pipeline::2                                                                                                                               
runtime/engine/runtimeState.ts                          | pipeline::1                                                                                                                               
runtime/execute/action.ts                               | @query(:1                                                                                                                                 
runtime/execute/actionPipelineContext.ts                | pipeline::1                                                                                                                               
runtime/execute/apply.ts                                | pipeline::1                                                                                                                               
runtime/execute/core/why.ts                             | @match(:1                                                                                                                                 
runtime/execute/graphPipeline/graphPipelineExecution.ts | pipeline::1                                                                                                                               
runtime/execute/graphPipeline/graphPipelineStep.ts      | pipeline::1                                                                                                                               
runtime/execute/graphPipeline/whenExecution.ts          | pipeline::1                                                                                                                               
runtime/execute/statements/bindingsExecution.ts         | @bind.:3, pipeline::1                                                                                                                     
runtime/graph/graph.ts                                  | @ctx.set:2, @ctx.clear:2                                                                                                                  
runtime/graphControl/computeSourceEvaluator.ts          | @query(:1                                                                                                                                 
runtime/query/evaluateNodeCapture.ts                    | pipeline::1                                                                                                                               
runtime/query/executeWhere.ts                           | @query(:2                                                                                                                                 
runtime/validation/expressions/expressionValidators.ts  | @query(:1                                                                                                                                 
tat-vscode/src/diagnostics.ts                           | @apply:4, @projection:4, @project(:1, @action(:1, @bind.:10, @ctx.set:3, @ctx.clear:2, pipeline::1                                        
tools/code-health/audit.ts                              | @apply:2, @projection:2, @project(:1, @action(:1, @query(:1, @match(:1, @path(:1, @bind.:1, @ctx.set:1, @ctx.clear:1, pipeline::1, @loop:2
```

## Recommended next refactor targets

1. Split `parser/directives/parserDirectiveParsers.ts` into semantic directive slices.
2. Split `runtime/execute/action.ts` into action execution, value evaluation, aggregation, and utility modules.
3. Split `runtime/validation/expressions/expressionValidators.ts` by pipeline/mutation/control/value validators.
4. Review legacy-pattern files and keep legacy strings only in migration diagnostics/docs.

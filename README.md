# SCREEN

**Semantic Code Reviewer: Engineer ENhancer**

SCREEN is an architecture-aware AI code review and prompt orchestration tool.

It analyzes source code, detects structural and semantic risks, and generates safer, context-aware AI prompts for refactoring.

SCREEN is built around one core rule:

```txt
Python measures.
TAT interprets.
React explains.
```

---

## Overview

SCREEN helps developers understand the hidden structure inside a codebase before asking AI to change it.

Instead of treating code as isolated text, SCREEN treats each file as part of a semantic project graph.

The app analyzes:

```txt
Code
→ Metrics
→ Function Profile
→ Constant Profile
→ Import / Export Profile
→ TAT Semantic Review
→ Architecture Context
→ AI Prompt Strategy
→ Prompt Chain
```

The goal is not just to generate code.

The goal is to generate safer architectural workflows for AI-assisted refactoring.

---

## Core Architecture

SCREEN uses three layers with clear responsibilities.

### Python Measures

Python owns static analysis and project facts.

Python detects:

* file metrics
* complexity
* repetition
* function profiles
* constant profiles
* import/export profiles
* project graph relationships
* fan-in / fan-out
* valid import paths
* nearby files

Python does **not** decide final semantic meaning.

It prepares evidence.

### TAT Interprets

TAT, or TryAngleTree, owns semantic interpretation.

TAT receives Python-generated facts through injection:

```tat
<- @inject(python_review_state, ".py")
<- @inject(python_prompt_chain_state, ".py")
```

TAT decides:

* which signals matter
* which findings are attached
* which clusters are formed
* which risks should be elevated
* which prompt-chain stages are relevant

TAT turns raw facts into meaning.

### React Explains

React owns the user-facing experience.

React displays:

* metrics
* semantic profiles
* findings
* clusters
* repeated code
* architecture context
* AI prompt output
* prompt-chain stages

React does not measure source code or decide semantic meaning.

It explains the interpreted result clearly.

---

## Main Features

## Structural Code Analysis

SCREEN detects traditional code-quality pressure such as:

* long files
* token-heavy files
* high complexity
* deep nesting
* loop-heavy logic
* decision-heavy logic
* boolean-heavy logic
* error-handling-heavy flows
* repeated structural patterns

Repeated code detection focuses on architectural repetition, not harmless syntax.

Examples:

```txt
Repeated guard-condition logic
Repeated early-return logic
Repeated transform pipelines
Repeated block shapes
```

---

## Function Profile

SCREEN classifies function names semantically.

It detects patterns such as:

```txt
useX        → hook-shaped function
getX        → getter / selector
setX        → setter / mutation helper
hasX/isX    → predicate
canX        → capability check
shouldX     → decision rule
analyzeX    → analyzer
detectX     → analyzer
handleX     → interaction handler
buildX      → builder
parseX      → transformer
formatX     → transformer
fetchX      → IO / data-access behavior
runX        → orchestrator
```

It also detects PascalCase component-shaped functions.

This helps SCREEN explain why a file is complex:

```txt
This file is hook-heavy.
This file is analyzer-heavy.
This file has many handler functions.
This file may need component extraction.
```

---

## Constant Profile

SCREEN analyzes constants in multiple layers.

### Name Semantics

The first pass looks at the name:

```txt
isX / hasX       → predicate or state flag
canX             → capability rule
shouldX          → decision rule
enableX          → feature flag
showX / visibleX → visibility rule
MAX / MIN        → threshold or configuration
```

### Value Semantics

The second pass looks at the value shape:

```txt
const x = true              → boolean literal
const x = score > 80        → boolean expression
const x = data.hero         → property/entity alias
const x = data.items ?? []  → collection alias
const x = 100               → numeric value
const x = () => {}          → function expression
const x = buildThing(data)  → function-call result
```

### Combined Roles

SCREEN combines name and value to infer roles such as:

```txt
booleanRule
booleanDerivedValue
entityAlias
collectionAlias
derivedNumericValue
actionGuardCandidate
renderDataProjection
functionExpression
```

This allows SCREEN to distinguish between healthy render preparation and risky boolean-rule density.

Example:

```js
const hero = data?.hero;
const stats = data?.stats ?? [];
const allocationDisabled = allocatingStatId !== null || availableStatPoints <= 0;
```

SCREEN can explain:

```txt
hero → entity alias
stats → collection alias
allocationDisabled → action guard candidate
```

---

## Import Profile

SCREEN analyzes JavaScript import paths and classifies dependency zones.

Import categories include:

```txt
ui_rendering
state_behavior
general_utility
domain_logic
data_access
configuration
type_contract
feature_module
test_support
asset_dependency
infrastructure
unknown
```

SCREEN detects signals such as:

```txt
import_heavy
external_import_heavy
local_import_heavy
deep_relative_import_heavy
wide_named_import_heavy
import_responsibility_spread
ui_imports_data_access
ui_imports_domain_logic
production_imports_test_support
```

SCREEN does not assume that many imports are bad.

Instead, it asks:

```txt
What responsibility zones does this file depend on?
```

For example, a UI file importing from components, hooks, API services, domain rules, constants, and test fixtures may indicate architecture boundary pressure.

---

## Export Profile

SCREEN analyzes what a file exposes to the rest of the project.

It detects export shapes such as:

```txt
default_export
named_export
function_export
constant_export
type_export
class_export
reexport
star_reexport
barrel_export
```

It also classifies export roles:

```txt
component_export
hook_export
predicate_export
getter_export
builder_export
analyzer_export
handler_export
config_export
type_export
```

Export signals include:

```txt
export_heavy
named_export_heavy
default_export_present
reexport_heavy
star_reexport_present
barrel_file
public_api_pressure
export_responsibility_spread
mixed_export_roles
utility_grab_bag
type_export_heavy
```

SCREEN does not assume that many exports are bad.

Instead, it asks:

```txt
Is this file an intentional public API surface,
or has it become a grab-bag module?
```

---

## TAT Semantic Review Engine

TAT turns raw Python metrics into semantic review meaning.

TAT produces:

* signals
* findings
* risks
* clusters
* projected review output
* prompt-chain recommendations

Example:

```txt
importResponsibilityCategoryCount > 3
→ import_responsibility_spread
→ architecture_boundary_cluster
→ finding_import_responsibility_spread
```

Example:

```txt
utilityGrabBagDetected = true
→ utility_grab_bag
→ public_api_cluster
→ finding_utility_grab_bag
```

This gives SCREEN a semantic review identity.

It does not say:

```txt
Too many imports.
Too many exports.
Too many constants.
```

It says:

```txt
This file crosses architecture boundaries.
This file exposes a broad public API surface.
This file has dense boolean-rule logic.
This file appears to build render data inline.
```

---

## Semantic Signal Clusters

SCREEN groups signals into meaningful clusters.

Examples:

```txt
structure_cluster
complexity_cluster
function_profile_cluster
constant_profile_cluster
render_projection_cluster
boolean_logic_cluster
import_profile_cluster
export_profile_cluster
architecture_boundary_cluster
dependency_coupling_cluster
public_api_cluster
```

Clusters help the developer understand what kind of problem they are looking at.

---

## Architecture-Aware Prompt Generation

SCREEN generates AI prompts with project context.

Generated prompts include:

* current file path
* imports
* imported-by relationships
* valid import paths
* nearby project files
* fan-in / fan-out
* risk level
* complexity metrics
* semantic findings
* repeated patterns
* behavior-preservation rules

Example context:

```txt
PROJECT ARCHITECTURE CONTEXT

Current file:
src/components/ReviewPanel.jsx

Imports:
- ../utils/formatters
- ../api/reviewApi

Imported by:
- src/App.jsx

Valid import paths from current file:
- ../utils/formatters
- ../api/reviewApi
- ./ReviewCard

Rules:
- Do not invent import paths.
- Preserve existing public exports unless explicitly instructed otherwise.
- If moving code, update all affected imports listed above.
- Prefer extracting helpers into nearby existing files when appropriate.
- Preserve behavior unless explicitly instructed otherwise.
```

This reduces:

* hallucinated imports
* unsafe extraction paths
* broken refactors
* accidental public API changes
* architecture-blind rewrites

---

## Prompt Chain Builder

SCREEN can generate staged AI workflows.

The prompt chain follows:

```txt
DISCOVER
→ PLAN
→ TRANSFORM
→ VERIFY
→ DOCUMENT
```

Each stage includes:

* purpose
* risk level
* reason for inclusion
* behavior-preservation constraints
* structured output requirements

TAT controls the prompt-chain graph.

React explains it to the user.

---

## React UI

The UI includes:

* Metrics
* Function Profile
* Constant Profile
* Import / Export Profile
* TAT Review
* Findings
* Signal Clusters
* Repeated Code
* AI Prompt
* Prompt Chain

The semantic profile panels are collapsible so the user can inspect detail without overwhelming the Metrics view.

---

## Example Review Signals

SCREEN can currently identify signals such as:

```txt
long_file
token_heavy
function_heavy
hook_heavy
component_heavy
analyzer_heavy
handler_heavy
constant_heavy
boolean_constant_heavy
render_data_projection
action_guard_heavy
import_responsibility_spread
ui_imports_data_access
production_imports_test_support
export_responsibility_spread
public_api_pressure
utility_grab_bag
repetition_high
complexity_high
risky_to_extend
```

---

## Tech Stack

### Frontend

* React
* Vite
* JavaScript
* CSS

### Backend

* Python
* Flask

### Semantic Runtime

* TAT, or TryAngleTree

---

## Development Philosophy

SCREEN follows a systems-first design philosophy:

```txt
Make hidden structure explicit.
Separate measurement from interpretation.
Separate reasoning from rendering.
Preserve behavior while clarifying architecture.
```

The core principle remains:

```txt
Python measures.
TAT interprets.
React explains.
```

---

## Current Status

SCREEN currently supports:

* project upload analysis
* single-file analysis
* project graph context
* architecture-aware prompt generation
* TAT-powered semantic review
* prompt-chain orchestration
* function semantic profiling
* constant semantic profiling
* constant value-role profiling
* import semantic profiling
* export semantic profiling
* repeated-code detection
* collapsible profile panels
* risk-aware AI prompt construction

---

## Future Directions

Potential future features:

* richer multi-file refactor planning
* dead code detection
* type-aware import/export analysis
* language support beyond JavaScript/TypeScript
* refactor simulation
* AI stage execution memory
* VSCode extension
* TAT-native workflow editor
* dependency graph visualization enhancements

---

## Author

Built by Carl Biggers-Johanson

- [Portfolio](https://my-portfolio-ashy-sigma-26.vercel.app/)
- [GitHub](https://github.com/cjohanson64-netizen)

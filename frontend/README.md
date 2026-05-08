# SCREEN

**Semantic Code Reviewer: Engineer Enhancer**

SCREEN is an architecture-aware AI code review and prompt orchestration tool powered by:

- **Python** → static analysis, metrics, project/file evidence
- **TAT (TryAngleTree)** → semantic reasoning, architectural interpretation, workflow orchestration
- **React** → interactive visualization, scoped analysis controls, AI workflow UI

---

## Overview

SCREEN helps engineers review code safely before refactoring.

Instead of treating code as isolated text, SCREEN analyzes source files as part of a semantic project structure. It detects code signals, interprets them through architectural context, and generates AI prompts that are specific, behavior-preserving, and less likely to overengineer.

The core flow is:

```txt
Project/File
→ Python Metrics
→ Selected Analysis Scopes
→ TAT Semantic Interpretation
→ Refactor-Worthiness
→ Domain Cohesion
→ Signal Trust
→ Safe Extraction Order
→ Architecture-Aware AI Prompt
````

SCREEN is designed around one core principle:

```txt
Python measures.
TAT interprets.
React explains.
```

---

## Core Features

### Selectable Analysis Scopes

SCREEN lets users choose which semantic lenses to run before analyzing a file.

Current analysis scopes include:

* Structure
* Functions
* Constants
* Imports
* Exports
* Loops
* Complexity
* Risk
* Full Review

This allows the user to run focused reviews instead of receiving a large all-purpose analysis every time.

---

### Python Static Analysis Layer

Python measures raw code and project evidence, including:

* File size
* Token estimate
* Function count and function roles
* Constant count and constant roles
* Import/export profile
* Complexity
* Nesting depth
* Repetition
* Loop density
* Boolean density
* Error-handling pressure
* File path/name context
* Domain cohesion evidence
* Signal confidence evidence

Python does **not** decide what the code means architecturally. It gathers evidence for TAT to interpret.

---

### TAT Semantic Review Engine

TAT interprets Python’s measurements and produces semantic review output.

TAT currently reasons about:

* File role
* Expected traits for that file role
* Low-tolerance architectural concerns
* Refactor-worthiness
* Domain cohesion
* Multi-domain responsibility mixing
* Safe extraction order
* Signal confidence
* Risks
* Findings
* Signal clusters

TAT review rules are modularized into focused semantic domains, such as:

```txt
file_context_review_rules.tat
refactor_worthiness_review_rules.tat
domain_cohesion_review_rules.tat
extraction_order_review_rules.tat
structure_review_rules.tat
function_review_rules.tat
constant_review_rules.tat
import_review_rules.tat
export_review_rules.tat
loop_review_rules.tat
complexity_review_rules.tat
risk_review_rules.tat
```

---

### File Context Classification

SCREEN uses file path and file name context to infer likely file roles.

Examples:

```txt
src/App.jsx
→ app_root

src/pages/GeneratorPage.tsx
→ page_shell

src/components/ScoreCard.jsx
→ component_file

src/hooks/useAssessment.js
→ hook_file

src/services/apiClient.js
→ service_file

src/domain/scoringRules.ts
→ domain_core_file
```

This lets SCREEN interpret signals more intelligently.

For example, broad imports may be healthy in an app root or page shell, but suspicious in a utility file or domain-rule file.

---

### Refactor-Worthiness Evaluation

SCREEN avoids treating every signal as an automatic refactor trigger.

Instead, it assigns refactor urgency:

```txt
none
watch
recommended
urgent
```

This helps SCREEN distinguish between:

```txt
healthy orchestration density
```

and:

```txt
actual maintainability risk
```

Example:

```txt
Refactor urgency: watch

This file is approaching orchestration density, but it is still healthy.
Do not refactor yet unless new behavior is being added or the same pattern repeats.
```

---

### Domain Cohesion Detection

SCREEN evaluates whether a file appears:

```txt
cohesive
mixed
ambiguous
unknown
```

This helps separate:

```txt
single-domain rule complexity
```

from:

```txt
multi-domain responsibility mixing
```

A complex but cohesive rules file may only need a targeted rule-cluster extraction.

A mixed page shell may need domain-specific extraction while preserving the page as the public composition entry point.

---

### Safe Extraction Ordering

When refactoring is worthwhile, SCREEN recommends the safest first move.

Possible extraction steps include:

* Defer extraction / watch first
* Extract render-only component first
* Extract display/view-model helper first
* Extract predicate/rule cluster first
* Extract workflow hook first
* Extract service/data boundary first
* Extract focused domain module first
* Group public API/export surface first

This prevents SCREEN from jumping directly to large file splits.

Example:

```txt
Safest extraction order:
1. Extract the largest self-contained render-only component first.
2. Extract display/view-model preparation second.
3. Extract workflow hook only after the render boundary is stable.
```

---

### Signal Trust and Evidence

SCREEN attaches confidence and evidence to sensitive boundary warnings.

This is especially important for signals like:

* Production imports test support
* UI imports data access
* UI imports domain logic

Instead of showing scary warnings without proof, SCREEN can now explain why it believes a signal.

Example:

```txt
Production Imports Test Support
Confidence: High

Evidence:
- ../tests/fixtures/fakeUser
- import path contains fixture/test-support tokens
- current file does not appear to be a test file
```

Low-confidence boundary signals are treated as review evidence, not automatic refactor triggers.

---

### Architecture-Aware Prompt Generation

SCREEN generates prompts that include:

* Selected analysis scopes
* File role
* Domain cohesion
* Refactor urgency
* Signal confidence
* Evidence
* Safe extraction order
* Project architecture context
* Behavior-preservation constraints
* Output expectations

The generated prompt follows this decision hierarchy:

```txt
1. Respect selected analysis scopes.
2. Interpret signals through the file role.
3. Use domain cohesion to choose watch, targeted extraction, or domain split.
4. Treat signal confidence as evidence strength.
5. Follow the safest extraction order before larger refactors.
6. Preserve public shells, exports, behavior, thresholds, and rendered output.
```

This helps reduce:

* hallucinated imports
* unsafe file movement
* broken refactors
* unnecessary abstractions
* generic “split this file” advice
* overengineering

---

### Prompt Chain Builder

SCREEN can generate staged AI workflow chains such as:

```txt
DISCOVER
→ PLAN
→ TRANSFORM
→ VERIFY
→ DOCUMENT
```

Each stage includes:

* Purpose
* Risk level
* Reason for inclusion
* AI prompt text
* Structured output expectations

The prompt chain helps users guide AI tools through safer refactor workflows instead of asking for one large uncontrolled change.

---

### Repeated Code Detection

SCREEN includes repeated-pattern analysis with:

* Repetition scoring
* Structural repetition grouping
* Severity filtering
* Highlighted line visualization
* AI extraction/refactor suggestions

SCREEN focuses on repeated behavior, not harmless syntax repetition.

---

### React Review UI

The UI includes:

* Project upload
* File tree generation
* File selection
* Analysis options panel
* Metrics
* Semantic Review
* Review Findings
* Semantic Signal Clusters
* Repeated Code
* AI Prompt
* AI Prompt Chain

The Semantic Review panel surfaces:

* File Context
* Refactor Worthiness
* Domain Cohesion
* Safest First Move
* Signal Trust
* Signals
* Risks

---

## Architecture

### Layer Responsibilities

SCREEN keeps responsibilities intentionally separated.

---

### Python

Python is responsible for measurement and evidence.

Python owns:

* Static analysis
* File metrics
* Function profiling
* Constant profiling
* Import/export profiling
* Complexity analysis
* Repetition detection
* File path/name classification
* Domain evidence measurement
* Signal confidence evidence
* Project/file tree data

Python does **not** own:

* semantic interpretation
* refactor urgency
* prompt strategy
* workflow ordering
* architectural meaning

---

### TAT (TryAngleTree)

TAT is responsible for semantic reasoning.

TAT owns:

* File role interpretation
* Refactor-worthiness
* Domain cohesion reasoning
* Multi-domain detection
* Safe extraction ordering
* Risk interpretation
* Signal clustering
* Prompt-chain semantics
* Workflow orchestration

TAT turns Python measurements into architectural meaning.

---

### React

React is responsible for interaction and explanation.

React owns:

* UI rendering
* Analysis option controls
* Review visualization
* Prompt display
* User workflow
* Copyable AI prompts
* Review tab layout

React does **not** decide architecture, risk, or semantic meaning.

---

## Example Architecture-Aware Prompt Context

```txt
SCREEN Architecture-Aware Interpretation:

- Selected analysis scopes: Functions, Imports
- File role: Page Shell
- Role interpretation: Keep the page as the public entry point and extract feature domains only when ownership is mixed.
- Refactor urgency: Recommended
- Domain cohesion: Mixed
- Active responsibility domains: UI Rendering, State Behavior, Data Access
- Signal confidence and evidence:
  - UI Imports Data Access: High confidence
    Evidence: ../services/assessmentApi (data-access import)

Safest extraction order:
1. Extract the largest self-contained render-only component first.
2. Extract one workflow hook after the render boundary is stable.

Final instruction:
This analysis is scoped to Functions and Imports. Start with the first safest extraction step and preserve the page as the public composition shell.
```

---

## Example Prompt Chain

```txt
DISCOVER
→ Identify responsibilities, active domains, and hidden workflows.

PLAN
→ Define behavior-preserving extraction boundaries.

TRANSFORM
→ Apply the smallest safe refactor.

VERIFY
→ Confirm behavior, imports, exports, thresholds, and rendered output are preserved.

DOCUMENT
→ Explain what changed, what stayed stable, and why the extraction boundary was safe.
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

* TAT (TryAngleTree)

---

## Project Goals

SCREEN explores a safer approach to AI-assisted engineering.

Instead of:

```txt
Generate better code.
```

SCREEN focuses on:

```txt
Generate safer architectural workflows for AI-assisted refactoring.
```

The goal is not to refactor every signal-heavy file.

The goal is to help users decide:

```txt
Is this code actually worth changing?
What is the safest first move?
What evidence supports that recommendation?
What prompt should I give an AI tool next?
```

---

## Development Philosophy

SCREEN follows a systems-first design philosophy:

```txt
Make hidden structure explicit.
Separate measurement from meaning.
Separate reasoning from rendering.
Preserve behavior while clarifying architecture.
Avoid overengineering.
```

The guiding principle remains:

```txt
Python measures.
TAT interprets.
React explains.
```

---

## Current Status

### V1 Complete

Current version includes:

* Modular TAT semantic review layer
* Selectable analysis scopes
* File context classification
* Refactor-worthiness evaluation
* Domain cohesion detection
* Safe extraction ordering
* Signal confidence and evidence
* Architecture-aware AI prompt generation
* Prompt chain orchestration
* Repeated code visualization
* Project/file tree workflow
* Scoped metrics and semantic review UI

---

## Future Directions

Potential future features:

* Full project dependency graph visualization
* Multi-file refactor planning
* Dead code detection
* Refactor simulation
* AI stage execution memory
* Prompt-chain execution tracking
* VSCode extension
* TAT-native workflow editor
* Architecture boundary visualization
* Import/export repair suggestions
* Test-generation workflows before risky refactors

---

## Author

Built by Carl Biggers-Johanson

* [Portfolio] (https://my-portfolio-ashy-sigma-26.vercel.app/)
* [GitHub] (https://github.com/cjohanson64-netizen)
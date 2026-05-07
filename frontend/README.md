# SCREEN
Semantic Code Reviewer
Engineer Enhancer

Architecture-aware AI code review and prompt orchestration powered by:

* **Python** → static analysis + project graph detection
* **TAT (TryAngleTree)** → semantic reasoning + workflow orchestration
* **React** → interactive visualization and AI workflow UI

---

# Overview

TAT Code Reviewer is an experimental AI-assisted engineering tool that analyzes source code, detects structural and architectural risks, and generates context-aware prompt workflows for AI refactoring.

Unlike traditional prompt generators, this system treats code as part of a semantic project graph rather than isolated text.

The app combines:

```txt
Code
→ Metrics
→ Semantic Signals
→ Architecture Context
→ Prompt Strategy
→ AI Workflow Chain
```

---

# Core Features

## 📊 Structural Code Analysis

Python-based analysis engine detects:

* Complexity
* Deep nesting
* Repeated logic
* Long files
* High token count
* Boolean-dense logic
* Loop-heavy logic
* Error-handling-heavy flows

---

## 🌳 TAT Semantic Review Engine

TAT modules interpret structural signals and produce:

* Signals
* Risks
* Findings
* Signal clusters
* Prompt chain strategies

TAT controls:

* Semantic interpretation
* Prompt stage ordering
* Risk-aware workflow generation

---

## 🧠 Architecture-Aware Prompt Generation

Generated prompts include:

* Current file path
* Imports
* Dependents
* Valid import paths
* Nearby project files
* Complexity/risk metrics
* Behavior-preservation constraints

This dramatically reduces:

* hallucinated imports
* broken refactors
* unsafe file movement
* invalid extraction paths

---

## 🔗 Prompt Chain Builder

The app generates staged AI workflows:

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
* Fully formed AI prompt
* Structured output requirements

---

## 🧩 Repeated Code Detection

Interactive repeated-pattern viewer includes:

* Severity filtering
* Highlighted line visualization
* Structural repetition grouping
* AI extraction/refactor suggestions

---

## ⚛️ React UI

Tabbed review interface includes:

* Metrics
* TAT Review
* Findings
* Signal Clusters
* Repeated Code
* AI Prompt
* Prompt Chain

---

# Architecture

## Layer Responsibilities

### Python

Responsible for:

* Static analysis
* File metrics
* Dependency graph construction
* Project structure detection

Python does **NOT** decide:

* prompt order
* semantic meaning
* workflow strategy

---

### TAT (TryAngleTree)

Responsible for:

* Semantic interpretation
* Risk reasoning
* Prompt orchestration
* Workflow ordering
* Strategy generation

TAT is the semantic reasoning layer.

---

### React

Responsible for:

* Visualization
* User interaction
* Prompt display
* Workflow rendering

React does **NOT** decide architecture or reasoning.

---

# Example Prompt Context

```txt
PROJECT ARCHITECTURE CONTEXT

Current file:
src/lib/samples.js

Imports:
- src/lib/utils.js
- src/styles/main.css

Imported by:
- src/App.jsx

Valid import paths from current file:
- ./utils
- ../styles/main.css

Rules:
- Do not invent import paths.
- Preserve existing public exports unless explicitly told otherwise.
- If moving code, update all affected imports listed above.
- Prefer extracting helpers into nearby files already present in the graph.
```

---

# Example Prompt Chain

```txt
🔍 DISCOVER
→ Identify responsibilities and hidden pipelines

🧭 PLAN
→ Define safe extraction boundaries

🔧 TRANSFORM
→ Refactor into target architecture

✅ VERIFY
→ Confirm behavior preservation

📝 DOCUMENT
→ Explain preserved logic and structural changes
```

---

# Tech Stack

## Frontend

* React
* Vite
* JavaScript

## Backend

* Python
* Flask

## Semantic Runtime

* TAT (TryAngleTree)

---

# Project Goals

This project explores a different approach to AI-assisted engineering:

Instead of:

```txt
“Generate better code”
```

the goal is:

```txt
“Generate safer architectural workflows for AI-assisted refactoring”
```

---

# Future Directions

Potential future features:

* Full project dependency graph visualization
* Architecture boundary detection
* Dead code detection
* Refactor simulation
* AI stage execution memory
* Multi-file orchestration
* VSCode extension
* TAT-native workflow editor

---

# Development Philosophy

The project follows a systems-first design philosophy:

```txt
Make hidden structure explicit.
Separate reasoning from rendering.
Preserve behavior while clarifying architecture.
```

---

# Status

## V1 Complete

Current version includes:

* Semantic TAT review engine
* Architecture-aware prompting
* Prompt chain orchestration
* Repeated code visualization
* Risk-aware AI workflows
* Project graph context injection

---

# Author

Built by Carl Biggers-Johanson

* Portfolio: [https://my-portfolio-ashy-sigma-26.vercel.app/](https://my-portfolio-ashy-sigma-26.vercel.app/)
* GitHub: [https://github.com/cjohanson64-netizen](https://github.com/cjohanson64-netizen)

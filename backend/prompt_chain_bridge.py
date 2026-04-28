import subprocess
import tempfile
from pathlib import Path
from typing import Any, Dict, List, Optional


TAT_ROOT = Path(__file__).resolve().parents[1] / "tat"
TAT_RUNNER = TAT_ROOT / "run-module.ts"

RULES_PATH = (
    Path(__file__).resolve().parent
    / "tat"
    / "modules"
    / "prompt_chain_builder.tat"
)

STATE_INJECTION_MARKER = "// PYTHON_PROMPT_CHAIN_STATE_GOES_HERE"


PROMPT_TEXT = {
    "discover_prompt": """You are a senior software engineer.

Goal:
Understand the structure of this code before any refactor.

Identify:
1. Core responsibilities
2. Hidden pipeline or orchestration flow
3. Repeated logic or repeated decision patterns
4. State transitions or data transformations
5. Risky behavior that must be preserved

Constraints:
- Do NOT modify the code
- Do NOT suggest refactors yet

Output:
1. Responsibility breakdown
2. Step-by-step flow (pipeline if present)
3. List of repeated patterns
4. List of behavior-sensitive logic (must not change)
""",

    "plan_prompt": """You are a senior software engineer.

Goal:
Create a behavior-preserving refactor plan.

Based on the discovered structure, define:

1. Target architecture (pipeline, service-layer, or modular)
2. Clear module/function boundaries
3. Extraction order (safe sequence)
4. What MUST remain unchanged

Constraints:
- Do NOT change behavior
- Do NOT change thresholds or constants
- Do NOT rename public exports unless required

Output:
1. Proposed file/module structure
2. Step-by-step refactor plan
3. Risk notes (what could break if done incorrectly)
4. Explicit list of preserved behaviors
""",

    "pipeline_refactor_prompt": """You are a senior software engineer.

Goal:
Refactor this code into a clear pipeline architecture.

The main entry point MUST read as a linear sequence of named stages.

Requirements:
1. Extract each stage into a named function
2. Preserve execution order and logic
3. Make data flow explicit between stages
4. Eliminate repeated logic by extracting shared helpers

Constraints:
- Do NOT change behavior
- Do NOT change thresholds or constants
- Do NOT remove edge-case handling
- Keep return shape identical

Output:
1. New top-level pipeline structure
2. Full updated main file
3. Extracted helper functions/modules
4. Notes on preserved behavior
""",

    "module_extraction_prompt": """You are a senior software engineer.

Goal:
Refactor this code into clear, modular responsibilities.

Requirements:
1. Separate orchestration from logic
2. Extract reusable functions/modules
3. Reduce nesting and complexity
4. Consolidate repeated logic

Constraints:
- Do NOT change behavior
- Do NOT change thresholds or constants
- Do NOT change public interfaces

Output:
1. New file/module structure
2. Full updated main file
3. Extracted helpers/modules
4. Explanation of structural improvements
""",

    "complexity_reduction_prompt": """You are a senior software engineer.

Goal:
Reduce complexity while preserving behavior.

Focus on:
1. Breaking apart deeply nested logic
2. Extracting decision-heavy sections into named helpers
3. Replacing complex boolean expressions with readable predicates
4. Simplifying control flow

Constraints:
- Preserve all logic and edge cases
- Do NOT change thresholds or scoring rules

Output:
1. Refactored code
2. Extracted helpers
3. Explanation of simplifications
4. Notes on preserved behavior
""",

    "verification_prompt": """You are a senior software engineer.

Goal:
Verify that a refactor preserved behavior.

Check:
1. All thresholds and constants remain unchanged
2. Edge-case handling is preserved
3. Return shapes and outputs are identical
4. Control flow produces equivalent results

Output:
1. Verification checklist (pass/fail per category)
2. Potential regressions
3. Areas requiring tests
4. Suggested test cases for risky paths
""",

    "documentation_prompt": """You are a senior software engineer.

Goal:
Document the refactor clearly for future maintainers.

Output:
1. Summary of structural changes
2. Explanation of new architecture
3. What behavior was preserved
4. What logic was intentionally NOT changed
5. Suggested future improvements
""",
}


def build_prompt_chain_recommendation(signals: Dict[str, Any]) -> Dict[str, Any]:
    source = build_tat_source(signals)
    result = run_tat_source(source)

    edges = parse_tat_edges(result.stdout)
    meta = parse_tat_meta(result.stdout)

    return resolve_prompt_chain(edges=edges, meta=meta, stdout=result.stdout, stderr=result.stderr)


def build_tat_source(signals: Dict[str, Any]) -> str:
    with open(RULES_PATH, "r", encoding="utf-8") as file:
        rules_tat = file.read()

    state_tat = build_state_injection(signals)

    return rules_tat.replace(STATE_INJECTION_MARKER, state_tat)


def build_state_injection(signals: Dict[str, Any]) -> str:
    detected_patterns = set(signals.get("detectedPatterns", []))
    risk_signals = set(signals.get("riskSignals", []))
    targets = set(signals.get("suggestedPromptTargets", []))

    return f"""
  -> @graft.state(prompt_chain, "fileType", "{signals.get("fileType", "unknown")}")
  -> @graft.state(prompt_chain, "complexityLevel", "{signals.get("complexityLevel", "low")}")

  -> @graft.state(prompt_chain, "pattern_repeated_logic", {tat_bool("repeated_logic" in detected_patterns)})
  -> @graft.state(prompt_chain, "pattern_repeated_pipeline", {tat_bool("repeated_pipeline" in detected_patterns)})
  -> @graft.state(prompt_chain, "pattern_async_api_usage", {tat_bool("async_api_usage" in detected_patterns)})
  -> @graft.state(prompt_chain, "pattern_many_functions", {tat_bool("many_functions" in detected_patterns)})

  -> @graft.state(prompt_chain, "risk_algorithmic_behavior", {tat_bool("algorithmic_behavior" in risk_signals)})
  -> @graft.state(prompt_chain, "risk_threshold_sensitive", {tat_bool("threshold_sensitive" in risk_signals)})
  -> @graft.state(prompt_chain, "risk_stateful_logic", {tat_bool("stateful_logic" in risk_signals)})

  -> @graft.state(prompt_chain, "target_pipeline_refactor", {tat_bool("pipeline_refactor" in targets)})
  -> @graft.state(prompt_chain, "target_module_extraction", {tat_bool("module_extraction" in targets)})
  -> @graft.state(prompt_chain, "target_complexity_reduction", {tat_bool("complexity_reduction" in targets)})
  -> @graft.state(prompt_chain, "target_duplication_reduction", {tat_bool("duplication_reduction" in targets)})
"""


def tat_bool(value: bool) -> str:
    return "true" if value else "false"


def run_tat_source(source: str):
    with tempfile.NamedTemporaryFile(
        mode="w",
        suffix=".tat",
        delete=False,
        encoding="utf-8",
    ) as temp_file:
        temp_file.write(source)
        temp_path = temp_file.name

    return subprocess.run(
        ["npx", "tsx", str(TAT_RUNNER), temp_path],
        cwd=str(TAT_ROOT),
        capture_output=True,
        text=True,
    )


def parse_tat_edges(stdout: str) -> List[Dict[str, str]]:
    edges = []

    for line in stdout.splitlines():
        if " --" not in line or "--> " not in line:
            continue

        try:
            subject, rest = line.split(" --", 1)
            relation, obj = rest.split("--> ", 1)

            edges.append({
                "subject": subject.strip(),
                "relation": relation.strip(),
                "object": obj.strip(),
            })
        except ValueError:
            continue

    return edges


def parse_tat_meta(stdout: str) -> Dict[str, Dict[str, Any]]:
    """
    Placeholder for future runtime meta parsing.

    If your run-module.ts currently only prints edges, keep this empty.
    Stage defaults below will provide metadata.
    """
    return {}


def resolve_prompt_chain(
    edges: List[Dict[str, str]],
    meta: Dict[str, Dict[str, Any]],
    stdout: str,
    stderr: str,
) -> Dict[str, Any]:
    stage_ids = [
        edge["object"]
        for edge in edges
        if edge["subject"] == "prompt_chain" and edge["relation"] == "hasStage"
    ]

    next_map = {
        edge["subject"]: edge["object"]
        for edge in edges
        if edge["relation"] == "nextStage"
    }

    prompt_map = {
        edge["subject"]: edge["object"]
        for edge in edges
        if edge["relation"] == "usesPrompt"
    }

    ordered_stage_ids = order_stages(stage_ids, next_map)

    stages = [
        build_stage(stage_id, prompt_map.get(stage_id), meta.get(stage_id, {}))
        for stage_id in ordered_stage_ids
    ]

    return {
        "chainId": "tat-driven-prompt-chain",
        "title": "TAT-Driven Prompt Chain",
        "stages": stages,
        "debug": {
            "stdout": stdout,
            "stderr": stderr,
            "edges": edges,
        },
    }


def order_stages(stage_ids: List[str], next_map: Dict[str, str]) -> List[str]:
    if not stage_ids:
        return []

    targets = set(next_map.values())
    starts = [stage_id for stage_id in stage_ids if stage_id not in targets]

    current = starts[0] if starts else stage_ids[0]
    ordered = []
    seen = set()

    while current and current not in seen:
        ordered.append(current)
        seen.add(current)
        current = next_map.get(current)

    for stage_id in stage_ids:
        if stage_id not in seen:
            ordered.append(stage_id)

    return ordered


def build_stage(stage_id: str, prompt_id: Optional[str], meta: Dict[str, Any]) -> Dict[str, Any]:
    defaults = STAGE_DEFAULTS.get(stage_id, {})

    return {
        "stage": defaults.get("stage", stage_id.upper()),
        "title": defaults.get("title", stage_id),
        "score": defaults.get("score", 70),
        "riskLevel": defaults.get("riskLevel", "medium"),
        "reason": defaults.get("reason", "TAT selected this prompt stage."),
        "promptText": PROMPT_TEXT.get(prompt_id or "", defaults.get("promptText", "")),
    }


STAGE_DEFAULTS = {
    "discover_stage": {
        "stage": "DISCOVER",
        "title": "Discover Hidden Structure",
        "score": 95,
        "riskLevel": "medium",
        "reason": "TAT selected this first because safe refactors should begin by identifying responsibilities, hidden flows, and preserved behavior.",
    },
    "plan_stage": {
        "stage": "PLAN",
        "title": "Plan Safe Refactor",
        "score": 90,
        "riskLevel": "medium",
        "reason": "TAT selected this before transformation so the AI plans extraction boundaries before changing code.",
    },
    "transform_stage": {
        "stage": "TRANSFORM",
        "title": "Transform Architecture",
        "score": 95,
        "riskLevel": "high",
        "reason": "TAT selected this to perform the architecture change after discovery and planning.",
    },
    "verify_stage": {
        "stage": "VERIFY",
        "title": "Verify Behavior Preservation",
        "score": 100,
        "riskLevel": "high",
        "reason": "TAT selected this because risky or algorithmic code must be checked after transformation.",
    },
    "document_stage": {
        "stage": "DOCUMENT",
        "title": "Document Refactor Decisions",
        "score": 70,
        "riskLevel": "low",
        "reason": "TAT selected this so preserved behavior and intentionally unchanged logic are recorded.",
    },
}
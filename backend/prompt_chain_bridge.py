import re
import subprocess
import tempfile
from pathlib import Path
from typing import Any, Dict, List, Optional


TAT_ROOT = Path(__file__).resolve().parents[1] / "tat-library"
TAT_RUNNER = TAT_ROOT / "run-module.ts"

RULES_PATH = (
    Path(__file__).resolve().parent
    / "tat_modules"
    / "prompt_chain_builder.tat"
)

STATE_INJECTION_HOOK = "python_prompt_chain_state"
STATE_INJECTION_EXTENSION = ".py"

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

    return resolve_tat_injection(
        tat_source=rules_tat,
        hook_ref=STATE_INJECTION_HOOK,
        file_extension=STATE_INJECTION_EXTENSION,
        injected_source=state_tat,
    )

def resolve_tat_injection(
    tat_source: str,
    hook_ref: str,
    file_extension: str,
    injected_source: str,
) -> str:
    """
    SCREEN-side injection resolver.

    The SCREEN-owned TAT module declares an injection point using current TAT syntax:

      <- @inject(python_prompt_chain_state, ".py")

    Python supplies the generated TAT graph-flow fragment for that hook, then passes
    the resolved source to the TAT runner.

    This keeps SCREEN's .tat files aligned with current injection syntax without
    modifying tat-library/runtime code.
    """
    extension_pattern = re.escape(file_extension)

    injection_pattern = re.compile(
        rf"""(?m)^[ \t]*<-\s*@inject\(\s*
        {re.escape(hook_ref)}
        \s*,\s*
        (?P<quote>["']){extension_pattern}(?P=quote)
        \s*
        (?:,\s*[A-Za-z_]\w*)?
        \s*\)\s*$""",
        re.VERBOSE,
    )

    if not injection_pattern.search(tat_source):
        raise ValueError(
            f'Missing TAT injection hook `<- @inject({hook_ref}, "{file_extension}")`.'
        )

    return injection_pattern.sub(injected_source.rstrip(), tat_source, count=1)

def build_state_injection(signals: Dict[str, Any]) -> str:
    detected_patterns = signals.get("detectedPatterns", [])
    risk_signals = signals.get("riskSignals", [])
    targets = signals.get("suggestedPromptTargets", [])
    complexity_level = signals.get("complexityLevel", "low")

    return f"""
  -> @graft.state(prompt_chain, complexity_low, {tat_bool(complexity_level == "low")})
  -> @graft.state(prompt_chain, complexity_medium, {tat_bool(complexity_level == "medium")})
  -> @graft.state(prompt_chain, complexity_high, {tat_bool(complexity_level == "high")})

  -> @graft.state(prompt_chain, pattern_repeated_logic, {tat_bool("repeated_logic" in detected_patterns)})
  -> @graft.state(prompt_chain, pattern_repeated_pipeline, {tat_bool("repeated_pipeline" in detected_patterns)})
  -> @graft.state(prompt_chain, pattern_async_api_usage, {tat_bool("async_api_usage" in detected_patterns)})
  -> @graft.state(prompt_chain, pattern_many_functions, {tat_bool("many_functions" in detected_patterns)})
  -> @graft.state(prompt_chain, pattern_many_constants, {tat_bool("many_constants" in detected_patterns)})

  -> @graft.state(prompt_chain, pattern_hook_heavy, {tat_bool("hook_heavy" in detected_patterns)})
  -> @graft.state(prompt_chain, pattern_component_heavy, {tat_bool("component_heavy" in detected_patterns)})
  -> @graft.state(prompt_chain, pattern_getter_heavy, {tat_bool("getter_heavy" in detected_patterns)})
  -> @graft.state(prompt_chain, pattern_predicate_heavy, {tat_bool("predicate_heavy" in detected_patterns)})
  -> @graft.state(prompt_chain, pattern_analyzer_heavy, {tat_bool("analyzer_heavy" in detected_patterns)})
  -> @graft.state(prompt_chain, pattern_handler_heavy, {tat_bool("handler_heavy" in detected_patterns)})

  -> @graft.state(prompt_chain, pattern_boolean_constant_heavy, {tat_bool("boolean_constant_heavy" in detected_patterns)})
  -> @graft.state(prompt_chain, pattern_threshold_constant_heavy, {tat_bool("threshold_constant_heavy" in detected_patterns)})
  -> @graft.state(prompt_chain, pattern_flag_constant_heavy, {tat_bool("flag_constant_heavy" in detected_patterns)})
  -> @graft.state(prompt_chain, pattern_decision_rule_constant_heavy, {tat_bool("decision_rule_constant_heavy" in detected_patterns)})
  -> @graft.state(prompt_chain, pattern_predicate_constant_heavy, {tat_bool("predicate_constant_heavy" in detected_patterns)})
  -> @graft.state(prompt_chain, pattern_capability_constant_heavy, {tat_bool("capability_constant_heavy" in detected_patterns)})
  -> @graft.state(prompt_chain, pattern_visibility_flag_heavy, {tat_bool("visibility_flag_heavy" in detected_patterns)})
  -> @graft.state(prompt_chain, pattern_state_flag_heavy, {tat_bool("state_flag_heavy" in detected_patterns)})

  -> @graft.state(prompt_chain, pattern_render_data_projection, {tat_bool("render_data_projection" in detected_patterns)})
  -> @graft.state(prompt_chain, pattern_entity_alias_heavy, {tat_bool("entity_alias_heavy" in detected_patterns)})
  -> @graft.state(prompt_chain, pattern_collection_alias_heavy, {tat_bool("collection_alias_heavy" in detected_patterns)})
  -> @graft.state(prompt_chain, pattern_derived_value_heavy, {tat_bool("derived_value_heavy" in detected_patterns)})
  -> @graft.state(prompt_chain, pattern_boolean_expression_constant_heavy, {tat_bool("boolean_expression_constant_heavy" in detected_patterns)})
  -> @graft.state(prompt_chain, pattern_action_guard_heavy, {tat_bool("action_guard_heavy" in detected_patterns)})
  -> @graft.state(prompt_chain, pattern_function_expression_constant_heavy, {tat_bool("function_expression_constant_heavy" in detected_patterns)})
  -> @graft.state(prompt_chain, pattern_view_model_pressure, {tat_bool("view_model_pressure" in detected_patterns)})
  
    -> @graft.state(prompt_chain, pattern_import_heavy, {tat_bool("import_heavy" in detected_patterns)})
  -> @graft.state(prompt_chain, pattern_external_import_heavy, {tat_bool("external_import_heavy" in detected_patterns)})
  -> @graft.state(prompt_chain, pattern_local_import_heavy, {tat_bool("local_import_heavy" in detected_patterns)})
  -> @graft.state(prompt_chain, pattern_deep_relative_import_heavy, {tat_bool("deep_relative_import_heavy" in detected_patterns)})
  -> @graft.state(prompt_chain, pattern_wide_named_import_heavy, {tat_bool("wide_named_import_heavy" in detected_patterns)})
  -> @graft.state(prompt_chain, pattern_import_responsibility_spread, {tat_bool("import_responsibility_spread" in detected_patterns)})
  -> @graft.state(prompt_chain, pattern_ui_imports_data_access, {tat_bool("ui_imports_data_access" in detected_patterns)})
  -> @graft.state(prompt_chain, pattern_ui_imports_domain_logic, {tat_bool("ui_imports_domain_logic" in detected_patterns)})
  -> @graft.state(prompt_chain, pattern_production_imports_test_support, {tat_bool("production_imports_test_support" in detected_patterns)})

  -> @graft.state(prompt_chain, pattern_export_heavy, {tat_bool("export_heavy" in detected_patterns)})
  -> @graft.state(prompt_chain, pattern_named_export_heavy, {tat_bool("named_export_heavy" in detected_patterns)})
  -> @graft.state(prompt_chain, pattern_default_export_present, {tat_bool("default_export_present" in detected_patterns)})
  -> @graft.state(prompt_chain, pattern_reexport_heavy, {tat_bool("reexport_heavy" in detected_patterns)})
  -> @graft.state(prompt_chain, pattern_star_reexport_present, {tat_bool("star_reexport_present" in detected_patterns)})
  -> @graft.state(prompt_chain, pattern_barrel_file, {tat_bool("barrel_file" in detected_patterns)})
  -> @graft.state(prompt_chain, pattern_export_responsibility_spread, {tat_bool("export_responsibility_spread" in detected_patterns)})
  -> @graft.state(prompt_chain, pattern_mixed_export_roles, {tat_bool("mixed_export_roles" in detected_patterns)})
  -> @graft.state(prompt_chain, pattern_utility_grab_bag, {tat_bool("utility_grab_bag" in detected_patterns)})
  -> @graft.state(prompt_chain, pattern_type_export_heavy, {tat_bool("type_export_heavy" in detected_patterns)})

  -> @graft.state(prompt_chain, risk_algorithmic_behavior, {tat_bool("algorithmic_behavior" in risk_signals)})
  -> @graft.state(prompt_chain, risk_threshold_sensitive, {tat_bool("threshold_sensitive" in risk_signals)})
  -> @graft.state(prompt_chain, risk_stateful_logic, {tat_bool("stateful_logic" in risk_signals)})
  -> @graft.state(prompt_chain, risk_hook_clustering, {tat_bool("hook_clustering" in risk_signals)})
  -> @graft.state(prompt_chain, risk_component_clustering, {tat_bool("component_clustering" in risk_signals)})
  -> @graft.state(prompt_chain, risk_analysis_responsibility, {tat_bool("analysis_responsibility" in risk_signals)})
  -> @graft.state(prompt_chain, risk_boolean_rule_density, {tat_bool("boolean_rule_density" in risk_signals)})
  -> @graft.state(prompt_chain, risk_threshold_rule_density, {tat_bool("threshold_rule_density" in risk_signals)})
  -> @graft.state(prompt_chain, risk_state_flag_density, {tat_bool("state_flag_density" in risk_signals)})
  -> @graft.state(prompt_chain, risk_ui_visibility_rule_density, {tat_bool("ui_visibility_rule_density" in risk_signals)})
  -> @graft.state(prompt_chain, risk_action_guard_density, {tat_bool("action_guard_density" in risk_signals)})
  -> @graft.state(prompt_chain, risk_view_model_density, {tat_bool("view_model_density" in risk_signals)})
  -> @graft.state(prompt_chain, risk_function_expression_density, {tat_bool("function_expression_density" in risk_signals)})
  -> @graft.state(prompt_chain, risk_import_boundary_pressure, {tat_bool("import_boundary_pressure" in risk_signals)})
  -> @graft.state(prompt_chain, risk_ui_data_coupling, {tat_bool("ui_data_coupling" in risk_signals)})
  -> @graft.state(prompt_chain, risk_ui_domain_coupling, {tat_bool("ui_domain_coupling" in risk_signals)})
  -> @graft.state(prompt_chain, risk_production_test_dependency, {tat_bool("production_test_dependency" in risk_signals)})
  -> @graft.state(prompt_chain, risk_export_surface_pressure, {tat_bool("export_surface_pressure" in risk_signals)})
  -> @graft.state(prompt_chain, risk_utility_surface_sprawl, {tat_bool("utility_surface_sprawl" in risk_signals)})
  -> @graft.state(prompt_chain, risk_public_api_gateway, {tat_bool("public_api_gateway" in risk_signals)})

  -> @graft.state(prompt_chain, target_pipeline_refactor, {tat_bool("pipeline_refactor" in targets)})
  -> @graft.state(prompt_chain, target_module_extraction, {tat_bool("module_extraction" in targets)})
  -> @graft.state(prompt_chain, target_complexity_reduction, {tat_bool("complexity_reduction" in targets)})
  -> @graft.state(prompt_chain, target_duplication_reduction, {tat_bool("duplication_reduction" in targets)})

  -> @graft.state(prompt_chain, target_hook_extraction, {tat_bool("hook_extraction" in targets)})
  -> @graft.state(prompt_chain, target_component_extraction, {tat_bool("component_extraction" in targets)})
  -> @graft.state(prompt_chain, target_analyzer_module_extraction, {tat_bool("analyzer_module_extraction" in targets)})
  -> @graft.state(prompt_chain, target_handler_extraction, {tat_bool("handler_extraction" in targets)})

  -> @graft.state(prompt_chain, target_boolean_rule_extraction, {tat_bool("boolean_rule_extraction" in targets)})
  -> @graft.state(prompt_chain, target_threshold_config_extraction, {tat_bool("threshold_config_extraction" in targets)})
  -> @graft.state(prompt_chain, target_state_flag_grouping, {tat_bool("state_flag_grouping" in targets)})
  -> @graft.state(prompt_chain, target_decision_rule_extraction, {tat_bool("decision_rule_extraction" in targets)})
  -> @graft.state(prompt_chain, target_visibility_rule_extraction, {tat_bool("visibility_rule_extraction" in targets)})

  -> @graft.state(prompt_chain, target_view_model_extraction, {tat_bool("view_model_extraction" in targets)})
  -> @graft.state(prompt_chain, target_action_guard_extraction, {tat_bool("action_guard_extraction" in targets)})
  -> @graft.state(prompt_chain, target_function_expression_review, {tat_bool("function_expression_review" in targets)})
  -> @graft.state(prompt_chain, target_import_boundary_review, {tat_bool("import_boundary_review" in targets)})
  -> @graft.state(prompt_chain, target_ui_data_boundary_review, {tat_bool("ui_data_boundary_review" in targets)})
  -> @graft.state(prompt_chain, target_production_dependency_review, {tat_bool("production_dependency_review" in targets)})
  -> @graft.state(prompt_chain, target_export_surface_review, {tat_bool("export_surface_review" in targets)})
  -> @graft.state(prompt_chain, target_utility_grab_bag_refactor, {tat_bool("utility_grab_bag_refactor" in targets)})
  -> @graft.state(prompt_chain, target_barrel_api_review, {tat_bool("barrel_api_review" in targets)})
  
  
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
    edges: List[Dict[str, str]] = []

    for line in stdout.splitlines():
        old_edge = parse_legacy_edge_line(line)
        if old_edge:
            edges.append(old_edge)
            continue

        new_edge = parse_graph_edge_line(line)
        if new_edge:
            edges.append(new_edge)

    return edges


def parse_legacy_edge_line(line: str) -> Dict[str, str] | None:
    if " --" not in line or "--> " not in line:
        return None

    try:
        subject, rest = line.split(" --", 1)
        relation, obj = rest.split("--> ", 1)
    except ValueError:
        return None

    return {
        "subject": subject.strip(),
        "relation": relation.strip(),
        "object": obj.strip(),
    }


def parse_graph_edge_line(line: str) -> Dict[str, str] | None:
    stripped = line.strip()

    if not stripped.startswith("- [") or not stripped.endswith("]"):
        return None

    edge_body = stripped[3:-1]
    parts = [part.strip() for part in edge_body.split(" : ")]

    if len(parts) != 3:
        return None

    subject, relation, obj = parts

    return {
        "subject": subject,
        "relation": relation,
        "object": obj,
    }

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
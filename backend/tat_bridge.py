import re
import subprocess
import tempfile
from pathlib import Path
from typing import Any, Dict, List


TAT_ROOT = Path(__file__).resolve().parents[1] / "tat-library"
TAT_RUNNER = TAT_ROOT / "run-module.ts"

REVIEW_RULES_DIR = (
    Path(__file__).resolve().parent
    / "tat_modules"
    / "review_rules"
)

LEGACY_RULES_PATH = (
    Path(__file__).resolve().parent
    / "tat_modules"
    / "review_rules.tat"
)

STATE_INJECTION_HOOK = "python_review_state"
STATE_INJECTION_EXTENSION = ".py"


DEFAULT_ANALYSIS_SCOPES = ["full"]

CONTEXT_EDGE_RELATIONS = {
    "hasFileRole",
    "expects",
    "hasLowToleranceFor",
    "hasRefactorUrgency",
    "hasWorthinessSignal",
    "hasRecommendation",
    "hasReason",
    "hasDomainCohesion",
    "hasActiveDomain",
    "hasDomainSignal",
    "hasDomainRecommendation",
    "hasDomainReason",
    "hasExtractionPlan",
    "hasExtractionStep",
    "hasExtractionReason",
    "hasSignalConfidence",
}

ANALYSIS_SCOPE_CATALOG = {
    "structure": {
        "signals": {
            "long_file",
            "token_heavy",
            "block_heavy",
            "deeply_nested",
            "long_lines",
        },
        "risks": set(),
        "findings": {
            "finding_file_too_large",
        },
        "clusters": {
            "structure_cluster",
        },
    },
    "functions": {
        "signals": {
            "function_heavy",
            "hook_heavy",
            "component_heavy",
            "getter_heavy",
            "setter_heavy",
            "predicate_heavy",
            "analyzer_heavy",
            "handler_heavy",
            "builder_heavy",
            "transformer_heavy",
            "io_heavy",
            "orchestrator_heavy",
        },
        "risks": set(),
        "findings": {
            "finding_hooks_should_move",
            "finding_components_should_split",
            "finding_getters_should_group",
            "finding_predicates_should_group",
            "finding_analyzers_should_group",
            "finding_handlers_should_group",
        },
        "clusters": {
            "function_profile_cluster",
            "react_cluster",
            "data_access_cluster",
            "rule_logic_cluster",
            "analysis_cluster",
            "interaction_cluster",
        },
    },
    "constants": {
        "signals": {
            "constant_heavy",
            "boolean_constant_heavy",
            "threshold_constant_heavy",
            "flag_constant_heavy",
            "decision_rule_constant_heavy",
            "predicate_constant_heavy",
            "capability_constant_heavy",
            "requirement_rule_constant_heavy",
            "feature_flag_constant_heavy",
            "visibility_flag_heavy",
            "state_flag_heavy",
            "validation_flag_heavy",
            "render_data_projection",
            "entity_alias_heavy",
            "collection_alias_heavy",
            "derived_value_heavy",
            "boolean_expression_constant_heavy",
            "action_guard_heavy",
            "function_expression_constant_heavy",
            "view_model_pressure",
        },
        "risks": set(),
        "findings": {
            "finding_boolean_constants_should_group",
            "finding_threshold_constants_should_group",
            "finding_flag_constants_should_group",
            "finding_decision_constants_should_group",
            "finding_render_data_projection_should_extract",
            "finding_action_guards_should_group",
            "finding_function_expressions_should_review",
            "finding_view_model_pressure",
        },
        "clusters": {
            "constant_profile_cluster",
            "boolean_logic_cluster",
            "configuration_cluster",
            "ui_state_cluster",
            "render_projection_cluster",
            "view_model_cluster",
            "action_guard_cluster",
            "function_profile_cluster",
        },
    },
    "imports": {
        "signals": {
            "import_heavy",
            "external_import_heavy",
            "local_import_heavy",
            "deep_relative_import_heavy",
            "wide_named_import_heavy",
            "import_responsibility_spread",
            "ui_imports_data_access",
            "ui_imports_domain_logic",
            "production_imports_test_support",
        },
        "risks": set(),
        "findings": {
            "finding_import_responsibility_spread",
            "finding_ui_imports_data_access",
            "finding_ui_imports_domain_logic",
            "finding_production_imports_test_support",
        },
        "clusters": {
            "import_profile_cluster",
            "architecture_boundary_cluster",
            "dependency_coupling_cluster",
        },
    },
    "exports": {
        "signals": {
            "export_heavy",
            "named_export_heavy",
            "default_export_present",
            "reexport_heavy",
            "star_reexport_present",
            "barrel_file",
            "public_api_pressure",
            "export_responsibility_spread",
            "mixed_export_roles",
            "utility_grab_bag",
            "type_export_heavy",
        },
        "risks": set(),
        "findings": {
            "finding_export_responsibility_spread",
            "finding_utility_grab_bag",
            "finding_barrel_file",
            "finding_public_api_pressure",
        },
        "clusters": {
            "export_profile_cluster",
            "public_api_cluster",
        },
    },
    "loops": {
        "signals": {
            "loop_heavy",
        },
        "risks": set(),
        "findings": set(),
        "clusters": {
            "complexity_cluster",
        },
    },
    "complexity": {
        "signals": {
            "repetition_high",
            "complexity_high",
            "decision_heavy",
            "boolean_heavy",
            "error_handling_heavy",
        },
        "risks": set(),
        "findings": {
            "finding_complexity_high",
            "finding_duplication_high",
        },
        "clusters": {
            "complexity_cluster",
        },
    },
    "risk": {
        "signals": set(),
        "risks": {
            "risky_to_extend",
        },
        "findings": {
            "finding_refactor_first",
        },
        "clusters": set(),
    },
}


ANALYSIS_SCOPE_TO_RULE_MODULE = {
    "context": {
        "file": "file_context_review_rules.tat",
        "graph": "fileContextReviewGraph",
    },
    "worthiness": {
        "file": "refactor_worthiness_review_rules.tat",
        "graph": "refactorWorthinessReviewGraph",
    },
    "cohesion": {
        "file": "domain_cohesion_review_rules.tat",
        "graph": "domainCohesionReviewGraph",
    },
        "extraction": {
        "file": "extraction_order_review_rules.tat",
        "graph": "extractionOrderReviewGraph",
    },
    "structure": {
        "file": "structure_review_rules.tat",
        "graph": "structureReviewGraph",
    },
    "functions": {
        "file": "function_review_rules.tat",
        "graph": "functionReviewGraph",
    },
    "constants": {
        "file": "constant_review_rules.tat",
        "graph": "constantReviewGraph",
    },
    "imports": {
        "file": "import_review_rules.tat",
        "graph": "importReviewGraph",
    },
    "exports": {
        "file": "export_review_rules.tat",
        "graph": "exportReviewGraph",
    },
    "loops": {
        "file": "loop_review_rules.tat",
        "graph": "loopReviewGraph",
    },
    "complexity": {
        "file": "complexity_review_rules.tat",
        "graph": "complexityReviewGraph",
    },
    "risk": {
        "file": "risk_review_rules.tat",
        "graph": "riskReviewGraph",
    },
}

FINDING_CATALOG = {
    "finding_file_too_large": {
        "rule": "file.too_large",
        "severity": "caution",
        "message": "This file may be doing too much.",
        "whyItMatters": "Large files often hide multiple responsibilities and become harder to navigate safely.",
        "suggestedFix": "Group related code by responsibility and extract one clear section at a time.",
        "nextAction": "Identify one responsibility to extract.",
    },
    "finding_complexity_high": {
        "rule": "complexity.high",
        "severity": "warning",
        "message": "This file has high complexity.",
        "whyItMatters": "High branching or nested logic makes bugs harder to isolate and changes riskier.",
        "suggestedFix": "Extract condition-heavy logic into named helper functions.",
        "nextAction": "Refactor complex paths before adding new behavior.",
    },
    "finding_duplication_high": {
        "rule": "duplication.high",
        "severity": "warning",
        "message": "Repeated structural patterns were detected.",
        "whyItMatters": "Duplicate logic increases maintenance cost because fixes may need to be repeated.",
        "suggestedFix": "Extract shared behavior into a helper, hook, service, or utility.",
        "nextAction": "Consolidate the highest-impact repeated pattern first.",
    },
    "finding_refactor_first": {
        "rule": "risk.refactor_first",
        "severity": "error",
        "message": "This code is risky to extend without refactoring first.",
        "whyItMatters": "The current structure has enough pressure that new features may increase fragility.",
        "suggestedFix": "Make behavior-preserving refactors before adding new functionality.",
        "nextAction": "Refactor before adding new features.",
    },
    "finding_hooks_should_move": {
        "rule": "functions.hooks_clustered",
        "severity": "caution",
        "message": "This file contains several hook-shaped functions.",
        "whyItMatters": "Many useX functions in one file often means reusable stateful behavior is mixed into the main file responsibility.",
        "suggestedFix": "Move related useX functions into a hooks folder or a focused custom-hook module.",
        "nextAction": "Extract the most reused hook-shaped function first.",
    },
    "finding_components_should_split": {
        "rule": "functions.components_clustered",
        "severity": "caution",
        "message": "This file contains several component-shaped functions.",
        "whyItMatters": "Many PascalCase functions in one file can hide a component tree that deserves clearer file boundaries.",
        "suggestedFix": "Move secondary components into component files or a local components folder.",
        "nextAction": "Extract the largest child component first.",
    },
    "finding_getters_should_group": {
        "rule": "functions.getters_clustered",
        "severity": "info",
        "message": "This file contains several getter-shaped functions.",
        "whyItMatters": "Many getX functions can mean the file is acting as a data-access or selector layer.",
        "suggestedFix": "Consider grouping related getters into a selector, query, or utility module.",
        "nextAction": "Group related getX functions by the data they read.",
    },
    "finding_predicates_should_group": {
        "rule": "functions.predicates_clustered",
        "severity": "info",
        "message": "This file contains several predicate-shaped functions.",
        "whyItMatters": "Many hasX, isX, canX, or shouldX functions can hide business rules inside a general-purpose file.",
        "suggestedFix": "Move related predicate logic into named rule or guard helpers.",
        "nextAction": "Extract the clearest predicate group first.",
    },
    "finding_analyzers_should_group": {
        "rule": "functions.analyzers_clustered",
        "severity": "caution",
        "message": "This file contains several analyzer-shaped functions.",
        "whyItMatters": "Many analyzeX or detectX functions usually means the file has a semantic analysis responsibility that deserves its own module.",
        "suggestedFix": "Move analysis functions into an analyzer module with a clear orchestration entry point.",
        "nextAction": "Extract related analyzeX/detectX functions into a focused analyzer file.",
    },
    "finding_handlers_should_group": {
        "rule": "functions.handlers_clustered",
        "severity": "info",
        "message": "This file contains several handler-shaped functions.",
        "whyItMatters": "Many handleX or toggleX functions can mean UI event handling is mixed with rendering or data logic.",
        "suggestedFix": "Group handlers near the state they modify or extract them into interaction helpers.",
        "nextAction": "Separate event-handling logic from rendering logic where possible.",
    },
        "finding_boolean_constants_should_group": {
        "rule": "constants.boolean_clustered",
        "severity": "caution",
        "message": "This file contains many boolean-shaped constants.",
        "whyItMatters": "Many isX, hasX, canX, or shouldX constants can mean decision logic is scattered across local flags.",
        "suggestedFix": "Group related boolean constants into named predicate helpers, guard helpers, or a rule module.",
        "nextAction": "Extract the clearest boolean-rule cluster first.",
    },
    "finding_threshold_constants_should_group": {
        "rule": "constants.thresholds_clustered",
        "severity": "caution",
        "message": "This file contains several threshold or configuration constants.",
        "whyItMatters": "Thresholds like MAX, MIN, LIMIT, DEFAULT, and RISK_THRESHOLD often represent tuning rules that should be easy to find and audit.",
        "suggestedFix": "Move related thresholds into a constants, config, or scoring-rules module.",
        "nextAction": "Group threshold constants by the behavior they control.",
    },
    "finding_flag_constants_should_group": {
        "rule": "constants.flags_clustered",
        "severity": "info",
        "message": "This file contains several flag-shaped constants.",
        "whyItMatters": "Many UI/state flags can make rendering and interaction state harder to reason about.",
        "suggestedFix": "Group related flags into state objects or focused UI state helpers.",
        "nextAction": "Group flags by UI region or state domain.",
    },
    "finding_decision_constants_should_group": {
        "rule": "constants.decision_rules_clustered",
        "severity": "caution",
        "message": "This file contains several decision-rule constants.",
        "whyItMatters": "Many shouldX, canX, requiresX, or allowsX constants can hide policy or permission logic inside a general file.",
        "suggestedFix": "Move decision-rule constants into named rule helpers or predicate modules.",
        "nextAction": "Extract permission or decision constants into named rules.",
    },
        "finding_render_data_projection_should_extract": {
        "rule": "constants.render_data_projection",
        "severity": "info",
        "message": "This file projects several values into render-ready constants.",
        "whyItMatters": "Render data projection is often helpful, but too much of it can make a component feel like it is building a view model inline.",
        "suggestedFix": "Consider grouping render-derived values into a selector, view-model helper, or focused hook when the projection grows.",
        "nextAction": "Review whether derived render values belong in a helper or hook.",
    },
    "finding_action_guards_should_group": {
        "rule": "constants.action_guards_clustered",
        "severity": "caution",
        "message": "This file contains several action-guard constants.",
        "whyItMatters": "Many disabled/allowed/guard constants can hide interaction rules inside rendering code.",
        "suggestedFix": "Group related action guards into predicate helpers or a UI interaction rule module.",
        "nextAction": "Extract related disabled/can/should action guards first.",
    },
    "finding_function_expressions_should_review": {
        "rule": "constants.function_expressions",
        "severity": "info",
        "message": "This file declares functions with const-style assignments.",
        "whyItMatters": "Const arrow functions are valid, but they should be interpreted as functions rather than normal constants.",
        "suggestedFix": "Review whether these should be counted and grouped with functions rather than constants.",
        "nextAction": "Check whether const function expressions belong with function-profile findings.",
    },
    "finding_view_model_pressure": {
        "rule": "constants.view_model_pressure",
        "severity": "caution",
        "message": "This file may be building a view model inline.",
        "whyItMatters": "Many entity aliases, collection aliases, derived values, and action guards can make a component responsible for preparing too much display data.",
        "suggestedFix": "Consider extracting render-data preparation into a selector, custom hook, or view-model helper.",
        "nextAction": "Extract the clearest render-data projection group first.",
    },
        "finding_import_responsibility_spread": {
        "rule": "imports.responsibility_spread",
        "severity": "caution",
        "message": "This file imports from several responsibility zones.",
        "whyItMatters": "Imports from UI, state, domain, data, config, and utility layers can mean the file is coordinating too many concerns.",
        "suggestedFix": "Review whether orchestration, data access, and domain logic should be separated into clearer modules.",
        "nextAction": "Identify the imported responsibility category that does not belong in this file.",
    },
    "finding_ui_imports_data_access": {
        "rule": "imports.ui_data_coupling",
        "severity": "caution",
        "message": "This UI-shaped file imports data-access code.",
        "whyItMatters": "When rendering code imports API, service, repository, or database modules directly, the component may be mixing view and data responsibilities.",
        "suggestedFix": "Consider moving data access into a hook, service wrapper, or parent orchestration layer.",
        "nextAction": "Extract direct data access away from the rendering component first.",
    },
    "finding_ui_imports_domain_logic": {
        "rule": "imports.ui_domain_coupling",
        "severity": "info",
        "message": "This UI-shaped file imports domain or rule logic.",
        "whyItMatters": "Domain rule imports can be healthy, but too many can make a component responsible for policy decisions.",
        "suggestedFix": "Consider grouping domain decisions into selectors, predicates, or view-model helpers.",
        "nextAction": "Review whether domain rules are being used for rendering only or for deeper decision-making.",
    },
    "finding_production_imports_test_support": {
        "rule": "imports.production_imports_test_support",
        "severity": "warning",
        "message": "This production file imports test support code.",
        "whyItMatters": "Production code depending on fixtures, mocks, stubs, or test helpers can create fragile runtime behavior.",
        "suggestedFix": "Move test-only data or mocks out of the production dependency path.",
        "nextAction": "Remove or replace the test-support import.",
    },
    "finding_export_responsibility_spread": {
        "rule": "exports.responsibility_spread",
        "severity": "caution",
        "message": "This file exports several different responsibility types.",
        "whyItMatters": "A wide export surface can make a module feel like a grab bag and increase refactor risk.",
        "suggestedFix": "Group exports by responsibility or split unrelated exports into focused modules.",
        "nextAction": "Identify the largest unrelated export role group.",
    },
    "finding_utility_grab_bag": {
        "rule": "exports.utility_grab_bag",
        "severity": "caution",
        "message": "This file appears to expose a grab bag of utility exports.",
        "whyItMatters": "Mixed utility exports can make a module harder to navigate, test, and safely change.",
        "suggestedFix": "Split utility exports by role, such as getters, predicates, builders, analyzers, or handlers.",
        "nextAction": "Extract the most coherent export group first.",
    },
    "finding_barrel_file": {
        "rule": "exports.barrel_file",
        "severity": "info",
        "message": "This file appears to be a barrel or public API gateway.",
        "whyItMatters": "Barrel files are often healthy, but changes can affect many import sites.",
        "suggestedFix": "Keep re-exports intentional and avoid mixing unrelated public APIs.",
        "nextAction": "Verify the barrel groups related exports only.",
    },
    "finding_public_api_pressure": {
        "rule": "exports.public_api_pressure",
        "severity": "caution",
        "message": "This file exposes a large public surface.",
        "whyItMatters": "Files with many named exports become harder to refactor because more consumers may depend on them.",
        "suggestedFix": "Review whether the public API should be split by responsibility.",
        "nextAction": "Group exported symbols by role before changing behavior.",
    },
}


def run_tat_review(metrics: Dict[str, Any], analysis_scopes: List[str] | None = None) -> Dict[str, Any]:
    normalized_scopes = normalize_analysis_scopes(analysis_scopes)
    selected_modules = get_selected_review_modules(normalized_scopes)
    state_tat = build_state_injection(metrics)

    try:
        combined = build_dynamic_review_source(selected_modules)
    except FileNotFoundError:
        with open(LEGACY_RULES_PATH, "r", encoding="utf-8") as file:
            rules_tat = file.read()

        combined = resolve_tat_injection(
            tat_source=rules_tat,
            hook_ref=STATE_INJECTION_HOOK,
            file_extension=STATE_INJECTION_EXTENSION,
            injected_source=state_tat,
        )
        execution_mode = "legacy_full_review_fallback"
    else:
        combined = resolve_tat_injection(
            tat_source=combined,
            hook_ref=STATE_INJECTION_HOOK,
            file_extension=STATE_INJECTION_EXTENSION,
            injected_source=state_tat,
        )
        execution_mode = "dynamic_selected_review_pipeline"

    result = run_tat_source(combined)

    if result.returncode != 0:
        print("\n--- TAT REVIEW FAILED ---")
        print("Return code:", result.returncode)
        print("\nSTDOUT:")
        print(result.stdout)
        print("\nSTDERR:")
        print(result.stderr)
        print("\nGENERATED TAT SOURCE:")
        print(combined)
        print("--- END TAT REVIEW FAILURE ---\n")

    edges = parse_tat_edges(result.stdout)
    clusters = build_clusters(edges)
    findings = build_findings(edges)

    review = {
        "success": result.returncode == 0,
        "stdout": result.stdout,
        "stderr": result.stderr,
        "edges": edges,
        "signals": [
            edge["object"]
            for edge in edges
            if edge["relation"] == "hasSignal"
        ],
        "risks": [
            edge["object"]
            for edge in edges
            if edge["relation"] == "hasRisk"
        ],
        "clusters": clusters,
        "findings": findings,
        "fileRoles": extract_edge_objects(edges, "hasFileRole"),
        "expectedTraits": extract_trait_map(edges, "expects"),
        "lowToleranceTraits": extract_trait_map(edges, "hasLowToleranceFor"),
        "refactorUrgency": extract_refactor_urgency(edges),
        "refactorUrgencyCandidates": extract_edge_objects(edges, "hasRefactorUrgency"),
        "refactorWorthinessSignals": extract_edge_objects(edges, "hasWorthinessSignal"),
        "refactorRecommendations": extract_edge_objects(edges, "hasRecommendation"),
        "refactorReasonMap": extract_trait_map(edges, "hasReason"),
        "domainCohesion": extract_domain_cohesion(edges),
        "activeDomains": extract_edge_objects(edges, "hasActiveDomain"),
        "domainSignals": extract_edge_objects(edges, "hasDomainSignal"),
        "domainRecommendations": extract_edge_objects(edges, "hasDomainRecommendation"),
        "domainReasonMap": extract_trait_map(edges, "hasCohesionReason"),
        "extractionPlan": extract_edge_objects(edges, "hasExtractionPlan"),
        "extractionSteps": extract_ordered_extraction_steps(edges),
        "extractionReasonMap": extract_trait_map(edges, "hasExtractionReason"),
        "tatSource": combined,
        "tatExecutionMode": execution_mode,
        "selectedTatGraphs": [module["graph"] for module in selected_modules],
        "analysisScopes": normalized_scopes,
        "availableAnalysisScopes": list(ANALYSIS_SCOPE_CATALOG.keys()),
        "signalConfidence": extract_signal_confidence(edges, metrics),
    }

    # Keep this as a safety net. Dynamic source should already run only selected
    # rule bodies, but filtering prevents stale or legacy fallback output from
    # leaking unchecked review domains into the UI.
    return filter_tat_review_by_scope(review, normalized_scopes)


NODE_DECLARATION_PATTERN = re.compile(r"(?m)^\s*([A-Za-z_]\w*)\s*=\s*<\{\}>\s*$")
IMPORT_BLOCK_PATTERN = re.compile(r"(?ms)^import\s*\{.*?\}\s*from\s*[\"'][^\"']+[\"']\s*")
EXPORT_LINE_PATTERN = re.compile(r"(?m)^\s*export\s+[^\n]+\n?")
SEED_ASSIGNMENT_PATTERN = re.compile(r"(?m)^\s*[A-Za-z_]\w*\s*:=\s*@seed\s*\{")


BASELINE_REVIEW_SCOPE_IDS = ["context", "cohesion", "worthiness", "extraction"]


def get_selected_review_modules(normalized_scopes: List[str]) -> List[Dict[str, str]]:
    if "full" in normalized_scopes:
        scope_ids = [
            scope
            for scope in ANALYSIS_SCOPE_TO_RULE_MODULE
            if scope not in BASELINE_REVIEW_SCOPE_IDS
        ]
    else:
        scope_ids = [
            scope
            for scope in normalized_scopes
            if scope in ANALYSIS_SCOPE_TO_RULE_MODULE
            and scope not in BASELINE_REVIEW_SCOPE_IDS
        ]

    # File context and refactor-worthiness are baseline interpretation passes.
    # They run for every analysis scope so SCREEN can explain how strongly the
    # selected signals should push toward a refactor.
    ordered_scope_ids = [
        *BASELINE_REVIEW_SCOPE_IDS,
        *[scope for scope in scope_ids if scope not in BASELINE_REVIEW_SCOPE_IDS],
    ]

    return [ANALYSIS_SCOPE_TO_RULE_MODULE[scope] for scope in ordered_scope_ids]


def build_dynamic_review_source(selected_modules: List[Dict[str, str]]) -> str:
    shared_source = read_review_rule_module("shared_review_nodes.tat")
    module_sources = [read_review_rule_module(module["file"]) for module in selected_modules]
    selected_graph_names = [module["graph"] for module in selected_modules]

    declarations = collect_node_declarations([shared_source, *module_sources])
    rule_bodies = [extract_rule_pipeline_body(source) for source in module_sources]

    nodes = "\n".join(f"    {name}," for name in declarations)
    rules = "\n\n".join(body for body in rule_bodies if body.strip())

    selected_graph_comment = "\n".join(
        f"// selected graph: {graph_name}" for graph_name in selected_graph_names
    )

    return f"""// dynamic_selected_review_pipeline.tat
// Generated by backend/tat_bridge.py.
// It intentionally inlines only the selected review rule bodies so injected
// Python state is available before the selected @if rules execute.
{selected_graph_comment}

{format_node_declarations(declarations)}

graph := @seed {{
  nodes: [
{nodes}
  ],
  edges: [],
  state: {{}},
  meta: {{}},
  root: file_analysis,
}}

  <- @inject({STATE_INJECTION_HOOK}, "{STATE_INJECTION_EXTENSION}")

{rules}

projection := graph <> @project.apply(graph, file_analysis)
"""


def read_review_rule_module(filename: str) -> str:
    return (REVIEW_RULES_DIR / filename).read_text(encoding="utf-8")


def collect_node_declarations(sources: List[str]) -> List[str]:
    declarations: List[str] = []
    seen: set[str] = set()

    for source in sources:
        source_without_imports = IMPORT_BLOCK_PATTERN.sub("", source)
        for match in NODE_DECLARATION_PATTERN.finditer(source_without_imports):
            name = match.group(1)
            if name in seen:
                continue
            seen.add(name)
            declarations.append(name)

    return declarations


def format_node_declarations(declarations: List[str]) -> str:
    return "\n".join(f"{name} = <{{}}>" for name in declarations)


def extract_rule_pipeline_body(source: str) -> str:
    source_without_imports = IMPORT_BLOCK_PATTERN.sub("", source)
    source_without_exports = EXPORT_LINE_PATTERN.sub("", source_without_imports)

    seed_match = SEED_ASSIGNMENT_PATTERN.search(source_without_exports)
    if not seed_match:
        return ""

    seed_start = seed_match.end() - 1
    seed_end = find_matching_brace(source_without_exports, seed_start)
    if seed_end == -1:
        return ""

    return source_without_exports[seed_end + 1 :].strip()


def find_matching_brace(source: str, opening_brace_index: int) -> int:
    depth = 0

    for index in range(opening_brace_index, len(source)):
        char = source[index]

        if char == "{":
            depth += 1
            continue

        if char == "}":
            depth -= 1
            if depth == 0:
                return index

    return -1

def normalize_analysis_scopes(analysis_scopes: List[str] | None) -> List[str]:
    if not analysis_scopes:
        return DEFAULT_ANALYSIS_SCOPES

    valid_scopes = [
        scope
        for scope in analysis_scopes
        if scope == "full" or scope in ANALYSIS_SCOPE_CATALOG
    ]

    if not valid_scopes or "full" in valid_scopes:
        return DEFAULT_ANALYSIS_SCOPES

    return valid_scopes


def filter_tat_review_by_scope(
    review: Dict[str, Any],
    analysis_scopes: List[str] | None,
) -> Dict[str, Any]:
    normalized_scopes = normalize_analysis_scopes(analysis_scopes)

    if "full" in normalized_scopes:
        return {
            **review,
            "analysisScopes": normalized_scopes,
            "availableAnalysisScopes": list(ANALYSIS_SCOPE_CATALOG.keys()),
            "signalConfidence": review.get("signalConfidence", {}),
        }

    allowed_signals: set[str] = set()
    allowed_risks: set[str] = set()
    allowed_findings: set[str] = set()
    allowed_clusters: set[str] = set()

    for scope in normalized_scopes:
        scope_config = ANALYSIS_SCOPE_CATALOG.get(scope, {})
        allowed_signals.update(scope_config.get("signals", set()))
        allowed_risks.update(scope_config.get("risks", set()))
        allowed_findings.update(scope_config.get("findings", set()))
        allowed_clusters.update(scope_config.get("clusters", set()))

    filtered_edges = [
        edge
        for edge in review.get("edges", [])
        if should_keep_edge_for_scope(
            edge=edge,
            allowed_signals=allowed_signals,
            allowed_risks=allowed_risks,
            allowed_findings=allowed_findings,
            allowed_clusters=allowed_clusters,
        )
    ]

    filtered_signals = [
        signal
        for signal in review.get("signals", [])
        if signal in allowed_signals
    ]

    filtered_risks = [
        risk
        for risk in review.get("risks", [])
        if risk in allowed_risks
    ]

    filtered_findings = [
        finding
        for finding in review.get("findings", [])
        if finding.get("id") in allowed_findings
    ]

    filtered_clusters = {
        cluster: [signal for signal in signals if signal in allowed_signals]
        for cluster, signals in review.get("clusters", {}).items()
        if cluster in allowed_clusters
    }
    filtered_clusters = {
        cluster: signals
        for cluster, signals in filtered_clusters.items()
        if signals
    }

    return {
        **review,
        "edges": filtered_edges,
        "signals": filtered_signals,
        "risks": filtered_risks,
        "clusters": filtered_clusters,
        "findings": filtered_findings,
        "fileRoles": review.get("fileRoles", []),
        "expectedTraits": review.get("expectedTraits", {}),
        "lowToleranceTraits": review.get("lowToleranceTraits", {}),
        "refactorUrgency": review.get("refactorUrgency", "none"),
        "refactorUrgencyCandidates": review.get("refactorUrgencyCandidates", []),
        "refactorWorthinessSignals": review.get("refactorWorthinessSignals", []),
        "refactorRecommendations": review.get("refactorRecommendations", []),
        "refactorReasonMap": review.get("refactorReasonMap", {}),
        "domainCohesion": review.get("domainCohesion", "unknown"),
        "activeDomains": review.get("activeDomains", []),
        "domainSignals": review.get("domainSignals", []),
        "domainRecommendations": review.get("domainRecommendations", []),
        "domainReasonMap": review.get("domainReasonMap", {}),
        "extractionPlan": review.get("extractionPlan", []),
        "extractionSteps": review.get("extractionSteps", []),
        "extractionReasonMap": review.get("extractionReasonMap", {}),
        "analysisScopes": normalized_scopes,
        "availableAnalysisScopes": list(ANALYSIS_SCOPE_CATALOG.keys()),
        "signalConfidence": filter_signal_confidence(
            review.get("signalConfidence", {}),
            filtered_signals,
        ),
    }
    
EXTRACTION_STEP_ORDER = {
    "defer_extraction_watch_first": 0,
    "render_only_component_first": 1,
    "display_view_model_helper_first": 2,
    "predicate_rule_cluster_first": 3,
    "workflow_hook_first": 4,
    "service_boundary_first": 5,
    "domain_module_first": 6,
    "public_api_grouping_first": 7,
}

def extract_signal_confidence(
    edges: List[Dict[str, str]],
    metrics: Dict[str, Any],
) -> Dict[str, Any]:
    import_profile = metrics.get("importProfile", {})
    confidence = dict(import_profile.get("signalConfidence", {}))

    for edge in edges:
        if edge.get("relation") != "hasSignalConfidence":
            continue

        signal = edge.get("subject")
        confidence_node = edge.get("object")

        if not signal:
            continue

        existing = confidence.get(signal, {})
        confidence[signal] = {
            **existing,
            "tatConfidence": confidence_node,
        }

    return confidence


def filter_signal_confidence(
    signal_confidence: Dict[str, Any],
    selected_signals: List[str],
) -> Dict[str, Any]:
    selected = set(selected_signals)

    return {
        signal: details
        for signal, details in signal_confidence.items()
        if signal in selected
    }

def extract_ordered_extraction_steps(edges: List[Dict[str, str]]) -> List[str]:
    steps = extract_edge_objects(edges, "hasExtractionStep")

    return sorted(
        steps,
        key=lambda step: EXTRACTION_STEP_ORDER.get(step, 99),
    )


def should_keep_edge_for_scope(
    edge: Dict[str, str],
    allowed_signals: set[str],
    allowed_risks: set[str],
    allowed_findings: set[str],
    allowed_clusters: set[str],
) -> bool:
    relation = edge.get("relation")
    subject = edge.get("subject")
    obj = edge.get("object")

    if relation in CONTEXT_EDGE_RELATIONS:
        return True

    if relation == "hasSignal":
        return obj in allowed_signals

    if relation == "hasRisk":
        return obj in allowed_risks

    if relation == "hasFinding":
        return obj in allowed_findings

    if relation == "belongsToCluster":
        return subject in allowed_signals and obj in allowed_clusters

    return subject in allowed_signals or obj in allowed_signals


def run_tat_source(source: str):
    with tempfile.NamedTemporaryFile(
        mode="w",
        suffix=".tat",
        delete=False,
        encoding="utf-8",
    ) as temp_file:
        temp_file.write(source)
        temp_path = temp_file.name

    try:
        return subprocess.run(
            ["npx", "tsx", str(TAT_RUNNER), temp_path],
            cwd=str(TAT_ROOT),
            capture_output=True,
            text=True,
            timeout=20,
        )
    except subprocess.TimeoutExpired as error:
        stdout = decode_process_text(error.stdout)
        stderr = decode_process_text(error.stderr)

        return subprocess.CompletedProcess(
            args=error.cmd,
            returncode=124,
            stdout=stdout,
            stderr=stderr + "\nTAT review timed out after 20 seconds.",
        )


def decode_process_text(value: Any) -> str:
    if value is None:
        return ""

    if isinstance(value, bytes):
        return value.decode("utf-8", errors="replace")

    return str(value)


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



REFACTOR_URGENCY_ORDER = {
    "refactor_none": 0,
    "refactor_watch": 1,
    "refactor_recommended": 2,
    "refactor_urgent": 3,
}

REFACTOR_URGENCY_LABELS = {
    "refactor_none": "none",
    "refactor_watch": "watch",
    "refactor_recommended": "recommended",
    "refactor_urgent": "urgent",
}


def extract_refactor_urgency(edges: List[Dict[str, str]]) -> str:
    urgency_nodes = extract_edge_objects(edges, "hasRefactorUrgency")

    if not urgency_nodes:
        return "none"

    strongest_node = max(
        urgency_nodes,
        key=lambda node: REFACTOR_URGENCY_ORDER.get(node, 0),
    )

    return REFACTOR_URGENCY_LABELS.get(strongest_node, "none")



DOMAIN_COHESION_ORDER = {
    "domain_ambiguous": 0,
    "domain_cohesive": 1,
    "domain_mixed": 2,
}

DOMAIN_COHESION_LABELS = {
    "domain_ambiguous": "ambiguous",
    "domain_cohesive": "cohesive",
    "domain_mixed": "mixed",
}


def extract_domain_cohesion(edges: List[Dict[str, str]]) -> str:
    cohesion_nodes = extract_edge_objects(edges, "hasDomainCohesion")

    if not cohesion_nodes:
        return "unknown"

    strongest_node = max(
        cohesion_nodes,
        key=lambda node: DOMAIN_COHESION_ORDER.get(node, 0),
    )

    return DOMAIN_COHESION_LABELS.get(strongest_node, "unknown")


def extract_edge_objects(edges: List[Dict[str, str]], relation: str) -> List[str]:
    values: List[str] = []
    seen: set[str] = set()

    for edge in edges:
        if edge.get("relation") != relation:
            continue

        value = edge.get("object")
        if not value or value in seen:
            continue

        seen.add(value)
        values.append(value)

    return values


def extract_trait_map(edges: List[Dict[str, str]], relation: str) -> Dict[str, List[str]]:
    trait_map: Dict[str, List[str]] = {}

    for edge in edges:
        if edge.get("relation") != relation:
            continue

        subject = edge.get("subject")
        obj = edge.get("object")
        if not subject or not obj:
            continue

        trait_map.setdefault(subject, [])
        if obj not in trait_map[subject]:
            trait_map[subject].append(obj)

    return trait_map

def build_clusters(edges: List[Dict[str, str]]) -> Dict[str, List[str]]:
    clusters: Dict[str, List[str]] = {}

    for edge in edges:
        if edge["relation"] != "belongsToCluster":
            continue

        cluster = edge["object"]
        signal = edge["subject"]

        if cluster not in clusters:
            clusters[cluster] = []

        clusters[cluster].append(signal)

    return clusters


def build_findings(edges: List[Dict[str, str]]) -> List[Dict[str, str]]:
    findings = []

    for edge in edges:
        if edge["relation"] != "hasFinding":
            continue

        finding_id = edge["object"]
        finding = FINDING_CATALOG.get(finding_id)

        if finding:
            findings.append({
                "id": finding_id,
                **finding,
            })

    return findings

def resolve_tat_injection(
    tat_source: str,
    hook_ref: str,
    file_extension: str,
    injected_source: str,
) -> str:
    """
    SCREEN-side injection resolver.

    The SCREEN-owned TAT module declares an injection point using current TAT syntax:

      <- @inject(python_review_state, ".py")

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

def build_state_injection(metrics: Dict[str, Any]) -> str:
    flattened = flatten_metrics(metrics)

    return f"""
  -> @graft.state(file_analysis, lineCount, {flattened["lineCount"]})
  -> @graft.state(file_analysis, tokenEstimate, {flattened["tokenEstimate"]})
  -> @graft.state(file_analysis, functionCount, {flattened["functionCount"]})
  -> @graft.state(file_analysis, constantCount, {flattened["constantCount"]})

  -> @graft.state(file_analysis, hookFunctionCount, {flattened["hookFunctionCount"]})
  -> @graft.state(file_analysis, componentFunctionCount, {flattened["componentFunctionCount"]})
  -> @graft.state(file_analysis, getterFunctionCount, {flattened["getterFunctionCount"]})
  -> @graft.state(file_analysis, setterFunctionCount, {flattened["setterFunctionCount"]})
  -> @graft.state(file_analysis, predicateFunctionCount, {flattened["predicateFunctionCount"]})
  -> @graft.state(file_analysis, analyzerFunctionCount, {flattened["analyzerFunctionCount"]})
  -> @graft.state(file_analysis, handlerFunctionCount, {flattened["handlerFunctionCount"]})
  -> @graft.state(file_analysis, builderFunctionCount, {flattened["builderFunctionCount"]})
  -> @graft.state(file_analysis, transformerFunctionCount, {flattened["transformerFunctionCount"]})
  -> @graft.state(file_analysis, ioFunctionCount, {flattened["ioFunctionCount"]})
  -> @graft.state(file_analysis, orchestratorFunctionCount, {flattened["orchestratorFunctionCount"]})

  -> @graft.state(file_analysis, booleanConstantCount, {flattened["booleanConstantCount"]})
  -> @graft.state(file_analysis, thresholdConstantCount, {flattened["thresholdConstantCount"]})
  -> @graft.state(file_analysis, flagConstantCount, {flattened["flagConstantCount"]})
  -> @graft.state(file_analysis, decisionRuleConstantCount, {flattened["decisionRuleConstantCount"]})
  -> @graft.state(file_analysis, predicateConstantCount, {flattened["predicateConstantCount"]})
  -> @graft.state(file_analysis, capabilityConstantCount, {flattened["capabilityConstantCount"]})
  -> @graft.state(file_analysis, requirementRuleConstantCount, {flattened["requirementRuleConstantCount"]})
  -> @graft.state(file_analysis, featureFlagConstantCount, {flattened["featureFlagConstantCount"]})
  -> @graft.state(file_analysis, visibilityFlagConstantCount, {flattened["visibilityFlagConstantCount"]})
  -> @graft.state(file_analysis, stateFlagConstantCount, {flattened["stateFlagConstantCount"]})
  -> @graft.state(file_analysis, validationFlagConstantCount, {flattened["validationFlagConstantCount"]})

  -> @graft.state(file_analysis, functionExpressionConstantCount, {flattened["functionExpressionConstantCount"]})
  -> @graft.state(file_analysis, entityAliasConstantCount, {flattened["entityAliasConstantCount"]})
  -> @graft.state(file_analysis, collectionAliasConstantCount, {flattened["collectionAliasConstantCount"]})
  -> @graft.state(file_analysis, derivedValueConstantCount, {flattened["derivedValueConstantCount"]})
  -> @graft.state(file_analysis, derivedNumericValueConstantCount, {flattened["derivedNumericValueConstantCount"]})
  -> @graft.state(file_analysis, booleanDerivedValueConstantCount, {flattened["booleanDerivedValueConstantCount"]})
  -> @graft.state(file_analysis, actionGuardConstantCount, {flattened["actionGuardConstantCount"]})
  -> @graft.state(file_analysis, renderDataProjectionConstantCount, {flattened["renderDataProjectionConstantCount"]})

  -> @graft.state(file_analysis, importCount, {flattened["importCount"]})
  -> @graft.state(file_analysis, externalImportCount, {flattened["externalImportCount"]})
  -> @graft.state(file_analysis, localImportCount, {flattened["localImportCount"]})
  -> @graft.state(file_analysis, relativeImportCount, {flattened["relativeImportCount"]})
  -> @graft.state(file_analysis, deepRelativeImportCount, {flattened["deepRelativeImportCount"]})
  -> @graft.state(file_analysis, internalAliasImportCount, {flattened["internalAliasImportCount"]})
  -> @graft.state(file_analysis, sideEffectImportCount, {flattened["sideEffectImportCount"]})
  -> @graft.state(file_analysis, wideNamedImportCount, {flattened["wideNamedImportCount"]})
  -> @graft.state(file_analysis, importResponsibilityCategoryCount, {flattened["importResponsibilityCategoryCount"]})

  -> @graft.state(file_analysis, uiRenderingImportCount, {flattened["uiRenderingImportCount"]})
  -> @graft.state(file_analysis, stateBehaviorImportCount, {flattened["stateBehaviorImportCount"]})
  -> @graft.state(file_analysis, generalUtilityImportCount, {flattened["generalUtilityImportCount"]})
  -> @graft.state(file_analysis, domainLogicImportCount, {flattened["domainLogicImportCount"]})
  -> @graft.state(file_analysis, dataAccessImportCount, {flattened["dataAccessImportCount"]})
  -> @graft.state(file_analysis, configurationImportCount, {flattened["configurationImportCount"]})
  -> @graft.state(file_analysis, typeContractImportCount, {flattened["typeContractImportCount"]})
  -> @graft.state(file_analysis, featureModuleImportCount, {flattened["featureModuleImportCount"]})
  -> @graft.state(file_analysis, testSupportImportCount, {flattened["testSupportImportCount"]})
  -> @graft.state(file_analysis, assetDependencyImportCount, {flattened["assetDependencyImportCount"]})
  -> @graft.state(file_analysis, infrastructureImportCount, {flattened["infrastructureImportCount"]})
  -> @graft.state(file_analysis, unknownImportCount, {flattened["unknownImportCount"]})

  -> @graft.state(file_analysis, importResponsibilitySpreadDetected, {flattened["importResponsibilitySpreadDetected"]})
  -> @graft.state(file_analysis, uiImportsDataAccessDetected, {flattened["uiImportsDataAccessDetected"]})
  -> @graft.state(file_analysis, uiImportsDataAccessHighConfidence, {flattened["uiImportsDataAccessHighConfidence"]})
  -> @graft.state(file_analysis, uiImportsDataAccessMediumConfidence, {flattened["uiImportsDataAccessMediumConfidence"]})
  -> @graft.state(file_analysis, uiImportsDomainLogicDetected, {flattened["uiImportsDomainLogicDetected"]})
  -> @graft.state(file_analysis, uiImportsDomainLogicHighConfidence, {flattened["uiImportsDomainLogicHighConfidence"]})
  -> @graft.state(file_analysis, uiImportsDomainLogicMediumConfidence, {flattened["uiImportsDomainLogicMediumConfidence"]})
  -> @graft.state(file_analysis, productionImportsTestSupportDetected, {flattened["productionImportsTestSupportDetected"]})
  -> @graft.state(file_analysis, productionImportsTestSupportHighConfidence, {flattened["productionImportsTestSupportHighConfidence"]})
  -> @graft.state(file_analysis, productionImportsTestSupportMediumConfidence, {flattened["productionImportsTestSupportMediumConfidence"]})
  
  -> @graft.state(file_analysis, exportCount, {flattened["exportCount"]})
  -> @graft.state(file_analysis, namedExportCount, {flattened["namedExportCount"]})
  -> @graft.state(file_analysis, defaultExportCount, {flattened["defaultExportCount"]})
  -> @graft.state(file_analysis, functionExportCount, {flattened["functionExportCount"]})
  -> @graft.state(file_analysis, constantExportCount, {flattened["constantExportCount"]})
  -> @graft.state(file_analysis, typeExportCount, {flattened["typeExportCount"]})
  -> @graft.state(file_analysis, classExportCount, {flattened["classExportCount"]})
  -> @graft.state(file_analysis, componentExportCount, {flattened["componentExportCount"]})
  -> @graft.state(file_analysis, hookExportCount, {flattened["hookExportCount"]})
  -> @graft.state(file_analysis, predicateExportCount, {flattened["predicateExportCount"]})
  -> @graft.state(file_analysis, getterExportCount, {flattened["getterExportCount"]})
  -> @graft.state(file_analysis, builderExportCount, {flattened["builderExportCount"]})
  -> @graft.state(file_analysis, analyzerExportCount, {flattened["analyzerExportCount"]})
  -> @graft.state(file_analysis, handlerExportCount, {flattened["handlerExportCount"]})
  -> @graft.state(file_analysis, configExportCount, {flattened["configExportCount"]})
  -> @graft.state(file_analysis, reexportCount, {flattened["reexportCount"]})
  -> @graft.state(file_analysis, starReexportCount, {flattened["starReexportCount"]})
  -> @graft.state(file_analysis, exportResponsibilityRoleCount, {flattened["exportResponsibilityRoleCount"]})

  -> @graft.state(file_analysis, exportResponsibilitySpreadDetected, {flattened["exportResponsibilitySpreadDetected"]})
  -> @graft.state(file_analysis, mixedExportRolesDetected, {flattened["mixedExportRolesDetected"]})
  -> @graft.state(file_analysis, utilityGrabBagDetected, {flattened["utilityGrabBagDetected"]})
  -> @graft.state(file_analysis, barrelFileDetected, {flattened["barrelFileDetected"]})
  -> @graft.state(file_analysis, starReexportDetected, {flattened["starReexportDetected"]})

  -> @graft.state(file_analysis, blockCount, {flattened["blockCount"]})
  -> @graft.state(file_analysis, maxNestingDepth, {flattened["maxNestingDepth"]})
  -> @graft.state(file_analysis, longLines, {flattened["longLines"]})
  -> @graft.state(file_analysis, repetitionScore, {flattened["repetitionScore"]})
  -> @graft.state(file_analysis, complexityScore, {flattened["complexityScore"]})
  -> @graft.state(file_analysis, decisionKeywords, {flattened["decisionKeywords"]})
  -> @graft.state(file_analysis, loopCount, {flattened["loopCount"]})
  -> @graft.state(file_analysis, booleanOperators, {flattened["booleanOperators"]})
  -> @graft.state(file_analysis, tryCatchBlocks, {flattened["tryCatchBlocks"]})

  -> @graft.state(file_analysis, pathHasAppFolder, {flattened["pathHasAppFolder"]})
  -> @graft.state(file_analysis, pathHasPageFolder, {flattened["pathHasPageFolder"]})
  -> @graft.state(file_analysis, pathHasComponentFolder, {flattened["pathHasComponentFolder"]})
  -> @graft.state(file_analysis, pathHasModalFolder, {flattened["pathHasModalFolder"]})
  -> @graft.state(file_analysis, pathHasHookFolder, {flattened["pathHasHookFolder"]})
  -> @graft.state(file_analysis, pathHasServiceFolder, {flattened["pathHasServiceFolder"]})
  -> @graft.state(file_analysis, pathHasDomainFolder, {flattened["pathHasDomainFolder"]})
  -> @graft.state(file_analysis, pathHasUtilityFolder, {flattened["pathHasUtilityFolder"]})
  -> @graft.state(file_analysis, pathHasFeatureFolder, {flattened["pathHasFeatureFolder"]})
  -> @graft.state(file_analysis, pathHasStateFolder, {flattened["pathHasStateFolder"]})
  -> @graft.state(file_analysis, pathHasTestFolder, {flattened["pathHasTestFolder"]})
  -> @graft.state(file_analysis, pathHasStyleAssetFolder, {flattened["pathHasStyleAssetFolder"]})
  -> @graft.state(file_analysis, pathHasConfigurationFolder, {flattened["pathHasConfigurationFolder"]})

  -> @graft.state(file_analysis, fileNameIsAppRoot, {flattened["fileNameIsAppRoot"]})
  -> @graft.state(file_analysis, fileNameEndsWithPage, {flattened["fileNameEndsWithPage"]})
  -> @graft.state(file_analysis, fileNameEndsWithComponent, {flattened["fileNameEndsWithComponent"]})
  -> @graft.state(file_analysis, fileNameIsModal, {flattened["fileNameIsModal"]})
  -> @graft.state(file_analysis, fileNameStartsWithUse, {flattened["fileNameStartsWithUse"]})
  -> @graft.state(file_analysis, fileNameLooksService, {flattened["fileNameLooksService"]})
  -> @graft.state(file_analysis, fileNameLooksDomain, {flattened["fileNameLooksDomain"]})
  -> @graft.state(file_analysis, fileNameLooksUtility, {flattened["fileNameLooksUtility"]})
  -> @graft.state(file_analysis, fileNameLooksConfig, {flattened["fileNameLooksConfig"]})

  -> @graft.state(file_analysis, fileExtensionIsJsxLike, {flattened["fileExtensionIsJsxLike"]})
  -> @graft.state(file_analysis, fileExtensionIsStyleLike, {flattened["fileExtensionIsStyleLike"]})
  -> @graft.state(file_analysis, fileExtensionIsScriptLike, {flattened["fileExtensionIsScriptLike"]})
  -> @graft.state(file_analysis, noPathRoleDetected, {flattened["noPathRoleDetected"]})

  -> @graft.state(file_analysis, uiRenderingDomainEvidence, {flattened["uiRenderingDomainEvidence"]})
  -> @graft.state(file_analysis, stateBehaviorDomainEvidence, {flattened["stateBehaviorDomainEvidence"]})
  -> @graft.state(file_analysis, domainLogicDomainEvidence, {flattened["domainLogicDomainEvidence"]})
  -> @graft.state(file_analysis, dataAccessDomainEvidence, {flattened["dataAccessDomainEvidence"]})
  -> @graft.state(file_analysis, configurationDomainEvidence, {flattened["configurationDomainEvidence"]})
  -> @graft.state(file_analysis, publicApiDomainEvidence, {flattened["publicApiDomainEvidence"]})
  -> @graft.state(file_analysis, testSupportDomainEvidence, {flattened["testSupportDomainEvidence"]})
  -> @graft.state(file_analysis, activeResponsibilityDomainCount, {flattened["activeResponsibilityDomainCount"]})
  -> @graft.state(file_analysis, hasDominantResponsibilityDomain, {flattened["hasDominantResponsibilityDomain"]})
  -> @graft.state(file_analysis, domainCohesionLikely, {flattened["domainCohesionLikely"]})
  -> @graft.state(file_analysis, multiDomainMixingLikely, {flattened["multiDomainMixingLikely"]})
"""
def tat_bool(value: bool) -> str:
    return "true" if value else "false"

def signal_confidence_level(
    signal_confidence: Dict[str, Dict[str, Any]],
    signal: str,
) -> str:
    return signal_confidence.get(signal, {}).get("level", "low")

def flatten_metrics(metrics: Dict[str, Any]) -> Dict[str, Any]:
    complexity = metrics.get("complexity", {})
    repetition = metrics.get("repetition", {})

    function_profile = metrics.get("functionProfile", {})
    function_categories = function_profile.get("categoryCounts", {})

    constant_profile = metrics.get("constantProfile", {})
    constant_categories = constant_profile.get("categoryCounts", {})

    import_profile = metrics.get("importProfile", {})
    import_categories = import_profile.get("categoryCounts", {})
    import_signals = set(import_profile.get("signals", []))
    import_signal_confidence = import_profile.get("signalConfidence", {})

    export_profile = metrics.get("exportProfile", {})
    export_signals = set(export_profile.get("signals", []))

    file_context = metrics.get("fileContext", {})
    domain_cohesion = metrics.get("domainCohesion", {})
    domain_evidence = domain_cohesion.get("evidence", {})

    return {
        "lineCount": metrics.get("lineCount", 0),
        "tokenEstimate": metrics.get("tokenEstimate", 0),
        "functionCount": metrics.get("functionCount", 0),
        "constantCount": metrics.get("constantCount", 0),

        "hookFunctionCount": function_profile.get("hookCount", 0),
        "componentFunctionCount": function_profile.get("componentCount", 0),
        "getterFunctionCount": function_categories.get("getters", 0),
        "setterFunctionCount": function_categories.get("setters", 0),
        "predicateFunctionCount": function_categories.get("predicates", 0),
        "analyzerFunctionCount": function_categories.get("analyzers", 0),
        "handlerFunctionCount": function_categories.get("handlers", 0),
        "builderFunctionCount": function_categories.get("builders", 0),
        "transformerFunctionCount": function_categories.get("transformers", 0),
        "ioFunctionCount": function_categories.get("io", 0),
        "orchestratorFunctionCount": function_categories.get("orchestrators", 0),

        "booleanConstantCount": constant_profile.get("booleanLikeCount", 0),
        "thresholdConstantCount": constant_profile.get("thresholdLikeCount", 0),
        "flagConstantCount": constant_profile.get("flagLikeCount", 0),
        "decisionRuleConstantCount": constant_profile.get("decisionRuleLikeCount", 0),
        "predicateConstantCount": constant_categories.get("predicates", 0),
        "capabilityConstantCount": constant_categories.get("capabilities", 0),
        "requirementRuleConstantCount": constant_categories.get("requirementRules", 0),
        "featureFlagConstantCount": constant_categories.get("featureFlags", 0),
        "visibilityFlagConstantCount": constant_categories.get("visibilityFlags", 0),
        "stateFlagConstantCount": constant_categories.get("stateFlags", 0),
        "validationFlagConstantCount": constant_categories.get("validationFlags", 0),

        "functionExpressionConstantCount": constant_profile.get("functionExpressionCount", 0),
        "entityAliasConstantCount": constant_profile.get("entityAliasCount", 0),
        "collectionAliasConstantCount": constant_profile.get("collectionAliasCount", 0),
        "derivedValueConstantCount": constant_profile.get("derivedValueCount", 0),
        "derivedNumericValueConstantCount": constant_profile.get("derivedNumericValueCount", 0),
        "booleanDerivedValueConstantCount": constant_profile.get("booleanDerivedValueCount", 0),
        "actionGuardConstantCount": constant_profile.get("actionGuardCandidateCount", 0),
        "renderDataProjectionConstantCount": constant_profile.get("renderDataProjectionCount", 0),

        "importCount": import_profile.get("total", 0),
        "externalImportCount": import_profile.get("externalCount", 0),
        "localImportCount": import_profile.get("localCount", 0),
        "relativeImportCount": import_profile.get("relativeCount", 0),
        "deepRelativeImportCount": import_profile.get("deepRelativeCount", 0),
        "internalAliasImportCount": import_profile.get("internalAliasCount", 0),
        "sideEffectImportCount": import_profile.get("sideEffectCount", 0),
        "wideNamedImportCount": import_profile.get("wideNamedImportCount", 0),
        "importResponsibilityCategoryCount": import_profile.get("responsibilityCategoryCount", 0),

        "uiRenderingImportCount": import_categories.get("ui_rendering", 0),
        "stateBehaviorImportCount": import_categories.get("state_behavior", 0),
        "generalUtilityImportCount": import_categories.get("general_utility", 0),
        "domainLogicImportCount": import_categories.get("domain_logic", 0),
        "dataAccessImportCount": import_categories.get("data_access", 0),
        "configurationImportCount": import_categories.get("configuration", 0),
        "typeContractImportCount": import_categories.get("type_contract", 0),
        "featureModuleImportCount": import_categories.get("feature_module", 0),
        "testSupportImportCount": import_categories.get("test_support", 0),
        "assetDependencyImportCount": import_categories.get("asset_dependency", 0),
        "infrastructureImportCount": import_categories.get("infrastructure", 0),
        "unknownImportCount": import_categories.get("unknown", 0),

        "importResponsibilitySpreadDetected": tat_bool("import_responsibility_spread" in import_signals),
        "uiImportsDataAccessDetected": tat_bool("ui_imports_data_access" in import_signals),
        "uiImportsDataAccessHighConfidence": tat_bool(signal_confidence_level(import_signal_confidence, "ui_imports_data_access") == "high"),
        "uiImportsDataAccessMediumConfidence": tat_bool(signal_confidence_level(import_signal_confidence, "ui_imports_data_access") == "medium"),
        "uiImportsDomainLogicDetected": tat_bool("ui_imports_domain_logic" in import_signals),
        "uiImportsDomainLogicHighConfidence": tat_bool(signal_confidence_level(import_signal_confidence, "ui_imports_domain_logic") == "high"),
        "uiImportsDomainLogicMediumConfidence": tat_bool(signal_confidence_level(import_signal_confidence, "ui_imports_domain_logic") == "medium"),
        "productionImportsTestSupportDetected": tat_bool("production_imports_test_support" in import_signals),
        "productionImportsTestSupportHighConfidence": tat_bool(signal_confidence_level(import_signal_confidence, "production_imports_test_support") == "high"),
        "productionImportsTestSupportMediumConfidence": tat_bool(signal_confidence_level(import_signal_confidence, "production_imports_test_support") == "medium"),
        
        "exportCount": export_profile.get("total", 0),
        "namedExportCount": export_profile.get("namedCount", 0),
        "defaultExportCount": export_profile.get("defaultCount", 0),
        "functionExportCount": export_profile.get("functionExportCount", 0),
        "constantExportCount": export_profile.get("constantExportCount", 0),
        "typeExportCount": export_profile.get("typeExportCount", 0),
        "classExportCount": export_profile.get("classExportCount", 0),
        "componentExportCount": export_profile.get("componentExportCount", 0),
        "hookExportCount": export_profile.get("hookExportCount", 0),
        "predicateExportCount": export_profile.get("predicateExportCount", 0),
        "getterExportCount": export_profile.get("getterExportCount", 0),
        "builderExportCount": export_profile.get("builderExportCount", 0),
        "analyzerExportCount": export_profile.get("analyzerExportCount", 0),
        "handlerExportCount": export_profile.get("handlerExportCount", 0),
        "configExportCount": export_profile.get("configExportCount", 0),
        "reexportCount": export_profile.get("reexportCount", 0),
        "starReexportCount": export_profile.get("starReexportCount", 0),
        "exportResponsibilityRoleCount": export_profile.get("responsibilityRoleCount", 0),

        "exportResponsibilitySpreadDetected": tat_bool("export_responsibility_spread" in export_signals),
        "mixedExportRolesDetected": tat_bool("mixed_export_roles" in export_signals),
        "utilityGrabBagDetected": tat_bool("utility_grab_bag" in export_signals),
        "barrelFileDetected": tat_bool("barrel_file" in export_signals),
        "starReexportDetected": tat_bool("star_reexport_present" in export_signals),

        "blockCount": metrics.get("blockCount", 0),
        "maxNestingDepth": metrics.get("maxNestingDepth", 0),
        "longLines": metrics.get("longLines", 0),
        "repetitionScore": repetition.get("repetitionScore", 0),
        "complexityScore": complexity.get("complexityScore", 0),
        "decisionKeywords": complexity.get("decisionKeywords", 0),
        "loopCount": complexity.get("loopCount", 0),
        "booleanOperators": complexity.get("booleanOperators", 0),
        "tryCatchBlocks": complexity.get("tryCatchBlocks", 0),

        "pathHasAppFolder": tat_bool(file_context.get("pathHasAppFolder", False)),
        "pathHasPageFolder": tat_bool(file_context.get("pathHasPageFolder", False)),
        "pathHasComponentFolder": tat_bool(file_context.get("pathHasComponentFolder", False)),
        "pathHasModalFolder": tat_bool(file_context.get("pathHasModalFolder", False)),
        "pathHasHookFolder": tat_bool(file_context.get("pathHasHookFolder", False)),
        "pathHasServiceFolder": tat_bool(file_context.get("pathHasServiceFolder", False)),
        "pathHasDomainFolder": tat_bool(file_context.get("pathHasDomainFolder", False)),
        "pathHasUtilityFolder": tat_bool(file_context.get("pathHasUtilityFolder", False)),
        "pathHasFeatureFolder": tat_bool(file_context.get("pathHasFeatureFolder", False)),
        "pathHasStateFolder": tat_bool(file_context.get("pathHasStateFolder", False)),
        "pathHasTestFolder": tat_bool(file_context.get("pathHasTestFolder", False)),
        "pathHasStyleAssetFolder": tat_bool(file_context.get("pathHasStyleAssetFolder", False)),
        "pathHasConfigurationFolder": tat_bool(file_context.get("pathHasConfigurationFolder", False)),

        "fileNameIsAppRoot": tat_bool(file_context.get("fileNameIsAppRoot", False)),
        "fileNameEndsWithPage": tat_bool(file_context.get("fileNameEndsWithPage", False)),
        "fileNameEndsWithComponent": tat_bool(file_context.get("fileNameEndsWithComponent", False)),
        "fileNameIsModal": tat_bool(file_context.get("fileNameIsModal", False)),
        "fileNameStartsWithUse": tat_bool(file_context.get("fileNameStartsWithUse", False)),
        "fileNameLooksService": tat_bool(file_context.get("fileNameLooksService", False)),
        "fileNameLooksDomain": tat_bool(file_context.get("fileNameLooksDomain", False)),
        "fileNameLooksUtility": tat_bool(file_context.get("fileNameLooksUtility", False)),
        "fileNameLooksConfig": tat_bool(file_context.get("fileNameLooksConfig", False)),

        "fileExtensionIsJsxLike": tat_bool(file_context.get("fileExtensionIsJsxLike", False)),
        "fileExtensionIsStyleLike": tat_bool(file_context.get("fileExtensionIsStyleLike", False)),
        "fileExtensionIsScriptLike": tat_bool(file_context.get("fileExtensionIsScriptLike", False)),
        "noPathRoleDetected": tat_bool(file_context.get("noPathRoleDetected", False)),

        "uiRenderingDomainEvidence": domain_evidence.get("ui_rendering", 0),
        "stateBehaviorDomainEvidence": domain_evidence.get("state_behavior", 0),
        "domainLogicDomainEvidence": domain_evidence.get("domain_logic", 0),
        "dataAccessDomainEvidence": domain_evidence.get("data_access", 0),
        "configurationDomainEvidence": domain_evidence.get("configuration", 0),
        "publicApiDomainEvidence": domain_evidence.get("public_api", 0),
        "testSupportDomainEvidence": domain_evidence.get("test_support", 0),
        "activeResponsibilityDomainCount": domain_cohesion.get("activeResponsibilityDomainCount", 0),
        "hasDominantResponsibilityDomain": tat_bool(domain_cohesion.get("hasDominantResponsibilityDomain", False)),
        "domainCohesionLikely": tat_bool(domain_cohesion.get("domainCohesionLikely", False)),
        "multiDomainMixingLikely": tat_bool(domain_cohesion.get("multiDomainMixingLikely", False)),
    }
    

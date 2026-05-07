import re
from typing import Any, Dict, List


def analyze_code_for_prompt_chain(filename: str, code: str, metrics: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "fileType": detect_file_type(filename, code, metrics),
        "complexityLevel": detect_complexity_level(metrics),
        "detectedPatterns": detect_patterns(code, metrics),
        "riskSignals": detect_risk_signals(code, metrics),
        "suggestedPromptTargets": detect_prompt_targets(code, metrics),
    }


def detect_file_type(filename: str, code: str, metrics: Dict[str, Any]) -> str:
    lower = filename.lower()
    function_profile = metrics.get("functionProfile", {})

    if function_profile.get("componentCount", 0) >= 1:
        return "component"

    if lower.endswith((".jsx", ".tsx")):
        return "component"

    if function_profile.get("hookCount", 0) >= 1:
        return "hook_or_react_logic"

    if "Service" in code or "service" in lower:
        return "service"

    if lower.endswith((".js", ".ts")):
        return "utility"

    if lower.endswith(".py"):
        return "python_module"

    return "unknown"


def detect_complexity_level(metrics: Dict[str, Any]) -> str:
    complexity = metrics.get("complexity", {}).get("complexityScore", 0)
    nesting = metrics.get("maxNestingDepth", 0)
    function_count = metrics.get("functionCount", 0)
    constant_profile = metrics.get("constantProfile", {})
    boolean_constant_count = constant_profile.get("booleanLikeCount", 0)
    action_guard_count = constant_profile.get("actionGuardCandidateCount", 0)

    if (
        complexity >= 70
        or nesting >= 5
        or function_count > 20
        or boolean_constant_count > 16
        or action_guard_count > 6
    ):
        return "high"

    if (
        complexity >= 35
        or nesting >= 3
        or function_count > 10
        or boolean_constant_count > 8
        or action_guard_count > 3
    ):
        return "medium"

    return "low"


def detect_patterns(code: str, metrics: Dict[str, Any]) -> List[str]:
    patterns = []

    repetition_score = metrics.get("repetition", {}).get("repetitionScore", 0)

    function_profile = metrics.get("functionProfile", {})
    function_categories = function_profile.get("categoryCounts", {})

    constant_profile = metrics.get("constantProfile", {})
    constant_categories = constant_profile.get("categoryCounts", {})

    if repetition_score > 25:
        patterns.append("repeated_logic")

    if has_pipeline_shape(code):
        patterns.append("repeated_pipeline")

    if re.search(r"\b(fetch|axios|async|await)\b", code):
        patterns.append("async_api_usage")

    if metrics.get("functionCount", 0) > 12:
        patterns.append("many_functions")

    if metrics.get("constantCount", 0) > 16:
        patterns.append("many_constants")

    if function_profile.get("hookCount", 0) >= 4:
        patterns.append("hook_heavy")

    if function_profile.get("componentCount", 0) >= 4:
        patterns.append("component_heavy")

    if function_categories.get("getters", 0) >= 4:
        patterns.append("getter_heavy")

    if function_categories.get("predicates", 0) >= 4:
        patterns.append("predicate_heavy")

    if function_categories.get("analyzers", 0) >= 3:
        patterns.append("analyzer_heavy")

    if function_categories.get("handlers", 0) >= 4:
        patterns.append("handler_heavy")

    if constant_profile.get("booleanLikeCount", 0) >= 8:
        patterns.append("boolean_constant_heavy")

    if constant_profile.get("thresholdLikeCount", 0) >= 4:
        patterns.append("threshold_constant_heavy")

    if constant_profile.get("flagLikeCount", 0) >= 6:
        patterns.append("flag_constant_heavy")

    if constant_profile.get("decisionRuleLikeCount", 0) >= 5:
        patterns.append("decision_rule_constant_heavy")

    if constant_categories.get("predicates", 0) >= 4:
        patterns.append("predicate_constant_heavy")

    if constant_categories.get("capabilities", 0) >= 2:
        patterns.append("capability_constant_heavy")

    if constant_categories.get("visibilityFlags", 0) >= 3:
        patterns.append("visibility_flag_heavy")

    if constant_categories.get("stateFlags", 0) >= 4:
        patterns.append("state_flag_heavy")

    if constant_profile.get("renderDataProjectionCount", 0) >= 4:
        patterns.append("render_data_projection")

    if constant_profile.get("entityAliasCount", 0) >= 3:
        patterns.append("entity_alias_heavy")

    if constant_profile.get("collectionAliasCount", 0) >= 3:
        patterns.append("collection_alias_heavy")

    if constant_profile.get("derivedValueCount", 0) >= 5:
        patterns.append("derived_value_heavy")

    if constant_profile.get("booleanDerivedValueCount", 0) >= 4:
        patterns.append("boolean_expression_constant_heavy")

    if constant_profile.get("actionGuardCandidateCount", 0) >= 3:
        patterns.append("action_guard_heavy")

    if constant_profile.get("functionExpressionCount", 0) >= 3:
        patterns.append("function_expression_constant_heavy")

    if (
        constant_profile.get("renderDataProjectionCount", 0) >= 6
        and constant_profile.get("actionGuardCandidateCount", 0) >= 2
    ):
        patterns.append("view_model_pressure")
        
    import_profile = metrics.get("importProfile", {})
    export_profile = metrics.get("exportProfile", {})

    for signal in import_profile.get("signals", []):
        patterns.append(signal)

    for signal in export_profile.get("signals", []):
        patterns.append(signal)

    if import_profile.get("responsibilityCategoryCount", 0) >= 4:
        patterns.append("import_responsibility_spread")

    if export_profile.get("responsibilityRoleCount", 0) >= 4:
        patterns.append("export_responsibility_spread")

    dominant_function_category = function_profile.get("dominantCategory")
    if dominant_function_category:
        patterns.append(f"function_profile_{dominant_function_category}")

    dominant_function_verb = function_profile.get("dominantVerb")
    if dominant_function_verb:
        patterns.append(f"function_verb_{dominant_function_verb}")

    dominant_constant_category = constant_profile.get("dominantCategory")
    if dominant_constant_category:
        patterns.append(f"constant_profile_{dominant_constant_category}")

    dominant_constant_prefix = constant_profile.get("dominantPrefix")
    if dominant_constant_prefix:
        patterns.append(f"constant_prefix_{dominant_constant_prefix}")

    dominant_constant_role = constant_profile.get("dominantRole")
    if dominant_constant_role:
        patterns.append(f"constant_role_{dominant_constant_role}")

    return unique(patterns)


def detect_risk_signals(code: str, metrics: Dict[str, Any]) -> List[str]:
    risks = []

    function_profile = metrics.get("functionProfile", {})
    function_categories = function_profile.get("categoryCounts", {})

    constant_profile = metrics.get("constantProfile", {})
    constant_categories = constant_profile.get("categoryCounts", {})

    if re.search(r"\b(threshold|score|median|average|duration|confidence|clarity)\b", code, re.I):
        risks.append("algorithmic_behavior")

    if re.search(r"\b[A-Z0-9_]+_(THRESHOLD|LIMIT|MIN|MAX|RATIO|DURATION)\b", code):
        risks.append("threshold_sensitive")

    if re.search(r"\b(useState|set[A-Z]|state|reducer|dispatch)\b", code):
        risks.append("stateful_logic")

    if function_profile.get("hookCount", 0) >= 4:
        risks.append("hook_clustering")

    if function_profile.get("componentCount", 0) >= 4:
        risks.append("component_clustering")

    if function_categories.get("analyzers", 0) >= 3:
        risks.append("analysis_responsibility")

    if constant_profile.get("booleanLikeCount", 0) >= 8:
        risks.append("boolean_rule_density")

    if constant_profile.get("thresholdLikeCount", 0) >= 4:
        risks.append("threshold_rule_density")

    if constant_profile.get("flagLikeCount", 0) >= 6:
        risks.append("state_flag_density")

    if constant_categories.get("visibilityFlags", 0) >= 3:
        risks.append("ui_visibility_rule_density")

    if constant_profile.get("actionGuardCandidateCount", 0) >= 3:
        risks.append("action_guard_density")

    if constant_profile.get("renderDataProjectionCount", 0) >= 6:
        risks.append("view_model_density")

    if constant_profile.get("functionExpressionCount", 0) >= 3:
        risks.append("function_expression_density")

    import_profile = metrics.get("importProfile", {})
    export_profile = metrics.get("exportProfile", {})
    import_signals = set(import_profile.get("signals", []))
    export_signals = set(export_profile.get("signals", []))

    if "import_responsibility_spread" in import_signals:
        risks.append("import_boundary_pressure")

    if "ui_imports_data_access" in import_signals:
        risks.append("ui_data_coupling")

    if "ui_imports_domain_logic" in import_signals:
        risks.append("ui_domain_coupling")

    if "production_imports_test_support" in import_signals:
        risks.append("production_test_dependency")

    if "export_responsibility_spread" in export_signals:
        risks.append("export_surface_pressure")

    if "utility_grab_bag" in export_signals:
        risks.append("utility_surface_sprawl")

    if "barrel_file" in export_signals or "star_reexport_present" in export_signals:
        risks.append("public_api_gateway")
        
    return unique(risks)


def detect_prompt_targets(code: str, metrics: Dict[str, Any]) -> List[str]:
    targets = []

    function_profile = metrics.get("functionProfile", {})
    function_categories = function_profile.get("categoryCounts", {})

    constant_profile = metrics.get("constantProfile", {})
    constant_categories = constant_profile.get("categoryCounts", {})

    if has_pipeline_shape(code):
        targets.append("pipeline_refactor")

    if metrics.get("functionCount", 0) > 12:
        targets.append("module_extraction")

    if function_profile.get("hookCount", 0) >= 4:
        targets.append("hook_extraction")

    if function_profile.get("componentCount", 0) >= 4:
        targets.append("component_extraction")

    if function_categories.get("analyzers", 0) >= 3:
        targets.append("analyzer_module_extraction")

    if function_categories.get("handlers", 0) >= 4:
        targets.append("handler_extraction")

    if constant_profile.get("booleanLikeCount", 0) >= 8:
        targets.append("boolean_rule_extraction")

    if constant_profile.get("thresholdLikeCount", 0) >= 4:
        targets.append("threshold_config_extraction")

    if constant_profile.get("flagLikeCount", 0) >= 6:
        targets.append("state_flag_grouping")

    if constant_profile.get("decisionRuleLikeCount", 0) >= 5:
        targets.append("decision_rule_extraction")

    if constant_categories.get("visibilityFlags", 0) >= 3:
        targets.append("visibility_rule_extraction")

    if constant_profile.get("renderDataProjectionCount", 0) >= 6:
        targets.append("view_model_extraction")

    if constant_profile.get("actionGuardCandidateCount", 0) >= 3:
        targets.append("action_guard_extraction")

    if constant_profile.get("functionExpressionCount", 0) >= 3:
        targets.append("function_expression_review")

    import_profile = metrics.get("importProfile", {})
    export_profile = metrics.get("exportProfile", {})
    import_signals = set(import_profile.get("signals", []))
    export_signals = set(export_profile.get("signals", []))

    if "import_responsibility_spread" in import_signals:
        targets.append("import_boundary_review")

    if "ui_imports_data_access" in import_signals:
        targets.append("ui_data_boundary_review")

    if "production_imports_test_support" in import_signals:
        targets.append("production_dependency_review")

    if "export_responsibility_spread" in export_signals:
        targets.append("export_surface_review")

    if "utility_grab_bag" in export_signals:
        targets.append("utility_grab_bag_refactor")

    if "barrel_file" in export_signals or "star_reexport_present" in export_signals:
        targets.append("barrel_api_review")

    if metrics.get("maxNestingDepth", 0) > 4:
        targets.append("complexity_reduction")

    if metrics.get("repetition", {}).get("repetitionScore", 0) > 25:
        targets.append("duplication_reduction")

    return unique(targets)

def has_pipeline_shape(code: str) -> bool:
    pipeline_words = [
        "build",
        "filter",
        "split",
        "merge",
        "recover",
        "transform",
        "normalize",
        "validate",
        "analyze",
        "detect",
        "parse",
        "run",
    ]

    hits = sum(1 for word in pipeline_words if re.search(rf"\b{word}", code, re.I))
    return hits >= 3


def unique(items: List[str]) -> List[str]:
    result = []
    seen = set()

    for item in items:
        if item in seen:
            continue

        result.append(item)
        seen.add(item)

    return result
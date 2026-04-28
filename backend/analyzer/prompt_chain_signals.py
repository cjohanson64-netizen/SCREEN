import re
from typing import Any, Dict, List


def analyze_code_for_prompt_chain(filename: str, code: str, metrics: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "fileType": detect_file_type(filename, code),
        "complexityLevel": detect_complexity_level(metrics),
        "detectedPatterns": detect_patterns(code, metrics),
        "riskSignals": detect_risk_signals(code),
        "suggestedPromptTargets": detect_prompt_targets(code, metrics),
    }


def detect_file_type(filename: str, code: str) -> str:
    lower = filename.lower()

    if lower.endswith((".jsx", ".tsx")):
        return "component"

    if "Service" in code or "service" in lower:
        return "service"

    if lower.endswith((".js", ".ts")):
        return "utility"

    return "unknown"


def detect_complexity_level(metrics: Dict[str, Any]) -> str:
    complexity = metrics.get("complexity", {}).get("complexityScore", 0)
    nesting = metrics.get("maxNestingDepth", 0)

    if complexity >= 70 or nesting >= 5:
        return "high"

    if complexity >= 35 or nesting >= 3:
        return "medium"

    return "low"


def detect_patterns(code: str, metrics: Dict[str, Any]) -> List[str]:
    patterns = []

    repetition_score = metrics.get("repetition", {}).get("repetitionScore", 0)

    if repetition_score > 25:
        patterns.append("repeated_logic")

    if has_pipeline_shape(code):
        patterns.append("repeated_pipeline")

    if re.search(r"\b(fetch|axios|async|await)\b", code):
        patterns.append("async_api_usage")

    if metrics.get("functionCount", 0) > 12:
        patterns.append("many_functions")

    return patterns


def detect_risk_signals(code: str) -> List[str]:
    risks = []

    if re.search(r"\b(threshold|score|median|average|duration|confidence|clarity)\b", code, re.I):
        risks.append("algorithmic_behavior")

    if re.search(r"\b[A-Z0-9_]+_(THRESHOLD|LIMIT|MIN|MAX|RATIO|DURATION)\b", code):
        risks.append("threshold_sensitive")

    if re.search(r"\b(useState|set[A-Z]|state|reducer|dispatch)\b", code):
        risks.append("stateful_logic")

    return risks


def detect_prompt_targets(code: str, metrics: Dict[str, Any]) -> List[str]:
    targets = []

    if has_pipeline_shape(code):
        targets.append("pipeline_refactor")

    if metrics.get("functionCount", 0) > 12:
        targets.append("module_extraction")

    if metrics.get("maxNestingDepth", 0) > 4:
        targets.append("complexity_reduction")

    if metrics.get("repetition", {}).get("repetitionScore", 0) > 25:
        targets.append("duplication_reduction")

    return targets


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
    ]

    hits = sum(1 for word in pipeline_words if re.search(rf"\b{word}", code, re.I))
    return hits >= 3
import re
from pathlib import Path

from analyzer.function_profile import build_function_profile
from analyzer.constant_profile import build_constant_profile
from analyzer.import_export_profile import build_import_export_profile

BRANCH_RE = re.compile(
    r"\b(if|else if|for|while|switch|case|catch|try|except|elif)\b"
)


def calculate_file_metrics(file_path: str, project_root: str) -> dict:
    absolute_path = Path(project_root) / file_path

    if not absolute_path.exists():
        return empty_metrics()

    content = absolute_path.read_text(encoding="utf-8", errors="ignore")
    lines = content.splitlines()

    line_count = len(lines)
    function_profile = build_function_profile(content)
    constant_profile = build_constant_profile(content)
    import_export_profile = build_import_export_profile(content, file_path)
    import_profile = import_export_profile["importProfile"]
    export_profile = import_export_profile["exportProfile"]
    function_count = function_profile["total"]
    constant_count = constant_profile["total"]
    branch_count = len(BRANCH_RE.findall(content))

    complexity = round(
        (line_count * 0.3)
        + (function_count * 2)
        + (constant_count * 1)
        + (branch_count * 1.5),
        2,
    )

    return {
        "lineCount": line_count,
        "functionCount": function_count,
        "functionProfile": function_profile,
        "constantCount": constant_count,
        "constantProfile": constant_profile,
        "branchCount": branch_count,
        "complexity": complexity,
        "importProfile": import_profile,
        "exportProfile": export_profile,
        "semanticImportCount": import_profile["total"],
        "semanticExportCount": export_profile["total"],
    }


def empty_metrics() -> dict:
    return {
        "lineCount": 0,
        "functionCount": 0,
        "functionProfile": {
            "total": 0,
            "namedCount": 0,
            "anonymousCount": 0,
            "componentCount": 0,
            "hookCount": 0,
            "verbCounts": {},
            "categoryCounts": {},
            "topVerbs": [],
            "topCategories": [],
            "componentNames": [],
            "hookNames": [],
            "functionNames": [],
            "dominantCategory": None,
            "dominantVerb": None,
        },
        "constantCount": 0,
        "constantProfile": {
            "total": 0,
            "namedCount": 0,
            "destructuredCount": 0,
            "booleanLikeCount": 0,
            "thresholdLikeCount": 0,
            "flagLikeCount": 0,
            "decisionRuleLikeCount": 0,
            "prefixCounts": {},
            "categoryCounts": {},
            "topPrefixes": [],
            "topCategories": [],
            "constantNames": [],
            "booleanLikeNames": [],
            "thresholdNames": [],
            "flagLikeNames": [],
            "decisionRuleNames": [],
            "dominantCategory": None,
            "dominantPrefix": None,
        },
        "branchCount": 0,
        "complexity": 0,
        "importProfile": empty_import_profile(),
        "exportProfile": empty_export_profile(),
        "semanticImportCount": 0,
        "semanticExportCount": 0,
    }


def calculate_risk_score(complexity: float, fan_in: int, fan_out: int) -> float:
    return round(
        (complexity * 0.5)
        + (fan_out * 2)
        + (fan_in * 3),
        2,
    )


def get_risk_level(risk_score: float) -> str:
    if risk_score >= 70:
        return "high"

    if risk_score >= 30:
        return "medium"

    return "low"

def empty_import_profile() -> dict:
    return {
        "total": 0,
        "externalCount": 0,
        "localCount": 0,
        "relativeCount": 0,
        "deepRelativeCount": 0,
        "internalAliasCount": 0,
        "sideEffectCount": 0,
        "wideNamedImportCount": 0,
        "categoryCounts": {},
        "pathKindCounts": {},
        "folderCounts": {},
        "topCategories": [],
        "topFolders": [],
        "responsibilityCategoryCount": 0,
        "importedFolders": [],
        "imports": [],
        "signals": [],
    }


def empty_export_profile() -> dict:
    return {
        "total": 0,
        "namedCount": 0,
        "defaultCount": 0,
        "functionExportCount": 0,
        "constantExportCount": 0,
        "typeExportCount": 0,
        "classExportCount": 0,
        "componentExportCount": 0,
        "hookExportCount": 0,
        "predicateExportCount": 0,
        "getterExportCount": 0,
        "builderExportCount": 0,
        "analyzerExportCount": 0,
        "handlerExportCount": 0,
        "configExportCount": 0,
        "reexportCount": 0,
        "starReexportCount": 0,
        "kindCounts": {},
        "roleCounts": {},
        "topKinds": [],
        "topRoles": [],
        "responsibilityRoleCount": 0,
        "exports": [],
        "signals": [],
    }
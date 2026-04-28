import re
from pathlib import Path


FUNCTION_RE = re.compile(
    r"\b(function|def|class|const|let|var|public|private|protected|func)\b"
)

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
    function_count = len(FUNCTION_RE.findall(content))
    branch_count = len(BRANCH_RE.findall(content))

    complexity = round(
        (line_count * 0.3)
        + (function_count * 2)
        + (branch_count * 1.5),
        2,
    )

    return {
        "lineCount": line_count,
        "functionCount": function_count,
        "branchCount": branch_count,
        "complexity": complexity,
    }


def empty_metrics() -> dict:
    return {
        "lineCount": 0,
        "functionCount": 0,
        "branchCount": 0,
        "complexity": 0,
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
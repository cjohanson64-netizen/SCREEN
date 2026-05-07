# backend/analyzer/complexity.py

import re
from typing import Any, Dict


def analyze_complexity(code: str) -> Dict[str, Any]:
    decision_keywords = count_decision_keywords(code)
    boolean_operators = count_boolean_operators(code)
    try_catch_blocks = count_try_catch_blocks(code)
    loop_count = count_loops(code)

    complexity_score = min(
        decision_keywords * 3
        + boolean_operators * 2
        + try_catch_blocks * 4
        + loop_count * 3,
        100,
    )

    return {
        "decisionKeywords": decision_keywords,
        "booleanOperators": boolean_operators,
        "tryCatchBlocks": try_catch_blocks,
        "loopCount": loop_count,
        "complexityScore": complexity_score,
    }


def count_decision_keywords(code: str) -> int:
    patterns = [
        r"\bif\b",
        r"\belse if\b",
        r"\belif\b",
        r"\bswitch\b",
        r"\bcase\b",
        r"\bmatch\b",
    ]

    return sum(len(re.findall(pattern, code)) for pattern in patterns)


def count_boolean_operators(code: str) -> int:
    patterns = [
        r"&&",
        r"\|\|",
        r"\band\b",
        r"\bor\b",
    ]

    return sum(len(re.findall(pattern, code)) for pattern in patterns)


def count_try_catch_blocks(code: str) -> int:
    patterns = [
        r"\btry\b",
        r"\bcatch\b",
        r"\bexcept\b",
    ]

    return sum(len(re.findall(pattern, code)) for pattern in patterns)


def count_loops(code: str) -> int:
    patterns = [
        r"\bfor\b",
        r"\bwhile\b",
        r"\.map\(",
        r"\.filter\(",
        r"\.reduce\(",
    ]

    return sum(len(re.findall(pattern, code)) for pattern in patterns)
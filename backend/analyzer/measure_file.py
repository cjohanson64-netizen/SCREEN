# backend/analyzer/measure_file.py

import re
from typing import Dict, Any
from analyzer.detect_repetition import detect_repetition
from analyzer.complexity import analyze_complexity
from analyzer.detect_blocks import detect_blocks



def measure_file(code: str) -> Dict[str, Any]:
    lines = code.split("\n")

    total_lines = len(lines)
    empty_lines = sum(1 for l in lines if not l.strip())
    comment_lines = sum(1 for l in lines if is_comment(l))
    code_lines = total_lines - empty_lines - comment_lines

    avg_line_length = (
        sum(len(l) for l in lines) / total_lines if total_lines > 0 else 0
    )

    max_line_length = max((len(l) for l in lines), default=0)

    repetition = detect_repetition(code)
    complexity = analyze_complexity(code)
    block_analysis = detect_blocks(code)

    return {
        "lineCount": total_lines,
        "codeLines": code_lines,
        "emptyLines": empty_lines,
        "commentLines": comment_lines,
        "avgLineLength": round(avg_line_length, 2),
        "maxLineLength": max_line_length,
        "longLines": count_long_lines(lines),
        "functionCount": count_functions(code),
        "blockCount": block_analysis["blockCount"],
        "maxNestingDepth": estimate_max_depth(code),
        "importCount": count_imports(code),
        "tokenEstimate": estimate_tokens(code),
        "repetition": repetition,
        "complexity": complexity,
        "blockAnalysis": block_analysis,
    }


# -----------------------------
# Helpers
# -----------------------------

def is_comment(line: str) -> bool:
    stripped = line.strip()
    return (
        stripped.startswith("//")
        or stripped.startswith("#")
        or stripped.startswith("/*")
        or stripped.startswith("*")
    )


def count_long_lines(lines, threshold: int = 120) -> int:
    return sum(1 for l in lines if len(l) > threshold)


def count_functions(code: str) -> int:
    """
    Detects:
    - JS: function foo(), const x = () =>
    - Python: def foo():
    """
    patterns = [
        r"\bfunction\b",
        r"\bdef\b",
        r"=>",
    ]

    return sum(len(re.findall(p, code)) for p in patterns)


def count_blocks(code: str) -> int:
    """
    Rough block detection via curly braces (JS)
    """
    return code.count("{") + code.count("}")


def estimate_max_depth(code: str) -> int:
    """
    Simple brace-based nesting depth
    """
    depth = 0
    max_depth = 0

    for char in code:
        if char == "{":
            depth += 1
            max_depth = max(max_depth, depth)
        elif char == "}":
            depth -= 1

    return max_depth


def count_imports(code: str) -> int:
    patterns = [
        r"\bimport\b",
        r"\brequire\(",
        r"\bfrom .* import\b",
    ]

    return sum(len(re.findall(p, code)) for p in patterns)


def estimate_tokens(code: str) -> int:
    """
    Very rough token estimate:
    split by whitespace + symbols
    """
    tokens = re.findall(r"\w+|[^\s\w]", code)
    return len(tokens)


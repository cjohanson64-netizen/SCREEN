# backend/analyzer/measure_file.py

import re
from typing import Dict, Any

from analyzer.detect_repetition import detect_repetition
from analyzer.complexity import analyze_complexity
from analyzer.detect_blocks import detect_blocks
from analyzer.function_profile import build_function_profile
from analyzer.constant_profile import build_constant_profile
from analyzer.import_export_profile import build_import_export_profile
from analyzer.file_context import build_file_context
from analyzer.domain_cohesion import build_domain_cohesion


def measure_file(code: str, filename: str | None = None) -> Dict[str, Any]:
    lines = code.split("\n")

    total_lines = len(lines)
    empty_lines = sum(1 for line in lines if not line.strip())
    comment_lines = sum(1 for line in lines if is_comment(line))
    code_lines = total_lines - empty_lines - comment_lines

    avg_line_length = (
        sum(len(line) for line in lines) / total_lines if total_lines > 0 else 0
    )

    max_line_length = max((len(line) for line in lines), default=0)

    repetition = detect_repetition(code)
    complexity = analyze_complexity(code)
    block_analysis = detect_blocks(code)
    function_profile = build_function_profile(code)
    constant_profile = build_constant_profile(code)
    import_export_profile = build_import_export_profile(code, filename=filename or "")
    file_context = build_file_context(filename)

    import_profile = import_export_profile["importProfile"]
    export_profile = import_export_profile["exportProfile"]

    domain_cohesion = build_domain_cohesion(
        {
            "functionProfile": function_profile,
            "constantProfile": constant_profile,
            "importProfile": import_profile,
            "exportProfile": export_profile,
            "fileContext": file_context,
        }
    )

    return {
        "lineCount": total_lines,
        "codeLines": code_lines,
        "emptyLines": empty_lines,
        "commentLines": comment_lines,
        "avgLineLength": round(avg_line_length, 2),
        "maxLineLength": max_line_length,
        "longLines": count_long_lines(lines),
        "functionCount": function_profile["total"],
        "functionProfile": function_profile,
        "constantCount": constant_profile["total"],
        "constantProfile": constant_profile,
        "blockCount": block_analysis["blockCount"],
        "maxNestingDepth": estimate_max_depth(code),
        "importCount": count_imports(code),
        "tokenEstimate": estimate_tokens(code),
        "repetition": repetition,
        "complexity": complexity,
        "blockAnalysis": block_analysis,
        "importProfile": import_profile,
        "exportProfile": export_profile,
        "semanticImportCount": import_profile["total"],
        "semanticExportCount": export_profile["total"],
        "fileContext": file_context,
        "domainCohesion": domain_cohesion,
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
    return sum(1 for line in lines if len(line) > threshold)


def count_blocks(code: str) -> int:
    """
    Rough block detection via curly braces.
    """
    return code.count("{") + code.count("}")


def estimate_max_depth(code: str) -> int:
    """
    Simple brace-based nesting depth.
    """
    depth = 0
    max_depth = 0

    for char in code:
        if char == "{":
            depth += 1
            max_depth = max(max_depth, depth)
        elif char == "}":
            depth -= 1

    return depth_safe_max(max_depth)


def depth_safe_max(max_depth: int) -> int:
    return max(max_depth, 0)


def count_imports(code: str) -> int:
    patterns = [
        r"\bimport\b",
        r"\brequire\(",
        r"\bfrom .* import\b",
    ]

    return sum(len(re.findall(pattern, code)) for pattern in patterns)


def estimate_tokens(code: str) -> int:
    """
    Very rough token estimate:
    split by whitespace + symbols.
    """
    tokens = re.findall(r"\w+|[^\s\w]", code)
    return len(tokens)
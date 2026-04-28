# backend/analyzer/detect_repetition.py

import re
from collections import defaultdict
from typing import Any, Dict, List


def detect_repetition(code: str) -> Dict[str, Any]:
    lines = code.split("\n")

    meaningful_entries = [
        {
            "lineNumber": index + 1,
            "original": line.rstrip(),
            "stripped": line.strip(),
            "normalized": normalize_line(line),
        }
        for index, line in enumerate(lines)
        if is_meaningful_line(line)
    ]

    repeated_exact_lines = find_repeated_entries(
        meaningful_entries,
        key_name="stripped",
    )

    repeated_normalized_lines = find_repeated_entries(
        meaningful_entries,
        key_name="normalized",
    )

    meaningful_repetitions = [
        item
        for item in repeated_normalized_lines
        if item["classification"] != "trivial"
    ]
    
    structural_repetitions = build_structural_repetitions(meaningful_repetitions)

    return {
        "repeatedExactLines": repeated_exact_lines,
        "repeatedNormalizedLines": repeated_normalized_lines,
        "meaningfulRepetitions": meaningful_repetitions,
        "repeatedExactLineCount": len(repeated_exact_lines),
        "repeatedNormalizedLineCount": len(repeated_normalized_lines),
        "meaningfulRepetitionCount": len(meaningful_repetitions),
        "repetitionScore": calculate_repetition_score(
            meaningful_repetitions,
            len(meaningful_entries),
        ),
        "structuralRepetitions": structural_repetitions,
    }


def is_meaningful_line(line: str) -> bool:
    stripped = line.strip()

    if not stripped:
        return False

    if stripped in ["{", "}", "(", ")", ");", "};"]:
        return False

    if stripped.startswith("//") or stripped.startswith("#"):
        return False

    return True


def normalize_line(line: str) -> str:
    normalized = line.strip()

    normalized = re.sub(r'"[^"]*"', "STRING", normalized)
    normalized = re.sub(r"'[^']*'", "STRING", normalized)
    normalized = re.sub(r"`[^`]*`", "STRING", normalized)
    normalized = re.sub(r"\b\d+(\.\d+)?\b", "NUMBER", normalized)
    normalized = re.sub(r"\.[a-zA-Z_][a-zA-Z0-9_]*", ".IDENTIFIER", normalized)

    normalized = re.sub(
        r"\b(const|let|var)\s+[a-zA-Z_][a-zA-Z0-9_]*",
        r"\1 IDENTIFIER",
        normalized,
    )

    normalized = re.sub(
        r"^[a-zA-Z_][a-zA-Z0-9_]*\s=",
        "IDENTIFIER =",
        normalized,
    )

    return normalized


def find_repeated_entries(
    entries: List[Dict[str, Any]],
    key_name: str,
    min_count: int = 3,
) -> List[Dict[str, Any]]:
    groups = defaultdict(list)

    for entry in entries:
        groups[entry[key_name]].append(entry)

    repeated = []

    for pattern, group in groups.items():
        if len(group) >= min_count:
            classification = classify_repetition(pattern)

            repeated.append({
                "pattern": pattern,
                "count": len(group),
                "classification": classification,
                "severity": classify_severity(classification, len(group)),
                "locations": [entry["lineNumber"] for entry in group],
                "examples": [
                    {
                        "lineNumber": entry["lineNumber"],
                        "line": entry["original"],
                    }
                    for entry in group[:5]
                ],
            })

    repeated.sort(
        key=lambda x: (
            severity_weight(x["severity"]),
            x["count"],
        ),
        reverse=True,
    )

    return repeated


def classify_repetition(pattern: str) -> str:
    stripped = pattern.strip()

    if is_trivial_pattern(stripped):
        return "trivial"

    if is_conditional_pattern(stripped):
        return "conditional"

    if is_function_call_pattern(stripped):
        return "function_call"

    if is_transform_pattern(stripped):
        return "data_transform"

    if is_return_pattern(stripped):
        return "return_pattern"

    return "structural"

def classify_structural_pattern(pattern: str) -> str | None:
    p = pattern.strip()

    if "Math.IDENTIFIER" in p or "median(" in p or "average(" in p:
        return "math_windowing_logic"

    if "candidate" in p or "candidates" in p:
        return "candidate_pipeline_logic"

    if "span" in p or "spanFrames" in p or "split" in p or "resplit" in p:
        return "span_splitting_logic"

    if ".filter(" in p or ".map(" in p or ".reduce(" in p or ".sort(" in p:
        return "collection_transform_logic"

    if "return false" in p or "return true" in p or pattern.startswith("if "):
        return "guard_condition_logic"

    return None

def build_structural_repetitions(repetitions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    groups: Dict[str, Dict[str, Any]] = {}

    for item in repetitions:
        structural_type = classify_structural_pattern(item["pattern"])

        if structural_type is None:
            continue

        if structural_type not in groups:
            groups[structural_type] = {
                "type": structural_type,
                "count": 0,
                "patterns": [],
                "locations": [],
            }

        groups[structural_type]["count"] += item["count"]
        groups[structural_type]["patterns"].append(item["pattern"])
        groups[structural_type]["locations"].extend(item.get("locations", []))

    return sorted(
        groups.values(),
        key=lambda item: item["count"],
        reverse=True,
    )

def is_trivial_pattern(pattern: str) -> bool:
    trivial_patterns = [
        r"^(const|let|var) IDENTIFIER = NUMBER;?$",
        r"^(const|let|var) IDENTIFIER = STRING;?$",
        r"^(const|let|var) IDENTIFIER = true;?$",
        r"^(const|let|var) IDENTIFIER = false;?$",
        r"^import .+ from STRING;?$",
        r"^export type .+",
        r"^type .+",
        r"^interface .+",
        r"^continue;?$",
        r"^break;?$",
        r"^return (true|false|null|\[\]|\{\}|NUMBER|STRING);?$",
        r"^return \{?$",
        r"^return \($",
        r"^\)?\s*\{?$",
        r"^\}\s*\{?$",
        r"^\}\);?$",
        r"^\);?$",
        r"^\}\)?;?$",
        r"^(if|else if|elif)\s*\($",
        r"^(const|let|var) IDENTIFIER =$",
        r"^const \{$",
        r"^\.\.\.IDENTIFIER,?$",
        r"^[a-zA-Z_][a-zA-Z0-9_]*:\s*[a-zA-Z_][a-zA-Z0-9_<>\[\]\| ]+,?$",
        r"^[a-zA-Z_][a-zA-Z0-9_]*,$",
        r"^: null;?$",
        r"^: NUMBER;?$",
        r"^NUMBER,?$",
    ]

    return any(re.match(regex, pattern) for regex in trivial_patterns)


def is_conditional_pattern(pattern: str) -> bool:
    return bool(re.match(r"^(if|else if|elif|switch|case)\b", pattern))


def is_function_call_pattern(pattern: str) -> bool:
    return bool(re.search(r"\b[a-zA-Z_][a-zA-Z0-9_]*\(", pattern))


def is_transform_pattern(pattern: str) -> bool:
    return any(token in pattern for token in [".map(", ".filter(", ".reduce(", ".sort("])


def is_return_pattern(pattern: str) -> bool:
    return pattern.startswith("return ")


def classify_severity(classification: str, count: int) -> str:
    if classification == "trivial":
        return "ignore"

    if count >= 8:
        return "high"

    if count >= 4:
        return "medium"

    return "low"


def severity_weight(severity: str) -> int:
    return {
        "high": 3,
        "medium": 2,
        "low": 1,
        "ignore": 0,
    }.get(severity, 0)


def calculate_repetition_score(
    meaningful_repetitions: List[Dict[str, Any]],
    meaningful_line_count: int,
) -> int:
    if meaningful_line_count == 0:
        return 0

    weighted_hits = 0

    for item in meaningful_repetitions:
        if item["severity"] == "high":
            weighted_hits += item["count"] * 2
        elif item["severity"] == "medium":
            weighted_hits += item["count"] * 1.25
        elif item["severity"] == "low":
            weighted_hits += item["count"]

    raw_score = weighted_hits / meaningful_line_count * 100

    return min(round(raw_score), 100)
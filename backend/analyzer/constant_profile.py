import re
from collections import Counter
from typing import Any, Dict, Iterable, List, Set


BOOLEAN_PREFIXES = [
    "is",
    "has",
    "can",
    "should",
    "will",
    "needs",
    "requires",
    "allows",
    "enable",
    "enabled",
    "disable",
    "disabled",
    "show",
    "hide",
    "visible",
    "selected",
    "active",
    "open",
    "closed",
    "loading",
    "error",
    "valid",
    "invalid",
]

THRESHOLD_KEYWORDS = [
    "threshold",
    "limit",
    "max",
    "min",
    "minimum",
    "maximum",
    "default",
    "fallback",
    "score",
    "ratio",
    "duration",
    "timeout",
    "interval",
    "confidence",
    "clarity",
    "weight",
]

NUMERIC_NAME_KEYWORDS = [
    "count",
    "points",
    "score",
    "total",
    "amount",
    "level",
    "value",
    "index",
    "size",
    "length",
    "duration",
    "timeout",
    "interval",
    "ratio",
    "weight",
]

CATEGORY_BY_PREFIX = {
    "is": "predicates",
    "has": "predicates",
    "can": "capabilities",
    "should": "decisionRules",
    "will": "intentRules",
    "needs": "requirementRules",
    "requires": "requirementRules",
    "allows": "capabilities",
    "enable": "featureFlags",
    "enabled": "featureFlags",
    "disable": "featureFlags",
    "disabled": "featureFlags",
    "show": "visibilityFlags",
    "hide": "visibilityFlags",
    "visible": "visibilityFlags",
    "selected": "stateFlags",
    "active": "stateFlags",
    "open": "stateFlags",
    "closed": "stateFlags",
    "loading": "stateFlags",
    "error": "stateFlags",
    "valid": "validationFlags",
    "invalid": "validationFlags",
}

JS_DECLARATION_RE = re.compile(
    r"\b(?P<kind>const|let|var)\s+"
    r"(?P<name>[A-Za-z_$][\w$]*)\s*=\s*"
    r"(?P<value>.*?);",
    re.DOTALL,
)

PYTHON_ASSIGNMENT_RE = re.compile(
    r"^\s*(?P<name>[A-Za-z_]\w*)\s*=\s*(?P<value>.+)$",
    re.MULTILINE,
)

DESTRUCTURED_DECLARATION_RE = re.compile(
    r"\b(?:const|let|var)\s*[\[{]",
    re.MULTILINE,
)


def build_constant_profile(code: str) -> Dict[str, Any]:
    entries = extract_constant_entries(code)
    names = [entry["name"] for entry in entries]

    prefix_counts = count_semantic_prefixes(names)
    category_counts = count_categories(prefix_counts)

    semantic_roles = [
        build_semantic_role(entry, code)
        for entry in entries
    ]

    normal_constant_roles = [
        role for role in semantic_roles
        if role["combinedRole"] != "functionExpression"
    ]

    boolean_like_names = [
        role["name"]
        for role in normal_constant_roles
        if role["nameSemantic"]["prefix"]
    ]

    threshold_names = [
        role["name"]
        for role in normal_constant_roles
        if role["valueSemantic"]["kind"] == "thresholdLike"
        or is_threshold_like_name(role["name"])
    ]

    flag_like_names = [
        role["name"]
        for role in normal_constant_roles
        if role["nameSemantic"]["category"] in {
            "featureFlags",
            "visibilityFlags",
            "stateFlags",
            "validationFlags",
        }
    ]

    decision_rule_names = [
        role["name"]
        for role in normal_constant_roles
        if role["nameSemantic"]["category"] in {
            "decisionRules",
            "requirementRules",
            "intentRules",
            "capabilities",
            "predicates",
        }
    ]

    role_counts = Counter(role["combinedRole"] for role in semantic_roles)
    value_kind_counts = Counter(role["valueSemantic"]["kind"] for role in semantic_roles)

    return {
        "total": len(normal_constant_roles),
        "declaredCount": len(entries),
        "namedCount": len(normal_constant_roles),
        "destructuredCount": estimate_destructured_declaration_count(code),

        "booleanLikeCount": len(boolean_like_names),
        "thresholdLikeCount": len(threshold_names),
        "flagLikeCount": len(flag_like_names),
        "decisionRuleLikeCount": len(decision_rule_names),

        "functionExpressionCount": role_counts.get("functionExpression", 0),
        "entityAliasCount": role_counts.get("entityAlias", 0),
        "collectionAliasCount": role_counts.get("collectionAlias", 0),
        "derivedValueCount": count_roles_matching(
            role_counts,
            {
                "derivedValue",
                "derivedNumericValue",
                "booleanDerivedValue",
                "functionCallResult",
            },
        ),
        "derivedNumericValueCount": role_counts.get("derivedNumericValue", 0),
        "booleanDerivedValueCount": role_counts.get("booleanDerivedValue", 0),
        "actionGuardCandidateCount": role_counts.get("actionGuardCandidate", 0),
        "renderDataProjectionCount": count_roles_matching(
            role_counts,
            {
                "entityAlias",
                "collectionAlias",
                "derivedValue",
                "derivedNumericValue",
            },
        ),

        "prefixCounts": dict(prefix_counts),
        "categoryCounts": dict(category_counts),
        "roleCounts": dict(role_counts),
        "valueKindCounts": dict(value_kind_counts),

        "topPrefixes": build_top_counts(prefix_counts),
        "topCategories": build_top_counts(category_counts),
        "topRoles": build_top_counts(role_counts),
        "topValueKinds": build_top_counts(value_kind_counts),

        "constantNames": [role["name"] for role in normal_constant_roles[:80]],
        "booleanLikeNames": boolean_like_names[:40],
        "thresholdNames": threshold_names[:40],
        "flagLikeNames": flag_like_names[:40],
        "decisionRuleNames": decision_rule_names[:40],

        "functionExpressionNames": names_for_role(semantic_roles, "functionExpression"),
        "entityAliasNames": names_for_role(semantic_roles, "entityAlias"),
        "collectionAliasNames": names_for_role(semantic_roles, "collectionAlias"),
        "derivedValueNames": names_for_roles(
            semantic_roles,
            {
                "derivedValue",
                "derivedNumericValue",
                "booleanDerivedValue",
                "functionCallResult",
            },
        ),
        "derivedNumericValueNames": names_for_role(semantic_roles, "derivedNumericValue"),
        "booleanDerivedValueNames": names_for_role(semantic_roles, "booleanDerivedValue"),
        "actionGuardCandidateNames": names_for_role(semantic_roles, "actionGuardCandidate"),
        "renderDataProjectionNames": names_for_roles(
            semantic_roles,
            {
                "entityAlias",
                "collectionAlias",
                "derivedValue",
                "derivedNumericValue",
            },
        ),

        "semanticRoles": semantic_roles[:120],

        "dominantCategory": get_dominant_key(category_counts),
        "dominantPrefix": get_dominant_key(prefix_counts),
        "dominantRole": get_dominant_key(role_counts),
        "dominantValueKind": get_dominant_key(value_kind_counts),
    }


def extract_constant_entries(code: str) -> List[Dict[str, str]]:
    entries: List[Dict[str, str]] = []
    seen: Set[str] = set()

    for match in JS_DECLARATION_RE.finditer(code):
        entry = {
            "declarationKind": match.group("kind"),
            "name": match.group("name"),
            "value": clean_expression(match.group("value")),
            "language": "javascript",
        }
        add_entry(entry, entries, seen)

    for match in PYTHON_ASSIGNMENT_RE.finditer(code):
        name = match.group("name")
        if name in {"return", "yield", "if", "for", "while", "with"}:
            continue

        entry = {
            "declarationKind": "assignment",
            "name": name,
            "value": clean_expression(match.group("value")),
            "language": "python",
        }
        add_entry(entry, entries, seen)

    return entries


def add_entry(entry: Dict[str, str], entries: List[Dict[str, str]], seen: Set[str]) -> None:
    name = entry["name"]

    if name in seen:
        return

    entries.append(entry)
    seen.add(name)


def clean_expression(value: str) -> str:
    return " ".join(value.strip().split())


def build_semantic_role(entry: Dict[str, str], full_code: str) -> Dict[str, Any]:
    name = entry["name"]
    value = entry["value"]

    name_semantic = infer_name_semantic(name)
    value_semantic = infer_value_semantic(name, value)
    usage_semantic = infer_usage_semantic(name, full_code)
    combined_role = infer_combined_role(name_semantic, value_semantic, usage_semantic)

    return {
        "name": name,
        "declarationKind": entry["declarationKind"],
        "valuePreview": value[:120],
        "nameSemantic": name_semantic,
        "valueSemantic": value_semantic,
        "usageSemantic": usage_semantic,
        "combinedRole": combined_role,
    }


def infer_name_semantic(name: str) -> Dict[str, Any]:
    prefix = detect_boolean_prefix(name)
    category = CATEGORY_BY_PREFIX.get(prefix) if prefix else infer_name_category_without_prefix(name)

    return {
        "prefix": prefix,
        "category": category,
        "isThresholdLike": is_threshold_like_name(name),
        "isPluralLike": is_plural_like_name(name),
        "isNumericLike": is_numeric_like_name(name),
        "confidence": "high" if prefix else "medium" if category else "low",
    }


def infer_name_category_without_prefix(name: str) -> str | None:
    lower = name.lower()

    if lower.endswith("disabled") or lower.endswith("enabled"):
        return "stateFlags"

    if lower.endswith("visible") or lower.endswith("hidden"):
        return "visibilityFlags"

    if any(keyword in lower for keyword in ["error", "loading", "selected", "active"]):
        return "stateFlags"

    if is_threshold_like_name(name):
        return "thresholds"

    if is_plural_like_name(name):
        return "collections"

    return None


def infer_value_semantic(name: str, value: str) -> Dict[str, Any]:
    stripped = value.strip()

    if is_function_expression(stripped):
        return semantic("functionExpression", "high")

    if is_boolean_literal(stripped):
        return semantic("booleanLiteral", "high")

    if is_boolean_expression(stripped):
        return semantic(
            "booleanExpression",
            "high",
            operators=extract_boolean_operators(stripped),
        )

    if is_array_literal(stripped):
        return semantic("arrayLiteral", "high")

    if is_object_literal(stripped):
        return semantic("objectLiteral", "high")

    if is_array_fallback(stripped):
        return semantic("arrayFallback", "high")

    if is_numeric_literal(stripped):
        return semantic("numericLiteral", "high")

    if is_string_literal(stripped):
        return semantic("stringLiteral", "high")

    if is_numeric_fallback(name, stripped):
        return semantic("numericFallback", "high")

    if is_property_access(stripped):
        return semantic("propertyAccess", "medium")

    if is_collection_transform(stripped):
        return semantic("collectionTransform", "medium")

    if is_function_call(stripped):
        return semantic("functionCallResult", "medium")

    if is_threshold_like_name(name):
        return semantic("thresholdLike", "medium")

    return semantic("unknown", "low")


def semantic(kind: str, confidence: str, **extra: Any) -> Dict[str, Any]:
    return {
        "kind": kind,
        "confidence": confidence,
        **extra,
    }


def infer_usage_semantic(name: str, full_code: str) -> Dict[str, Any]:
    usages = []

    if re.search(rf"\bdisabled\s*=\s*{{\s*{re.escape(name)}\s*}}", full_code):
        usages.append("jsxDisabledProp")

    if re.search(rf"\bchecked\s*=\s*{{\s*{re.escape(name)}\s*}}", full_code):
        usages.append("jsxCheckedProp")

    if re.search(rf"\bhidden\s*=\s*{{\s*{re.escape(name)}\s*}}", full_code):
        usages.append("jsxHiddenProp")

    if re.search(rf"{{\s*{re.escape(name)}\s*&&", full_code):
        usages.append("jsxRenderGuard")

    if re.search(rf"{re.escape(name)}\.map\s*\(", full_code):
        usages.append("collectionRenderMap")

    if re.search(rf"{re.escape(name)}\.filter\s*\(", full_code):
        usages.append("collectionFilter")

    return {
        "kinds": usages,
        "confidence": "high" if usages else "low",
    }


def infer_combined_role(
    name_semantic: Dict[str, Any],
    value_semantic: Dict[str, Any],
    usage_semantic: Dict[str, Any],
) -> str:
    value_kind = value_semantic["kind"]
    name_category = name_semantic["category"]
    usage_kinds = set(usage_semantic["kinds"])

    if value_kind == "functionExpression":
        return "functionExpression"

    if "jsxDisabledProp" in usage_kinds:
        return "actionGuardCandidate"

    if value_kind in {"booleanLiteral", "booleanExpression"}:
        if name_category in {"capabilities", "decisionRules", "requirementRules", "predicates"}:
            return "booleanRule"
        return "booleanDerivedValue"

    if value_kind in {"arrayLiteral", "arrayFallback"} or name_semantic["isPluralLike"]:
        return "collectionAlias"

    if value_kind == "propertyAccess":
        return "entityAlias"

    if value_kind in {"numericLiteral", "numericFallback"}:
        if name_semantic["isThresholdLike"]:
            return "thresholdConstant"
        return "derivedNumericValue"

    if value_kind == "collectionTransform":
        return "collectionDerivedValue"

    if value_kind == "functionCallResult":
        return "functionCallResult"

    if value_kind in {"objectLiteral", "stringLiteral"}:
        return "derivedValue"

    if name_category in {"featureFlags", "visibilityFlags", "stateFlags", "validationFlags"}:
        return "booleanDerivedValue"

    if name_semantic["isThresholdLike"]:
        return "thresholdConstant"

    return "derivedValue"


def count_semantic_prefixes(names: List[str]) -> Counter:
    counts: Counter = Counter()

    for name in names:
        prefix = detect_boolean_prefix(name)

        if prefix:
            counts[prefix] += 1

    return counts


def detect_boolean_prefix(name: str) -> str | None:
    normalized = normalize_name_for_matching(name)

    for prefix in BOOLEAN_PREFIXES:
        if is_named_with_suffix(normalized, prefix):
            return prefix

    return None


def is_named_with_suffix(name: str, prefix: str) -> bool:
    if not name.startswith(prefix):
        return False

    suffix = name[len(prefix):]

    if not suffix:
        return False

    return suffix[0].isupper() or suffix[0] == "_"


def normalize_name_for_matching(name: str) -> str:
    if "_" not in name:
        return name

    parts = name.lower().split("_")
    if not parts:
        return name

    return parts[0] + "".join(part.capitalize() for part in parts[1:])


def is_threshold_like_name(name: str) -> bool:
    lower = name.lower()

    return any(keyword in lower for keyword in THRESHOLD_KEYWORDS)


def is_plural_like_name(name: str) -> bool:
    lower = name.lower()

    return lower.endswith("s") and not lower.endswith("ss")


def is_numeric_like_name(name: str) -> bool:
    lower = name.lower()

    return any(keyword in lower for keyword in NUMERIC_NAME_KEYWORDS)


def is_function_expression(value: str) -> bool:
    return (
        "=>" in value
        or value.startswith("function ")
        or value.startswith("async function ")
    )


def is_boolean_literal(value: str) -> bool:
    return value in {"true", "false", "True", "False"}


def is_boolean_expression(value: str) -> bool:
    return bool(
        re.search(r"(!==|===|<=|>=|<|>|\|\||&&|!\s*[A-Za-z_$])", value)
    )


def extract_boolean_operators(value: str) -> List[str]:
    return re.findall(r"!==|===|<=|>=|<|>|\|\||&&|!", value)


def is_array_literal(value: str) -> bool:
    return value.startswith("[") and value.endswith("]")


def is_object_literal(value: str) -> bool:
    return value.startswith("{") and value.endswith("}")


def is_array_fallback(value: str) -> bool:
    return "?? []" in value or "|| []" in value


def is_numeric_literal(value: str) -> bool:
    return bool(re.fullmatch(r"-?\d+(\.\d+)?", value))


def is_string_literal(value: str) -> bool:
    return (
        len(value) >= 2
        and (
            (value.startswith('"') and value.endswith('"'))
            or (value.startswith("'") and value.endswith("'"))
        )
    )


def is_numeric_fallback(name: str, value: str) -> bool:
    return is_numeric_like_name(name) and bool(
        re.search(r"(\?\?|\|\|)\s*-?\d+(\.\d+)?", value)
    )


def is_property_access(value: str) -> bool:
    return bool(
        re.fullmatch(
            r"[A-Za-z_$][\w$]*(\?|\.)?(\.[A-Za-z_$][\w$]*)+",
            value.replace("?.", "."),
        )
    )


def is_collection_transform(value: str) -> bool:
    return bool(re.search(r"\.(map|filter|reduce|flatMap|sort)\s*\(", value))


def is_function_call(value: str) -> bool:
    return bool(re.match(r"[A-Za-z_$][\w$]*\s*\(", value))


def count_categories(prefix_counts: Counter) -> Counter:
    categories: Counter = Counter()

    for prefix, count in prefix_counts.items():
        category = CATEGORY_BY_PREFIX.get(prefix)

        if category:
            categories[category] += count

    return categories


def estimate_destructured_declaration_count(code: str) -> int:
    return len(DESTRUCTURED_DECLARATION_RE.findall(code))


def build_top_counts(counts: Counter, limit: int = 5) -> List[Dict[str, Any]]:
    return [
        {"name": name, "count": count}
        for name, count in counts.most_common(limit)
    ]


def get_dominant_key(counts: Counter) -> str | None:
    if not counts:
        return None

    return counts.most_common(1)[0][0]


def count_roles_matching(role_counts: Counter, roles: Set[str]) -> int:
    return sum(role_counts.get(role, 0) for role in roles)


def names_for_role(semantic_roles: List[Dict[str, Any]], role: str) -> List[str]:
    return [
        item["name"]
        for item in semantic_roles
        if item["combinedRole"] == role
    ][:40]


def names_for_roles(semantic_roles: List[Dict[str, Any]], roles: Set[str]) -> List[str]:
    return [
        item["name"]
        for item in semantic_roles
        if item["combinedRole"] in roles
    ][:40]
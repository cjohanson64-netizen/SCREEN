import re
from collections import Counter
from typing import Any, Dict, Iterable, List, Set


COMMON_FUNCTION_VERBS = [
    "use",
    "get",
    "set",
    "has",
    "is",
    "can",
    "should",
    "build",
    "create",
    "make",
    "parse",
    "format",
    "normalize",
    "validate",
    "analyze",
    "detect",
    "calculate",
    "compute",
    "estimate",
    "count",
    "find",
    "filter",
    "map",
    "reduce",
    "sort",
    "group",
    "merge",
    "split",
    "transform",
    "render",
    "handle",
    "toggle",
    "update",
    "load",
    "save",
    "fetch",
    "post",
    "send",
    "run",
    "execute",
    "apply",
]

CATEGORY_BY_VERB = {
    "use": "hooks",
    "get": "getters",
    "set": "setters",
    "has": "predicates",
    "is": "predicates",
    "can": "predicates",
    "should": "predicates",
    "build": "builders",
    "create": "builders",
    "make": "builders",
    "parse": "transformers",
    "format": "transformers",
    "normalize": "transformers",
    "transform": "transformers",
    "analyze": "analyzers",
    "detect": "analyzers",
    "calculate": "calculators",
    "compute": "calculators",
    "estimate": "calculators",
    "count": "calculators",
    "find": "selectors",
    "filter": "selectors",
    "map": "selectors",
    "reduce": "selectors",
    "sort": "selectors",
    "group": "selectors",
    "merge": "composers",
    "split": "composers",
    "render": "renderers",
    "handle": "handlers",
    "toggle": "handlers",
    "update": "mutators",
    "load": "io",
    "save": "io",
    "fetch": "io",
    "post": "io",
    "send": "io",
    "run": "orchestrators",
    "execute": "orchestrators",
    "apply": "orchestrators",
}

JS_FUNCTION_PATTERNS = [
    re.compile(r"\b(?:export\s+default\s+|export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\("),
    re.compile(r"\b(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>"),
    re.compile(r"\b(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s+)?function\b"),
]

PYTHON_FUNCTION_RE = re.compile(r"^\s*def\s+([A-Za-z_]\w*)\s*\(", re.MULTILINE)


def build_function_profile(code: str) -> Dict[str, Any]:
    names = extract_function_names(code)
    verb_counts = count_function_verbs(names)
    category_counts = count_categories(verb_counts)
    component_names = [name for name in names if is_pascal_case(name)]
    hook_names = [name for name in names if name.startswith("use") and is_named_with_suffix(name, "use")]

    return {
        "total": len(names),
        "namedCount": len(names),
        "anonymousCount": estimate_anonymous_function_count(code),
        "componentCount": len(component_names),
        "hookCount": len(hook_names),
        "verbCounts": dict(verb_counts),
        "categoryCounts": dict(category_counts),
        "topVerbs": build_top_counts(verb_counts),
        "topCategories": build_top_counts(category_counts),
        "componentNames": component_names[:20],
        "hookNames": hook_names[:20],
        "functionNames": names[:50],
        "dominantCategory": get_dominant_key(category_counts),
        "dominantVerb": get_dominant_key(verb_counts),
    }


def extract_function_names(code: str) -> List[str]:
    names: List[str] = []
    seen: Set[str] = set()

    for pattern in JS_FUNCTION_PATTERNS:
        add_names(pattern.findall(code), names, seen)

    add_names(PYTHON_FUNCTION_RE.findall(code), names, seen)

    return names


def add_names(candidates: Iterable[str], names: List[str], seen: Set[str]) -> None:
    for name in candidates:
        if name not in seen:
            names.append(name)
            seen.add(name)


def count_function_verbs(names: List[str]) -> Counter:
    counts: Counter = Counter()

    for name in names:
        verb = detect_function_verb(name)

        if verb:
            counts[verb] += 1

    return counts


def detect_function_verb(name: str) -> str | None:
    for verb in COMMON_FUNCTION_VERBS:
        if is_named_with_suffix(name, verb):
            return verb

    return None


def is_named_with_suffix(name: str, prefix: str) -> bool:
    if not name.startswith(prefix):
        return False

    suffix = name[len(prefix):]

    if not suffix:
        return False

    return suffix[0].isupper() or suffix[0] == "_"


def count_categories(verb_counts: Counter) -> Counter:
    categories: Counter = Counter()

    for verb, count in verb_counts.items():
        category = CATEGORY_BY_VERB.get(verb)

        if category:
            categories[category] += count

    return categories


def is_pascal_case(name: str) -> bool:
    if not name or "_" in name:
        return False

    return name[0].isupper() and any(char.islower() for char in name[1:])


def estimate_anonymous_function_count(code: str) -> int:
    arrow_functions = len(re.findall(r"(?:^|[\s,:(\[])(?:async\s+)?\([^)]*\)\s*=>|(?:^|[\s,:(\[])[A-Za-z_$][\w$]*\s*=>", code))
    anonymous_functions = len(re.findall(r"\bfunction\s*\(", code))
    return arrow_functions + anonymous_functions


def build_top_counts(counts: Counter, limit: int = 5) -> List[Dict[str, Any]]:
    return [
        {"name": name, "count": count}
        for name, count in counts.most_common(limit)
    ]


def get_dominant_key(counts: Counter) -> str | None:
    if not counts:
        return None

    return counts.most_common(1)[0][0]
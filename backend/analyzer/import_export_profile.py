import re
from collections import Counter
from typing import Any, Dict, List, Optional, Tuple


IMPORT_RE = re.compile(
    r"""
    ^\s*
    import\s+
    (?P<body>.*?)
    \s+from\s+
    (?P<quote>["'])
    (?P<source>[^"']+)
    (?P=quote)
    \s*;?
    """,
    re.MULTILINE | re.VERBOSE,
)

SIDE_EFFECT_IMPORT_RE = re.compile(
    r"""
    ^\s*
    import\s+
    (?P<quote>["'])
    (?P<source>[^"']+)
    (?P=quote)
    \s*;?
    """,
    re.MULTILINE | re.VERBOSE,
)

REQUIRE_RE = re.compile(
    r"""
    \b(?:const|let|var)\s+
    (?P<body>[^=]+?)
    \s*=\s*
    require\(
      (?P<quote>["'])
      (?P<source>[^"']+)
      (?P=quote)
    \)
    \s*;?
    """,
    re.MULTILINE | re.VERBOSE,
)

EXPORT_DEFAULT_RE = re.compile(
    r"^\s*export\s+default\b(?P<body>.*)$",
    re.MULTILINE,
)

EXPORT_DECLARATION_RE = re.compile(
    r"""
    ^\s*
    export\s+
    (?P<kind>function|const|let|var|class|type|interface)\s+
    (?P<name>[A-Za-z_$][\w$]*)
    """,
    re.MULTILINE | re.VERBOSE,
)

EXPORT_LIST_RE = re.compile(
    r"""
    ^\s*
    export\s+
    \{
      (?P<names>[^}]+)
    \}
    (?:\s+from\s+(?P<quote>["'])(?P<source>[^"']+)(?P=quote))?
    \s*;?
    """,
    re.MULTILINE | re.VERBOSE,
)

EXPORT_STAR_RE = re.compile(
    r"""
    ^\s*
    export\s+\*\s+from\s+
    (?P<quote>["'])
    (?P<source>[^"']+)
    (?P=quote)
    \s*;?
    """,
    re.MULTILINE | re.VERBOSE,
)


FOLDER_CATEGORY_MAP = {
    # UI / rendering
    "components": "ui_rendering",
    "component": "ui_rendering",
    "ui": "ui_rendering",
    "views": "ui_rendering",
    "view": "ui_rendering",
    "pages": "ui_rendering",
    "page": "ui_rendering",
    "screens": "ui_rendering",
    "layouts": "ui_rendering",
    "layout": "ui_rendering",
    "widgets": "ui_rendering",
    "partials": "ui_rendering",
    "presentational": "ui_rendering",

    # React state / behavior
    "hooks": "state_behavior",
    "hook": "state_behavior",
    "state": "state_behavior",
    "store": "state_behavior",
    "stores": "state_behavior",
    "reducers": "state_behavior",
    "reducer": "state_behavior",
    "contexts": "state_behavior",
    "context": "state_behavior",
    "providers": "state_behavior",
    "provider": "state_behavior",
    "effects": "state_behavior",
    "signals": "state_behavior",

    # Utilities
    "utils": "general_utility",
    "util": "general_utility",
    "helpers": "general_utility",
    "helper": "general_utility",
    "lib": "general_utility",
    "libs": "general_utility",
    "common": "general_utility",
    "shared": "general_utility",
    "tools": "general_utility",
    "tooling": "general_utility",
    "support": "general_utility",

    # Domain logic
    "domain": "domain_logic",
    "models": "domain_logic",
    "model": "domain_logic",
    "entities": "domain_logic",
    "entity": "domain_logic",
    "rules": "domain_logic",
    "rule": "domain_logic",
    "policies": "domain_logic",
    "policy": "domain_logic",
    "guards": "domain_logic",
    "guard": "domain_logic",
    "predicates": "domain_logic",
    "predicate": "domain_logic",
    "validators": "domain_logic",
    "validator": "domain_logic",
    "validation": "domain_logic",
    "schemas": "domain_logic",
    "schema": "domain_logic",

    # Data access
    "api": "data_access",
    "apis": "data_access",
    "services": "data_access",
    "service": "data_access",
    "clients": "data_access",
    "client": "data_access",
    "repositories": "data_access",
    "repository": "data_access",
    "repo": "data_access",
    "data": "data_access",
    "db": "data_access",
    "database": "data_access",
    "queries": "data_access",
    "query": "data_access",
    "mutations": "data_access",
    "mutation": "data_access",
    "endpoints": "data_access",
    "endpoint": "data_access",
    "fetchers": "data_access",
    "fetcher": "data_access",

    # Config
    "constants": "configuration",
    "constant": "configuration",
    "config": "configuration",
    "configs": "configuration",
    "settings": "configuration",
    "env": "configuration",
    "environment": "configuration",
    "tokens": "configuration",
    "theme": "configuration",
    "themes": "configuration",
    "styles": "configuration",
    "style": "configuration",

    # Types
    "types": "type_contract",
    "type": "type_contract",
    "interfaces": "type_contract",
    "interface": "type_contract",
    "contracts": "type_contract",
    "contract": "type_contract",
    "dto": "type_contract",
    "dtos": "type_contract",
    "typedefs": "type_contract",

    # Feature/module
    "features": "feature_module",
    "feature": "feature_module",
    "modules": "feature_module",
    "module": "feature_module",
    "domains": "feature_module",
    "apps": "feature_module",
    "packages": "feature_module",
    "sections": "feature_module",

    # Test support
    "tests": "test_support",
    "test": "test_support",
    "specs": "test_support",
    "spec": "test_support",
    "__tests__": "test_support",
    "fixtures": "test_support",
    "fixture": "test_support",
    "mocks": "test_support",
    "mock": "test_support",
    "stubs": "test_support",
    "stub": "test_support",
    "fakes": "test_support",
    "fake": "test_support",

    # Assets
    "assets": "asset_dependency",
    "images": "asset_dependency",
    "image": "asset_dependency",
    "icons": "asset_dependency",
    "icon": "asset_dependency",
    "fonts": "asset_dependency",
    "media": "asset_dependency",
    "public": "asset_dependency",

    # Infrastructure
    "scripts": "infrastructure",
    "script": "infrastructure",
    "build": "infrastructure",
    "ci": "infrastructure",
    "deploy": "infrastructure",
    "deployment": "infrastructure",
    "infra": "infrastructure",
    "infrastructure": "infrastructure",
    "ops": "infrastructure",
    "server": "infrastructure",
    "backend": "infrastructure",
    "frontend": "infrastructure",
}


EXPORT_VERB_CATEGORY_MAP = {
    "get": "getter_export",
    "set": "setter_export",
    "has": "predicate_export",
    "is": "predicate_export",
    "can": "predicate_export",
    "should": "predicate_export",
    "analyze": "analyzer_export",
    "detect": "analyzer_export",
    "build": "builder_export",
    "create": "builder_export",
    "make": "builder_export",
    "handle": "handler_export",
    "toggle": "handler_export",
    "use": "hook_export",
}

TEST_SUPPORT_PATH_TOKENS = {
    "test",
    "tests",
    "testing",
    "__tests__",
    "spec",
    "specs",
    "fixture",
    "fixtures",
    "mock",
    "mocks",
    "stub",
    "stubs",
    "fake",
    "fakes",
    "devonly",
    "testutils",
    "test-utils",
}

DATA_ACCESS_CATEGORIES = {"data_access"}
UI_CATEGORIES = {"ui_rendering"}
DOMAIN_LOGIC_CATEGORIES = {"domain_logic"}


def build_import_export_profile(code: str, filename: str = "") -> Dict[str, Any]:
    imports = extract_imports(code)
    exports = extract_exports(code)

    return {
        "importProfile": build_import_profile(imports, filename),
        "exportProfile": build_export_profile(exports),
    }


def build_import_profile(imports: List[Dict[str, Any]], filename: str = "") -> Dict[str, Any]:
    path_kinds = Counter(item["pathKind"] for item in imports)
    category_counts = Counter(item["category"] for item in imports)
    folder_counts = Counter(
        folder
        for item in imports
        for folder in item.get("matchedFolders", [])
    )

    wide_named_imports = [
        item for item in imports if item.get("namedCount", 0) >= 5
    ]

    deep_relative_imports = [
        item for item in imports if item["pathKind"] == "deep_relative"
    ]

    category_names = [
        category for category in category_counts.keys()
        if category != "unknown"
    ]

    signal_confidence = build_import_signal_confidence(
        imports=imports,
        category_counts=category_counts,
        filename=filename,
    )

    signals = infer_import_signals(
        imports=imports,
        category_counts=category_counts,
        filename=filename,
        signal_confidence=signal_confidence,
    )

    return {
        "total": len(imports),
        "externalCount": path_kinds.get("external_package", 0),
        "localCount": path_kinds.get("local_relative", 0)
        + path_kinds.get("deep_relative", 0)
        + path_kinds.get("internal_alias", 0),
        "relativeCount": path_kinds.get("local_relative", 0)
        + path_kinds.get("deep_relative", 0),
        "deepRelativeCount": len(deep_relative_imports),
        "internalAliasCount": path_kinds.get("internal_alias", 0),
        "sideEffectCount": sum(1 for item in imports if item["importKind"] == "side_effect"),
        "wideNamedImportCount": len(wide_named_imports),
        "categoryCounts": dict(category_counts),
        "pathKindCounts": dict(path_kinds),
        "folderCounts": dict(folder_counts),
        "topCategories": build_top_counts(category_counts),
        "topFolders": build_top_counts(folder_counts),
        "responsibilityCategoryCount": len(category_names),
        "importedFolders": list(folder_counts.keys())[:40],
        "imports": imports[:80],
        "signals": signals,
        "signalConfidence": signal_confidence,
    }

def build_export_profile(exports: List[Dict[str, Any]]) -> Dict[str, Any]:
    kind_counts = Counter(item["exportKind"] for item in exports)
    role_counts = Counter(item["role"] for item in exports)
    named_exports = [
        item for item in exports
        if item["exportKind"] not in {"default_export", "star_reexport"}
    ]
    reexports = [
        item for item in exports
        if item["exportKind"] in {"reexport", "star_reexport"}
    ]

    export_role_names = [
        role for role in role_counts.keys()
        if role != "unknown_export"
    ]

    return {
        "total": len(exports),
        "namedCount": len(named_exports),
        "defaultCount": kind_counts.get("default_export", 0),
        "functionExportCount": kind_counts.get("function_export", 0),        "constantExportCount": role_counts.get("constant_export", 0),
        "typeExportCount": role_counts.get("type_export", 0),
        "classExportCount": role_counts.get("class_export", 0),
        "componentExportCount": role_counts.get("component_export", 0),
        "hookExportCount": role_counts.get("hook_export", 0),
        "predicateExportCount": role_counts.get("predicate_export", 0),
        "getterExportCount": role_counts.get("getter_export", 0),
        "builderExportCount": role_counts.get("builder_export", 0),
        "analyzerExportCount": role_counts.get("analyzer_export", 0),
        "handlerExportCount": role_counts.get("handler_export", 0),
        "configExportCount": role_counts.get("config_export", 0),
        "reexportCount": len(reexports),
        "starReexportCount": kind_counts.get("star_reexport", 0),
        "kindCounts": dict(kind_counts),
        "roleCounts": dict(role_counts),
        "topKinds": build_top_counts(kind_counts),
        "topRoles": build_top_counts(role_counts),
        "responsibilityRoleCount": len(export_role_names),
        "exports": exports[:100],
        "signals": infer_export_signals(exports, kind_counts, role_counts),
    }


def extract_imports(code: str) -> List[Dict[str, Any]]:
    imports: List[Dict[str, Any]] = []

    for match in IMPORT_RE.finditer(code):
        body = match.group("body").strip()
        source = match.group("source").strip()
        imports.append(build_import_entry(source, body, "module_import"))

    for match in SIDE_EFFECT_IMPORT_RE.finditer(code):
        source = match.group("source").strip()
        imports.append(build_import_entry(source, "", "side_effect"))

    for match in REQUIRE_RE.finditer(code):
        body = match.group("body").strip()
        source = match.group("source").strip()
        imports.append(build_import_entry(source, body, "require"))

    return imports


def build_import_entry(source: str, body: str, import_kind: str) -> Dict[str, Any]:
    path_kind = classify_import_path(source)
    matched_folders = extract_known_folders(source)
    category = infer_import_category(source, matched_folders)
    path_tokens = extract_path_tokens(source)

    return {
        "source": source,
        "importKind": import_kind,
        "pathKind": path_kind,
        "category": category,
        "matchedFolders": matched_folders,
        "pathTokens": path_tokens,
        "testSupportTokens": [
            token for token in path_tokens
            if token in TEST_SUPPORT_PATH_TOKENS
        ],
        "namedCount": count_named_imports(body),
        "hasDefaultImport": has_default_import(body),
        "hasNamespaceImport": "*" in body,
        "isTypeImport": body.startswith("type "),
        "isDeepRelative": path_kind == "deep_relative",
    }

def extract_exports(code: str) -> List[Dict[str, Any]]:
    exports: List[Dict[str, Any]] = []

    for match in EXPORT_STAR_RE.finditer(code):
        source = match.group("source").strip()
        exports.append({
            "name": "*",
            "source": source,
            "exportKind": "star_reexport",
            "role": "barrel_export",
        })

    for match in EXPORT_LIST_RE.finditer(code):
        source = match.group("source")
        names = parse_export_names(match.group("names"))
        export_kind = "reexport" if source else "named_export"

        for name in names:
            exports.append({
                "name": name,
                "source": source,
                "exportKind": export_kind,
                "role": infer_export_role(name, export_kind),
            })

    for match in EXPORT_DECLARATION_RE.finditer(code):
        kind = match.group("kind")
        name = match.group("name")
        exports.append({
            "name": name,
            "source": None,
            "exportKind": f"{kind}_export",
            "role": infer_export_role(name, f"{kind}_export", declaration_kind=kind),
        })

    for match in EXPORT_DEFAULT_RE.finditer(code):
        body = match.group("body").strip()
        name = infer_default_export_name(body)
        exports.append({
            "name": name,
            "source": None,
            "exportKind": "default_export",
            "role": infer_export_role(name, "default_export"),
        })

    return dedupe_exports(exports)


def classify_import_path(source: str) -> str:
    if source.startswith("../../../"):
        return "deep_relative"

    if source.startswith("../") or source.startswith("./"):
        return "local_relative"

    if source.startswith("@/") or source.startswith("src/") or source.startswith("~/"):
        return "internal_alias"

    return "external_package"


def extract_known_folders(source: str) -> List[str]:
    parts = [
        normalize_path_segment(part)
        for part in source.replace("\\", "/").split("/")
        if part and part not in {".", "..", "@", "~"}
    ]

    return [
        part for part in parts
        if part in FOLDER_CATEGORY_MAP
    ]

def extract_path_tokens(source: str) -> List[str]:
    raw_parts = [
        part
        for part in source.replace("\\", "/").split("/")
        if part and part not in {".", "..", "@", "~"}
    ]

    tokens: List[str] = []

    for part in raw_parts:
        normalized = normalize_path_segment(part)
        stem = normalized.rsplit(".", 1)[0]

        tokens.append(normalized)

        if stem != normalized:
            tokens.append(stem)

        for split_token in re.split(r"[-_.]", stem):
            if split_token:
                tokens.append(split_token)

    return dedupe_preserve_order(tokens)

def normalize_path_segment(segment: str) -> str:
    return segment.strip().lower()


def infer_import_category(source: str, matched_folders: List[str]) -> str:
    for folder in matched_folders:
        category = FOLDER_CATEGORY_MAP.get(folder)
        if category:
            return category

    if classify_import_path(source) == "external_package":
        return "external_package"

    return "unknown"


def count_named_imports(body: str) -> int:
    match = re.search(r"\{(?P<names>[^}]+)\}", body)

    if not match:
        return 0

    return len([
        item.strip()
        for item in match.group("names").split(",")
        if item.strip()
    ])


def has_default_import(body: str) -> bool:
    if not body or body.startswith("{") or body.startswith("*") or body.startswith("type "):
        return False

    first_part = body.split(",", 1)[0].strip()
    return bool(first_part)


def parse_export_names(names_blob: str) -> List[str]:
    names = []

    for raw_name in names_blob.split(","):
        cleaned = raw_name.strip()

        if not cleaned:
            continue

        if " as " in cleaned:
            cleaned = cleaned.split(" as ", 1)[-1].strip()

        names.append(cleaned)

    return names


def infer_default_export_name(body: str) -> str:
    if body.startswith("function "):
        parts = body.split()
        return parts[1].split("(", 1)[0] if len(parts) > 1 else "default"

    if body.startswith("class "):
        parts = body.split()
        return parts[1].split("{", 1)[0] if len(parts) > 1 else "default"

    return "default"


def infer_export_role(
    name: str,
    export_kind: str,
    declaration_kind: Optional[str] = None,
) -> str:
    if export_kind in {"reexport", "star_reexport"}:
        return "barrel_export"

    if declaration_kind == "type" or declaration_kind == "interface":
        return "type_export"

    if declaration_kind == "class":
        return "class_export"

    if declaration_kind in {"const", "let", "var"}:
        if is_config_like_name(name):
            return "config_export"

        if is_pascal_case(name):
            return "component_export"

        return "constant_export"

    if is_pascal_case(name):
        return "component_export"

    prefix = detect_export_prefix(name)
    if prefix:
        return EXPORT_VERB_CATEGORY_MAP[prefix]

    if declaration_kind == "function":
        return "function_export"

    if export_kind == "default_export":
        return "default_export"

    return "unknown_export"


def detect_export_prefix(name: str) -> Optional[str]:
    for prefix in EXPORT_VERB_CATEGORY_MAP:
        if name.startswith(prefix) and len(name) > len(prefix):
            suffix = name[len(prefix)]
            if suffix.isupper() or suffix == "_":
                return prefix

    return None


def is_pascal_case(name: str) -> bool:
    return bool(name) and name[0].isupper()


def is_config_like_name(name: str) -> bool:
    return name.isupper() or any(
        keyword in name.lower()
        for keyword in ["config", "constant", "threshold", "limit", "default"]
    )


def infer_import_signals(
    imports: List[Dict[str, Any]],
    category_counts: Counter,
    filename: str,
    signal_confidence: Dict[str, Dict[str, Any]],
) -> List[str]:
    signals = []

    total = len(imports)
    external_count = sum(1 for item in imports if item["pathKind"] == "external_package")
    local_count = total - external_count
    deep_count = sum(1 for item in imports if item["pathKind"] == "deep_relative")
    wide_count = sum(1 for item in imports if item.get("namedCount", 0) >= 5)

    if total > 12:
        signals.append("import_heavy")

    if external_count > 5:
        signals.append("external_import_heavy")

    if local_count > 8:
        signals.append("local_import_heavy")

    if deep_count > 1:
        signals.append("deep_relative_import_heavy")

    if wide_count > 1:
        signals.append("wide_named_import_heavy")

    responsibility_categories = [
        category for category in category_counts
        if category not in {"unknown", "external_package"}
    ]

    if len(responsibility_categories) >= 4:
        signals.append("import_responsibility_spread")

    if confidence_at_least(signal_confidence, "ui_imports_data_access", "medium"):
        signals.append("ui_imports_data_access")

    if confidence_at_least(signal_confidence, "ui_imports_domain_logic", "medium"):
        signals.append("ui_imports_domain_logic")

    # This warning is high-trust only. Medium/low confidence stays as evidence,
    # but does not become a scary production/test-support finding.
    if confidence_at_least(signal_confidence, "production_imports_test_support", "high"):
        signals.append("production_imports_test_support")

    return signals

def build_import_signal_confidence(
    imports: List[Dict[str, Any]],
    category_counts: Counter,
    filename: str,
) -> Dict[str, Dict[str, Any]]:
    confidence: Dict[str, Dict[str, Any]] = {}

    production_file = is_production_file(filename)
    test_support_imports = [
        item for item in imports
        if item.get("testSupportTokens")
    ]

    if test_support_imports:
        level = "high" if production_file else "low"

        confidence["production_imports_test_support"] = {
            "level": level,
            "reason": (
                "Production file imports a path with explicit test/mock/fixture/stub tokens."
                if production_file
                else "Import path contains test-support tokens, but the current file also appears test-like."
            ),
            "evidence": [
                build_import_evidence(item, "test-support token")
                for item in test_support_imports[:8]
            ],
        }

    ui_imports = [
        item for item in imports
        if item.get("category") in UI_CATEGORIES
    ]

    data_access_imports = [
        item for item in imports
        if item.get("category") in DATA_ACCESS_CATEGORIES
    ]

    domain_logic_imports = [
        item for item in imports
        if item.get("category") in DOMAIN_LOGIC_CATEGORIES
    ]

    if ui_imports and data_access_imports:
        confidence["ui_imports_data_access"] = {
            "level": "high" if is_ui_file(filename) else "medium",
            "reason": (
                "UI-shaped file imports data-access modules."
                if is_ui_file(filename)
                else "This file imports both UI and data-access categories."
            ),
            "evidence": [
                *[
                    build_import_evidence(item, "ui import")
                    for item in ui_imports[:4]
                ],
                *[
                    build_import_evidence(item, "data-access import")
                    for item in data_access_imports[:4]
                ],
            ],
        }

    if ui_imports and domain_logic_imports:
        confidence["ui_imports_domain_logic"] = {
            "level": "high" if is_ui_file(filename) else "medium",
            "reason": (
                "UI-shaped file imports domain-logic modules."
                if is_ui_file(filename)
                else "This file imports both UI and domain-logic categories."
            ),
            "evidence": [
                *[
                    build_import_evidence(item, "ui import")
                    for item in ui_imports[:4]
                ],
                *[
                    build_import_evidence(item, "domain-logic import")
                    for item in domain_logic_imports[:4]
                ],
            ],
        }

    return confidence


def build_import_evidence(item: Dict[str, Any], reason: str) -> Dict[str, Any]:
    return {
        "source": item.get("source", ""),
        "category": item.get("category", "unknown"),
        "pathKind": item.get("pathKind", "unknown"),
        "matchedFolders": item.get("matchedFolders", []),
        "testSupportTokens": item.get("testSupportTokens", []),
        "reason": reason,
    }


def confidence_at_least(
    signal_confidence: Dict[str, Dict[str, Any]],
    signal: str,
    minimum: str,
) -> bool:
    order = {
        "low": 1,
        "medium": 2,
        "high": 3,
    }

    level = signal_confidence.get(signal, {}).get("level")

    return order.get(level, 0) >= order.get(minimum, 0)


def is_ui_file(filename: str) -> bool:
    lower = filename.lower().replace("\\", "/")

    return any(
        marker in lower
        for marker in [
            "/components/",
            "/component/",
            "/pages/",
            "/page/",
            "/screens/",
            "/views/",
            ".jsx",
            ".tsx",
        ]
    )

def dedupe_preserve_order(items: List[str]) -> List[str]:
    result = []
    seen = set()

    for item in items:
        if item in seen:
            continue

        result.append(item)
        seen.add(item)

    return result

def infer_export_signals(
    exports: List[Dict[str, Any]],
    kind_counts: Counter,
    role_counts: Counter,
) -> List[str]:
    signals = []

    total = len(exports)
    named_count = total - kind_counts.get("default_export", 0)
    reexport_count = kind_counts.get("reexport", 0) + kind_counts.get("star_reexport", 0)

    if total > 10:
        signals.append("export_heavy")

    if named_count > 8:
        signals.append("named_export_heavy")

    if kind_counts.get("default_export", 0) > 0:
        signals.append("default_export_present")

    if reexport_count > 4:
        signals.append("reexport_heavy")

    if kind_counts.get("star_reexport", 0) > 0:
        signals.append("star_reexport_present")

    if total > 0 and reexport_count == total:
        signals.append("barrel_file")

    role_names = [
        role for role in role_counts
        if role not in {"unknown_export", "barrel_export"}
    ]

    if len(role_names) >= 4:
        signals.append("export_responsibility_spread")
        signals.append("mixed_export_roles")

    utility_roles = {
        "getter_export",
        "predicate_export",
        "builder_export",
        "analyzer_export",
        "handler_export",
        "function_export",
    }

    if sum(role_counts.get(role, 0) for role in utility_roles) >= 8 and len(role_names) >= 4:
        signals.append("utility_grab_bag")

    if role_counts.get("type_export", 0) > 6:
        signals.append("type_export_heavy")

    return signals


def is_production_file(filename: str) -> bool:
    lower = filename.lower().replace("\\", "/")

    return not any(
        marker in lower
        for marker in [
            "/test/",
            "/tests/",
            "/testing/",
            "/__tests__/",
            "/fixture/",
            "/fixtures/",
            "/mock/",
            "/mocks/",
            "/stub/",
            "/stubs/",
            "/fake/",
            "/fakes/",
            ".test.",
            ".spec.",
            "_test.",
            "_spec.",
        ]
    )

def dedupe_exports(exports: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    result = []
    seen = set()

    for item in exports:
        key = (item["name"], item.get("source"), item["exportKind"])

        if key in seen:
            continue

        result.append(item)
        seen.add(key)

    return result


def build_top_counts(counts: Counter, limit: int = 5) -> List[Dict[str, Any]]:
    return [
        {"name": name, "count": count}
        for name, count in counts.most_common(limit)
    ]
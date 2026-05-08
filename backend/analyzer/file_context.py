# backend/analyzer/file_context.py

from pathlib import Path
import re
from typing import Any, Dict, Iterable, List, Set


FOLDER_GROUPS = {
    "app": {
        "app",
        "apps",
        "application",
        "root",
        "shell",
        "layout",
        "layouts",
        "router",
        "routes",
        "routing",
        "entry",
        "bootstrap",
        "main",
    },
    "page": {
        "pages",
        "page",
        "views",
        "view",
        "screens",
        "screen",
        "routes",
    },
    "component": {
        "components",
        "component",
        "ui",
        "widgets",
        "widget",
        "elements",
        "element",
        "partials",
        "shared",
        "common",
    },
    "modal": {
        "modals",
        "modal",
        "dialogs",
        "dialog",
        "overlays",
        "overlay",
        "drawers",
        "drawer",
        "popovers",
        "popover",
    },
    "hook": {
        "hooks",
        "hook",
        "use",
        "composables",
    },
    "service": {
        "services",
        "service",
        "api",
        "apis",
        "client",
        "clients",
        "requests",
        "request",
        "fetchers",
        "fetcher",
        "repositories",
        "repository",
        "repo",
        "data",
        "dataaccess",
        "storage",
        "db",
        "database",
        "supabase",
        "firebase",
    },
    "domain": {
        "domain",
        "core",
        "model",
        "models",
        "entities",
        "entity",
        "logic",
        "rules",
        "rule",
        "engine",
        "engines",
        "semantic",
        "semantics",
        "grammar",
        "spec",
        "specs",
        "schema",
        "schemas",
        "types",
        "contracts",
        "contract",
    },
    "utility": {
        "utils",
        "util",
        "utilities",
        "helpers",
        "helper",
        "lib",
        "libs",
        "support",
        "tools",
        "tool",
        "formatters",
        "formatter",
        "parsers",
        "parser",
        "serializers",
        "serializer",
        "normalizers",
        "normalizer",
        "validators",
        "validator",
        "validation",
    },
    "feature": {
        "features",
        "feature",
        "modules",
        "module",
        "sections",
        "section",
        "flows",
        "flow",
        "workflows",
        "workflow",
    },
    "state": {
        "state",
        "store",
        "stores",
        "redux",
        "zustand",
        "context",
        "contexts",
        "providers",
        "provider",
        "reducers",
        "reducer",
        "actions",
        "action",
        "selectors",
        "selector",
        "signals",
        "signal",
    },
    "test": {
        "test",
        "tests",
        "testing",
        "__tests__",
        "spec",
        "specs",
        "fixtures",
        "fixture",
        "mocks",
        "mock",
        "stubs",
        "stub",
        "fakes",
        "fake",
        "devonly",
        "testutils",
        "test-utils",
    },
    "style_asset": {
        "styles",
        "style",
        "css",
        "scss",
        "sass",
        "theme",
        "themes",
        "tokens",
        "design",
        "assets",
        "asset",
        "images",
        "image",
        "icons",
        "icon",
        "fonts",
        "font",
        "media",
        "static",
        "public",
    },
    "configuration": {
        "config",
        "configs",
        "configuration",
        "env",
        "environment",
        "infra",
        "infrastructure",
        "deployment",
        "deploy",
        "scripts",
        "script",
        "cli",
        "bin",
        "build",
        "vite",
        "webpack",
        "eslint",
        "prettier",
        "tsconfig",
        "docker",
        "ci",
        "github",
    },
}

COMPONENT_SUFFIXES = (
    "panel",
    "card",
    "button",
    "list",
    "table",
    "form",
    "navbar",
    "sidebar",
    "toolbar",
    "header",
    "footer",
)

MODAL_SUFFIXES = (
    "modal",
    "dialog",
    "drawer",
    "popover",
    "overlay",
)

UTILITY_SUFFIXES = (
    "utils",
    "helpers",
    "parser",
    "formatter",
    "validator",
    "normalizer",
    "mapper",
    "builder",
    "factory",
)

SERVICE_SUFFIXES = (
    "service",
    "client",
    "api",
    "repository",
    "repo",
    "gateway",
    "adapter",
)

DOMAIN_SUFFIXES = (
    "domain",
    "rules",
    "engine",
    "schema",
    "types",
    "spec",
    "model",
)

CONFIG_SUFFIXES = (
    "config",
    "settings",
    "environment",
    "env",
)


def build_file_context(filename: str | None = None) -> Dict[str, Any]:
    path_text = normalize_path_text(filename or "untitled")
    path = Path(path_text)
    file_name = path.name or path_text
    stem = strip_compound_suffixes(file_name)
    extension = ''.join(path.suffixes) or path.suffix

    folder_tokens = normalize_tokens(path.parts[:-1])
    file_name_tokens = normalize_tokens(split_name_tokens(stem))
    folder_token_set = set(folder_tokens)
    file_name_token_set = set(file_name_tokens)

    folder_matches = {
        group: sorted(folder_token_set.intersection(tokens))
        for group, tokens in FOLDER_GROUPS.items()
    }

    file_name_lower = normalize_token(stem)

    path_has = {
        group: bool(matches)
        for group, matches in folder_matches.items()
    }

    file_name_flags = {
        "fileNameIsAppRoot": file_name_lower in {
            "app",
            "appcontent",
            "root",
            "rootlayout",
            "main",
            "index",
            "bootstrap",
            "entry",
            "router",
            "routes",
        },
        "fileNameEndsWithPage": ends_with_any(file_name_lower, ("page", "screen", "view", "route", "layout")),
        "fileNameEndsWithComponent": ends_with_any(file_name_lower, COMPONENT_SUFFIXES),
        "fileNameIsModal": ends_with_any(file_name_lower, MODAL_SUFFIXES),
        "fileNameStartsWithUse": stem.startswith("use") and len(stem) > 3 and stem[3:4].isupper(),
        "fileNameLooksService": ends_with_any(file_name_lower, SERVICE_SUFFIXES),
        "fileNameLooksDomain": ends_with_any(file_name_lower, DOMAIN_SUFFIXES),
        "fileNameLooksUtility": ends_with_any(file_name_lower, UTILITY_SUFFIXES),
        "fileNameLooksConfig": ends_with_any(file_name_lower, CONFIG_SUFFIXES),
    }

    role_hints = infer_role_hints(path_has, file_name_flags, extension)

    return {
        "filePath": path_text,
        "fileName": file_name,
        "fileStem": stem,
        "fileExtension": extension,
        "folderTokens": folder_tokens,
        "fileNameTokens": file_name_tokens,
        "folderMatches": folder_matches,
        "roleHints": role_hints,
        **to_path_has_flags(path_has),
        **file_name_flags,
        "fileExtensionIsJsxLike": extension.endswith(".jsx") or extension.endswith(".tsx"),
        "fileExtensionIsStyleLike": extension in {".css", ".scss", ".sass"},
        "fileExtensionIsScriptLike": extension in {".js", ".jsx", ".ts", ".tsx", ".py", ".go", ".java"},
        "noPathRoleDetected": not bool(role_hints),
    }


def normalize_path_text(path_text: str) -> str:
    return path_text.replace("\\", "/").strip()


def strip_compound_suffixes(file_name: str) -> str:
    path = Path(file_name)
    stem = path.name
    for suffix in path.suffixes:
        if stem.endswith(suffix):
            stem = stem[: -len(suffix)]
    return stem or path.stem


def normalize_tokens(values: Iterable[str]) -> List[str]:
    tokens: List[str] = []

    for value in values:
        for token in split_name_tokens(str(value)):
            normalized = normalize_token(token)
            if normalized:
                tokens.append(normalized)

    return tokens


def split_name_tokens(value: str) -> List[str]:
    separated = re.sub(r"([a-z0-9])([A-Z])", r"\1 \2", value)
    return [token for token in re.split(r"[^A-Za-z0-9_]+|_+", separated) if token]


def normalize_token(value: str) -> str:
    return value.lower().replace("-", "").replace("_", "")


def ends_with_any(value: str, suffixes: Iterable[str]) -> bool:
    return any(value.endswith(suffix) for suffix in suffixes)


def to_path_has_flags(path_has: Dict[str, bool]) -> Dict[str, bool]:
    return {
        "pathHasAppFolder": path_has.get("app", False),
        "pathHasPageFolder": path_has.get("page", False),
        "pathHasComponentFolder": path_has.get("component", False),
        "pathHasModalFolder": path_has.get("modal", False),
        "pathHasHookFolder": path_has.get("hook", False),
        "pathHasServiceFolder": path_has.get("service", False),
        "pathHasDomainFolder": path_has.get("domain", False),
        "pathHasUtilityFolder": path_has.get("utility", False),
        "pathHasFeatureFolder": path_has.get("feature", False),
        "pathHasStateFolder": path_has.get("state", False),
        "pathHasTestFolder": path_has.get("test", False),
        "pathHasStyleAssetFolder": path_has.get("style_asset", False),
        "pathHasConfigurationFolder": path_has.get("configuration", False),
    }


def infer_role_hints(path_has: Dict[str, bool], file_name_flags: Dict[str, bool], extension: str) -> List[str]:
    hints: Set[str] = set()

    if path_has.get("app") or file_name_flags["fileNameIsAppRoot"]:
        hints.add("app_root")

    if path_has.get("page") or file_name_flags["fileNameEndsWithPage"]:
        hints.add("page_shell")

    if path_has.get("component") or file_name_flags["fileNameEndsWithComponent"]:
        hints.add("component_file")

    if path_has.get("modal") or file_name_flags["fileNameIsModal"]:
        hints.add("modal_component")

    if path_has.get("hook") or file_name_flags["fileNameStartsWithUse"]:
        hints.add("hook_file")

    if path_has.get("service") or file_name_flags["fileNameLooksService"]:
        hints.add("service_file")

    if path_has.get("domain") or file_name_flags["fileNameLooksDomain"]:
        hints.add("domain_core_file")

    if path_has.get("utility") or file_name_flags["fileNameLooksUtility"]:
        hints.add("utility_file")

    if path_has.get("feature"):
        hints.add("feature_module_file")

    if path_has.get("state"):
        hints.add("state_module_file")

    if path_has.get("test"):
        hints.add("test_support_file")

    if path_has.get("style_asset") or extension in {".css", ".scss", ".sass"}:
        hints.add("style_asset_file")

    if path_has.get("configuration") or file_name_flags["fileNameLooksConfig"]:
        hints.add("configuration_file")

    return sorted(hints)

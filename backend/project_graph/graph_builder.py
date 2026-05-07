from pathlib import Path

from project_graph.dependency_parser import parse_file_dependencies, normalize_path
from project_graph.metrics import (
    calculate_file_metrics,
    calculate_risk_score,
    get_risk_level,
)


SUPPORTED_EXTENSIONS = {".ts", ".tsx", ".js", ".jsx", ".css", ".py", ".go", ".java"}

IGNORED_DIRS = {
    "__MACOSX",
    "node_modules",
    "dist",
    "build",
    ".git",
    "coverage",
    ".next",
    ".vite",
}

IGNORED_FILES = {
    ".DS_Store",
}


def should_ignore_path(path: Path) -> bool:
    if path.name in IGNORED_FILES:
        return True

    return any(part in IGNORED_DIRS for part in path.parts)

def is_supported_file(path: Path) -> bool:
    return path.suffix in SUPPORTED_EXTENSIONS


def scan_project_files(project_root: str) -> list[str]:
    root = Path(project_root)
    files = []

    for path in root.rglob("*"):
        if should_ignore_path(path):
            continue

        if path.is_file() and is_supported_file(path):
            files.append(normalize_path(str(path.relative_to(root))))

    return files


def build_project_graph(project_root: str) -> dict:
    files = scan_project_files(project_root)


    edges = []

    for file_path in files:
        edges.extend(parse_file_dependencies(file_path, project_root))

    node_map = {}

    for file_path in files:
        file_metrics = calculate_file_metrics(file_path, project_root)
        absolute_path = Path(project_root) / file_path
        content = absolute_path.read_text(encoding="utf-8", errors="ignore")
        
        node_map[file_path] = {
            "path": file_path,
            "name": Path(file_path).name,
            "content": content,
            "imports": [],
            "dependents": [],
            "metrics": {
                **file_metrics,
                "fanIn": 0,
                "fanOut": 0,
                "risk": 0,
                "riskLevel": "low"
            },
        }

    for edge in edges:
        from_file = edge["from"]
        to_file = edge["to"]

        if from_file in node_map:
            node_map[from_file]["imports"].append(to_file)

        if to_file in node_map:
            node_map[to_file]["dependents"].append(from_file)

    for node in node_map.values():
        fan_out = len(node["imports"])
        fan_in = len(node["dependents"])
        complexity = node["metrics"]["complexity"]

        risk = calculate_risk_score(complexity, fan_in, fan_out)

        node["metrics"]["fanOut"] = fan_out
        node["metrics"]["fanIn"] = fan_in
        node["metrics"]["risk"] = risk
        node["metrics"]["riskLevel"] = get_risk_level(risk)

    return {
        "nodes": list(node_map.values()),
        "edges": edges,
    }
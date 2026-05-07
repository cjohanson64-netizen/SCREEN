import re
from pathlib import Path


IMPORT_RE = re.compile(
    r"""import\s+(?:.+?\s+from\s+)?["'](.+?)["']""",
    re.MULTILINE,
)

JS_TS_EXTENSIONS = {".ts", ".tsx", ".js", ".jsx"}


def normalize_path(path: str) -> str:
    return path.replace("\\", "/")


def is_relative_import(import_path: str) -> bool:
    return import_path.startswith("./") or import_path.startswith("../")


def parse_imports(file_content: str) -> list[str]:
    imports = IMPORT_RE.findall(file_content)
    return [path for path in imports if is_relative_import(path)]

def resolve_import_path(from_file: str, import_path: str, project_root: str) -> str | None:
    from_path = Path(project_root) / from_file
    base_dir = from_path.parent

    raw_target = base_dir / import_path

    candidates = []

    if raw_target.suffix:
        candidates.append(raw_target)
    else:
        for ext in JS_TS_EXTENSIONS:
            candidates.append(raw_target.with_suffix(ext))

        for ext in JS_TS_EXTENSIONS:
            candidates.append(raw_target / f"index{ext}")

    for candidate in candidates:
        if candidate.exists():
            return normalize_path(str(candidate.relative_to(project_root)))

    return None


def parse_file_dependencies(file_path: str, project_root: str) -> list[dict]:
    absolute_path = Path(project_root) / file_path
    suffix = Path(file_path).suffix

    if suffix not in JS_TS_EXTENSIONS:
        return []

    if not absolute_path.exists():
        return []

    content = absolute_path.read_text(encoding="utf-8", errors="ignore")
    imports = parse_imports(content)
    
    print(file_path, imports)

    edges = []

    for import_path in imports:
        resolved = resolve_import_path(file_path, import_path, project_root)

        if resolved:
            edges.append({
                "from": normalize_path(file_path),
                "to": resolved,
                "importPath": import_path,
            })

    return edges
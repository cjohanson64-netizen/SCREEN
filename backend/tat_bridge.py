import subprocess
import tempfile
from pathlib import Path
from typing import Any, Dict, List


TAT_ROOT = Path(__file__).resolve().parents[1] / "tat"
TAT_RUNNER = TAT_ROOT / "run-module.ts"

RULES_PATH = (
    Path(__file__).resolve().parent
    / "tat"
    / "modules"
    / "review_rules.tat"
)

FINDING_CATALOG = {
    "finding_file_too_large": {
        "rule": "file.too_large",
        "severity": "caution",
        "message": "This file may be doing too much.",
        "whyItMatters": "Large files often hide multiple responsibilities and become harder to navigate safely.",
        "suggestedFix": "Group related code by responsibility and extract one clear section at a time.",
        "nextAction": "Identify one responsibility to extract."
    },
    "finding_complexity_high": {
        "rule": "complexity.high",
        "severity": "warning",
        "message": "This file has high complexity.",
        "whyItMatters": "High branching or nested logic makes bugs harder to isolate and changes riskier.",
        "suggestedFix": "Extract condition-heavy logic into named helper functions.",
        "nextAction": "Refactor complex paths before adding new behavior."
    },
    "finding_duplication_high": {
        "rule": "duplication.high",
        "severity": "warning",
        "message": "Repeated structural patterns were detected.",
        "whyItMatters": "Duplicate logic increases maintenance cost because fixes may need to be repeated.",
        "suggestedFix": "Extract shared behavior into a helper, hook, service, or utility.",
        "nextAction": "Consolidate the highest-impact repeated pattern first."
    },
    "finding_refactor_first": {
        "rule": "risk.refactor_first",
        "severity": "error",
        "message": "This code is risky to extend without refactoring first.",
        "whyItMatters": "The current structure has enough pressure that new features may increase fragility.",
        "suggestedFix": "Make behavior-preserving refactors before adding new functionality.",
        "nextAction": "Refactor before adding new features."
    },
}

STATE_INJECTION_MARKER = "// PYTHON_STATE_INJECTION_GOES_HERE"


def run_tat_review(metrics: Dict[str, Any]) -> Dict[str, Any]:
    state_tat = build_state_injection(metrics)

    with open(RULES_PATH, "r", encoding="utf-8") as file:
        rules_tat = file.read()

    combined = rules_tat.replace(STATE_INJECTION_MARKER, state_tat)

    result = run_tat_source(combined)
    edges = parse_tat_edges(result.stdout)
    clusters = build_clusters(edges)
    findings = build_findings(edges)

    return {
        "success": result.returncode == 0,
        "stdout": result.stdout,
        "stderr": result.stderr,
        "edges": edges,
        "signals": [
            edge["object"]
            for edge in edges
            if edge["relation"] == "hasSignal"
        ],
        "risks": [
            edge["object"]
            for edge in edges
            if edge["relation"] == "hasRisk"
        ],
        "clusters": clusters,
        "findings": findings,
        "tatSource": combined,
    }


def run_tat_source(source: str):
    with tempfile.NamedTemporaryFile(
        mode="w",
        suffix=".tat",
        delete=False,
        encoding="utf-8",
    ) as temp_file:
        temp_file.write(source)
        temp_path = temp_file.name

    return subprocess.run(
        ["npx", "tsx", str(TAT_RUNNER), temp_path],
        cwd=str(TAT_ROOT),
        capture_output=True,
        text=True,
    )


def parse_tat_edges(stdout: str) -> List[Dict[str, str]]:
    edges = []

    for line in stdout.splitlines():
        if " --" not in line or "--> " not in line:
            continue

        try:
            subject, rest = line.split(" --", 1)
            relation, obj = rest.split("--> ", 1)

            edges.append(
                {
                    "subject": subject.strip(),
                    "relation": relation.strip(),
                    "object": obj.strip(),
                }
            )
        except ValueError:
            continue

    return edges


def build_clusters(edges: List[Dict[str, str]]) -> Dict[str, List[str]]:
    clusters: Dict[str, List[str]] = {}

    for edge in edges:
        if edge["relation"] != "belongsToCluster":
            continue

        cluster = edge["object"]
        signal = edge["subject"]

        if cluster not in clusters:
            clusters[cluster] = []

        clusters[cluster].append(signal)

    return clusters

def build_findings(edges: List[Dict[str, str]]) -> List[Dict[str, str]]:
    findings = []

    for edge in edges:
        if edge["relation"] != "hasFinding":
            continue

        finding_id = edge["object"]
        finding = FINDING_CATALOG.get(finding_id)

        if finding:
            findings.append({
                "id": finding_id,
                **finding,
            })

    return findings

def build_state_injection(metrics: Dict[str, Any]) -> str:
    flattened = flatten_metrics(metrics)

    return f"""
  -> @graft.state(file_analysis, "lineCount", {flattened["lineCount"]})
  -> @graft.state(file_analysis, "tokenEstimate", {flattened["tokenEstimate"]})
  -> @graft.state(file_analysis, "functionCount", {flattened["functionCount"]})
  -> @graft.state(file_analysis, "blockCount", {flattened["blockCount"]})
  -> @graft.state(file_analysis, "maxNestingDepth", {flattened["maxNestingDepth"]})
  -> @graft.state(file_analysis, "longLines", {flattened["longLines"]})
  -> @graft.state(file_analysis, "repetitionScore", {flattened["repetitionScore"]})
  -> @graft.state(file_analysis, "complexityScore", {flattened["complexityScore"]})
  -> @graft.state(file_analysis, "decisionKeywords", {flattened["decisionKeywords"]})
  -> @graft.state(file_analysis, "loopCount", {flattened["loopCount"]})
  -> @graft.state(file_analysis, "booleanOperators", {flattened["booleanOperators"]})
  -> @graft.state(file_analysis, "tryCatchBlocks", {flattened["tryCatchBlocks"]})
"""


def flatten_metrics(metrics: Dict[str, Any]) -> Dict[str, Any]:
    complexity = metrics.get("complexity", {})
    repetition = metrics.get("repetition", {})

    return {
        "lineCount": metrics.get("lineCount", 0),
        "tokenEstimate": metrics.get("tokenEstimate", 0),
        "functionCount": metrics.get("functionCount", 0),
        "blockCount": metrics.get("blockCount", 0),
        "maxNestingDepth": metrics.get("maxNestingDepth", 0),
        "longLines": metrics.get("longLines", 0),
        "repetitionScore": repetition.get("repetitionScore", 0),
        "complexityScore": complexity.get("complexityScore", 0),
        "decisionKeywords": complexity.get("decisionKeywords", 0),
        "loopCount": complexity.get("loopCount", 0),
        "booleanOperators": complexity.get("booleanOperators", 0),
        "tryCatchBlocks": complexity.get("tryCatchBlocks", 0),
    }
import re
import subprocess
import tempfile
from pathlib import Path
from typing import Any, Dict, List


TAT_ROOT = Path(__file__).resolve().parents[1] / "tat-library"
TAT_RUNNER = TAT_ROOT / "run-module.ts"

RULES_PATH = (
    Path(__file__).resolve().parent
    / "tat_modules"
    / "review_rules.tat"
)

STATE_INJECTION_HOOK = "python_review_state"
STATE_INJECTION_EXTENSION = ".py"

FINDING_CATALOG = {
    "finding_file_too_large": {
        "rule": "file.too_large",
        "severity": "caution",
        "message": "This file may be doing too much.",
        "whyItMatters": "Large files often hide multiple responsibilities and become harder to navigate safely.",
        "suggestedFix": "Group related code by responsibility and extract one clear section at a time.",
        "nextAction": "Identify one responsibility to extract.",
    },
    "finding_complexity_high": {
        "rule": "complexity.high",
        "severity": "warning",
        "message": "This file has high complexity.",
        "whyItMatters": "High branching or nested logic makes bugs harder to isolate and changes riskier.",
        "suggestedFix": "Extract condition-heavy logic into named helper functions.",
        "nextAction": "Refactor complex paths before adding new behavior.",
    },
    "finding_duplication_high": {
        "rule": "duplication.high",
        "severity": "warning",
        "message": "Repeated structural patterns were detected.",
        "whyItMatters": "Duplicate logic increases maintenance cost because fixes may need to be repeated.",
        "suggestedFix": "Extract shared behavior into a helper, hook, service, or utility.",
        "nextAction": "Consolidate the highest-impact repeated pattern first.",
    },
    "finding_refactor_first": {
        "rule": "risk.refactor_first",
        "severity": "error",
        "message": "This code is risky to extend without refactoring first.",
        "whyItMatters": "The current structure has enough pressure that new features may increase fragility.",
        "suggestedFix": "Make behavior-preserving refactors before adding new functionality.",
        "nextAction": "Refactor before adding new features.",
    },
    "finding_hooks_should_move": {
        "rule": "functions.hooks_clustered",
        "severity": "caution",
        "message": "This file contains several hook-shaped functions.",
        "whyItMatters": "Many useX functions in one file often means reusable stateful behavior is mixed into the main file responsibility.",
        "suggestedFix": "Move related useX functions into a hooks folder or a focused custom-hook module.",
        "nextAction": "Extract the most reused hook-shaped function first.",
    },
    "finding_components_should_split": {
        "rule": "functions.components_clustered",
        "severity": "caution",
        "message": "This file contains several component-shaped functions.",
        "whyItMatters": "Many PascalCase functions in one file can hide a component tree that deserves clearer file boundaries.",
        "suggestedFix": "Move secondary components into component files or a local components folder.",
        "nextAction": "Extract the largest child component first.",
    },
    "finding_getters_should_group": {
        "rule": "functions.getters_clustered",
        "severity": "info",
        "message": "This file contains several getter-shaped functions.",
        "whyItMatters": "Many getX functions can mean the file is acting as a data-access or selector layer.",
        "suggestedFix": "Consider grouping related getters into a selector, query, or utility module.",
        "nextAction": "Group related getX functions by the data they read.",
    },
    "finding_predicates_should_group": {
        "rule": "functions.predicates_clustered",
        "severity": "info",
        "message": "This file contains several predicate-shaped functions.",
        "whyItMatters": "Many hasX, isX, canX, or shouldX functions can hide business rules inside a general-purpose file.",
        "suggestedFix": "Move related predicate logic into named rule or guard helpers.",
        "nextAction": "Extract the clearest predicate group first.",
    },
    "finding_analyzers_should_group": {
        "rule": "functions.analyzers_clustered",
        "severity": "caution",
        "message": "This file contains several analyzer-shaped functions.",
        "whyItMatters": "Many analyzeX or detectX functions usually means the file has a semantic analysis responsibility that deserves its own module.",
        "suggestedFix": "Move analysis functions into an analyzer module with a clear orchestration entry point.",
        "nextAction": "Extract related analyzeX/detectX functions into a focused analyzer file.",
    },
    "finding_handlers_should_group": {
        "rule": "functions.handlers_clustered",
        "severity": "info",
        "message": "This file contains several handler-shaped functions.",
        "whyItMatters": "Many handleX or toggleX functions can mean UI event handling is mixed with rendering or data logic.",
        "suggestedFix": "Group handlers near the state they modify or extract them into interaction helpers.",
        "nextAction": "Separate event-handling logic from rendering logic where possible.",
    },
        "finding_boolean_constants_should_group": {
        "rule": "constants.boolean_clustered",
        "severity": "caution",
        "message": "This file contains many boolean-shaped constants.",
        "whyItMatters": "Many isX, hasX, canX, or shouldX constants can mean decision logic is scattered across local flags.",
        "suggestedFix": "Group related boolean constants into named predicate helpers, guard helpers, or a rule module.",
        "nextAction": "Extract the clearest boolean-rule cluster first.",
    },
    "finding_threshold_constants_should_group": {
        "rule": "constants.thresholds_clustered",
        "severity": "caution",
        "message": "This file contains several threshold or configuration constants.",
        "whyItMatters": "Thresholds like MAX, MIN, LIMIT, DEFAULT, and RISK_THRESHOLD often represent tuning rules that should be easy to find and audit.",
        "suggestedFix": "Move related thresholds into a constants, config, or scoring-rules module.",
        "nextAction": "Group threshold constants by the behavior they control.",
    },
    "finding_flag_constants_should_group": {
        "rule": "constants.flags_clustered",
        "severity": "info",
        "message": "This file contains several flag-shaped constants.",
        "whyItMatters": "Many UI/state flags can make rendering and interaction state harder to reason about.",
        "suggestedFix": "Group related flags into state objects or focused UI state helpers.",
        "nextAction": "Group flags by UI region or state domain.",
    },
    "finding_decision_constants_should_group": {
        "rule": "constants.decision_rules_clustered",
        "severity": "caution",
        "message": "This file contains several decision-rule constants.",
        "whyItMatters": "Many shouldX, canX, requiresX, or allowsX constants can hide policy or permission logic inside a general file.",
        "suggestedFix": "Move decision-rule constants into named rule helpers or predicate modules.",
        "nextAction": "Extract permission or decision constants into named rules.",
    },
        "finding_render_data_projection_should_extract": {
        "rule": "constants.render_data_projection",
        "severity": "info",
        "message": "This file projects several values into render-ready constants.",
        "whyItMatters": "Render data projection is often helpful, but too much of it can make a component feel like it is building a view model inline.",
        "suggestedFix": "Consider grouping render-derived values into a selector, view-model helper, or focused hook when the projection grows.",
        "nextAction": "Review whether derived render values belong in a helper or hook.",
    },
    "finding_action_guards_should_group": {
        "rule": "constants.action_guards_clustered",
        "severity": "caution",
        "message": "This file contains several action-guard constants.",
        "whyItMatters": "Many disabled/allowed/guard constants can hide interaction rules inside rendering code.",
        "suggestedFix": "Group related action guards into predicate helpers or a UI interaction rule module.",
        "nextAction": "Extract related disabled/can/should action guards first.",
    },
    "finding_function_expressions_should_review": {
        "rule": "constants.function_expressions",
        "severity": "info",
        "message": "This file declares functions with const-style assignments.",
        "whyItMatters": "Const arrow functions are valid, but they should be interpreted as functions rather than normal constants.",
        "suggestedFix": "Review whether these should be counted and grouped with functions rather than constants.",
        "nextAction": "Check whether const function expressions belong with function-profile findings.",
    },
    "finding_view_model_pressure": {
        "rule": "constants.view_model_pressure",
        "severity": "caution",
        "message": "This file may be building a view model inline.",
        "whyItMatters": "Many entity aliases, collection aliases, derived values, and action guards can make a component responsible for preparing too much display data.",
        "suggestedFix": "Consider extracting render-data preparation into a selector, custom hook, or view-model helper.",
        "nextAction": "Extract the clearest render-data projection group first.",
    },
        "finding_import_responsibility_spread": {
        "rule": "imports.responsibility_spread",
        "severity": "caution",
        "message": "This file imports from several responsibility zones.",
        "whyItMatters": "Imports from UI, state, domain, data, config, and utility layers can mean the file is coordinating too many concerns.",
        "suggestedFix": "Review whether orchestration, data access, and domain logic should be separated into clearer modules.",
        "nextAction": "Identify the imported responsibility category that does not belong in this file.",
    },
    "finding_ui_imports_data_access": {
        "rule": "imports.ui_data_coupling",
        "severity": "caution",
        "message": "This UI-shaped file imports data-access code.",
        "whyItMatters": "When rendering code imports API, service, repository, or database modules directly, the component may be mixing view and data responsibilities.",
        "suggestedFix": "Consider moving data access into a hook, service wrapper, or parent orchestration layer.",
        "nextAction": "Extract direct data access away from the rendering component first.",
    },
    "finding_ui_imports_domain_logic": {
        "rule": "imports.ui_domain_coupling",
        "severity": "info",
        "message": "This UI-shaped file imports domain or rule logic.",
        "whyItMatters": "Domain rule imports can be healthy, but too many can make a component responsible for policy decisions.",
        "suggestedFix": "Consider grouping domain decisions into selectors, predicates, or view-model helpers.",
        "nextAction": "Review whether domain rules are being used for rendering only or for deeper decision-making.",
    },
    "finding_production_imports_test_support": {
        "rule": "imports.production_imports_test_support",
        "severity": "warning",
        "message": "This production file imports test support code.",
        "whyItMatters": "Production code depending on fixtures, mocks, stubs, or test helpers can create fragile runtime behavior.",
        "suggestedFix": "Move test-only data or mocks out of the production dependency path.",
        "nextAction": "Remove or replace the test-support import.",
    },
    "finding_export_responsibility_spread": {
        "rule": "exports.responsibility_spread",
        "severity": "caution",
        "message": "This file exports several different responsibility types.",
        "whyItMatters": "A wide export surface can make a module feel like a grab bag and increase refactor risk.",
        "suggestedFix": "Group exports by responsibility or split unrelated exports into focused modules.",
        "nextAction": "Identify the largest unrelated export role group.",
    },
    "finding_utility_grab_bag": {
        "rule": "exports.utility_grab_bag",
        "severity": "caution",
        "message": "This file appears to expose a grab bag of utility exports.",
        "whyItMatters": "Mixed utility exports can make a module harder to navigate, test, and safely change.",
        "suggestedFix": "Split utility exports by role, such as getters, predicates, builders, analyzers, or handlers.",
        "nextAction": "Extract the most coherent export group first.",
    },
    "finding_barrel_file": {
        "rule": "exports.barrel_file",
        "severity": "info",
        "message": "This file appears to be a barrel or public API gateway.",
        "whyItMatters": "Barrel files are often healthy, but changes can affect many import sites.",
        "suggestedFix": "Keep re-exports intentional and avoid mixing unrelated public APIs.",
        "nextAction": "Verify the barrel groups related exports only.",
    },
    "finding_public_api_pressure": {
        "rule": "exports.public_api_pressure",
        "severity": "caution",
        "message": "This file exposes a large public surface.",
        "whyItMatters": "Files with many named exports become harder to refactor because more consumers may depend on them.",
        "suggestedFix": "Review whether the public API should be split by responsibility.",
        "nextAction": "Group exported symbols by role before changing behavior.",
    },
}


def run_tat_review(metrics: Dict[str, Any]) -> Dict[str, Any]:
    state_tat = build_state_injection(metrics)

    with open(RULES_PATH, "r", encoding="utf-8") as file:
        rules_tat = file.read()

    combined = resolve_tat_injection(
        tat_source=rules_tat,
        hook_ref=STATE_INJECTION_HOOK,
        file_extension=STATE_INJECTION_EXTENSION,
        injected_source=state_tat,
    )
    
    result = run_tat_source(combined)
    
    result = run_tat_source(combined)

    if result.returncode != 0:
        print("\n--- TAT REVIEW FAILED ---")
        print("Return code:", result.returncode)
        print("\nSTDOUT:")
        print(result.stdout)
        print("\nSTDERR:")
        print(result.stderr)
        print("\nGENERATED TAT SOURCE:")
        print(combined)
        print("--- END TAT REVIEW FAILURE ---\n")
            
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

    try:
        return subprocess.run(
            ["npx", "tsx", str(TAT_RUNNER), temp_path],
            cwd=str(TAT_ROOT),
            capture_output=True,
            text=True,
            timeout=20,
        )
    except subprocess.TimeoutExpired as error:
        stdout = decode_process_text(error.stdout)
        stderr = decode_process_text(error.stderr)

        return subprocess.CompletedProcess(
            args=error.cmd,
            returncode=124,
            stdout=stdout,
            stderr=stderr + "\nTAT review timed out after 20 seconds.",
        )


def decode_process_text(value: Any) -> str:
    if value is None:
        return ""

    if isinstance(value, bytes):
        return value.decode("utf-8", errors="replace")

    return str(value)


def parse_tat_edges(stdout: str) -> List[Dict[str, str]]:
    edges: List[Dict[str, str]] = []

    for line in stdout.splitlines():
        old_edge = parse_legacy_edge_line(line)
        if old_edge:
            edges.append(old_edge)
            continue

        new_edge = parse_graph_edge_line(line)
        if new_edge:
            edges.append(new_edge)

    return edges


def parse_legacy_edge_line(line: str) -> Dict[str, str] | None:
    if " --" not in line or "--> " not in line:
        return None

    try:
        subject, rest = line.split(" --", 1)
        relation, obj = rest.split("--> ", 1)
    except ValueError:
        return None

    return {
        "subject": subject.strip(),
        "relation": relation.strip(),
        "object": obj.strip(),
    }


def parse_graph_edge_line(line: str) -> Dict[str, str] | None:
    stripped = line.strip()

    if not stripped.startswith("- [") or not stripped.endswith("]"):
        return None

    edge_body = stripped[3:-1]
    parts = [part.strip() for part in edge_body.split(" : ")]

    if len(parts) != 3:
        return None

    subject, relation, obj = parts

    return {
        "subject": subject,
        "relation": relation,
        "object": obj,
    }


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

def resolve_tat_injection(
    tat_source: str,
    hook_ref: str,
    file_extension: str,
    injected_source: str,
) -> str:
    """
    SCREEN-side injection resolver.

    The SCREEN-owned TAT module declares an injection point using current TAT syntax:

      <- @inject(python_review_state, ".py")

    Python supplies the generated TAT graph-flow fragment for that hook, then passes
    the resolved source to the TAT runner.

    This keeps SCREEN's .tat files aligned with current injection syntax without
    modifying tat-library/runtime code.
    """
    extension_pattern = re.escape(file_extension)

    injection_pattern = re.compile(
        rf"""(?m)^[ \t]*<-\s*@inject\(\s*
        {re.escape(hook_ref)}
        \s*,\s*
        (?P<quote>["']){extension_pattern}(?P=quote)
        \s*
        (?:,\s*[A-Za-z_]\w*)?
        \s*\)\s*$""",
        re.VERBOSE,
    )

    if not injection_pattern.search(tat_source):
        raise ValueError(
            f'Missing TAT injection hook `<- @inject({hook_ref}, "{file_extension}")`.'
        )

    return injection_pattern.sub(injected_source.rstrip(), tat_source, count=1)

def build_state_injection(metrics: Dict[str, Any]) -> str:
    flattened = flatten_metrics(metrics)

    return f"""
  -> @graft.state(file_analysis, lineCount, {flattened["lineCount"]})
  -> @graft.state(file_analysis, tokenEstimate, {flattened["tokenEstimate"]})
  -> @graft.state(file_analysis, functionCount, {flattened["functionCount"]})
  -> @graft.state(file_analysis, constantCount, {flattened["constantCount"]})

  -> @graft.state(file_analysis, hookFunctionCount, {flattened["hookFunctionCount"]})
  -> @graft.state(file_analysis, componentFunctionCount, {flattened["componentFunctionCount"]})
  -> @graft.state(file_analysis, getterFunctionCount, {flattened["getterFunctionCount"]})
  -> @graft.state(file_analysis, setterFunctionCount, {flattened["setterFunctionCount"]})
  -> @graft.state(file_analysis, predicateFunctionCount, {flattened["predicateFunctionCount"]})
  -> @graft.state(file_analysis, analyzerFunctionCount, {flattened["analyzerFunctionCount"]})
  -> @graft.state(file_analysis, handlerFunctionCount, {flattened["handlerFunctionCount"]})
  -> @graft.state(file_analysis, builderFunctionCount, {flattened["builderFunctionCount"]})
  -> @graft.state(file_analysis, transformerFunctionCount, {flattened["transformerFunctionCount"]})
  -> @graft.state(file_analysis, ioFunctionCount, {flattened["ioFunctionCount"]})
  -> @graft.state(file_analysis, orchestratorFunctionCount, {flattened["orchestratorFunctionCount"]})

  -> @graft.state(file_analysis, booleanConstantCount, {flattened["booleanConstantCount"]})
  -> @graft.state(file_analysis, thresholdConstantCount, {flattened["thresholdConstantCount"]})
  -> @graft.state(file_analysis, flagConstantCount, {flattened["flagConstantCount"]})
  -> @graft.state(file_analysis, decisionRuleConstantCount, {flattened["decisionRuleConstantCount"]})
  -> @graft.state(file_analysis, predicateConstantCount, {flattened["predicateConstantCount"]})
  -> @graft.state(file_analysis, capabilityConstantCount, {flattened["capabilityConstantCount"]})
  -> @graft.state(file_analysis, requirementRuleConstantCount, {flattened["requirementRuleConstantCount"]})
  -> @graft.state(file_analysis, featureFlagConstantCount, {flattened["featureFlagConstantCount"]})
  -> @graft.state(file_analysis, visibilityFlagConstantCount, {flattened["visibilityFlagConstantCount"]})
  -> @graft.state(file_analysis, stateFlagConstantCount, {flattened["stateFlagConstantCount"]})
  -> @graft.state(file_analysis, validationFlagConstantCount, {flattened["validationFlagConstantCount"]})

  -> @graft.state(file_analysis, functionExpressionConstantCount, {flattened["functionExpressionConstantCount"]})
  -> @graft.state(file_analysis, entityAliasConstantCount, {flattened["entityAliasConstantCount"]})
  -> @graft.state(file_analysis, collectionAliasConstantCount, {flattened["collectionAliasConstantCount"]})
  -> @graft.state(file_analysis, derivedValueConstantCount, {flattened["derivedValueConstantCount"]})
  -> @graft.state(file_analysis, derivedNumericValueConstantCount, {flattened["derivedNumericValueConstantCount"]})
  -> @graft.state(file_analysis, booleanDerivedValueConstantCount, {flattened["booleanDerivedValueConstantCount"]})
  -> @graft.state(file_analysis, actionGuardConstantCount, {flattened["actionGuardConstantCount"]})
  -> @graft.state(file_analysis, renderDataProjectionConstantCount, {flattened["renderDataProjectionConstantCount"]})

  -> @graft.state(file_analysis, importCount, {flattened["importCount"]})
  -> @graft.state(file_analysis, externalImportCount, {flattened["externalImportCount"]})
  -> @graft.state(file_analysis, localImportCount, {flattened["localImportCount"]})
  -> @graft.state(file_analysis, relativeImportCount, {flattened["relativeImportCount"]})
  -> @graft.state(file_analysis, deepRelativeImportCount, {flattened["deepRelativeImportCount"]})
  -> @graft.state(file_analysis, internalAliasImportCount, {flattened["internalAliasImportCount"]})
  -> @graft.state(file_analysis, sideEffectImportCount, {flattened["sideEffectImportCount"]})
  -> @graft.state(file_analysis, wideNamedImportCount, {flattened["wideNamedImportCount"]})
  -> @graft.state(file_analysis, importResponsibilityCategoryCount, {flattened["importResponsibilityCategoryCount"]})

  -> @graft.state(file_analysis, uiRenderingImportCount, {flattened["uiRenderingImportCount"]})
  -> @graft.state(file_analysis, stateBehaviorImportCount, {flattened["stateBehaviorImportCount"]})
  -> @graft.state(file_analysis, generalUtilityImportCount, {flattened["generalUtilityImportCount"]})
  -> @graft.state(file_analysis, domainLogicImportCount, {flattened["domainLogicImportCount"]})
  -> @graft.state(file_analysis, dataAccessImportCount, {flattened["dataAccessImportCount"]})
  -> @graft.state(file_analysis, configurationImportCount, {flattened["configurationImportCount"]})
  -> @graft.state(file_analysis, typeContractImportCount, {flattened["typeContractImportCount"]})
  -> @graft.state(file_analysis, featureModuleImportCount, {flattened["featureModuleImportCount"]})
  -> @graft.state(file_analysis, testSupportImportCount, {flattened["testSupportImportCount"]})
  -> @graft.state(file_analysis, assetDependencyImportCount, {flattened["assetDependencyImportCount"]})
  -> @graft.state(file_analysis, infrastructureImportCount, {flattened["infrastructureImportCount"]})
  -> @graft.state(file_analysis, unknownImportCount, {flattened["unknownImportCount"]})

  -> @graft.state(file_analysis, importResponsibilitySpreadDetected, {flattened["importResponsibilitySpreadDetected"]})
  -> @graft.state(file_analysis, uiImportsDataAccessDetected, {flattened["uiImportsDataAccessDetected"]})
  -> @graft.state(file_analysis, uiImportsDomainLogicDetected, {flattened["uiImportsDomainLogicDetected"]})
  -> @graft.state(file_analysis, productionImportsTestSupportDetected, {flattened["productionImportsTestSupportDetected"]})

  -> @graft.state(file_analysis, exportCount, {flattened["exportCount"]})
  -> @graft.state(file_analysis, namedExportCount, {flattened["namedExportCount"]})
  -> @graft.state(file_analysis, defaultExportCount, {flattened["defaultExportCount"]})
  -> @graft.state(file_analysis, functionExportCount, {flattened["functionExportCount"]})
  -> @graft.state(file_analysis, constantExportCount, {flattened["constantExportCount"]})
  -> @graft.state(file_analysis, typeExportCount, {flattened["typeExportCount"]})
  -> @graft.state(file_analysis, classExportCount, {flattened["classExportCount"]})
  -> @graft.state(file_analysis, componentExportCount, {flattened["componentExportCount"]})
  -> @graft.state(file_analysis, hookExportCount, {flattened["hookExportCount"]})
  -> @graft.state(file_analysis, predicateExportCount, {flattened["predicateExportCount"]})
  -> @graft.state(file_analysis, getterExportCount, {flattened["getterExportCount"]})
  -> @graft.state(file_analysis, builderExportCount, {flattened["builderExportCount"]})
  -> @graft.state(file_analysis, analyzerExportCount, {flattened["analyzerExportCount"]})
  -> @graft.state(file_analysis, handlerExportCount, {flattened["handlerExportCount"]})
  -> @graft.state(file_analysis, configExportCount, {flattened["configExportCount"]})
  -> @graft.state(file_analysis, reexportCount, {flattened["reexportCount"]})
  -> @graft.state(file_analysis, starReexportCount, {flattened["starReexportCount"]})
  -> @graft.state(file_analysis, exportResponsibilityRoleCount, {flattened["exportResponsibilityRoleCount"]})

  -> @graft.state(file_analysis, exportResponsibilitySpreadDetected, {flattened["exportResponsibilitySpreadDetected"]})
  -> @graft.state(file_analysis, mixedExportRolesDetected, {flattened["mixedExportRolesDetected"]})
  -> @graft.state(file_analysis, utilityGrabBagDetected, {flattened["utilityGrabBagDetected"]})
  -> @graft.state(file_analysis, barrelFileDetected, {flattened["barrelFileDetected"]})
  -> @graft.state(file_analysis, starReexportDetected, {flattened["starReexportDetected"]})

  -> @graft.state(file_analysis, blockCount, {flattened["blockCount"]})
  -> @graft.state(file_analysis, maxNestingDepth, {flattened["maxNestingDepth"]})
  -> @graft.state(file_analysis, longLines, {flattened["longLines"]})
  -> @graft.state(file_analysis, repetitionScore, {flattened["repetitionScore"]})
  -> @graft.state(file_analysis, complexityScore, {flattened["complexityScore"]})
  -> @graft.state(file_analysis, decisionKeywords, {flattened["decisionKeywords"]})
  -> @graft.state(file_analysis, loopCount, {flattened["loopCount"]})
  -> @graft.state(file_analysis, booleanOperators, {flattened["booleanOperators"]})
  -> @graft.state(file_analysis, tryCatchBlocks, {flattened["tryCatchBlocks"]})
"""
def tat_bool(value: bool) -> str:
    return "true" if value else "false"

def flatten_metrics(metrics: Dict[str, Any]) -> Dict[str, Any]:
    complexity = metrics.get("complexity", {})
    repetition = metrics.get("repetition", {})

    function_profile = metrics.get("functionProfile", {})
    function_categories = function_profile.get("categoryCounts", {})

    constant_profile = metrics.get("constantProfile", {})
    constant_categories = constant_profile.get("categoryCounts", {})

    import_profile = metrics.get("importProfile", {})
    import_categories = import_profile.get("categoryCounts", {})
    import_signals = set(import_profile.get("signals", []))

    export_profile = metrics.get("exportProfile", {})
    export_signals = set(export_profile.get("signals", []))

    return {
        "lineCount": metrics.get("lineCount", 0),
        "tokenEstimate": metrics.get("tokenEstimate", 0),
        "functionCount": metrics.get("functionCount", 0),
        "constantCount": metrics.get("constantCount", 0),

        "hookFunctionCount": function_profile.get("hookCount", 0),
        "componentFunctionCount": function_profile.get("componentCount", 0),
        "getterFunctionCount": function_categories.get("getters", 0),
        "setterFunctionCount": function_categories.get("setters", 0),
        "predicateFunctionCount": function_categories.get("predicates", 0),
        "analyzerFunctionCount": function_categories.get("analyzers", 0),
        "handlerFunctionCount": function_categories.get("handlers", 0),
        "builderFunctionCount": function_categories.get("builders", 0),
        "transformerFunctionCount": function_categories.get("transformers", 0),
        "ioFunctionCount": function_categories.get("io", 0),
        "orchestratorFunctionCount": function_categories.get("orchestrators", 0),

        "booleanConstantCount": constant_profile.get("booleanLikeCount", 0),
        "thresholdConstantCount": constant_profile.get("thresholdLikeCount", 0),
        "flagConstantCount": constant_profile.get("flagLikeCount", 0),
        "decisionRuleConstantCount": constant_profile.get("decisionRuleLikeCount", 0),
        "predicateConstantCount": constant_categories.get("predicates", 0),
        "capabilityConstantCount": constant_categories.get("capabilities", 0),
        "requirementRuleConstantCount": constant_categories.get("requirementRules", 0),
        "featureFlagConstantCount": constant_categories.get("featureFlags", 0),
        "visibilityFlagConstantCount": constant_categories.get("visibilityFlags", 0),
        "stateFlagConstantCount": constant_categories.get("stateFlags", 0),
        "validationFlagConstantCount": constant_categories.get("validationFlags", 0),

        "functionExpressionConstantCount": constant_profile.get("functionExpressionCount", 0),
        "entityAliasConstantCount": constant_profile.get("entityAliasCount", 0),
        "collectionAliasConstantCount": constant_profile.get("collectionAliasCount", 0),
        "derivedValueConstantCount": constant_profile.get("derivedValueCount", 0),
        "derivedNumericValueConstantCount": constant_profile.get("derivedNumericValueCount", 0),
        "booleanDerivedValueConstantCount": constant_profile.get("booleanDerivedValueCount", 0),
        "actionGuardConstantCount": constant_profile.get("actionGuardCandidateCount", 0),
        "renderDataProjectionConstantCount": constant_profile.get("renderDataProjectionCount", 0),

        "importCount": import_profile.get("total", 0),
        "externalImportCount": import_profile.get("externalCount", 0),
        "localImportCount": import_profile.get("localCount", 0),
        "relativeImportCount": import_profile.get("relativeCount", 0),
        "deepRelativeImportCount": import_profile.get("deepRelativeCount", 0),
        "internalAliasImportCount": import_profile.get("internalAliasCount", 0),
        "sideEffectImportCount": import_profile.get("sideEffectCount", 0),
        "wideNamedImportCount": import_profile.get("wideNamedImportCount", 0),
        "importResponsibilityCategoryCount": import_profile.get("responsibilityCategoryCount", 0),

        "uiRenderingImportCount": import_categories.get("ui_rendering", 0),
        "stateBehaviorImportCount": import_categories.get("state_behavior", 0),
        "generalUtilityImportCount": import_categories.get("general_utility", 0),
        "domainLogicImportCount": import_categories.get("domain_logic", 0),
        "dataAccessImportCount": import_categories.get("data_access", 0),
        "configurationImportCount": import_categories.get("configuration", 0),
        "typeContractImportCount": import_categories.get("type_contract", 0),
        "featureModuleImportCount": import_categories.get("feature_module", 0),
        "testSupportImportCount": import_categories.get("test_support", 0),
        "assetDependencyImportCount": import_categories.get("asset_dependency", 0),
        "infrastructureImportCount": import_categories.get("infrastructure", 0),
        "unknownImportCount": import_categories.get("unknown", 0),

        "importResponsibilitySpreadDetected": tat_bool("import_responsibility_spread" in import_signals),
        "uiImportsDataAccessDetected": tat_bool("ui_imports_data_access" in import_signals),
        "uiImportsDomainLogicDetected": tat_bool("ui_imports_domain_logic" in import_signals),
        "productionImportsTestSupportDetected": tat_bool("production_imports_test_support" in import_signals),

        "exportCount": export_profile.get("total", 0),
        "namedExportCount": export_profile.get("namedCount", 0),
        "defaultExportCount": export_profile.get("defaultCount", 0),
        "functionExportCount": export_profile.get("functionExportCount", 0),
        "constantExportCount": export_profile.get("constantExportCount", 0),
        "typeExportCount": export_profile.get("typeExportCount", 0),
        "classExportCount": export_profile.get("classExportCount", 0),
        "componentExportCount": export_profile.get("componentExportCount", 0),
        "hookExportCount": export_profile.get("hookExportCount", 0),
        "predicateExportCount": export_profile.get("predicateExportCount", 0),
        "getterExportCount": export_profile.get("getterExportCount", 0),
        "builderExportCount": export_profile.get("builderExportCount", 0),
        "analyzerExportCount": export_profile.get("analyzerExportCount", 0),
        "handlerExportCount": export_profile.get("handlerExportCount", 0),
        "configExportCount": export_profile.get("configExportCount", 0),
        "reexportCount": export_profile.get("reexportCount", 0),
        "starReexportCount": export_profile.get("starReexportCount", 0),
        "exportResponsibilityRoleCount": export_profile.get("responsibilityRoleCount", 0),

        "exportResponsibilitySpreadDetected": tat_bool("export_responsibility_spread" in export_signals),
        "mixedExportRolesDetected": tat_bool("mixed_export_roles" in export_signals),
        "utilityGrabBagDetected": tat_bool("utility_grab_bag" in export_signals),
        "barrelFileDetected": tat_bool("barrel_file" in export_signals),
        "starReexportDetected": tat_bool("star_reexport_present" in export_signals),

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
    

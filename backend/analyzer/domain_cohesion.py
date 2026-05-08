# backend/analyzer/domain_cohesion.py

from __future__ import annotations

from typing import Any, Dict, Tuple


DOMAIN_KEYS = (
    "ui_rendering",
    "state_behavior",
    "domain_logic",
    "data_access",
    "configuration",
    "public_api",
    "test_support",
)


def build_domain_cohesion(inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Build a small responsibility-domain profile from already-measured Python data.

    Python measures evidence counts. TAT decides whether that evidence means the
    file is cohesive, mixed, watch-level, or refactor-worthy.
    """
    function_profile = inputs.get("functionProfile", {})
    constant_profile = inputs.get("constantProfile", {})
    import_profile = inputs.get("importProfile", {})
    export_profile = inputs.get("exportProfile", {})
    file_context = inputs.get("fileContext", {})

    function_categories = function_profile.get("categoryCounts", {})
    constant_categories = constant_profile.get("categoryCounts", {})
    import_categories = import_profile.get("categoryCounts", {})
    export_role_counts = export_profile.get("roleCounts", {})

    evidence = {
        "ui_rendering": int(file_context.get("fileExtensionIsJsxLike", False))
        + int(file_context.get("pathHasComponentFolder", False))
        + int(file_context.get("pathHasPageFolder", False))
        + import_categories.get("ui_rendering", 0)
        + function_categories.get("component", 0)
        + constant_categories.get("render_data_projection", 0),
        "state_behavior": int(file_context.get("pathHasHookFolder", False))
        + int(file_context.get("pathHasStateFolder", False))
        + import_categories.get("state_behavior", 0)
        + function_categories.get("hook", 0)
        + function_categories.get("handler", 0)
        + constant_categories.get("state_flag", 0)
        + constant_categories.get("flag", 0),
        "domain_logic": int(file_context.get("pathHasDomainFolder", False))
        + import_categories.get("domain_logic", 0)
        + function_categories.get("predicate", 0)
        + function_categories.get("analyzer", 0)
        + constant_categories.get("decision_rule", 0)
        + constant_categories.get("predicate", 0)
        + constant_categories.get("boolean_expression", 0),
        "data_access": int(file_context.get("pathHasServiceFolder", False))
        + import_categories.get("data_access", 0)
        + function_categories.get("getter", 0)
        + function_categories.get("io", 0),
        "configuration": int(file_context.get("pathHasConfigurationFolder", False))
        + import_categories.get("configuration", 0)
        + constant_categories.get("threshold", 0)
        + export_role_counts.get("config", 0),
        "public_api": export_profile.get("exportResponsibilityRoleCount", 0)
        + export_role_counts.get("type", 0)
        + export_role_counts.get("class", 0),
        "test_support": int(file_context.get("pathHasTestFolder", False))
        + import_categories.get("test_support", 0),
    }

    active_domains = [domain for domain, count in evidence.items() if count > 0]
    active_domain_count = len(active_domains)
    primary_domain, primary_domain_evidence = get_primary_domain(evidence)
    total_evidence = sum(evidence.values())
    has_dominant_domain = (
        total_evidence > 0 and primary_domain_evidence / total_evidence >= 0.55
    )

    return {
        "evidence": evidence,
        "activeDomains": active_domains,
        "activeResponsibilityDomainCount": active_domain_count,
        "primaryResponsibilityDomain": primary_domain,
        "primaryResponsibilityDomainEvidence": primary_domain_evidence,
        "totalResponsibilityDomainEvidence": total_evidence,
        "hasDominantResponsibilityDomain": has_dominant_domain,
        "domainCohesionLikely": active_domain_count <= 2 and has_dominant_domain,
        "multiDomainMixingLikely": active_domain_count >= 4,
    }


def get_primary_domain(evidence: Dict[str, int]) -> Tuple[str, int]:
    if not evidence:
        return "unknown", 0

    domain, count = max(evidence.items(), key=lambda item: item[1])

    if count <= 0:
        return "unknown", 0

    return domain, count

function formatList(items = []) {
  if (!items.length) {
    return "- None";
  }

  return items.map((item) => `- ${item}`).join("\n");
}

function formatMetrics(metrics = {}) {
  const lines = [];

  if (metrics.riskLevel) {
    lines.push(`- Risk: ${metrics.riskLevel}`);
  }

  if (metrics.complexity != null) {
    lines.push(`- Complexity: ${metrics.complexity}`);
  }

  if (metrics.fanIn != null) {
    lines.push(`- Fan-in: ${metrics.fanIn}`);
  }

  if (metrics.fanOut != null) {
    lines.push(`- Fan-out: ${metrics.fanOut}`);
  }

  return lines.length ? lines.join("\n") : "- None";
}

export function buildArchitectureContext(selectedProjectFile) {
  if (!selectedProjectFile) {
    return "";
  }

  const {
    path,
    imports = [],
    dependents = [],
    validImportPaths = [],
    nearbyFiles = [],
    metrics = {},
  } = selectedProjectFile;

  return `
PROJECT ARCHITECTURE CONTEXT

Current file:
${path}

Imports:
${formatList(imports)}

Imported by:
${formatList(dependents)}

Valid import paths from current file:
${formatList(validImportPaths)}

Nearby project files:
${formatList(nearbyFiles)}

Metrics:
${formatMetrics(metrics)}

Rules:
- Do not invent import paths.
- Preserve existing public exports unless explicitly instructed otherwise.
- If moving code, update all affected imports listed above.
- Prefer extracting helpers into nearby existing files when appropriate.
- Use only valid relative import paths from the current file.
- Preserve behavior unless explicitly instructed otherwise.
`.trim();
}
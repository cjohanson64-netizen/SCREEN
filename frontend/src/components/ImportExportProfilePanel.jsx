import { useState } from "react";
import { formatReviewLabel } from "../utils/formatters";

function formatTopCounts(items = []) {
  if (!items.length) return "None detected";

  return items.map((item) => `${item.name}: ${item.count}`).join(", ");
}

function SignalList({ title, signals = [] }) {
  if (!signals.length) return null;

  return (
    <div className="import-export-signal-group">
      <h4>{title}</h4>
      <div className="import-export-chip-list">
        {signals.map((signal) => (
          <span className="import-export-chip" key={signal}>
            {formatReviewLabel(signal)}
          </span>
        ))}
      </div>
    </div>
  );
}

function ImportSampleTable({ imports = [] }) {
  if (!imports.length) return null;

  return (
    <div className="import-export-table-wrap">
      <h4>Import samples</h4>

      <div className="import-export-table">
        <div className="import-export-row import-export-head">
          <span>Source</span>
          <span>Path kind</span>
          <span>Category</span>
        </div>

        {imports.slice(0, 10).map((item) => (
          <div className="import-export-row" key={`${item.source}-${item.importKind}`}>
            <span title={item.source}>{item.source}</span>
            <span>{formatReviewLabel(item.pathKind ?? "unknown")}</span>
            <span>{formatReviewLabel(item.category ?? "unknown")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExportSampleTable({ exports = [] }) {
  if (!exports.length) return null;

  return (
    <div className="import-export-table-wrap">
      <h4>Export samples</h4>

      <div className="import-export-table">
        <div className="import-export-row import-export-head">
          <span>Name</span>
          <span>Kind</span>
          <span>Role</span>
        </div>

        {exports.slice(0, 10).map((item) => (
          <div className="import-export-row" key={`${item.name}-${item.exportKind}-${item.source ?? "local"}`}>
            <span title={item.name}>{item.name}</span>
            <span>{formatReviewLabel(item.exportKind ?? "unknown")}</span>
            <span>{formatReviewLabel(item.role ?? "unknown")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function getImportExportAdvice(importProfile = {}, exportProfile = {}) {
  const advice = [];
  const importSignals = new Set(importProfile.signals ?? []);
  const exportSignals = new Set(exportProfile.signals ?? []);

  if (importSignals.has("import_responsibility_spread")) {
    advice.push({
      title: "Import responsibility spread",
      detail:
        "This file imports from several responsibility zones. Review whether it is coordinating UI, data, domain, config, and utility work in one place.",
    });
  }

  if (importSignals.has("ui_imports_data_access")) {
    advice.push({
      title: "UI/data coupling",
      detail:
        "This UI-shaped file imports data-access code. Consider moving API/service calls into a hook, parent orchestration layer, or service wrapper.",
    });
  }

  if (importSignals.has("ui_imports_domain_logic")) {
    advice.push({
      title: "UI/domain coupling",
      detail:
        "This UI-shaped file imports domain or rule logic. That can be healthy, but too much may mean policy decisions belong in selectors or predicates.",
    });
  }

  if (importSignals.has("production_imports_test_support")) {
    advice.push({
      title: "Production/test dependency",
      detail:
        "This production file imports test support code such as fixtures, mocks, or stubs. This is usually worth fixing quickly.",
    });
  }

  if (exportSignals.has("export_responsibility_spread")) {
    advice.push({
      title: "Export responsibility spread",
      detail:
        "This file exports several responsibility types. Consider grouping or splitting exports so the public surface is easier to understand.",
    });
  }

  if (exportSignals.has("utility_grab_bag")) {
    advice.push({
      title: "Utility grab bag",
      detail:
        "This file exposes a mixed set of utility exports. Split by role, such as getters, predicates, builders, analyzers, or handlers.",
    });
  }

  if (exportSignals.has("star_reexport_present") || exportSignals.has("barrel_file")) {
    advice.push({
      title: "Public API gateway",
      detail:
        "This file includes re-export behavior. That can be healthy for barrel files, but changes may affect many import sites.",
    });
  }

  return advice;
}

export default function ImportExportProfilePanel({
  importProfile = {},
  exportProfile = {},
}) {
  const [isOpen, setIsOpen] = useState(true);

  const hasImportProfile = importProfile && Object.keys(importProfile).length > 0;
  const hasExportProfile = exportProfile && Object.keys(exportProfile).length > 0;

  if (!hasImportProfile && !hasExportProfile) {
    return (
      <section className="import-export-profile-panel">
        <h3>Import / Export Profile</h3>
        <p className="muted">
          No semantic import/export profile is available for this file yet.
        </p>
      </section>
    );
  }

  const advice = getImportExportAdvice(importProfile, exportProfile);

  return (
    <section className="import-export-profile-panel">
      <button
        className="profile-collapse-header"
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <div>
          <h3>Import / Export Profile</h3>
          <p className="muted">
            SCREEN classifies dependencies and public API surface so TAT can explain coupling, boundary pressure, and export responsibility spread.
          </p>
        </div>

        <div className="profile-header-actions">
          <span className="import-export-profile-badge">
            {importProfile.responsibilityCategoryCount ?? 0} import zones ·{" "}
            {exportProfile.responsibilityRoleCount ?? 0} export roles
          </span>
          <span className="profile-collapse-icon" aria-hidden="true">
            {isOpen ? "−" : "+"}
          </span>
        </div>
      </button>

      {isOpen && (
        <>
          <div className="import-export-profile-grid">
            <div className="import-export-profile-stat">
              <span>Imports</span>
              <strong>{importProfile.total ?? 0}</strong>
            </div>

            <div className="import-export-profile-stat">
              <span>Local imports</span>
              <strong>{importProfile.localCount ?? 0}</strong>
            </div>

            <div className="import-export-profile-stat">
              <span>External imports</span>
              <strong>{importProfile.externalCount ?? 0}</strong>
            </div>

            <div className="import-export-profile-stat">
              <span>Import zones</span>
              <strong>{importProfile.responsibilityCategoryCount ?? 0}</strong>
            </div>

            <div className="import-export-profile-stat">
              <span>Exports</span>
              <strong>{exportProfile.total ?? 0}</strong>
            </div>

            <div className="import-export-profile-stat">
              <span>Export roles</span>
              <strong>{exportProfile.responsibilityRoleCount ?? 0}</strong>
            </div>
          </div>

          <div className="import-export-profile-detail-grid">
            <div className="import-export-profile-detail-card">
              <h4>Top import categories</h4>
              <p>{formatTopCounts(importProfile.topCategories)}</p>
            </div>

            <div className="import-export-profile-detail-card">
              <h4>Top imported folders</h4>
              <p>{formatTopCounts(importProfile.topFolders)}</p>
            </div>

            <div className="import-export-profile-detail-card">
              <h4>Top export kinds</h4>
              <p>{formatTopCounts(exportProfile.topKinds)}</p>
            </div>

            <div className="import-export-profile-detail-card">
              <h4>Top export roles</h4>
              <p>{formatTopCounts(exportProfile.topRoles)}</p>
            </div>

            <div className="import-export-profile-detail-card">
              <h4>Import shape</h4>
              <ul className="compact-list">
                <li>Relative: {importProfile.relativeCount ?? 0}</li>
                <li>Deep relative: {importProfile.deepRelativeCount ?? 0}</li>
                <li>Internal alias: {importProfile.internalAliasCount ?? 0}</li>
                <li>Wide named: {importProfile.wideNamedImportCount ?? 0}</li>
                <li>Side effect: {importProfile.sideEffectCount ?? 0}</li>
              </ul>
            </div>

            <div className="import-export-profile-detail-card">
              <h4>Export shape</h4>
              <ul className="compact-list">
                <li>Named: {exportProfile.namedCount ?? 0}</li>
                <li>Default: {exportProfile.defaultCount ?? 0}</li>
                <li>Functions: {exportProfile.functionExportCount ?? 0}</li>
                <li>Types: {exportProfile.typeExportCount ?? 0}</li>
                <li>Re-exports: {exportProfile.reexportCount ?? 0}</li>
                <li>Star re-exports: {exportProfile.starReexportCount ?? 0}</li>
              </ul>
            </div>
          </div>

          {advice.length > 0 && (
            <div className="import-export-advice-list">
              <h4>Why this matters</h4>

              {advice.map((item) => (
                <article className="import-export-advice-card" key={item.title}>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </article>
              ))}
            </div>
          )}

          <div className="import-export-signal-lists">
            <SignalList title="Import signals" signals={importProfile.signals} />
            <SignalList title="Export signals" signals={exportProfile.signals} />
          </div>

          <ImportSampleTable imports={importProfile.imports} />
          <ExportSampleTable exports={exportProfile.exports} />
        </>
      )}
    </section>
  );
}
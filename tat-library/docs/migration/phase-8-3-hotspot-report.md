# Phase 8.3 Hotspot Report

Phase 8.3 adds a repeatable hotspot report that combines static code-health metrics with optional runtime timing snapshots.

## Command

```bash
npx tsx tools/code-health/hotspots.ts --include-timing --out docs/reports/phase-8-3-hotspots.md
```

## Purpose

The report ranks files by structural risk before Phase 8.4 pruning/refactoring. It uses signals such as LOC, function count, import coupling, switch/case density, brace depth, directive density, and legacy directive references.

When `--include-timing` is passed, the script also runs canonical TAT fixtures through `run-module.ts --timing` and includes their timing totals and phase timings.

## Non-goals

- No behavior changes.
- No cache implementation yet.
- No incremental execution yet.
- No automatic refactor decisions without reviewing the report.

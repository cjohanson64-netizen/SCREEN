# Phase 8.2 Code Health Instrumentation

Phase 8.2 adds a repeatable code-health audit script so structural pruning can be guided by measurements instead of intuition.

## Run the audit

```bash
npx tsx tools/code-health/audit.ts . --out docs/migration/phase-8-2-code-health-report.md
```

## Metrics collected

- non-empty LOC
- function count
- import count
- switch/case count
- if count
- approximate max brace depth
- directive reference count
- legacy directive/syntax references

## Current purpose

This script does not change runtime behavior. It identifies oversized files, coupling hot spots, legacy syntax drift, and likely split targets before the next pruning pass.

## Phase 8.2 target sequence

1. Generate repeatable health reports.
2. Prune legacy directive remnants.
3. Split oversized parser directive modules.
4. Split action runtime responsibilities.
5. Split expression validation responsibilities.
6. Re-run canonical runtime fixtures after each split.

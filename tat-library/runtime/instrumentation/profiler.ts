export interface RuntimeProfileEntry {
  operation: string;
  count: number;
  totalMs: number;
  maxMs: number;
}

export interface RuntimeProfileReport {
  entries: RuntimeProfileEntry[];
}

export class RuntimeProfiler {
  private readonly entries = new Map<string, RuntimeProfileEntry>();

  measure<T>(operation: string, fn: () => T): T {
    const started = nowMs();
    try {
      return fn();
    } finally {
      this.record(operation, nowMs() - started);
    }
  }

  record(operation: string, durationMs: number): void {
    const existing = this.entries.get(operation);

    if (existing) {
      existing.count += 1;
      existing.totalMs += durationMs;
      existing.maxMs = Math.max(existing.maxMs, durationMs);
      return;
    }

    this.entries.set(operation, {
      operation,
      count: 1,
      totalMs: durationMs,
      maxMs: durationMs,
    });
  }

  report(): RuntimeProfileReport {
    return {
      entries: Array.from(this.entries.values()).sort((a, b) => {
        if (b.totalMs !== a.totalMs) return b.totalMs - a.totalMs;
        if (b.count !== a.count) return b.count - a.count;
        return a.operation.localeCompare(b.operation);
      }),
    };
  }
}

export function createRuntimeProfiler(): RuntimeProfiler {
  return new RuntimeProfiler();
}

export function profileOperation<T>(
  profiler: RuntimeProfiler | undefined,
  operation: string,
  fn: () => T,
): T {
  return profiler ? profiler.measure(operation, fn) : fn();
}

function nowMs(): number {
  return Date.now();
}

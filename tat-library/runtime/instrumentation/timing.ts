export interface RuntimeTimingEntry {
  name: string;
  count: number;
  durationMs: number;
}

export interface RuntimeTimingReport {
  totalMs: number;
  entries: RuntimeTimingEntry[];
}

export class RuntimeTimingCollector {
  private readonly startedAt = nowMs();
  private readonly entries = new Map<string, RuntimeTimingEntry>();

  measure<T>(name: string, fn: () => T): T {
    const started = nowMs();
    try {
      return fn();
    } finally {
      this.record(name, nowMs() - started);
    }
  }

  record(name: string, durationMs: number): void {
    const existing = this.entries.get(name);

    if (existing) {
      existing.count += 1;
      existing.durationMs += durationMs;
      return;
    }

    this.entries.set(name, {
      name,
      count: 1,
      durationMs,
    });
  }

  report(): RuntimeTimingReport {
    return {
      totalMs: nowMs() - this.startedAt,
      entries: Array.from(this.entries.values()).sort((a, b) => {
        const aParts = a.name.split(".");
        const bParts = b.name.split(".");
        if (aParts[0] === bParts[0]) return a.name.localeCompare(b.name);
        return a.name.localeCompare(b.name);
      }),
    };
  }
}

export function createRuntimeTimingCollector(): RuntimeTimingCollector {
  return new RuntimeTimingCollector();
}

export function measureTiming<T>(
  collector: RuntimeTimingCollector | undefined,
  name: string,
  fn: () => T,
): T {
  return collector ? collector.measure(name, fn) : fn();
}

function nowMs(): number {
  return Date.now();
}

/**
 * Telemetry measurement point stored inside a reactive array.
 */
interface TelemetryRecord {
  id: string;
  metric: number;
}

/**
 * Demonstrates Svelte 5 deep $state, shallow $state.raw binary buffers, and $state.snapshot unwrapping.
 */
class TelemetryStore {
  records = $state<TelemetryRecord[]>([]);
  buffer = $state.raw<Float64Array>(new Float64Array(1024));

  addRecord(id: string, metric: number): void {
    this.records.push({ id, metric });
  }

  /**
   * Replaces the raw buffer reference because $state.raw only tracks reassignment, not element writes.
   */
  replaceBuffer(nextBuffer: Float64Array): void {
    this.buffer = nextBuffer;
  }

  /**
   * Produces a plain un-proxied deep copy safe for structuredClone, Web Workers, or JSON serialization.
   */
  exportPureSnapshot(): TelemetryRecord[] {
    return $state.snapshot(this.records);
  }

  clear(): void {
    this.records.length = 0;
  }
}

export { TelemetryStore, type TelemetryRecord };

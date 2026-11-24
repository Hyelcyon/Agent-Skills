interface TelemetryRecord {
  id: string;
  metric: number;
}

class TelemetryStore {
  records = $state<TelemetryRecord[]>([]);
  buffer = $state.raw<Float64Array>(new Float64Array(1024));

  addRecord(id: string, metric: number): void {
    this.records.push({ id, metric });
  }

  exportPureSnapshot(): TelemetryRecord[] {
    return $state.snapshot(this.records);
  }

  clear(): void {
    this.records.length = 0;
  }
}

export { TelemetryStore, type TelemetryRecord };

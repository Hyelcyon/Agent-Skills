interface CoreWebVitalsReport {
  lcpMs: number | null;
  inpMs: number | null;
  clsScore: number;
}

function observeCoreWebVitals(onReport: (report: CoreWebVitalsReport) => void): () => void {
  const currentReport: CoreWebVitalsReport = {
    lcpMs: null,
    inpMs: null,
    clsScore: 0
  };

  const observers: PerformanceObserver[] = [];
  if (typeof PerformanceObserver === 'undefined') {
    return () => {};
  }

  const supported = PerformanceObserver.supportedEntryTypes ?? [];

  if (supported.includes('largest-contentful-paint')) {
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (!lastEntry) return;
      currentReport.lcpMs = lastEntry.startTime;
      onReport({ ...currentReport });
    });
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    observers.push(lcpObserver);
  }

  if (supported.includes('layout-shift')) {
    const clsObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        const layoutShift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
        if (!layoutShift.hadRecentInput && typeof layoutShift.value === 'number') {
          currentReport.clsScore += layoutShift.value;
        }
      }
      onReport({ ...currentReport });
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });
    observers.push(clsObserver);
  }

  return () => {
    for (const observer of observers) {
      observer.disconnect();
    }
  };
}

export { observeCoreWebVitals };
export type { CoreWebVitalsReport };

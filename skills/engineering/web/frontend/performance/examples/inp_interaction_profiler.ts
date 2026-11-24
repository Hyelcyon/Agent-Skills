interface InteractionMetric {
  id: string;
  duration: number;
  inputDelay: number;
  processingTime: number;
}

export function observeInteractionLatency(onMetricLogged: (metric: InteractionMetric) => void): () => void {
  if (typeof PerformanceObserver === 'undefined') {
    return () => {};
  }

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const eventEntry = entry as PerformanceEventTiming;
      if (!eventEntry.interactionId) continue;

      const inputDelay = eventEntry.processingStart - eventEntry.startTime;
      const processingTime = eventEntry.processingEnd - eventEntry.processingStart;

      onMetricLogged({
        id: `interaction_${eventEntry.interactionId}`,
        duration: eventEntry.duration,
        inputDelay: Math.max(0, inputDelay),
        processingTime: Math.max(0, processingTime)
      });
    }
  });

  observer.observe({ type: 'event', buffered: true, durationThreshold: 16 } as PerformanceObserverInit);

  return () => {
    observer.disconnect();
  };
}

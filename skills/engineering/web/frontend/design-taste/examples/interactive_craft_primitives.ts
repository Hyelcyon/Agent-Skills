export interface ObserverPoolEntry {
  observer: IntersectionObserver;
  callbacks: WeakMap<Element, (isIntersecting: boolean) => void>;
}

const observerPool = new Map<string, ObserverPoolEntry>();

export function subscribePrefersReducedMotion(onChange: (reduced: boolean) => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    onChange(true);
    return () => {};
  }

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  onChange(mediaQuery.matches);

  const handler = (event: MediaQueryListEvent) => {
    onChange(event.matches);
  };
  mediaQuery.addEventListener('change', handler);
  return () => mediaQuery.removeEventListener('change', handler);
}

export function observeElementVisibility(
  element: Element,
  onVisibilityChange: (visible: boolean) => void,
  options: { rootMargin?: string; threshold?: number; once?: boolean } = {}
): () => void {
  if (typeof IntersectionObserver === 'undefined') {
    onVisibilityChange(true);
    return () => {};
  }

  const rootMargin = options.rootMargin ?? '0px';
  const threshold = options.threshold ?? 0;
  const once = options.once ?? false;
  const key = `${rootMargin}:${threshold}:${once}`;

  let entry = observerPool.get(key);
  if (!entry) {
    const callbacks = new WeakMap<Element, (isIntersecting: boolean) => void>();
    const observer = new IntersectionObserver(
      (records) => {
        for (const record of records) {
          const cb = callbacks.get(record.target);
          if (!cb) continue;
          cb(record.isIntersecting);
          if (once && record.isIntersecting) {
            observer.unobserve(record.target);
            callbacks.delete(record.target);
          }
        }
      },
      { rootMargin, threshold }
    );
    entry = { observer, callbacks };
    observerPool.set(key, entry);
  }

  entry.callbacks.set(element, onVisibilityChange);
  entry.observer.observe(element);

  return () => {
    entry.observer.unobserve(element);
    entry.callbacks.delete(element);
  };
}

export function computeLogarithmicOverDrag(deltaPx: number): number {
  if (deltaPx <= 0) return 0;
  const damped = 8 * (Math.log(deltaPx + 1) - 2);
  return Math.max(0, damped);
}

export function shouldDismissDrawer(deltaPx: number, elapsedMs: number, containerHeightPx: number): boolean {
  if (deltaPx <= 0) return false;
  const safeElapsed = Math.max(elapsedMs, 1);
  const velocityPxPerMs = Math.abs(deltaPx) / safeElapsed;
  return velocityPxPerMs > 0.4 || deltaPx >= containerHeightPx * 0.25;
}

export function computeSlidingIndicatorY(listTopPx: number, itemTopPx: number): number {
  return Math.round((itemTopPx - listTopPx) * 100) / 100;
}

export function createManagedRenderLoop(
  renderFrame: (timestampMs: number) => void,
  options: { minAcceptableFps?: number; frameInterval?: number } = {}
): { start: () => void; stop: () => void; isRunning: () => boolean } {
  const minFps = options.minAcceptableFps ?? 24;
  let frameInterval = Math.max(1, options.frameInterval ?? 1);
  let rafId = 0;
  let running = false;
  let frameCount = 0;
  let sampleStart = 0;

  const onVisibilityChange = () => {
    if (typeof document !== 'undefined' && document.hidden) {
      stop();
    }
  };

  const tick = (now: number) => {
    if (!running) return;
    frameCount += 1;

    if (sampleStart === 0) {
      sampleStart = now;
    } else if (frameCount % 24 === 0) {
      const elapsedSec = (now - sampleStart) / 1000;
      const measuredFps = elapsedSec > 0 ? 24 / elapsedSec : 60;
      if (measuredFps < minFps && frameInterval < 3) {
        frameInterval += 1;
      }
      sampleStart = now;
    }

    if (frameCount % frameInterval === 0) {
      renderFrame(now);
    }

    if (typeof requestAnimationFrame === 'function') {
      rafId = requestAnimationFrame(tick);
    }
  };

  const start = () => {
    if (running || typeof requestAnimationFrame !== 'function') return;
    running = true;
    frameCount = 0;
    sampleStart = 0;
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', onVisibilityChange);
    }
    rafId = requestAnimationFrame(tick);
  };

  const stop = () => {
    if (!running) return;
    running = false;
    if (typeof cancelAnimationFrame === 'function' && rafId !== 0) {
      cancelAnimationFrame(rafId);
    }
    rafId = 0;
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', onVisibilityChange);
    }
  };

  return {
    start,
    stop,
    isRunning: () => running,
  };
}

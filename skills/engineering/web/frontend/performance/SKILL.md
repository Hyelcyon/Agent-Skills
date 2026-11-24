---
name: performance
description: Use when measuring, debugging, and optimizing web frontend performance, targeting Google Core Web Vitals (LCP, INP, CLS), breaking long tasks with scheduler.yield, or configuring Speculation Rules.
---

# Enterprise Frontend Performance & Core Web Vitals Optimization

Field-tested methodologies for optimizing Core Web Vitals (LCP $\le 2.5\text{s}$, INP $\le 200\text{ms}$, CLS $\le 0.1$), main thread task scheduling, and speculative prefetching.

## When to Use
- Optimizing Largest Contentful Paint (LCP) by prioritizing hero assets and preloading fonts.
- Fixing Interaction to Next Paint (INP) lags by breaking tasks with `scheduler.yield()`.
- Eliminating Cumulative Layout Shift (CLS) via `aspect-ratio` and font fallback overrides.
- Configuring the Speculation Rules API for instant cross-document transitions.

## When NOT to Use
- Writing backend database queries or server indexing (use `query-optimization`).
- Configuring network CDN edge firewalls.

---

## 5-Phase Agent Operational Protocol

```
Phase 1: Real User Metrics & Lab Profiling (Lighthouse, CrUX, Web Vitals API)
Phase 2: LCP Critical Path Optimization (Resource hints, fetchpriority="high")
Phase 3: INP & Main-Thread Scheduling (scheduler.yield(), requestIdleCallback)
Phase 4: CLS Layout Stability Enforcement (aspect-ratio, font-display: optional)
Phase 5: Automated Performance Gate & Regression Audit
```

### Phase 1: Real User Metrics & Profiling
Profile Core Web Vitals: LCP ($\le 2.5\text{s}$), INP ($\le 200\text{ms}$), CLS ($\le 0.1$). Inspect Chrome DevTools Performance panel for long tasks (>50ms).

### Phase 2: LCP Critical Path Optimization
Preload critical viewport resources. Set `fetchpriority="high"` on hero images and never apply `loading="lazy"` to above-the-fold content:
```html
<link rel="preload" as="image" href="/hero.webp" fetchpriority="high">
<img src="/hero.webp" fetchpriority="high" width="1200" height="600" alt="Hero">
```

### Phase 3: INP & Main-Thread Scheduling
Break CPU-intensive JavaScript operations using `scheduler.yield()` or microtask chunking to keep the main thread responsive to user interactions:
```typescript
if (typeof scheduler !== 'undefined' && 'yield' in scheduler) {
  await scheduler.yield();
}
```

### Phase 4: CLS Layout Stability
Reserve aspect ratios on images and embedded frames using CSS `aspect-ratio`. Prevent font-swap layout shifts via `size-adjust` and `ascent-override` in font fallbacks.

### Phase 5: Verification & Performance Gate
Run automated Lighthouse audits and fail CI if metric thresholds regress:
```bash
npx lhci autorun
```

---

## Prohibited Anti-Patterns

- ❌ Setting `loading="lazy"` on Largest Contentful Paint (LCP) hero images.
- ❌ Running synchronous blocking loops (>50ms) on the main UI thread.
- ❌ Injecting dynamically sized elements above existing content without reserved space (causes CLS).
- ❌ Preloading too many resources (>5 fonts/images), causing network bandwidth contention.
- ❌ Loading non-critical third-party analytics scripts synchronously in `<head>`.

---

## References & Documentation
- Core Web Vitals Deep Dive: [references/core-web-vitals-deep-dive.md](./references/core-web-vitals-deep-dive.md)
- Speculation Rules & Instant Navigation: [references/speculation-rules-and-prerendering.md](./references/speculation-rules-and-prerendering.md)
- Runtime Task Scheduling & INP: [references/runtime-scheduling-and-inp.md](./references/runtime-scheduling-and-inp.md)

## Resources & Examples
- Speculation Rules Starter: [resources/speculation-rules.json](./resources/speculation-rules.json)
- Core Web Vitals Targets: [resources/web-vitals-thresholds.json](./resources/web-vitals-thresholds.json)
- Font Fallback Overrides: [resources/font-fallback-override.css](./resources/font-fallback-override.css)
- Task Chunking Scheduler: [examples/task_chunking_scheduler.ts](./examples/task_chunking_scheduler.ts)
- Performance Observer Metrics: [examples/performance_observer_metrics.ts](./examples/performance_observer_metrics.ts)
- INP Interaction Profiler: [examples/inp_interaction_profiler.ts](./examples/inp_interaction_profiler.ts)

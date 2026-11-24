# Enterprise Frontend Performance & Core Web Vitals Runbook

A senior performance engineering reference for optimizing Largest Contentful Paint (LCP), Interaction to Next Paint (INP), and Cumulative Layout Shift (CLS) based on Chrome UX Report (CrUX) 75th percentile benchmarks.

---

## 1. Largest Contentful Paint (LCP) Optimization ($\le 2.5\text{s}$)

LCP measures when the main content of a page has likely loaded.

### Rules of LCP
1. **Never Lazy Load the LCP Asset**:
   - Marking hero images with `loading="lazy"` delays their download until layout calculation completes, adding 500ms–1500ms to LCP.
2. **Prioritize via `fetchPriority="high"`**:
   - Tag the LCP image element with `fetchpriority="high"` and preload critical fonts/images in the HTML `<head>`.
3. **Explicit Dimensions**:
   - Always supply explicit `width` and `height` attributes to prevent layout shifts.

---

## 2. Interaction to Next Paint (INP) Optimization ($\le 200\text{ms}$)

INP replaced First Input Delay (FID) as the official responsiveness metric, observing the latency of all user interactions (clicks, taps, keypresses) throughout the full page lifecycle.

### Strategies to Yield the Main Thread
1. **Break Long Tasks ($> 50\text{ms}$)**:
   - Use `scheduler.yield()` (or fallback to `setTimeout`) to return control to the browser event loop between heavy operations, allowing user input and paint rendering to process without blocking.
2. **Prioritized Scheduling via `scheduler.postTask`**:
   - Classify tasks into `user-blocking`, `user-visible`, and `background`.
3. **Passive Event Listeners**:
   - Supply `{ passive: true }` to touch and wheel event listeners to decouple scrolling from main thread script execution.

---

## 3. Cumulative Layout Shift (CLS) Optimization ($\le 0.1$)

CLS measures visual stability.
- Reserve aspect ratio boxes using CSS `aspect-ratio` or fixed containers for asynchronous images, video embeds, and dynamic widgets.
- Use `font-display: swap` accompanied by `size-adjust`, `ascent-override`, and `descent-override` in `@font-face` to match fallback font metrics with web fonts.

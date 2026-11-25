# API Compatibility Triage: CSS View Transitions API

## 1. Target Query
Is same-document `document.startViewTransition` supported across evergreen desktop and mobile browsers?

## 2. Verified Facts (MDN Baseline: Newly Available)
- **Chromium**: Supported in Chrome 111+ and Edge 111+.
- **Safari**: Supported in Safari 18+ and iOS Safari 18+.
- **Firefox**: Supported unflagged starting in Firefox 144+ (October 2025).
- **Caveat**: Cross-document MPA view transitions (`@view-transition { navigation: auto; }`) have narrower support than same-document `document.startViewTransition()`.

## 3. Recommended Progressive Enhancement Fallback
Feature-detect `document.startViewTransition` before calling it and fall back to a synchronous DOM update on older browsers:

```typescript
function transitionUI(updateDom: () => void): void {
  if (typeof document.startViewTransition === 'function') {
    document.startViewTransition(updateDom);
    return;
  }
  updateDom();
}
```

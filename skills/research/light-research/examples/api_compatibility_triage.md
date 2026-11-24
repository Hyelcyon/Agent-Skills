# API Compatibility Triage: CSS View Transitions API

## 1. Target Query
Is `document.startViewTransition` supported across baseline evergreen browsers?

## 2. Verified Facts
- Chromium: Supported since Chrome 111.
- Safari: Supported in Safari 18+.
- Firefox: Supported in Firefox 129+ under flag; nightly support enabled.

## 3. Recommended Fallback
Feature detect via `if (document.startViewTransition)` and execute DOM update callback directly when unsupported.

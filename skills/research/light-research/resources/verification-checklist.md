# Technical Verification Checklist

Use this checklist during Phase 4 and Phase 5 of every technical investigation or API integration task.

---

### Step 1: Local Version Anchoring
- [ ] Inspect project manifest (`package.json`, `Cargo.toml`, `pyproject.toml`, etc.).
- [ ] Note exact major and minor version of the target dependency.
- [ ] Verify runtime version (Node.js engine, Python version, Rust edition).

### Step 2: Multi-Hop Upstream Extraction
- [ ] Search query targets Tier 1 documentation or maintainer GitHub repository.
- [ ] Primary documentation page retrieved and inspected (anti-snippet invariant enforced).
- [ ] Method signature, argument types, optional flags, and return type verified.
- [ ] Import specifier and path verified (e.g. `next/navigation` vs. legacy `next/router`).

### Step 3: Falsification & Negative Evidence Hunting
- [ ] Executed breaking-change query (`"<symbol>" "<version>" "breaking change"`).
- [ ] Executed deprecation query (`site:<docs> "<symbol>" "deprecated"`).
- [ ] Executed issue-tracker query for open regression reports.
- [ ] Verified runtime boundary compatibility (Node.js vs. Edge vs. Browser).

### Step 4: Empirical Scratch Verification
- [ ] Standalone minimal test script or command executed (`node -e`, `python -c`, `tsc --noEmit`, etc.).
- [ ] Exit code 0 confirmed; no unexpected warnings, deprecation banners, or type mismatches.
- [ ] Verified that solution does NOT rely on `--force`, `--legacy-peer-deps`, or `@ts-ignore`.

### Step 5: Transparent Reporting
- [ ] Technical findings state exact verified version.
- [ ] Direct documentation or repository release link provided.
- [ ] Known trade-offs or constraints honestly disclosed.

# Dependency & Upgrade Hygiene

Unmanaged dependency drift causes silent runtime breaks, security CVEs, and brittle builds. Maintain dependencies with disciplined isolation and falsification.

---

## 1. Upgrade Classification & Blast Radius

| Update Type | Risk | Required Protocol |
| :--- | :--- | :--- |
| **Patch / Security CVE** | Low | Inspect release notes, run lockfile update, execute full test + build suite |
| **Minor Feature** | Moderate | Check deprecation warnings in build/test output; verify peer dependencies |
| **Major Breaking** | High | Isolate into its own diff; run 3-hop falsification on breaking changes + migration guide first |

---

## 2. Rules for Zero-Surprise Upgrades

1. **Always Commit Lockfiles & Avoid `--legacy-peer-deps` / `--force`**: Never mask peer conflicts with force flags in CI or production manifests.
2. **One Major Ecosystem Jump at a Time**: Never upgrade React, Next.js, TypeScript, and ESLint simultaneously in one blind sweep; isolate failures cleanly.
3. **Check Runtime Engines**: Verify Node, Python, Java, or Rust minimum engine compatibility before bumping (`package.json` `engines`, `requires-python`, `rust-version`).
4. **Audit Unused & Duplicate Packages**: After retiring a feature, remove orphaned dependencies from manifests and lockfiles instead of leaving dead supply-chain surface.

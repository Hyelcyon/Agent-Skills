# Rapid Package Evaluation Scorecard and Triage Standard

Rapid evaluation criteria for assessing third-party open-source packages, libraries, and utilities before introducing them as project dependencies.

## 1. The Cost of Dependencies

Every added dependency introduces a permanent ongoing cost:
- Supply-chain security attack surface.
- Potential breaking changes across semver updates.
- Transitive dependency tree bloat.
- Build time and bundle size increases.

Before adopting any dependency, perform a rapid 5-minute scorecard evaluation.

---

## 2. Evaluation Scorecard Dimensions

| Metric | Minimum Passing Standard | Disqualification Red Flags |
| :--- | :--- | :--- |
| **Maintenance Activity** | Commit or release within the last 6 months (180 days) | Zero releases in >18 months, unmaintained repository notice |
| **Security Track Record** | 0 unpatched critical/high CVEs | Open unresolved remote execution CVEs |
| **Type Support** | First-party `.d.ts` declaration files included | Missing types or outdated `@types/*` with broken definitions |
| **Transitive Impact** | Clean minimal dependency tree | Deep dependency tree bringing dozens of untrusted packages |
| **Licensing** | Permissive OSI license (MIT, Apache-2.0, ISC, BSD) | Copyleft license (GPLv3, AGPL) in commercial proprietary software |

---

## 3. Rapid CLI Verification Commands

Inspect package metadata directly from the command line without installing or running unvetted `npx` binaries:

```bash
npm info <package-name> dist-tags time.modified license dist.unpackedSize
npm view <package-name> dependencies
```

Check minified + gzipped client bundle size via Bundlephobia JSON API (without downloading arbitrary CLI packages):

```bash
curl -s "https://bundlephobia.com/api/size?package=<package-name>"
```

Verify minified and gzipped sizes to avoid importing packages that exceed performance budgets.

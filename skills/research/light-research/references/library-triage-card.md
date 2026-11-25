# Rapid Library Triage Card & Smoke Test

Use this reference when evaluating and comparing candidate packages during a light research task.

---

## 1. Quick Comparison Scorecard

Evaluate candidate packages across four dimensions (Score 1-5):

| Candidate | Maintenance & Releases | License | Bundle / Overhead | TypeScript / DX | Total |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Option A** | | MIT | Small (<5kb) | First-class | |
| **Option B** | | Apache 2.0 | Medium | Third-party types | |

---

## 2. Terminal Inspection Commands

Quickly extract package health directly from CLI without full web page scraping:

```bash
npm view <package-name> name version license dist.unpackedSize time.modified repository.url
pip index versions <package-name>
cargo info <package-name>
```

---

## 3. The 5-Minute Smoke Test

Before recommending a package for adoption:
1. Initialize a temporary scratch directory.
2. Install the candidate: `npm install --no-save <package-name>`.
3. Run a minimal test script exercising the core API.
4. Verify import style (ESM vs CJS) and type definition exports.

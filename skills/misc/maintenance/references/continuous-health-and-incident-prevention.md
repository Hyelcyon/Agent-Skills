# Continuous Health & Incident Prevention

Long-lived projects stay maintainable when every bugfix leaves behind structural prevention rather than one-off patches.

---

## 1. The Post-Incident Maintenance Loop

1. **Regression Guard**: Every fixed production bug must leave behind a deterministic automated test that fails without the fix and passes with it.
2. **Knowledge Distillation**: When a defect stems from a non-obvious environment quirk, build flag, or private API constraint, record an atomic card in `.gemini/knowledge/cards/` and index it in `knowledge.json` (`knowledge-learning` skill).
3. **Retire Stale Workarounds**: When a platform upgrade resolves a documented workaround, mark the corresponding knowledge card `Deprecated` or update it rather than letting obsolete advice misdirect future agents.

---

## 2. Keeping Rules, Skills & Docs Lean

- Prune duplicate instructions across `AGENTS.md`, `rules/*.md`, and skill docs; keep rules focused on **invariants** and skills focused on **execution runbooks**.
- Verify markdown links, schemas, linters, and test suites on a regular cadence so documentation never drifts silently from the live codebase.

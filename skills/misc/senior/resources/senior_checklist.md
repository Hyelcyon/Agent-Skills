# Senior Developer Quality Checklist

- [ ] Root cause located via caller/state tracing rather than patching a downstream symptom?
- [ ] Minimal coherent diff implemented with zero unrelated refactoring or whitespace churn?
- [ ] Zero premature abstractions, single-use wrappers, or unnecessary new dependencies added?
- [ ] Shallow nesting and shared parameterized helpers used instead of duplicated branches?
- [ ] Zero bare error suppression (`except: pass`, empty `catch`, unchecked native `$LASTEXITCODE`)?
- [ ] Zero hardcoded secrets, credentials, or local machine paths introduced?
- [ ] Identifiers and comments in standard English, with zero syntax-echo AI-slop comments?
- [ ] Boundary cases (`null`, `0`, empty, timeouts, invalid IDs, disconnect races) handled safely?
- [ ] Real build/type-check/test commands executed *after final edit* with zero skipped failures?

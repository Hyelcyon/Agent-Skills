# Safe Refactoring & Dead-Code Pruning

Refactoring changes internal structure without altering observable external behavior. Dead-code deletion reduces maintenance cost only when proven unreachable.

---

## 1. Characterization-First Refactoring

1. **Verify Baseline First**: Run existing tests before touching a single line. If tests are red before you start, stop and report or fix the baseline first.
2. **Pin Observable Behavior**: For untested legacy code, write characterization tests asserting current return values, error codes, and side effects before extracting helpers.
3. **Preserve Public Contracts (Expand-Contract)**: When renaming or reshaping an exported function or config key with external callers, add the new signature first, migrate callers, verify tests, and remove the old signature cleanly.

---

## 2. Dead-Code Verification Checklist

Before deleting a file, export, environment variable, or feature flag:
- Grep the entire repository for static imports, re-exports (`export * from`), and type references.
- Check dynamic references: string route tables, `import()`, reflection, `package.json` `scripts`/`exports`/`bin`, CI YAML files, and Dockerfiles.
- Delete dead code outright—never leave commented-out legacy blocks (`// oldHandler()`) in source files.
- Immediately remove or update adjacent comments and docs that referenced the deleted behavior.

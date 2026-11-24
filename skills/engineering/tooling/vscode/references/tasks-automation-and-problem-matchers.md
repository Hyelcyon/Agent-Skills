# Task Automation & Problem Matchers Guide

A senior engineering guide to authoring `.vscode/tasks.json` for deterministic build pipelines, background watchers, and error capture across polyglot repositories.

---

## 1. Principles of Senior Task Automation

1. **Native Problem Matcher Binding**:
   - Compiling or linting code without a problem matcher forces developers to scan raw terminal output.
   - Binding problem matchers translates stdout/stderr directly into actionable rows in the native VS Code **Problems** panel (`Ctrl+Shift+M` / `Cmd+Shift+M`).
2. **Deterministic Task Groups**:
   - Designate canonical build and test tasks with `"isDefault": true` so standard shortcuts (`Ctrl+Shift+B` for build) work instantly without prompt ambiguity.
3. **Controlled Background Watchers**:
   - Long-running processes (e.g. `tsc --watch`, `cargo watch`, `vite`) must declare `"isBackground": true` paired with explicit `beginsPattern` and `endsPattern` so downstream dependent tasks know when initialization completes.
4. **Terminal Discipline**:
   - Configure terminal presentation (`reveal`, `panel`, `clear`) to prevent cluttering the developer's terminal list with dozens of orphaned output panels.

---

## 2. Standard Problem Matchers Catalog

VS Code bundles pre-defined problem matchers for standard compiler toolchains:

| Toolchain / Compiler | Bundled Problem Matcher | Notes |
| :--- | :--- | :--- |
| TypeScript Compiler | `$tsc` | Single-run compilation (`tsc -p .`) |
| TypeScript Watcher | `$tsc-watch` | Background watch mode (`tsc --watch`) |
| ESLint (Compact) | `$eslint-compact` | Requires `eslint --format compact` |
| ESLint (Stylish) | `$eslint-stylish` | Matches standard default ESLint output |
| Rust Compiler | `$rustc` | Cargo / Rust single compilation |
| Rust Watcher | `$rustc-watch` | Pair with `cargo watch` |
| Go Compiler | `$go` | Matches `go build` / `go test` output |
| MSVC / C# Compiler | `$msCompile` | Matches Visual Studio / MSBuild output |
| GCC / Clang | `$gcc` | Standard GCC error/warning output |

---

## 3. Background Task Architecture (Watchers)

When running a file watcher (e.g. TypeScript, Vite, Webpack), downstream launch configurations or dependent tasks will hang unless the task signals that its build iteration is ready.

```json
{
  "label": "npm: watch",
  "type": "shell",
  "command": "pnpm run watch",
  "isBackground": true,
  "problemMatcher": {
    "base": "$tsc-watch",
    "background": {
      "activeOnStart": true,
      "beginsPattern": "^.*Starting compilation in watch mode.*$",
      "endsPattern": "^.*Found 0 errors\\. Watching for file changes.*$"
    }
  },
  "presentation": {
    "reveal": "silent",
    "panel": "dedicated",
    "clear": true
  }
}
```

---

## 4. Custom Regex Problem Matcher Design

When using custom CLI linters or test runners that lack built-in VS Code matchers (e.g. Ruff, Biome, Vitest), author a custom regex problem matcher:

```json
{
  "name": "ruff-linter",
  "owner": "python",
  "fileLocation": ["relative", "${workspaceFolder}"],
  "pattern": {
    "regexp": "^(.*?):(\\d+):(\\d+):\\s+([A-Z]\\d+)\\s+(.*)$",
    "file": 1,
    "line": 2,
    "column": 3,
    "code": 4,
    "message": 5
  }
}
```

---

## 5. Chained & Sequenced Pipelines

Use `dependsOn` and `dependsOrder: "sequence"` to enforce ordered multi-stage pipelines:

```json
{
  "label": "ci: pre-commit-gate",
  "dependsOrder": "sequence",
  "dependsOn": [
    "task: format-check",
    "task: lint",
    "task: type-check",
    "task: test"
  ],
  "problemMatcher": []
}
```

This guarantees that format checks run before linting, and type checking runs before the test suite executes, mirroring CI pipeline gates locally.

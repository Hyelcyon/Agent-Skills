---
name: vscode
description: Use when configuring .vscode workspace settings, launch.json debug pipelines, tasks.json build automation, or team extensions.json recommendations across polyglot projects.
---

# VS Code Workspace Configuration & Toolchain Architecture

Senior engineering standards and procedural runbooks for architecting deterministic, reproducible `.vscode` workspace configurations, polyglot debugging pipelines, task automation, and team onboarding recommendations.

## When to Use
- Establishing team-wide, consistent `.vscode/settings.json` enforcing format-on-save, linter actions, and search exclusions.
- Configuring polyglot `.vscode/launch.json` debugging profiles across Node.js/TypeScript, Python, Rust, Go, C/C++, and C#/.NET.
- Designing `.vscode/tasks.json` build, test, and background watch automation with problem matchers.
- Creating curated `.vscode/extensions.json` workspace recommendations to eliminate onboarding drift.
- Configuring compound launch configurations to debug multi-service backends and frontends simultaneously.

## When NOT to Use
- Configuring CI/CD pipelines outside the editor (use `ci-cd`).
- Managing container environments and Compose stacks (use `docker`).
- Writing general source code formatting rules (see respective language skills).

---

## 1. 5-Phase Agent Operational Protocol

```
[Phase 1: Toolchain Profiling] ──> [Phase 2: Settings & Formatters] ──> [Phase 3: Launch & Debugging] ──> [Phase 4: Task Automation] ──> [Phase 5: Team Hygiene Gate]
  Detect languages & runtimes       Enforce format-on-save & rules       Author launch.json & compound       Map tasks & problem matchers       Curate extensions & git rules
```

### Phase 1: Toolchain & Workspace Profiling
1. Inspect project manifests (`package.json`, `Cargo.toml`, `pyproject.toml`, `go.mod`, `*.csproj`) to identify languages, runtimes, package managers, and test runners.
2. Verify that workspace configuration does NOT contain absolute local paths (e.g. `C:\Users\...` or `/home/...`), which break team collaboration.

### Phase 2: Workspace Settings & Formatter Binding (`settings.json`)
1. Enforce deterministic formatting on save:
   ```json
   {
     "editor.formatOnSave": true,
     "editor.codeActionsOnSave": {
       "source.fixAll": "explicit",
       "source.organizeImports": "explicit"
     }
   }
   ```
2. Configure language-specific default formatters (e.g. `charliermarsh.ruff` for Python, `esbenp.prettier-vscode` or `biomejs.biome` for JS/TS, `rust-lang.rust-analyzer` for Rust).
3. Exclude heavy build artifacts (`dist`, `node_modules`, `target`, `.next`, `bin`, `obj`) from `files.exclude` and `search.exclude` to protect editor performance.

### Phase 3: Polyglot Launch & Debugging Pipelines (`launch.json`)
1. Define targeted launch configurations using `envFile` (e.g. `${workspaceFolder}/.env.local`) instead of hardcoded secrets.
2. Set `"sourceMaps": true` and accurate `"outFiles"` for TypeScript/Node runtimes.
3. Use compound launch profiles (`compounds`) to orchestrate dependent services (e.g. start backend API server + launch frontend client).

### Phase 4: Task Automation & Problem Matchers (`tasks.json`)
1. Wrap project build and test scripts into standard VS Code tasks.
2. Bind appropriate problem matchers (`$tsc`, `$eslint-compact`, `$rustc`, `$msCompile`) so compiler errors populate the native VS Code Problems panel.
3. Configure `dependsOn` and `preLaunchTask` to ensure dependencies build automatically before debugging starts.

### Phase 5: Team Extensions & Hygiene Gate (`extensions.json`)
1. Populate `.vscode/extensions.json` with mandatory team extensions (`recommendations`) and flag deprecated/conflicting extensions (`unwantedRecommendations`).
2. Verify Git hygiene: commit `.vscode/settings.json`, `launch.json`, `tasks.json`, and `extensions.json` to Git; exclude local state files (`*.suo`, `*.user`, workspace caches).

---

## 2. Prohibited Anti-Patterns

- ❌ Hardcoding absolute machine paths (e.g. `"program": "C:/dev/myproject/src/index.js"`; use `${workspaceFolder}`).
- ❌ Hardcoding API keys, database passwords, or JWT secrets in `launch.json` (use `envFile: "${workspaceFolder}/.env"`).
- ❌ Omitting problem matchers from `tasks.json` (leaves developers blind to compilation errors).
- ❌ Disabling `formatOnSave` in shared team configurations.
- ❌ Adding machine-specific extensions or personal themes to repository `extensions.json`.

---

## 3. References & Documentation
- Workspace Settings & Formatter Binding: [references/settings-and-formatter-binding.md](./references/settings-and-formatter-binding.md)
- Polyglot Debugging & Launch Pipelines: [references/polyglot-debugging-launch-pipeline.md](./references/polyglot-debugging-launch-pipeline.md)
- Task Automation & Problem Matchers: [references/tasks-automation-and-problem-matchers.md](./references/tasks-automation-and-problem-matchers.md)

## 4. Resources & Examples
- Strict Workspace Settings Template: [resources/settings.strict.json](./resources/settings.strict.json)
- Polyglot Launch Configurations Template: [resources/launch.polyglot.json](./resources/launch.polyglot.json)
- Standard Tasks & Problem Matchers Template: [resources/tasks.polyglot.json](./resources/tasks.polyglot.json)
- Team Recommended Extensions Template: [resources/extensions.recommended.json](./resources/extensions.recommended.json)
- Full-Stack Compound Workspace Example: [examples/full_stack_workspace_config.json](./examples/full_stack_workspace_config.json)
- Native Systems Debugging (Rust/C++) Example: [examples/rust_cpp_lldb_launch.json](./examples/rust_cpp_lldb_launch.json)
- Python FastAPI Debug & Watch Task Example: [examples/python_fastapi_debug_task.json](./examples/python_fastapi_debug_task.json)

# Polyglot Debugging & Launch Pipelines Guide

A senior engineering guide to structuring `.vscode/launch.json` for deterministic, cross-platform debugging across Node.js/TypeScript, Python, Rust, Go, C++, and C#/.NET.

---

## 1. Principles of Senior Debugging Configuration

1. **Security & Zero Secrets**:
   - Never embed database credentials, API tokens, or secrets inside `launch.json`.
   - Load environment configurations dynamically using `"envFile": "${workspaceFolder}/.env"` or `${workspaceFolder}/.env.local`.
2. **Pre-Launch Build Integration**:
   - Always bind compiled languages (Rust, C++, C#, TypeScript) to a `preLaunchTask` in `tasks.json` so the debugger always runs against the freshest build artifacts.
3. **Compound Multi-Service Orchestration**:
   - In modern full-stack or microservice architectures, developers need to debug frontend and backend simultaneously with single-click orchestration via `compounds`.
4. **Platform-Agnostic Path Resolvers**:
   - Always use standard VS Code variables:
     - `${workspaceFolder}`: Project root directory
     - `${file}`: Currently active file
     - `${fileBasenameNoExtension}`: Active filename without extension
     - `${workspaceFolderBasename}`: Workspace folder name

---

## 2. Polyglot Debug Configurations

### Node.js & TypeScript (`pwa-node`)

Modern VS Code uses JavaScript Debugger (`pwa-node`). Key requirements:
- Enable `"sourceMaps": true`.
- Constrain `"outFiles"` to build directories (`${workspaceFolder}/dist/**/*.js`) to optimize symbol lookup.
- Set `"smartStep": true` to skip external dependency internals (`node_modules`).

```json
{
  "name": "Node: Launch Current TS File",
  "type": "node",
  "request": "launch",
  "runtimeExecutable": "tsx",
  "args": ["${file}"],
  "cwd": "${workspaceFolder}",
  "envFile": "${workspaceFolder}/.env.local",
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

For compiled TypeScript projects:
```json
{
  "name": "Node: Debug Dist",
  "type": "node",
  "request": "launch",
  "program": "${workspaceFolder}/dist/index.js",
  "preLaunchTask": "npm: build",
  "outFiles": ["${workspaceFolder}/dist/**/*.js"],
  "sourceMaps": true,
  "cwd": "${workspaceFolder}",
  "envFile": "${workspaceFolder}/.env"
}
```

---

### Python (`debugpy`)

Debug configuration using the modern Python extension and `debugpy`:
- Use `"module"` for running frameworks (FastAPI, Flask, pytest) to ensure package imports resolve correctly.
- Configure `"justMyCode": true` to keep debugger focus within repository code.

```json
[
  {
    "name": "Python: Current File",
    "type": "debugpy",
    "request": "launch",
    "program": "${file}",
    "console": "integratedTerminal",
    "justMyCode": true,
    "envFile": "${workspaceFolder}/.env"
  },
  {
    "name": "Python: FastAPI Service",
    "type": "debugpy",
    "request": "launch",
    "module": "uvicorn",
    "args": ["app.main:app", "--reload", "--port", "8000"],
    "jinja": true,
    "justMyCode": true,
    "envFile": "${workspaceFolder}/.env"
  }
]
```

---

### Rust (`CodeLLDB`)

Native debugging on Windows, macOS, and Linux is best delivered by `vadimcn.vscode-lldb` (`lldb`):
- Bind `preLaunchTask: "cargo build"` to compile before attaching.
- Set target binary to `${workspaceFolder}/target/debug/${workspaceFolderBasename}` (or specific binary name).

```json
{
  "name": "Rust: Debug Binary (CodeLLDB)",
  "type": "lldb",
  "request": "launch",
  "program": "${workspaceFolder}/target/debug/${workspaceFolderBasename}",
  "args": [],
  "cwd": "${workspaceFolder}",
  "preLaunchTask": "cargo: build",
  "stopOnEntry": false
}
```

---

### Go (`delve`)

Go debugging is managed by the official Go extension via Delve (`dlv`):
- Mode `"auto"` detects package or single file targets.
- Enable `showGlobalVariables` only when required to prevent performance degradation.

```json
{
  "name": "Go: Launch Package",
  "type": "go",
  "request": "launch",
  "mode": "auto",
  "program": "${fileDirname}",
  "envFile": "${workspaceFolder}/.env",
  "showLog": false
}
```

---

### C++ (`cppdbg` / `lldb`)

For GCC, Clang, or MSVC debugging:
- Use `cppdbg` (`ms-vscode.cpptools`) or `lldb` (`vadimcn.vscode-lldb`).
- Ensure symbols are generated (`-g` for GCC/Clang, `/Zi` for MSVC).

```json
{
  "name": "C++: Build & Debug Active File (cppdbg)",
  "type": "cppdbg",
  "request": "launch",
  "program": "${fileDirname}/${fileBasenameNoExtension}",
  "args": [],
  "stopAtEntry": false,
  "cwd": "${fileDirname}",
  "environment": [],
  "externalConsole": false,
  "MIMode": "gdb",
  "preLaunchTask": "cpp: build active file"
}
```

---

### C# / .NET (`coreclr`)

Debug configuration for .NET 8 / .NET 9 LTS via the C# Dev Kit:
- Binds to `preLaunchTask: "build"`.
- Locates target output DLL inside `bin/Debug/net8.0/` or `net9.0/`.

```json
{
  "name": ".NET: Launch API",
  "type": "coreclr",
  "request": "launch",
  "preLaunchTask": "build",
  "program": "${workspaceFolder}/bin/Debug/net8.0/${workspaceFolderBasename}.dll",
  "args": [],
  "cwd": "${workspaceFolder}",
  "stopAtEntry": false,
  "envFile": "${workspaceFolder}/.env"
}
```

---

## 3. Compound Launch Orchestration

Compound launch configurations enable orchestrating multiple debugger sessions in a single click:

```json
{
  "compounds": [
    {
      "name": "Full Stack: Web Frontend & API Backend",
      "configurations": [
        "Node: Fastify Backend",
        "Chrome: Launch Web Frontend"
      ],
      "stopAll": true
    }
  ]
}
```

When `"stopAll": true` is configured, stopping either service cleanly terminates all coordinated sessions, preventing orphan background processes from locking ports.

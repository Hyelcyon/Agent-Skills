# Workspace Settings & Formatter Binding Guide

A senior engineering guide to structuring `.vscode/settings.json` for deterministic, zero-friction developer environments across polyglot repositories.

---

## 1. Principles of Senior Workspace Configuration

1. **Workspace-Scoped, Never Machine-Specific**:
   - Never put absolute directory paths or local username paths in repository configuration.
   - Use variable substitution: `${workspaceFolder}`, `${workspaceFolderBasename}`, `${file}`, `${relativeFile}`.
2. **Formatting on Save is Non-Negotiable**:
   - Code reviews must focus on logic, architecture, and invariants—never on indentation, trailing commas, or quotes.
   - Enforce formatting on save with explicit code actions to organize imports and fix lint rules automatically.
3. **Protecting IDE Performance via Aggressive Exclusions**:
   - Heavy artifact folders (`node_modules`, `dist`, `target`, `.next`, `bin`, `obj`, `.turbo`) waste file watcher threads, spike CPU usage, and contaminate global search.
   - Always exclude build directories from `files.watcherExclude`, `search.exclude`, and `files.exclude`.

---

## 2. Core Formatting & Code Actions Binding

```json
{
  "editor.formatOnSave": true,
  "editor.formatOnPaste": false,
  "editor.codeActionsOnSave": {
    "source.fixAll": "explicit",
    "source.organizeImports": "explicit"
  },
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.detectIndentation": false,
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "files.trimFinalNewlines": true
}
```

---

## 3. Polyglot Language Formatter Mappings

Configure deterministic default formatters per language ID to prevent conflicting extensions:

```json
{
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.tabSize": 2
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.tabSize": 2
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.tabSize": 2
  },
  "[python]": {
    "editor.defaultFormatter": "charliermarsh.ruff",
    "editor.tabSize": 4,
    "editor.codeActionsOnSave": {
      "source.organizeImports.ruff": "explicit",
      "source.fixAll.ruff": "explicit"
    }
  },
  "[rust]": {
    "editor.defaultFormatter": "rust-lang.rust-analyzer",
    "editor.tabSize": 4
  },
  "[go]": {
    "editor.defaultFormatter": "golang.go",
    "editor.tabSize": 4,
    "editor.insertSpaces": false
  },
  "[csharp]": {
    "editor.defaultFormatter": "csharpier.csharpier-vscode",
    "editor.tabSize": 4
  },
  "[cpp]": {
    "editor.defaultFormatter": "ms-vscode.cpptools",
    "editor.tabSize": 4
  },
  "[json]": {
    "editor.defaultFormatter": "vscode.json-language-features"
  },
  "[jsonc]": {
    "editor.defaultFormatter": "vscode.json-language-features"
  }
}
```

---

## 4. Search & File Watcher Performance Exclusions

```json
{
  "files.exclude": {
    "**/.git": true,
    "**/.svn": true,
    "**/.hg": true,
    "**/CVS": true,
    "**/.DS_Store": true,
    "**/Thumbs.db": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/build": true,
    "**/target": true,
    "**/.next": true,
    "**/.svelte-kit": true,
    "**/bin": true,
    "**/obj": true,
    "**/coverage": true,
    "**/.ruff_cache": true,
    "**/__pycache__": true
  },
  "files.watcherExclude": {
    "**/.git/objects/**": true,
    "**/.git/subtree-cache/**": true,
    "**/node_modules/**": true,
    "**/dist/**": true,
    "**/target/**": true,
    "**/.next/**": true
  }
}
```

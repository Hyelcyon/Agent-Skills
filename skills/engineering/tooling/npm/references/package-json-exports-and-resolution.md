# Modern package.json Exports and Module Resolution Architecture

Architectural standards for package encapsulation, conditional export mapping, dual ESM/CJS packaging, and type declaration resolution in modern npm packages.

## 1. The Modern Package Entry Point Standard

Legacy properties (`"main"`, `"module"`, `"browser"`) suffer from inconsistent module resolution across bundlers and runtimes. The `"exports"` field provides strict boundary encapsulation: only subpaths declared inside `"exports"` can be imported by consumers.

```json
{
  "name": "@enterprise/data-client",
  "version": "2.4.0",
  "type": "module",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      },
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      }
    },
    "./testing": {
      "import": {
        "types": "./dist/testing.d.ts",
        "default": "./dist/testing.js"
      }
    },
    "./package.json": "./package.json"
  }
}
```

Any attempt by a consumer to import internal files (for example, `@enterprise/data-client/dist/internal/helper.js`) throws an `ERR_PACKAGE_PATH_NOT_EXPORTED` error, preserving encapsulation.

---

## 2. Conditional Export Key Ordering Invariants

Node.js and TypeScript inspect conditional export keys sequentially from top to bottom. Incorrect key ordering breaks type resolution or causes dual-package hazard bugs.

### Mandatory Condition Structure

Nest `"types"` **first inside each runtime condition** (`.d.ts` under `"import"`, `.d.cts` under `"require"`) rather than sharing a single top-level `"types"` key before `"import"`/`"require"`, then place `"default"` as the fallback entry point:

---

## 3. Subpath Exports and Package Hygiene

When exporting submodules, avoid exposing deep directory hierarchies directly. Use clean logical subpaths:

```json
{
  "exports": {
    "./constants": {
      "types": "./dist/constants/index.d.ts",
      "import": "./dist/constants/index.js"
    },
    "./telemetry": {
      "types": "./dist/telemetry/index.d.ts",
      "import": "./dist/telemetry/index.js"
    }
  }
}
```

Consumers import cleanly via `@scope/package/telemetry` without hardcoding dist paths, enabling package authors to refactor internal build structures without breaking consumers.

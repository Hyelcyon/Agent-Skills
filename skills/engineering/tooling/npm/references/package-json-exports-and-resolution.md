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
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./testing": {
      "types": "./dist/testing.d.ts",
      "import": "./dist/testing.js"
    },
    "./package.json": "./package.json"
  }
}
```

Any attempt by a consumer to import internal files (for example, `@enterprise/data-client/dist/internal/helper.js`) throws an `ERR_PACKAGE_PATH_NOT_EXPORTED` error, preserving encapsulation.

---

## 2. Conditional Export Key Ordering Invariants

Node.js and TypeScript inspect conditional export keys sequentially from top to bottom. Incorrect key ordering breaks type resolution or causes dual-package hazard bugs.

### Mandatory Key Order Rule

1. `"types"`: Must always be the first key. If placed after `"import"`, TypeScript may fail to locate declaration files in certain module resolution modes.
2. `"import"`: The ESM target file.
3. `"require"`: The CommonJS target file (if backwards compatibility is maintained).
4. `"default"`: Generic fallback entry point.

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

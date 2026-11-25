# Node.js Modern Runtime Engine and Native ESM Architecture

Engineering specifications for modern Node.js 22/23+ V8 runtime execution, native ECMAScript Modules (ESM), and top-level await.

---

## 1. Native ESM as the Runtime Standard

Modern Node.js projects mandate native ECMAScript Modules (`"type": "module"` in `package.json`).

### Key ESM Guarantees
- Strict mode is enabled by default across all module files.
- Asynchronous module loading graph: modules are parsed and linked before execution.
- Native top-level `await` supported without async IIFE wrappers.

```javascript
import { readFile } from 'node:fs/promises';

const configData = await readFile('./config.json', 'utf8');
export const appConfig = JSON.parse(configData);
```

---

## 2. Path Resolution: `import.meta.dirname` and `import.meta.filename`

Legacy CommonJS globals (`__dirname`, `__filename`) do not exist in ESM. Node.js provides first-class properties on `import.meta`:

```javascript
import path from 'node:path';

export const projectRoot = path.resolve(import.meta.dirname, '..');
export const currentFile = import.meta.filename;
```

---

## 3. Package Exports Map

Configure the `"exports"` field in `package.json` to strictly control public entry points and encapsulation:

```json
{
  "name": "@enterprise/core-service",
  "version": "1.0.0",
  "type": "module",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      }
    },
    "./client": {
      "import": {
        "types": "./dist/client.d.ts",
        "default": "./dist/client.js"
      }
    }
  }
}
```

Internal files not listed in `"exports"` cannot be imported by external consumers, preventing unintended coupling to private modules.

---

## 4. Modern Node.js Standard Library Imports

Always use the `node:` protocol prefix when importing built-in modules (`node:fs`, `node:path`, `node:http`, `node:sqlite`).
- Eliminates ambiguity between core modules and third-party npm packages.
- Guarantees resolution from the Node.js runtime binary.

# Vite Plugin Architecture, Rollup Hooks, and Virtual Modules

Architectural standards for authoring Vite plugins, intercepting module resolution, creating virtual modules, and optimizing production bundling.

## 1. Vite Plugin Hook Lifecycle

A Vite plugin extends Rollup's plugin interface with additional hooks specific to the development server and Hot Module Replacement (HMR).

### Core Execution Lifecycle

1. **Configuration Stage**:
   - `config(config, env)`: Mutates or merges Vite user configurations before resolution.
   - `configResolved(resolvedConfig)`: Reads the final normalized configuration.
2. **Server Stage**:
   - `configureServer(server)`: Attaches custom Connect middlewares to the dev server.
   - `transformIndexHtml(html)`: Injects scripts, meta tags, or preload headers into `index.html`.
3. **Module Resolution and Build Stage (Universal Rollup Hooks)**:
   - `resolveId(source, importer)`: Intercepts module specifiers to resolve paths or declare virtual modules.
   - `load(id)`: Reads file contents or returns generated in-memory code.
   - `transform(code, id)`: Transpiles code before passing it to subsequent plugins or the browser.

---

## 2. Implementing Virtual Modules

Virtual modules allow plugins to inject dynamic, compile-time data or configurations directly into the import graph.

### Convention: Prefix with Null Byte

Vite conventions dictate that virtual module IDs start with `virtual:` for user-facing imports, and are resolved internally with a null byte prefix (`\0`) to prevent other plugins from treating them as filesystem paths.

```typescript
import type { Plugin } from 'vite';

export function virtualVersionPlugin(): Plugin {
  const virtualModuleId = 'virtual:build-metadata';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  return {
    name: 'vite-plugin-build-metadata',
    resolveId(id: string) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
      return null;
    },
    load(id: string) {
      if (id === resolvedVirtualModuleId) {
        const metadata = {
          buildTimestamp: Date.now(),
          gitCommit: process.env.GIT_COMMIT || 'development',
        };
        return `export const buildMetadata = ${JSON.stringify(metadata)};`;
      }
      return null;
    },
  };
}
```

Consumers can import `buildMetadata` in application code via:

```typescript
import { buildMetadata } from 'virtual:build-metadata';
```

---

## 3. Rollup Manual Chunks Strategy

Prevent large monolithic JavaScript bundles in production builds by configuring granular `manualChunks`:

```typescript
export function configureVendorChunks(id: string): string | void {
  if (id.includes('node_modules')) {
    if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
      return 'vendor-react';
    }
    if (id.includes('@tanstack') || id.includes('axios')) {
      return 'vendor-data';
    }
    return 'vendor-common';
  }
}
```

Splitting vendor code into logical chunks allows browser caching of rarely modified runtime libraries while invalidating only application-specific code upon releases.

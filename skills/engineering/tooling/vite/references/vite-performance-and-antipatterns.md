# Enterprise Vite Architecture, Performance & Anti-Patterns Runbook

A senior runbook covering Vite 6 build pipeline architecture, chunk optimization, environment variable safety, and anti-patterns to avoid.

---

## 1. Critical Anti-Patterns to Avoid

### ❌ Anti-Pattern 1: Running `vite dev` or `vite preview` in Production Docker Containers
- **The Hazard**: The Vite development server compiles modules on-the-fly, lacks aggressive minification, includes development overhead, and exposes an internal web server not hardened for public internet traffic. `vite preview` is strictly a local debugging tool.
- **The Standard**: Run `vite build` during the CI or Docker build stage, producing pure static files (`dist/`). Serve the static files using high-performance HTTP servers like Nginx, Caddy, or a CDN.

### ❌ Anti-Pattern 2: Putting Sensitive Credentials in `VITE_` Environment Variables
- **The Hazard**: Any environment variable prefixed with `VITE_` is statically embedded directly into client-side JavaScript bundles during compilation. Anyone opening Developer Tools can read the string in plain text.
- **The Standard**: Never prefix database passwords, private API keys, or secret tokens with `VITE_`. Only public identifiers (such as public API base URLs or analytics IDs) may use `VITE_`.

### ❌ Anti-Pattern 3: Massive Monolithic Vendor Bundles
- **The Hazard**: Leaving Vite's Rollup configuration on default bundling creates single multi-megabyte `index.js` chunks, destroying First Contentful Paint (FCP) and cache invalidation efficiency.
- **The Standard**: Configure `output.manualChunks` to isolate stable, third-party frameworks (e.g. `vendor-react`) from rapidly changing application business logic.

---

## 2. Tree-Shaking & Barrel File Pitfalls

Importing from barrel files (`index.ts` files that re-export hundreds of modules) often forces the bundler to load and parse large subtrees:
- Instead of `import { Button } from '@/components'`, configure compiler plugin optimizers or direct imports `import { Button } from '@/components/button'` to avoid pulling unreferenced components into the build graph.
- Configure `optimizeDeps.include` or `optimizeDeps.exclude` when integrating modern pure ESM packages.

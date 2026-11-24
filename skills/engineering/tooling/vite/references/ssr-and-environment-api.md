# Vite SSR and Environment API Architecture (Vite 6+)

Architectural guidelines for server-side rendering, multi-environment runtimes, and the Vite 6 Environment API.

## 1. The Vite 6 Environment API

Historically, Vite was designed primarily with two fixed execution targets: the browser client and the Node.js SSR runtime. 

Modern full-stack applications run across heterogeneous runtimes (browser, Node server, Cloudflare Workerd edge workers, Electron main/renderer). Vite 6 introduces the Environment API to configure distinct environments within a single configuration.

### Multi-Environment Configuration (`vite.config.ts`)

```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  environments: {
    client: {
      build: {
        outDir: 'dist/client',
        rollupOptions: {
          input: 'src/entry-client.tsx',
        },
      },
    },
    ssr: {
      build: {
        outDir: 'dist/server',
        ssr: true,
        rollupOptions: {
          input: 'src/entry-server.tsx',
        },
      },
    },
    edge: {
      build: {
        outDir: 'dist/edge',
        ssr: true,
        rollupOptions: {
          input: 'src/entry-edge.ts',
        },
      },
    },
  },
});
```

Each environment maintains its own module graph, resolve conditions, and build outputs without polluting global settings.

---

## 2. Server-Side Module Execution in Development

In custom SSR dev servers, use Vite's SSR runner to load and execute server entry points with live Hot Module Replacement:

```typescript
import express from 'express';
import { createServer } from 'vite';

async function bootstrapServer() {
  const app = express();
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });

  app.use(vite.middlewares);

  app.use('*', async (req, res, next) => {
    try {
      const url = req.originalUrl;
      const template = await vite.transformIndexHtml(url, '<div id="root"><!--ssr-outlet--></div>');
      const { render } = await vite.ssrLoadModule('/src/entry-server.tsx');
      const appHtml = await render(url);
      const html = template.replace('<!--ssr-outlet-->', appHtml);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (error) {
      vite.ssrFixStacktrace(error as Error);
      next(error);
    }
  });

  app.listen(3000);
}
```

`vite.ssrFixStacktrace(error)` remaps runtime stack traces back to original TypeScript source files using generated sourcemaps.

---

## 3. Hydration Mismatch Safety Rules

To avoid client hydration failures when hydrating SSR markup:
1. **Deterministic Date/Time**: Never render `new Date().toISOString()` directly on the server without synchronizing the timestamp across the initial HTML payload.
2. **Browser APIs**: Guard access to `window`, `document`, and `localStorage` inside lifecycle hooks (`useEffect`, `onMounted`) so they never execute during server-side evaluation.
3. **HTML Tag Structure**: Avoid invalid DOM nesting such as placing `<div>` or `<p>` inside another `<p>`, which causes browser DOM repair algorithms to produce mismatches during client hydration.

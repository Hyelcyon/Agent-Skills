# Docker Multi-Stage Builds and BuildKit Caching Architecture

Architectural guidelines for maximizing BuildKit layer caching, minimizing final image size, securing compilation credentials, and extracting clean build artifacts.

## 1. High-Performance Multi-Stage Pipeline Architecture

Separate the build environment from the final execution environment. Compilation toolchains, dev dependencies, and temporary intermediate assets must never reach the production runtime image.

```dockerfile
#syntax=docker/dockerfile:1.7

FROM node:22-alpine AS base
ENV NODE_ENV=production
WORKDIR /app

FROM base AS dependencies
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    corepack enable && pnpm install --frozen-lockfile --prod=false

FROM dependencies AS builder
WORKDIR /app
COPY . .
RUN pnpm build && pnpm prune --prod

FROM base AS runner
WORKDIR /app
RUN addgroup --system --gid 10001 nodejs && \
    adduser --system --uid 10001 nodejs
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json

USER nodejs
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

Using `--mount=type=cache` preserves downloaded package tarballs across consecutive builds on the same host without baking the cache directory into the image layers.

---

## 2. Secure Secret Injection During Build

Never inject API keys, private npm tokens, or SSH keys through `ARG` or `ENV` instructions, as they remain permanently readable inside image inspection layers (`docker history`).

### Using BuildKit Secret Mounts

```dockerfile
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc \
    pnpm install --frozen-lockfile
```

Execute the build by passing the secret from a local file or environment variable:

```bash
docker build --secret id=npmrc,src=$HOME/.npmrc -t enterprise-app:latest .
```

The secret file is mounted into memory only during the execution of that specific `RUN` step and is never saved into the container layer history.

---

## 3. Cache Invalidation and Layer Ordering Invariants

1. **Order from Slowest to Most Frequent Changes**:
   - System packages and OS updates (`apk add`, `apt-get`).
   - Package manager lockfiles (`package.json`, `pnpm-lock.yaml`, `Cargo.lock`, `go.sum`).
   - Dependency download and install commands.
   - Application source code (`COPY . .`).
   - Compilation commands (`npm run build`, `cargo build --release`).
2. **Deterministic File Copying**:
   - Avoid `COPY . .` early in the Dockerfile. Copying all files invalidates the layer cache whenever any file changes (even README or markdown docs).
   - Use a comprehensive `.dockerignore` file to exclude local `.git`, tests, documentation, and transient files.

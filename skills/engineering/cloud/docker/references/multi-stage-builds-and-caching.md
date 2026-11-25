# Docker Multi-Stage Builds and BuildKit Caching Architecture

Architectural guidelines for maximizing BuildKit layer caching, minimizing final image size, securing compilation credentials, and extracting clean build artifacts.

## 1. High-Performance Multi-Stage Pipeline Architecture

Separate the build environment from the final execution environment. Compilation toolchains, dev dependencies, and temporary intermediate assets must never reach the production runtime image.

```dockerfile
# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile

FROM dependencies AS builder
COPY . .
RUN pnpm build && CI=true pnpm prune --prod

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -g 10001 -S nodejs && \
    adduser -u 10001 -S nodejs -G nodejs
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json

USER nodejs
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

Using `--mount=type=cache` preserves downloaded package tarballs across consecutive builds on the same host without baking the cache directory into the image layers. Defer `ENV NODE_ENV=production` to `runner` so `dependencies`/`builder` install devDependencies cleanly, and use BusyBox `addgroup -S` / `adduser -S` flags on Alpine bases (`groupadd --system` applies only to Debian/Ubuntu bases).

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
docker build --secret id=npmrc,src=$HOME/.npmrc -t enterprise-app:1.0.0 .
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

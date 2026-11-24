---
name: docker
description: Use when containerizing applications with Docker, authoring multi-stage Dockerfiles with BuildKit cache mounts, configuring .dockerignore, setting up non-root users, or debugging container startup and shutdown signals.
---

# Enterprise Docker Architecture & Agent Operational Runbook

Senior DevOps standards for autonomous agents containerizing applications: multi-stage builds, BuildKit package caching, non-root execution, graceful signal handling, and verified anti-pattern elimination.

## When to Use
- Containerizing Node.js, Python, or Go microservices from scratch.
- Setting up BuildKit cache mounts (`--mount=type=cache`) to accelerate CI dependency installs.
- Authoring `.dockerignore` to block build context bloat and secret leaks.
- Securing containers with non-root user privileges and minimal runner bases.
- Handling `SIGTERM` / `SIGINT` signals for zero-downtime rolling container deployments.

## When NOT to Use
- Managing GitHub Actions or GitLab CI pipeline configurations (use `ci-cd`).
- Provisioning cloud VMs, Kubernetes clusters, or Terraform infrastructure.

---

## 1. Autonomous Agent Operational Protocol

When assigned to containerize an application or optimize a Docker build, the agent must execute these 5 sequential phases:

```
[Phase 1: Profiling] ──> [Phase 2: Context Shield] ──> [Phase 3: Multi-Stage] ──> [Phase 4: Security] ──> [Phase 5: Verification]
  Read package.json       Create .dockerignore         Separate deps/build/run     Create non-root user       Build & inspect image
```

### Phase 1: Project & Runtime Profiling
1. Inspect the workspace root: read `package.json`, lockfiles (`pnpm-lock.yaml`, `package-lock.json`), or Python `pyproject.toml`.
2. Determine output type:
   - **Static client-side app (Vite/React)**: Build static `dist/` and serve via `nginx:alpine`.
   - **Dynamic server-side service (Node/Express/FastAPI)**: Run via minimal Node/Python runtime with graceful signal handlers.

### Phase 2: Context Shielding (.dockerignore First)
Before creating or modifying a `Dockerfile`, verify that `.dockerignore` exists in the build context root.
- Block `.git`, `node_modules`, `.env*`, and build caches from transferring to the Docker daemon.
- Reference template: [resources/.dockerignore.recommended](./resources/.dockerignore.recommended).

### Phase 3: Multi-Stage Layer Optimization
Structure the `Dockerfile` with distinct stages to maximize layer caching:
1. `base`: Set environment variables and install package managers.
2. `dependencies`: Copy **only** package manifests and run install with BuildKit cache mounts.
3. `builder`: Copy remaining application source code and compile.
4. `runner`: Copy exclusively the built artifacts and production dependencies.

### Phase 4: Non-Root Security & Signal Hardening
1. Never leave the final stage running as `root` (UID 0). Create a dedicated system user (`appuser`).
2. Verify signal handling so `SIGTERM` initiates a graceful shutdown instead of timing out.

### Phase 5: Verification & Image Audit
Execute local verification before declaring completion:
```bash
docker build -t app-test:local .
docker history app-test:local
docker images app-test:local
```

---

## 2. Production Multi-Stage Standard

```dockerfile
FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN pnpm run build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm prune --prod

FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 appuser
COPY --from=builder --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:nodejs /app/dist ./dist
COPY --from=builder --chown=appuser:nodejs /app/package.json ./package.json
USER appuser
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

---

## 3. Critical Anti-Patterns to Avoid
- ❌ Running as `USER root` (exposes host system on container escape).
- ❌ Running `COPY . .` before dependency installation (destroys Docker layer cache).
- ❌ Retaining build compilers (`gcc`, `g++`, development headers) in production runner stage.
- ❌ Passing passwords or tokens via `ARG` or `ENV` (persists in image metadata history).
- ❌ Running `vite dev` or `vite preview` inside production containers.

## References & Documentation
- Deep Security & Anti-Patterns Runbook: [references/docker-security-and-antipatterns.md](./references/docker-security-and-antipatterns.md)
- Multi-Stage Builds & BuildKit Caching: [references/multi-stage-builds-and-caching.md](./references/multi-stage-builds-and-caching.md)
- Container Security & Rootless Runtimes: [references/container-security-and-rootless.md](./references/container-security-and-rootless.md)

## Resources & Examples
- Multi-Stage Dockerfile Template: [resources/Dockerfile.multistage](./resources/Dockerfile.multistage)
- Production .dockerignore: [resources/.dockerignore.recommended](./resources/.dockerignore.recommended)
- Hardened Docker Daemon Config: [resources/daemon.json](./resources/daemon.json)
- Graceful Shutdown Server Example: [examples/graceful_shutdown_server.ts](./examples/graceful_shutdown_server.ts)
- Container Healthcheck Script: [examples/container_healthcheck.sh](./examples/container_healthcheck.sh)
- Hardened Compose Local Service: [examples/docker_compose_local.yml](./examples/docker_compose_local.yml)

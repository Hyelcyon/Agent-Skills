# Enterprise Docker Architecture, Security & Anti-Patterns Runbook

A senior DevOps runbook covering multi-stage container optimization, non-root user execution, BuildKit cache mounts, signal handling, and anti-patterns to avoid.

---

## 1. Critical Anti-Patterns to Avoid

### ❌ Anti-Pattern 1: Running as Root (`USER root`)
- **The Hazard**: Containers running as `root` (UID 0) share the host kernel namespace. If an application vulnerability yields remote code execution or container breakout, the attacker gains immediate root-level host privileges.
- **The Standard**: Always create an unprivileged system user and group (`USER appuser` or `USER node`) before the `CMD` or `ENTRYPOINT` directive.

### ❌ Anti-Pattern 2: Copying the Entire Repository Before Dependency Installation
- **The Hazard**: Writing `COPY . .` before `npm install` invalidates Docker's layer cache on every single source code edit, triggering redundant 5–10 minute package downloads.
- **The Standard**: Copy exclusively the package manifests (`package.json`, lockfiles) first, execute the install step with BuildKit cache mounts, and only then copy application source code.

### ❌ Anti-Pattern 3: Retaining Build Tools in Production Runtime Images
- **The Hazard**: Shipping compilers (`gcc`, `g++`), package managers (`npm`, `pnpm`), and development headers into production increases the attack surface, bloats image size from 80MB to 1.5GB, and fails vulnerability compliance scans.
- **The Standard**: Use multi-stage builds. Compile artifacts in a build stage, and copy strictly the production binary or compiled `dist/` bundle into a clean runner stage.

### ❌ Anti-Pattern 4: Baking Secrets into Build Arguments or Environment Variables
- **The Hazard**: `ARG` and `ENV` values persist in plain text inside Docker image metadata (`docker history`, `docker inspect`).
- **The Standard**: Use BuildKit secret mounts (`RUN --mount=type=secret,id=npmrc`) which mount secrets in-memory during build execution without persisting them to layer history.

---

## 2. Signal Handling & The PID 1 Zombie Problem

In Unix systems, process ID 1 is responsible for reaping orphaned child processes and handling OS signals (`SIGTERM`, `SIGINT`).
Standard Node.js or Python runtimes are not designed to act as init systems:
- They ignore `SIGTERM` when running as PID 1, causing Docker to wait 10 seconds before forcibly killing the container with `SIGKILL`, resulting in dropped connections and corrupted transactions.
- Even with Node/Python `SIGTERM` handlers, runtimes without an init supervisor fail to reap orphaned child processes spawned by subshells. Use an explicit init system (`tini`, `dumb-init`, or `docker run --init`) alongside `process.on('SIGTERM', ...)` graceful draining.

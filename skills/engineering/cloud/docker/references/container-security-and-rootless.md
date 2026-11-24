# Container Security, Hardening, and Rootless Runtime Architecture

Production hardening guidelines for container containment, Linux capability dropping, read-only filesystems, and unprivileged execution in modern container environments.

## 1. Non-Root Execution Principles

Running containers as UID 0 (root) grants host-level administrative access if an application vulnerability allows a container breakout.

### Hardened User Declaration

In the final production image stage, always create a dedicated system group and user with a fixed, unprivileged UID/GID (10000+):

```dockerfile
FROM alpine:3.20
RUN addgroup -g 10001 -S appgroup && \
    adduser -u 10001 -S appuser -G appgroup
WORKDIR /app
COPY --chown=appuser:appgroup dist/ /app/
USER appuser
CMD ["/app/server"]
```

---

## 2. Docker Compose Hardening Standards

Apply runtime constraints in production orchestrations or local compose manifests:

```yaml
services:
  api:
    image: enterprise-api:latest
    user: "10001:10001"
    read_only: true
    security_opt:
      - no-new-privileges:true
      - seccomp:unconfined
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
    tmpfs:
      - /tmp:rw,noexec,nosuid,size=64m
      - /run:rw,noexec,nosuid,size=16m
    deploy:
      resources:
        limits:
          cpus: "2.0"
          memory: 1024M
```

- **`read_only: true`**: Mounts the container root filesystem as read-only. Attackers cannot download malicious binaries or overwrite system files.
- **`cap_drop: ALL`**: Strips all 40+ Linux capabilities, neutralizing network raw packet creation, module loading, and system administrative bypasses.
- **`no-new-privileges:true`**: Prevents setuid and setgid binaries from escalating privileges within the running container.
- **`tmpfs`**: Provides memory-backed, ephemeral scratch space for temporary application files while forbidding execution (`noexec`).

---

## 3. Minimal Base Images and Distroless Architecture

Reduce image attack surface and eliminate shell escape vectors by using Google Distroless or scratch base images:

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM gcr.io/distroless/nodejs22-debian12:nonroot
WORKDIR /app
COPY --from=build --chown=nonroot:nonroot /app/dist ./dist
COPY --from=build --chown=nonroot:nonroot /app/node_modules ./node_modules
USER nonroot
CMD ["dist/index.js"]
```

Distroless images omit package managers (`apk`, `apt`), shells (`/bin/sh`, `/bin/bash`), and coreutils. Even if an attacker executes arbitrary code via a remote command injection vulnerability, they cannot spawn an interactive shell or install exploitation tools.

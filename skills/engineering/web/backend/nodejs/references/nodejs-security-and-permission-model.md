# Node.js Security and Runtime Permission Model

Engineering standards for process sandboxing, resource access control, and supply-chain protection using the Node.js Permission Model.

---

## 1. The Threat of Supply-Chain Package Execution

Third-party dependencies executing in Node.js historically possessed unrestricted access to:
- Read environment variables, SSH keys, and cloud credentials (`~/.aws`, `~/.ssh`).
- Spawn arbitrary shell commands and reverse shells via `node:child_process`.
- Exfiltrate sensitive filesystem contents over open network sockets.

The Node.js Permission Model establishes hard security boundaries enforced directly at the C++ runtime layer.

---

## 2. Enabling Runtime Permissions via CLI

Launch processes with explicit permission boundaries:

```bash
node --permission \
  --allow-fs-read="/app/config,/app/dist" \
  --allow-fs-write="/app/logs,/app/tmp" \
  index.js
```

### Key Permission Flags
- `--allow-fs-read`: Whitelist directories the process can read from. Any read outside triggers `ERR_ACCESS_DENIED`.
- `--allow-fs-write`: Whitelist directories the process can write or delete.
- `--allow-child-process`: Grants permission to spawn external system binaries. When omitted, all `child_process` methods (`spawn`, `exec`, `fork`) throw security errors.
- `--allow-worker`: Controls whether `Worker` threads can be spawned.

---

## 3. Programmatic Permission Inspection

Verify permissions programmatically before attempting privileged operations:

```typescript
export function canReadDirectory(dirPath: string): boolean {
  if (typeof process.permission?.has === 'function') {
    return process.permission.has('fs.read', dirPath);
  }
  return true;
}

export function canSpawnProcess(): boolean {
  if (typeof process.permission?.has === 'function') {
    return process.permission.has('child');
  }
  return true;
}
```

---

## 4. Production Hardening Invariants
- Never grant `--allow-fs-read="*"` in production containers; constrain reads to the application deployment directory.
- Forbid `--allow-child-process` in web-facing microservices unless the service is explicitly designed as a build runner.
- Always run backend containers as non-root users (`USER node`).

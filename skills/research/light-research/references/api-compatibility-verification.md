# API Version Compatibility and Peer Dependency Verification

Operational guidelines for verifying runtime compatibility, diagnosing peer dependency conflicts, and validating library API contracts prior to integration.

## 1. Runtime Compatibility Matrices

Before adopting a library or updating an existing dependency, verify compatibility against your runtime targets:

### Node.js Engine Verification

Inspect the package's declared engine requirements:

```bash
npm info <package-name> engines
```

Ensure the library supports your deployment environment (e.g. Node 20 LTS or Node 22 LTS). Libraries relying on newer Node.js APIs (such as built-in SQLite or native WebSocket) fail on older LTS runtimes.

---

## 2. Resolving Peer Dependency Conflicts

Peer dependency warnings (`ERESOLVE could not resolve`) occur when two dependencies require incompatible versions of a shared peer package (e.g. `react@18` vs `react@19`).

### Resolution Workflow

1. Identify the conflicting packages via `npm ls <package-name>`.
2. Inspect whether the newer package has published an update or beta supporting the target peer version.
3. If an update is available, upgrade the conflicting package.
4. **Prohibited Practice**: Never bypass peer dependency errors using `--legacy-peer-deps` or `--force` in production manifests without verifying runtime stability.

---

## 3. Rapid Scratch API Verification

Verify that an API behaves as documented by executing an isolated scratch script before introducing code changes into the main codebase:

```typescript
import { z } from 'zod';

const TestSchema = z.object({
  id: z.string().uuid(),
  count: z.number().int().positive(),
});

const result = TestSchema.safeParse({
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  count: 5,
});

if (!result.success) {
  process.exit(1);
}
```

Running a standalone scratch script confirms method signatures, error types, and import resolution in isolation.

---
name: npm
description: Use when authoring or auditing package.json manifests, configuring modern exports maps and files whitelist arrays, mitigating .npmignore secret leak hazards, running package dry-runs, or publishing with provenance.
---

# Enterprise npm Packaging & Agent Operational Runbook

Standard operational protocol for autonomous agents managing package manifests, conditional export maps, artifact whitelisting (`files` vs `.npmignore`), dry-run verifications, and provenance publishing.

## When to Use
- Configuring `package.json` with conditional export maps (`exports`) for ESM and CommonJS.
- Whitelisting published artifacts using `"files": ["dist", ...]` to eliminate secret leakage.
- Authoring or auditing secondary `.npmignore` files without falling into the `.gitignore` fallback trap.
- Verifying packaged tarballs via `npm publish --dry-run` or `npm pack`.
- Enabling cryptographic build provenance via `publishConfig.provenance`.

## When NOT to Use
- Managing monorepo workspaces and hard-link dependency deduplication (use `pnpm`).
- Setting up Git release tags and automated changelog actions (use `github`).

---

## 1. Autonomous Agent Operational Protocol

When assigned to prepare, configure, or audit an npm package for release, the agent must execute these 5 sequential phases:

```
[Phase 1: Manifest Audit] ──> [Phase 2: Whitelist Guard] ──> [Phase 3: Export Mapping] ──> [Phase 4: Dry-Run Pack] ──> [Phase 5: Release Verification]
  Inspect package.json         Enforce "files" array           Define types/import/require     Inspect tarball contents   Build & run tests
```

### Phase 1: Manifest Audit & Discovery
1. Read the target `package.json`.
2. Inspect for risky fields:
   - Check if `"files"` is missing.
   - Check if a loose `.npmignore` exists in the repository root.
   - Check if `"main"` points to uncompiled TypeScript source (`src/index.ts`).

### Phase 2: Whitelist Guard (Neutralizing `.npmignore` Risks)
1. Do not rely on `.npmignore`. The moment `.npmignore` exists, npm ignores `.gitignore`, risking secret exposure.
2. Mandate the `"files"` whitelist array in `package.json` containing only the compiled distribution directory and documentation:
   ```json
   {
     "files": ["dist", "README.md", "LICENSE"]
   }
   ```

### Phase 3: Modern Export Mapping (`exports`)
1. Ensure `"type": "module"` is configured for modern ESM packages.
2. Configure conditional export maps with `"types"` listed as the first condition:
   ```json
   {
     "exports": {
       ".": {
         "types": "./dist/index.d.ts",
         "import": "./dist/index.js",
         "require": "./dist/index.cjs"
       }
     }
   }
   ```

### Phase 4: Dry-Run Packing & Artifact Audit
Never execute `npm publish` without verifying the tarball payload:
```bash
npm publish --dry-run
```
Inspect the output file list to verify that:
- No `.env` or configuration secrets are included.
- No raw `src/` or test fixtures are included.
- Built `.d.ts` and `.js` artifacts exist in the expected paths.

### Phase 5: Verification & Provenance
Ensure `"publishConfig"` includes provenance and access permissions:
```json
{
  "publishConfig": {
    "access": "public",
    "provenance": true
  }
}
```

---

## 2. Critical Anti-Patterns to Avoid
- ❌ Relying on `.npmignore` alone (triggers `.gitignore` bypass and leaks `.env`/test keys).
- ❌ Publishing uncompiled TypeScript files (`src/index.ts`) in `"main"` or `"exports"`.
- ❌ Omitting `"types"` in conditional export maps or placing `"types"` after `"import"`.
- ❌ Publishing without `--dry-run` or tarball inspection.
- ❌ Blindly using `--legacy-peer-deps` or `--force` instead of resolving dependency trees.

## References & Documentation
- Modern Publishing & Anti-Patterns Runbook: [references/npm-modern-publishing.md](./references/npm-modern-publishing.md)
- Package Exports & Resolution Architecture: [references/package-json-exports-and-resolution.md](./references/package-json-exports-and-resolution.md)
- Dependency Security & Provenance: [references/dependency-security-and-provenance.md](./references/dependency-security-and-provenance.md)

## Resources & Examples
- Standard .npmignore: [resources/.npmignore.recommended](./resources/.npmignore.recommended)
- Package Manifest Template: [resources/package.json.template](./resources/package.json.template)
- Recommended .npmrc Config: [resources/.npmrc.recommended](./resources/.npmrc.recommended)
- Manifest Validator Example: [examples/validate_package_manifest.ts](./examples/validate_package_manifest.ts)
- Dependency Audit Runner Example: [examples/dependency_audit_runner.ts](./examples/dependency_audit_runner.ts)
- Tarball Integrity Verifier: [examples/clean_tarball_verifier.ts](./examples/clean_tarball_verifier.ts)

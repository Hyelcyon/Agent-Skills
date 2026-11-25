# Enterprise npm Publishing, Security & Anti-Patterns Runbook

A senior guide for package distribution, modern `package.json` manifest architecture, `.npmignore` risk analysis, and artifact whitelisting.

---

## 1. Whitelisting vs Blacklisting: The `.npmignore` Security Trap

### The Denylist Vulnerability (`.npmignore`)
Relying on `.npmignore` to exclude files is a primary cause of accidental secret and source disclosure to the public npm registry:
- When you add a new private file locally (e.g. `credentials.json`, `debug.log`, or `.env.local`), `.npmignore` does not know about it.
- **The `.gitignore` Fallback Trap**: If `.npmignore` does NOT exist, npm falls back to `.gitignore`. The moment you create `.npmignore` to hide a folder, **npm completely stops reading `.gitignore`**. Any file ignored by Git but omitted from `.npmignore` is uploaded to the public registry.

### The Enterprise Standard: `package.json` `files` Whitelist
Always declare an explicit whitelist array in `package.json`:

```json
{
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ]
}
```
Any file not listed in `files` is ignored by default. Even if secrets or test databases exist in the root directory, they cannot be packaged.

---

## 2. Modern Package Manifest Architecture (`exports`)

Traditional `main` and `module` fields are insufficient for modern module resolution. Use explicit conditional export maps:

```json
{
  "type": "module",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      },
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      }
    },
    "./submodule": {
      "import": {
        "types": "./dist/submodule.d.ts",
        "default": "./dist/submodule.js"
      },
      "require": {
        "types": "./dist/submodule.d.cts",
        "default": "./dist/submodule.cjs"
      }
    }
  }
}
```

Declare `"types"` as the first key *inside each* `"import"` / `"require"` block (`.d.ts` for ESM, `.d.cts` for CJS) so consumers on `moduleResolution: "node16"`/`"nodenext"` avoid Dual Package Hazard type errors.

---

## 3. Pre-Publish Verification Workflow

Never publish blind. Always inspect the generated tarball artifact:

```bash
npm publish --dry-run
npm pack --dry-run
```

To inspect the exact packed files locally:

```bash
npm pack
tar -tf *.tgz
rm *.tgz
```

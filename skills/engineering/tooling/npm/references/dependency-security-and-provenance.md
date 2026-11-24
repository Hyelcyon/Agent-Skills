# npm Supply Chain Security, Provenance, and Dependency Auditing

Engineering guidelines for verifiable build provenance, cryptographic package signing, lifecycle script mitigation, and dependency vulnerability triage in npm.

## 1. Verifiable Build Provenance and Signing

Modern npm publishing supports verifiable build provenance using Sigstore and GitHub Actions OIDC federation. Publishing with provenance generates a publicly verifiable SLSA Level 2+ attestation linking the published npm package directly to the specific commit and repository that built it.

### Publishing Workflow with Provenance

```yaml
name: Publish Package
on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683
      - uses: actions/setup-node@39370e3970a6d050c480ffad4ff0ed4d3fdee5af
        with:
          node-version: 22
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm run build
      - run: npm publish --provenance --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_AUTOMATION_TOKEN }}
```

Consumers can verify package provenance using `npm audit signatures`, ensuring the artifact was not intercepted or replaced post-build.

---

## 2. Mitigating Malicious Lifecycle Scripts

Malicious packages frequently execute remote payloads during installation via `postinstall` or `preinstall` hooks.

### Defense-in-Depth Policies

1. **Install with Disabled Scripts**: In CI environments or untrusted dependency audits, disable arbitrary script execution:
   ```bash
   npm ci --ignore-scripts
   ```
2. **Deterministic Scripts Execution**: When dependencies require compilation (e.g. native addons), build them explicitly rather than running untrusted scripts globally.

---

## 3. Lockfile Integrity and Version Pinning

Always commit `package-lock.json` (version 3 format).

### CI Installation Rule

Never execute `npm install` inside continuous integration or deployment pipelines. Always execute:

```bash
npm ci
```

`npm ci` strictly validates `package.json` against `package-lock.json`. If discrepancies exist, it terminates immediately with an error rather than silently mutating dependencies.

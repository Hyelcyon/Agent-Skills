# CI/CD Pipeline Performance, Caching, and Matrix Architecture

Engineering standards for optimizing continuous integration speed, managing cross-platform build matrices, eliminating redundant executions, and caching dependencies.

## 1. Concurrency Cancellation Groups

When multiple commits are pushed rapidly to an active pull request, running queued builds for obsolete commits wastes compute minutes and clogs runner queues. Cancel superseded runs immediately:

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.event.pull_request.number || github.ref }}
  cancel-in-progress: ${{ github.event_name == 'pull_request' }}
```

Using `github.event.pull_request.number || github.ref` avoids cross-fork branch-name collisions (`head_ref` on two forks can both be `main`), while gating `cancel-in-progress` on `pull_request` ensures commits on `main`/trunk run to completion without interruption.

---

## 2. Multi-Platform Matrix Testing with Isolated Failures

Verify cross-platform compatibility across operating systems and runtime versions without halting the entire test suite on a single platform failure:

```yaml
jobs:
  test-matrix:
    runs-on: ${{ matrix.os }}
    strategy:
      fail-fast: false
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [20, 22]
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
      - uses: actions/setup-node@39370e3970a6d050c480ffad4ff0ed4d3fdee5af # v4.1.0
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm ci
      - run: npm test
```

Setting `fail-fast: false` ensures that if Windows fails due to path delimiter issues, the macOS and Linux builds continue running, providing comprehensive feedback in a single CI run.

---

## 3. High-Efficiency Dependency Caching

Accelerate CI pipelines by caching package manager stores based on strict lockfile content hashes. Never cache `node_modules` directly for `pnpm`, which relies on content-addressable store links:

```yaml
steps:
  - name: Resolve pnpm Store Path
    shell: bash
    run: echo "PNPM_STORE_PATH=$(pnpm store path --silent)" >> "$GITHUB_ENV"

  - name: Cache pnpm Store
    uses: actions/cache@1bd1e32a3bdc45362d1e726936510720a7c30a57 # v4.2.0
    with:
      path: ${{ env.PNPM_STORE_PATH }}
      key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
      restore-keys: |
        ${{ runner.os }}-pnpm-
```

If the lockfile has not changed, the dependencies are restored from cache in seconds, bypassing network downloads and tarball verification.

---

## 4. Trigger Optimization and Path Filtering

Prevent documentation or configuration updates from triggering full test suites:

```yaml
on:
  pull_request:
    branches: [main]
    paths-ignore:
      - '**.md'
      - 'docs/**'
      - '.vscode/**'
      - '.github/dependabot.yml'
```

Limiting triggers to relevant code changes prevents queue congestion and reduces feedback latency for developers.

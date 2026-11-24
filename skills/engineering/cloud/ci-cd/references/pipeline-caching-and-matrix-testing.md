# CI/CD Pipeline Performance, Caching, and Matrix Architecture

Engineering standards for optimizing continuous integration speed, managing cross-platform build matrices, eliminating redundant executions, and caching dependencies.

## 1. Concurrency Cancellation Groups

When multiple commits are pushed rapidly to an active pull request, running queued builds for obsolete commits wastes compute minutes and clogs runner queues. Cancel superseded runs immediately:

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.head_ref || github.run_id }}
  cancel-in-progress: true
```

Using `github.head_ref || github.run_id` ensures that PR branches cancel obsolete runs while commits on main/trunk run to completion without interruption.

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
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683
      - uses: actions/setup-node@39370e3970a6d050c480ffad4ff0ed4d3fdee5af
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm ci
      - run: npm test
```

Setting `fail-fast: false` ensures that if Windows fails due to path delimiter issues, the macOS and Linux builds continue running, providing comprehensive feedback in a single CI run.

---

## 3. High-Efficiency Dependency Caching

Accelerate CI pipelines by caching package manager directories based on strict lockfile content hashes:

```yaml
steps:
  - name: Cache Node Modules
    uses: actions/cache@d4323d4df104b026a6aa633fdb11d772115902dd
    with:
      path: |
        ~/.local/share/pnpm/store
        node_modules
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

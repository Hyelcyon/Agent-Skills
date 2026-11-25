# Version Locking & Local Environment Grounding

Operational protocol for systematically extracting installed dependency versions from local project manifests and enforcing version-locked search queries.

---

## 1. Why Version Locking is Non-Negotiable

A major driver of AI agent bugs is version drift:
- The user's project is running `pydantic 1.10`, but the agent searches for modern `pydantic 2.x` syntax (`model_dump()`), causing an immediate `AttributeError`.
- The user's project is running `next 15.1`, but the agent copies a blog post from 2022 using `next/router` and `pages/` directory conventions.
- The user's project is running `react 19`, but the agent suggests `useFormState` (which was renamed to `useActionState`).

**Rigorous technical research mandates that search queries are never version-agnostic.** You must identify the local version *before* formulating queries.

---

## 2. Manifest & Lockfile Extraction Matrix

Before executing search queries, inspect the relevant project files:

| Ecosystem | Manifest File | Lockfile | Version Inspection Command |
| :--- | :--- | :--- | :--- |
| **Node / TypeScript** | `package.json` | `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock` | `npm ls <package> --depth=0` or read `package.json` |
| **Python** | `pyproject.toml`, `requirements.txt` | `uv.lock`, `poetry.lock`, `Pipfile.lock`, `pdm.lock` | `pip show <package>` or inspect lockfile |
| **Rust** | `Cargo.toml` | `Cargo.lock` | `cargo pkgid <package>` or read `Cargo.lock` |
| **Go** | `go.mod` | `go.sum` | `go list -m <package>` or read `go.mod` |
| **Java / JVM** | `pom.xml`, `build.gradle.kts` | `gradle.lockfile` | Inspect dependency block in build file |
| **C# / .NET** | `*.csproj`, `Directory.Build.props` | `packages.lock.json` | `dotnet list package` or read `.csproj` |

---

## 3. Query Construction with Version Anchors

Once the local version is determined, inject the exact major.minor version into every search query:

```text
[site:<official_docs>] "<symbol>" <major>.<minor>
```

### Examples:
- **TypeScript Project**: Local `next` is `15.1.4`
  - Query: `site:nextjs.org/docs "next/form" 15.1`
- **Python Project**: Local `fastapi` is `0.115.0` with `pydantic` `2.8`
  - Query: `site:fastapi.tiangolo.com "model_dump" "pydantic v2"`
- **Rust Project**: Local `tokio` is `1.38`
  - Query: `site:docs.rs/tokio/1.38 "task::JoinSet"`

---

## 4. Handling Major Version Discrepancies

If search reveals that the latest version has fundamentally changed compared to the project's installed version:
1. **Identify the Delta**: Note whether the installed version is legacy ($N-1$) or current ($N$).
2. **Prioritize Installed Compatibility**: Implement code that is strictly valid for the *currently installed version*.
3. **Transparently Note Upgrade Path**: Mention in the response:
   > *"Note: This project is running v1.x (`foo.dict()`). In v2.x, this method was replaced with `foo.model_dump()`. If you plan to upgrade to v2, migration details are available at [link]."*
4. **Never Force Incompatible Upgrades**: Do not introduce code requiring an uninstalled newer version unless the user explicitly requested a package upgrade.

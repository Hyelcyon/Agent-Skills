# Antigravity Skills Developer Deep Dive

Authoring, organizing, and auditing production-grade skills specifically for **Google Antigravity Desktop App** while honoring open Agent Skills (`agentskills.io`) portability.

---

## 1. Antigravity App Discovery & File Layout

Antigravity Desktop App reads skills from two scopes, each scanned **strictly 1 level deep** (`<root>/<skill-name>/SKILL.md`):

| Scope | Default App Paths | CLI-Only Paths (Do NOT assume in App) |
| :--- | :--- | :--- |
| **Workspace** | `<workspace>/.agents/skills/<name>/` (legacy `<workspace>/.agent/skills/<name>/`) | N/A |
| **Global** | `~/.gemini/config/skills/<name>/` | `~/.gemini/antigravity-cli/skills/`, `~/.gemini/skills/` |
| **Plugins** | `<plugin>/skills/<name>/` via installed Antigravity plugins | Framework-specific CLI plugin caches |

### Organizing Nested Skill Categories via `skills.json`
Because Antigravity scans each root only 1 level deep, hierarchical trees like `skills/engineering/platform/windows/` require explicit discovery entries in `skills.json` (root) or `.agents/skills.json`:
- **Base path rule**: Relative `path` values in `.agents/skills.json` resolve from the **workspace root** containing `.agents/`, NOT relative to `.agents/`.
- **Filtering**: Use `include_only` or `exclude` arrays on an `entries` item to expose subsets cleanly, and `inherits` to compose parent manifests.
- Validate against [../resources/skills-schema.json](../resources/skills-schema.json).

---

## 2. Skill Anatomy & Progressive Disclosure

```text
skill-name/
├── SKILL.md                  # [Required] Frontmatter + concise workflow & guardrails
├── references/               # [On-Demand] Modular domain deep-dives loaded only when needed
├── scripts/                  # [On-Demand] Deterministic code (--help first, run silently)
├── resources/                # [On-Demand] Config templates, schemas, policies to adapt/copy
└── examples/                 # [On-Demand] Tested canonical, async, and error-recovery code
```

### Runtime Minimum vs Workstation Catalog Standard
Distinguish these clearly so agents never waste tokens:
1. **Official Antigravity App Minimum**: Any skill directory containing a valid `SKILL.md` (`name` matching folder, valid `description`) works natively. Small focused skills do NOT need empty subdirectories.
2. **Workstation Engineering Catalog Benchmark**: Rich domain skills in `~/.gemini/config/skills/` standardize on a modular Triad (`references/` `>= 3` docs or `>= 7` for `react`, `vue`, `angular`, `svelte`, `nodejs`, `nextjs`; `examples/` `>= 3`; `resources/` `>= 3`) so complex runtime models and failure modes stay separated rather than bloating `SKILL.md`.
3. **Zero-Stub Invariant**: Never invent placeholder or sub-40-byte files just to satisfy numeric counts. Every artifact must carry verified, non-obvious technical substance.

---

## 3. Official YAML Frontmatter vs Cross-Tool Boundaries

Validate against [../resources/skill-frontmatter-schema.json](../resources/skill-frontmatter-schema.json):

| Field | Required | Rules |
| :--- | :--- | :--- |
| `name` | Yes | `1..64` chars, `^[a-z0-9]+(-[a-z0-9]+)*$`, no `--`, matches parent folder name |
| `description` | Yes | `10..1024` chars, concrete trigger symptoms + `"Do NOT use for..."` if ambiguous; **never summarize workflow steps** |
| `license` / `compatibility` / `metadata` / `allowed-tools` | No | Open `agentskills.io` metadata (`compatibility <= 500` chars) |

**Cross-Platform Separation Rule**:
- Do NOT place Antigravity-incompatible Claude Code keys (`disable-model-invocation`, `user-invocable`, `context: fork`, `argument-hint`, `!` shell injections) into Antigravity-only skills unless building cross-agent skills explicitly targeting Claude Code.
- Do NOT put Antigravity hook config inside `SKILL.md`; workspace hooks belong in `.agents/hooks.json` with Antigravity Desktop App events (`SessionStart`, `PreToolUse`, `PostToolUse`, `PreInvocation`, `PostInvocation`, `Stop`).

---

## 4. Subdirectory Craftsmanship Standards

### `references/` — Focused Domain Modules
- Split distinct failure domains (e.g., server serialization vs client hydration, lock safety vs eviction) into independent `.md` files linked from `SKILL.md` with relative markdown links (`[references/file.md](./references/file.md)`).
- Never duplicate entire references back into `SKILL.md`.

### `scripts/` — Black-Box Deterministic Helpers
- Design scripts to be invoked via CLI without forcing agents to read the script source first: implement `--help`, explicit exit codes, and machine-readable JSON or concise table stdout.
- Never start foreground servers, file watchers, or infinite loops inside verification commands.

### `examples/` & `resources/` — Production Truth
- Compile, lint, or type-check every code snippet (`python -m py_compile`, `tsc --noEmit`, `ruff`, `powershell`).
- **Never hardcode demo secrets** (even `"Bearer secret"` defaults) or use deprecated/vulnerable patterns (missing `hmac.compare_digest`, unvalidated SSRF IPv4-mapped IPv6, busy loops, raw string cookie concatenation without `__Host-` guards).

---

## 5. Senior Agent Engineering Philosophy & Discovery Optimization

1. **Trigger Descriptions Only ("When", Never "How")**:
   - Poor: `description: "Runs pytest, inspects traceback, edits file, re-runs tests."` (encourages the model to improvise without reading `SKILL.md`).
   - Effective: `description: "Use when writing or reviewing Python 3.12+ services, Pydantic v2 models, TaskGroup concurrency, or debugging async exceptions."` (or third-person equivalent ending with `"Use when..."`).
2. **Root Cause Over Patch Layering**:
   Every technical skill must steer the agent to trace callers, state invariants, and minimal diffs first rather than wrapping null checks or swallowing exceptions.
3. **Empirical Verification Before Claiming Done**:
   Never report success from memory; every skill Phase 4 must specify exact runnable validation commands suited to the OS and project stack.

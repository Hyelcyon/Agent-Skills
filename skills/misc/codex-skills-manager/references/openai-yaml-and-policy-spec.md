# `agents/openai.yaml` & Codex Policy Specification

Complete schema reference for Codex's sidecar configuration file `agents/openai.yaml` placed inside `<skill-dir>/agents/openai.yaml`.

---

## 1. Sidecar Layout

```text
my-codex-skill/
├── SKILL.md                  # Standard name + description frontmatter only
├── agents/
│   └── openai.yaml           # Codex UI metadata, implicit invocation policy & MCP deps
├── scripts/                  # Deterministic executable helpers
├── references/               # Modular on-demand technical docs
└── assets/                   # Templates, icons, schemas for Codex skills
```

---

## 2. Top-Level Sections in `agents/openai.yaml`

### A. `interface` (Optional UI & Prompt Binding)
- `display_name`: Human-readable UI card label.
- `short_description`: Concise card subtitle shown in `/skills` picker.
- `icon_small` / `icon_large`: Relative paths to SVG/PNG assets under `assets/`.
- `brand_color`: Hex color `#RRGGBB` (6 hexadecimal digits).
- `default_prompt`: Starter prompt inserted when clicked; **should mention `$<skill-name>`** so Codex triggers the matching skill cleanly.

### B. `policy` (Optional Invocation Guardrail)
- `allow_implicit_invocation`: Boolean (`true` by default). Set `false` to block implicit auto-selection on destructive or gated skills while allowing `$<skill-name>`.

### C. `dependencies` (Optional External Tool Bindings)
- `tools`: Array of tool descriptors (`type: "mcp"`, `value: "<server-name>"`, `description`, `transport`, `command` or `url`). Ensures Codex surfaces missing MCP integrations upfront instead of failing mid-run.

Validate against [../resources/openai-yaml-schema.json](../resources/openai-yaml-schema.json).

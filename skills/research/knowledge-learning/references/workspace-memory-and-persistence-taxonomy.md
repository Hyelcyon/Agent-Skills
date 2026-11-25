# Workspace Memory and Persistence Taxonomy

This reference defines the hierarchical taxonomy for persisting learned workspace knowledge, specifying exact storage destinations, file formats, and progressive disclosure boundaries.

---

## 1. Knowledge Tier Hierarchy

To avoid bloating context windows while ensuring reliable recall, learned knowledge is partitioned into four distinct tiers:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        KNOWLEDGE TIER HIERARCHY                        │
├────────────────────────────────┬───────────────────────────────────────┤
│ Tier 1: Global Invariants      │ AGENTS.md / rules/*.md (All sessions) │
│ Tier 2: Project Architecture   │ docs/adr/*.md, docs/architecture/*.md │
│ Tier 3: Operational Cards      │ config/knowledge/ & .gemini/knowledge/│
│ Tier 4: Reusable Custom Skills │ skills/* (Complex procedural workflows)│
└────────────────────────────────┴───────────────────────────────────────┘
```

---

## 2. Tier Selection Matrix

| Tier | Target Location | Criteria for Inclusion | Lifespan |
| :--- | :--- | :--- | :--- |
| **Tier 1: Global / Project Rules** | `AGENTS.md`, `rules/*.md` | Non-negotiable invariants affecting code generation, safety, or fundamental coding style across all turns. | Permanent / Standing |
| **Tier 2: Architecture Decision Records** | `docs/adr/ADR-NNNN.md` | Deliberate engineering choices between multiple viable alternatives with trade-offs. | Project Lifetime |
| **Tier 3: Operational Knowledge Cards** | `~/.gemini/config/knowledge/` or `.gemini/knowledge/` | Specific environment quirks, CLI workarounds, test setup prerequisites, private API nuances. | On-Demand (Indexed) |
| **Tier 4: Reusable Skill Assets** | `skills/<category>/<name>/` | Multi-step procedural runbooks requiring executable scripts, templates, and multi-file guidance. | System / User-Wide |

---

## 3. Directory Conventions for Tier 3 Knowledge Cards

To unify knowledge storage across Google Antigravity, knowledge cards are centralized under the `knowledge/` hub:

```text
~/.gemini/config/knowledge/ (or <workspace-root>/.gemini/knowledge/)
├── knowledge.json                       # Machine-readable registry (id, scope, weight, summary)
├── README.md                            # Optional human overview and weight conventions
└── cards/
    ├── KC-001-native-binding-tests.md   # Atomic markdown knowledge card
    ├── KC-002-test-db-isolation.md      # Atomic markdown knowledge card
    └── KC-003-private-npm-registry.md   # Atomic markdown knowledge card
```

### Machine-Readable Registry Format (`knowledge.json`)
The `knowledge.json` file serves as the lightweight discovery layer allowing progressive disclosure without token bloat (validated by [../resources/learning-taxonomy-schema.json](../resources/learning-taxonomy-schema.json)):

```json
{
  "version": "1.0.0",
  "entries": [
    {
      "id": "KC-001",
      "title": "Mandatory Native Binding Test Command",
      "category": "test_harness",
      "scope": "tests/**/*",
      "weight": "critical",
      "status": "Active",
      "path": "cards/KC-001-native-binding-tests.md",
      "summary": "Always invoke tests via pnpm test:native; never run raw vitest.",
      "created_at": "2026-11-03",
      "last_verified": "2026-11-03",
      "verification_command": "pnpm test:native"
    }
  ]
}
```

---

## 4. De-Duplication & Conflict Resolution

When recording newly learned knowledge:
1. **Search Existing Knowledge**: Before creating a new card, check `knowledge.json` to see if the topic was already covered.
2. **Update vs Append**: If the existing card is outdated, edit it in place with updated verification evidence rather than creating contradictory duplicates.
3. **Deprecation Protocol**: When a project refactor eliminates a workaround, mark the card `Status: Deprecated` and document the deprecating commit or PR.

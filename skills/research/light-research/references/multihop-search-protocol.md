# Multi-Hop Search & Gap Detection Protocol

Operational guidelines for executing high-precision, iterative web searches for production-grade agentic search, gap detection, and evidence triangulation.

---

## 1. The Core Philosophy: Search as Verification

A fundamental flaw of traditional LLM agents is treating web search as a fallback when the agent is totally ignorant, while relying on parametric memory when the agent *feels* confident. In fast-evolving software ecosystems (React 19, Next.js 15, Pydantic v2, Tailwind v4, Python 3.12+, Rust 2024 edition), parametric confidence is the #1 cause of silent hallucinations.

The rigorous operational philosophy reverses this:
- **Parametric Memory is Unverified Draft Only**: Internal weights provide general conceptual patterns, never exact API contracts or recent breaking change boundaries.
- **Search Compute is High-ROI**: Spending 2-3 targeted search calls before writing code eliminates hours of compiler debugging, broken imports, and user frustration.
- **Search Snippets are Index Cards, Not the Book**: Never extract an API signature or architectural recommendation from a search engine preview snippet alone.

---

## 2. The 3-Hop Multi-Query Execution Loop

```
       ┌────────────────────────────────────────────────────────┐
       │                Technical Question / Error              │
       └───────────────────────────┬────────────────────────────┘
                                   ▼
          [ Hop 1: Discovery & Documentation Targeting ]
                 - site:<docs> "<exact symbol>" <version>
                                   │
                                   ▼
          [ Hop 2: Deep Extraction & Signature Verification ]
                 - Inspect official doc page / repository source
                 - Extract signatures, types, runtime boundaries
                                   │
                                   ▼
          [ Hop 3: Falsification & Negative Evidence Hunting ]
                 - Probe for breaking changes, deprecations, caveats
                 - "<symbol>" "breaking change" OR "deprecated"
                                   │
                                   ▼
                     [ Gap Detection / Verifier ]
                       ├── Sufficient & Clean? ──► [ Phase 5: Empirical Scratch Proof ]
                       └── Gaps Detected? ───────► [ Reformulate & Loop ]
```

### Hop 1: Discovery & Documentation Targeting
Formulate high-entropy search queries that bypass SEO blogs and pinpoint official documentation:
- Good: `site:nextjs.org/docs/app "useActionState" 15`
- Bad: `how to use actions in nextjs`

### Hop 2: Deep Extraction & Signature Verification
Extract full contracts:
- Method name, import path, required vs. optional parameters.
- Return types, async vs. sync behavior.
- Runtime boundaries (Server vs. Client Components, Edge runtime support, Node.js minimum engine).

### Hop 3: Falsification & Negative Evidence Hunting
This is the fundamental falsification discipline. Never assume a found pattern works until you actively try to dislodge it:
- Probe for recent deprecations: `site:github.com/<owner>/<repo> "deprecated" "<symbol>"`
- Probe for breaking migrations: `"<symbol>" "breaking change" <target-version>`
- Probe for active open issues: `"<symbol>" site:github.com/<owner>/<repo>/issues "bug"`

---

## 3. Gap Detection & Query Reformulation

After retrieving evidence from Hops 1-3, evaluate whether any gaps remain:

| Gap Detected | Reformulation Strategy | Example Query |
| :--- | :--- | :--- |
| **Missing Parameter Types** | Target repository source code definitions | `site:github.com/org/repo "export interface Options" OR "type Config"` |
| **Ambiguous Runtime Support** | Target runtime compatibility tables | `site:developer.mozilla.org OR site:docs "runtime support" "<symbol>"` |
| **Unclear Migration Path** | Target official upgrade guides | `site:docs/migration "<old-symbol>" "<new-symbol>"` |
| **Conflicting Blog vs. Doc** | Discard blog; target primary git release notes | `site:github.com/org/repo/releases tag <version>` |

---

## 4. Anti-Patterns to Strictly Prohibit

1. **The Single-Shot Exit**: Running one query, seeing a partial answer in the snippet, and immediately jumping into code editing.
2. **Confirmation Bias Searching**: Searching only `how to use X with Y` without searching `X Y breaking change` or `X Y issues`.
3. **SEO Farm Trapping**: Reading aggregators (GeeksForGeeks, Baeldung, random Medium posts) instead of official GitHub repos or documentation portals.
4. **Rationalizing Mistakes**: When a user or compiler indicates an error, arguing why the previous answer "should have worked" instead of discarding the hypothesis and conducting a fresh search.

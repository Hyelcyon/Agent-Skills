# Falsification & Negative Evidence Hunting Protocol

Operational guidelines for executing falsification searches to detect breaking changes, silent deprecations, and runtime failure modes before code implementation.

---

## 1. What is Falsification in Engineering Research?

In scientific and senior software engineering practice, a hypothesis cannot be considered verified merely because one tutorial or documentation snippet supports it. **Falsification is the deliberate attempt to disprove your own proposed solution before writing production code.**

When an AI agent searches only for affirmative queries (e.g. `how to configure middleware in nextjs 15`), search algorithms return articles that confirm the query—often written for older versions or simplified demo environments. This produces confirmation bias.

Falsification actively queries for:
1. **Breaking Changes**: Has this signature or configuration syntax been altered or removed in the installed version?
2. **Deprecation Warnings**: Has the maintainer announced an upcoming sunset or recommended an alternate API?
3. **Runtime Incompatibilities**: Does this API fail in Edge runtimes, serverless functions, or specific OS environments?
4. **Active GitHub Issues**: Is there a known critical bug, race condition, or memory leak associated with this feature?

---

## 2. Standard Falsification Query Templates

Always execute at least one falsification query for any non-trivial API or architectural recommendation:

### Template 1: Breaking Change Probing
```text
"<symbol_or_feature>" "<target_version>" "breaking change" OR "removed" OR "replaced"
```
*Example*: `"middleware" "nextjs 15" "breaking change" OR "replaced"`

### Template 2: Deprecation Probing
```text
site:<official_docs_or_github> "<symbol_or_feature>" "deprecated" OR "legacy" OR "will be removed"
```
*Example*: `site:nextjs.org/docs "getInitialProps" "deprecated"`

### Template 3: Failure Mode & Bug Probing
```text
site:github.com/<owner>/<repo>/issues "<symbol_or_feature>" "not working" OR "fails" OR "regression"
```
*Example*: `site:github.com/prisma/prisma/issues "accelerate" "prepared statement" "error"`

### Template 4: Runtime/Platform Constraint Probing
```text
"<symbol_or_feature>" ("edge runtime" OR "serverless" OR "node 22") "unsupported" OR "not compatible"
```
*Example*: `"bcrypt" "edge runtime" "unsupported" OR "error"`

---

## 3. Interpreting Falsification Results

When negative search returns results:

| Finding | Engineering Action |
| :--- | :--- |
| **API Deprecated in Target Version** | Do NOT use. Search for the designated replacement symbol and target its migration guide. |
| **Breaking Change Documented in Release Notes** | Update signature to the new spec immediately; verify that no legacy options are passed. |
| **Open GitHub Issue with Reproduction** | Inspect whether an official workaround exists. If unpatched, select an alternative library or design. |
| **Runtime Incompatibility (e.g. Node vs. Edge)** | Validate target execution environment before code insertion (e.g., switch to Web Crypto `crypto.subtle` PBKDF2 or an edge-compatible pure-JS library). |
| **Zero Negative Evidence Found** | Confidence established. Proceed to Phase 5 (Empirical Scratch Proof). |

---

## 4. The Anti-Rationalization Rule

When falsification yields negative evidence against your initial assumption:
- ❌ **Prohibited**: Do NOT rationalize or downplay the risk (e.g. "It's deprecated, but it will probably work for now").
- ❌ **Prohibited**: Do NOT attempt to conceal the deprecation from the user.
- ✅ **Mandatory**: Disclose the breaking change or deprecation explicitly, state the authoritative source, and implement the modern, supported alternative.

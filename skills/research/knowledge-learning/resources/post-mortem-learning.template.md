# Incident Post-Mortem & Learned Invariant

- **Incident ID**: PM-[YYYYMMDD-01]
- **Date**: [YYYY-MM-DD]
- **Author**: [Agent / Pair Programmer]
- **Impact**: [e.g., Broken CI build, silent test failure, deployment crash]

---

## 1. Executive Summary

Brief 2-3 sentence overview of what went wrong, how it was diagnosed, and the permanent mitigation instituted.

---

## 2. Timeline & Diagnostic Progression

| Timestamp | Phase | Observation / Action Taken |
| :--- | :--- | :--- |
| T+00m | Detection | Initial command failed with exit code 1. |
| T+10m | Hypothesis | Assumed missing dependency; re-installation failed to resolve. |
| T+20m | Breakthrough | Discovered undocumented symlink issue under Windows host. |
| T+30m | Resolution | Fixed mount configuration and added explicit flag. |

---

## 3. Root Cause Analysis

Explain the five whys (or technical chain of events) explaining why the failure occurred.

---

## 4. Permanent Invariant Established

Document the exact rule added to workspace memory or rules to ensure this incident cannot recur:
- **Location Updated**: [e.g., .gemini/knowledge/cards/KC-005-slug.md + .gemini/knowledge/knowledge.json / AGENTS.md]
- **Rule Summary**: [One clear directive]

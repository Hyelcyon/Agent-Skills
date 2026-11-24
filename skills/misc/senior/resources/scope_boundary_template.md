# Scope Boundary Analysis Template

## 1. Targeted Request
- Explicit User Goal: `<exact requirement>`
- Files Directly Affected: `<list of files>`

## 2. Invariant Inbound/Outbound Boundaries
- Upstream Callers: `<callers that invoke this component>`
- Downstream Dependencies: `<systems or databases called>`
- State Invariants: `<data invariants that must not break>`

## 3. Excluded Scope (Non-Goals)
- Refactoring surrounding unrequested modules: `EXCLUDED`
- Adding speculative configuration keys: `EXCLUDED`
- Reformatting unrelated lines: `EXCLUDED`

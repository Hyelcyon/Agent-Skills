# Root-Cause Engineering vs. Patch Layering

## 1. The Patch-Layering Anti-Pattern
When an unexpected null or error occurs, junior developers often wrap the symptom:
- Adding `if (obj != null)` guards at the rendering or output layer without understanding why `obj` was null.
- Catching exceptions broadly and swallowing them (`catch (Exception e) {}`).
- Introducing fallback default values that mask state corruption.

## 2. Root-Cause Tracing
Always trace backward along the execution path:
1. Identify the point of origin: where was the invalid state constructed?
2. Trace callers and data flows to locate the invariant breakdown.
3. Fix the state creation or validation logic at the source.

## 3. Invariant Restoration
A true fix restores the structural invariant so that downstream consumers do not need defensive wrappers.

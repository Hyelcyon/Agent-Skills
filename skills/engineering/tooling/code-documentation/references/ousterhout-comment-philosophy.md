# John Ousterhout's Commenting Philosophy (A Philosophy of Software Design)

A synthesis of Chapters 12 and 13 of *A Philosophy of Software Design* (by Prof. John Ousterhout, Stanford University), establishing the theoretical foundation for senior-grade documentation in autonomous coding agents.

---

## 1. The Core Purpose: Reducing "Unknown Unknowns"

Software complexity manifests primarily as:
1. **Change Amplification**: A simple change requiring modifications in many different places.
2. **Cognitive Load**: How much knowledge a developer must hold to complete a task.
3. **Unknown Unknowns**: When it is not obvious what information you need, or what files must be modified.

**Comments are the ultimate tool for neutralizing Unknown Unknowns.** Code alone cannot express developer intent, trade-offs, external constraints, or why an alternative design was rejected.

---

## 2. The Four Cardinal Rules of Comments

### Rule 1: Do Not Repeat the Code
If the information can be deduced simply by reading the syntax of the method, writing a comment is worse than useless—it adds cognitive noise and creates maintenance debt:
- ❌ *Code repetition:*
  ```typescript
  // Find the user by their id
  function findUserById(id: string) { ... }
  ```
- ✅ *Adding non-obvious information:*
  ```typescript
  /**
   * Looks up a user record by primary UUID.
   *
   * @remarks
   * Employs read-through caching via Redis. Returns stale snapshot data
   * during network partitions rather than throwing connectivity errors.
   */
  function findUserById(id: string) { ... }
  ```

### Rule 2: Interface Comments Must Differ from Implementation Comments
- **Interface Comments**: Written from the caller's perspective. Describe *what* the module provides abstractly, its contract, preconditions, and side effects, without mentioning internal variables or helper loops.
- **Implementation Comments**: Written inside method bodies. Describe *how* the algorithm works and *why* a particular data structure or invariant is maintained.

### Rule 3: Higher-Level vs Lower-Level Comments
- Comments should operate at a different level of abstraction than the code:
  - If the code is low-level (bit shifting, byte arrays, regexes), the comment should explain the high-level intent (e.g. *"Bitwise mask extracts the 4-bit tenant tier flag"*).
  - If the code is high-level (orchestrating five business services), the comment should clarify low-level invariants (e.g. *"Service B must be invoked after Service A to satisfy payment ledger constraints"*).

### Rule 4: Comments as a Design Tool (Write Comments First)
Senior engineers write interface comments *before* writing the implementation:
- If an interface is difficult to describe in a concise paragraph, the abstraction is likely shallow or overly complex.
- Writing comments first acts as an architectural stress test.

# JavaScript Async Control Flow and Explicit Resource Management

Architectural standards for asynchronous execution, deterministic resource cleanup with Symbol.dispose, error propagation, and context propagation in modern JavaScript.

## 1. Explicit Resource Management with "using"

JavaScript applications frequently leak file descriptors, database connections, and event listeners when developers forget manual `cleanup()` calls inside `finally` blocks.

The Explicit Resource Management specification introduces the `using` keyword and `Symbol.dispose` / `Symbol.asyncDispose` protocols:

```javascript
export class FileLockGuard {
  #path;
  #released = false;

  constructor(filePath) {
    this.#path = filePath;
  }

  [Symbol.dispose]() {
    if (!this.#released) {
      this.#released = true;
    }
  }
}

export function writeSafely(filePath, content) {
  using guard = new FileLockGuard(filePath);
}
```

When execution leaves the block scope enclosing `using guard`, JavaScript automatically invokes `[Symbol.dispose]()`, even if an error is thrown within the block.

---

## 2. Robust Error Chaining with Error Cause

When catching low-level runtime errors in service boundaries, preserve the original call stack using the `cause` option:

```javascript
export async function fetchUserRecord(userId) {
  try {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP request failed with status: ${response.status}`);
    }
    return await response.json();
  } catch (originalError) {
    throw new Error(`Failed to load profile for user: ${userId}`, {
      cause: originalError
    });
  }
}
```

Modern runtimes print the complete chained causal stack trace, preserving the root underlying network error while maintaining clean domain-level error contracts.

---

## 3. Deep Immutable Cloning with structuredClone

Avoid JSON serialization hacks (`JSON.parse(JSON.stringify(obj))`) when duplicating complex state trees:

```javascript
export function duplicateState(stateTree) {
  return structuredClone(stateTree);
}
```

Advantages of `structuredClone`:
- Accurately clones cyclic references without throwing maximum call stack errors.
- Correctly clones `Date`, `RegExp`, `Map`, `Set`, and `ArrayBuffer` instances without degrading them into plain strings or empty objects.
- Functions, DOM nodes, and non-clonable symbols throw deterministic `DataCloneError` exceptions rather than being silently omitted.

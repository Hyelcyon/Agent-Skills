# Modern ECMAScript Features Architecture (ES2024 - ES2026+)

Comprehensive engineering standards for modern JavaScript, covering new language primitives, native Set algebra, Promise resolvers, array grouping, and immutable sequence transformations.

## 1. Static Inversion of Control with Promise.withResolvers()

Prior to ES2024, extracting the `resolve` and `reject` callbacks from a Promise constructor required creating outer variables and reassigning them inside the executor function. `Promise.withResolvers()` returns the promise alongside its resolve and reject triggers directly.

```javascript
export class EventChannel {
  #current = Promise.withResolvers();

  push(item) {
    const { resolve } = this.#current;
    this.#current = Promise.withResolvers();
    resolve(item);
  }

  next() {
    return this.#current.promise;
  }
}
```

This pattern simplifies event-driven stream adapters, custom queue runners, and test mocking harnesses without closure boilerplate.

---

## 2. Native Set Algebra Methods

Modern JavaScript natively implements mathematical Set operations, eliminating the need for custom array filtering loops:

- `setA.union(setB)`: Returns elements present in either set.
- `setA.intersection(setB)`: Returns elements common to both sets.
- `setA.difference(setB)`: Returns elements in setA that are not in setB.
- `setA.symmetricDifference(setB)`: Returns elements in either set but not in both.
- `setA.isSubsetOf(setB)`: Evaluates whether all elements of setA exist in setB.
- `setA.isSupersetOf(setB)`: Evaluates whether setA contains all elements of setB.

```javascript
export function evaluateUserPermissions(grantedRoles, requiredRoles) {
  const granted = new Set(grantedRoles);
  const required = new Set(requiredRoles);

  const missing = required.difference(granted);
  const hasAccess = missing.size === 0;

  return {
    authorized: hasAccess,
    missingRoles: Array.from(missing)
  };
}
```

---

## 3. High-Performance Grouping with Object.groupBy and Map.groupBy

Group elements into objects or keyed Maps without manual `Array.prototype.reduce` aggregators:

```javascript
const inventory = [
  { name: 'asparagus', type: 'vegetables', quantity: 5 },
  { name: 'bananas', type: 'fruit', quantity: 0 },
  { name: 'cherries', type: 'fruit', quantity: 12 },
  { name: 'fish', type: 'meat', quantity: 22 }
];

const stockByType = Object.groupBy(inventory, (item) => item.type);
const availabilityMap = Map.groupBy(inventory, (item) => item.quantity > 0 ? 'inStock' : 'outOfStock');
```

`Object.groupBy` creates an object with a null prototype, preventing accidental prototype-pollution collisions when grouping on user-supplied keys.

---

## 4. Immutable Array Manipulation

Modern JavaScript provides non-mutating alternatives to mutating array methods:

| Mutating Method | Modern Immutable Equivalent |
| :--- | :--- |
| `arr.sort()` | `arr.toSorted()` |
| `arr.reverse()` | `arr.toReversed()` |
| `arr.splice()` | `arr.toSpliced()` |
| `arr[index] = val` | `arr.with(index, val)` |

```javascript
const numbers = [3, 1, 4, 1, 5];
const sorted = numbers.toSorted((a, b) => a - b);
const updated = sorted.with(0, 99);
```

The original array `numbers` remains unmodified, ensuring safe data flow across functional transformations and reactive state trees.

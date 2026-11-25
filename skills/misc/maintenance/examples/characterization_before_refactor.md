# Example: Characterization Tests Before Refactoring

## Scenario
Splitting a 140-line `calculateInvoiceTotals()` function that has zero existing unit tests.

## Step 1: Pin Observable Behavior First
Write black-box assertions capturing current rounding, tax-exempt, discount-floor, and empty-line outputs before modifying production code:
```typescript
import assert from 'node:assert/strict';

assert.deepEqual(calculateInvoiceTotals([], 0.1), { subtotalCents: 0, taxCents: 0, totalCents: 0 });
assert.deepEqual(
  calculateInvoiceTotals([{ unitCents: 1999, qty: 2, taxable: true }], 0.0825),
  { subtotalCents: 3998, taxCents: 330, totalCents: 4328 }
);
```

## Step 2: Refactor & Re-Verify
Extract small pure helpers (`computeSubtotalCents`, `computeTaxCents`), re-run the characterization suite plus full project tests, and confirm identical outputs with zero contract drift.

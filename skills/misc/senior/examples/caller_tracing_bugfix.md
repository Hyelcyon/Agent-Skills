# Example: Caller Tracing Bugfix

## Scenario
A downstream export service throws `TypeError: Cannot read property 'format' of undefined` during invoice generation.

## Symptom Patching (Anti-Pattern)
```typescript
function renderInvoice(invoice: Invoice) {
  const dateStr = invoice.date ? invoice.date.format() : 'N/A';
}
```
Result: The invoice renders with an invalid date string, corrupting financial records.

## Root-Cause Tracing (Senior Approach)
1. Grep all call sites constructing `Invoice`.
2. Discover that `InvoiceParser.fromPayload()` failed to parse ISO date strings when milliseconds were omitted.
3. Fix the parser so `date` is always a valid `DateTime` instance.
4. Downstream renderers remain clean and strictly typed.

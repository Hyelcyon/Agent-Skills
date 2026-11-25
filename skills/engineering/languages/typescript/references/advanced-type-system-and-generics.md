# Advanced TypeScript Type System and Generics

Engineering standards for expressive compile-time contracts, conditional types, template literal types, and mapped type transforms.

---

## 1. Distributive Conditional Types

Conditional types distribute automatically over naked type parameters in unions:

```typescript
export type NonNullableField<T> = T extends null | undefined ? never : T;

export type Flatten<T> = T extends (infer U)[] ? U : T;
```

To prevent unwanted distribution, wrap the condition in tuples:
```typescript
export type IsStrictUnion<T, U> = [T] extends [U] ? true : false;
```

---

## 2. Key Remapping in Mapped Types

Transform object schemas dynamically using `as` clauses and template literal types:

```typescript
export type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

interface UserRecord {
  id: string;
  name: string;
  age: number;
}

export type UserGetters = Getters<UserRecord>;
```

---

## 3. Branded / Nominal Types

TypeScript uses structural typing by default. Enforce nominal typing for domain identifiers to prevent mixing up IDs:

```typescript
declare const Brand: unique symbol;

export type Brand<T, B extends string> = T & { readonly [Brand]: B };

export type OrderId = Brand<string, 'OrderId'>;
export type CustomerId = Brand<string, 'CustomerId'>;

export function fulfillOrder(orderId: OrderId, customerId: CustomerId): void {
}
```

---

## 4. Invariants for Generics
- Prefer constrained generics (`<T extends Record<string, unknown>>`) over unconstrained `<T>`.
- Never use `Function` or `object` as generic constraints; use explicit function signatures `(...args: never[]) => unknown` or `Record<string, unknown>`.
- Avoid deep recursive type calculations exceeding 20 levels of recursion to prevent compiler lockups.

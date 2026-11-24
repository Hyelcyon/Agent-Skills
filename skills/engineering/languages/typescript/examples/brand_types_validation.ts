declare const BrandSymbol: unique symbol;

export type Branded<T, TBrand extends string> = T & { readonly [BrandSymbol]: TBrand };

export type UserId = Branded<string, 'UserId'>;
export type PositiveInt = Branded<number, 'PositiveInt'>;

export function parseUserId(raw: string): UserId {
  if (!raw || raw.trim().length === 0) {
    throw new Error('UserId cannot be empty');
  }
  return raw as UserId;
}

export function parsePositiveInt(n: number): PositiveInt {
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error(`Expected positive integer, received ${n}`);
  }
  return n as PositiveInt;
}

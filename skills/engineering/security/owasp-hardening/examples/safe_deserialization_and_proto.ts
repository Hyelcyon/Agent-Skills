const FORBIDDEN_KEYS: ReadonlySet<string> = new Set([
  '__proto__',
  'constructor',
  'prototype'
]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function safeDeepMerge<T extends Record<string, unknown>>(target: T, source: Record<string, unknown>): T {
  for (const key of Object.keys(source)) {
    if (FORBIDDEN_KEYS.has(key)) {
      continue;
    }

    const sourceVal = source[key];
    const targetVal = (target as Record<string, unknown>)[key];

    if (isPlainObject(sourceVal)) {
      if (!isPlainObject(targetVal)) {
        (target as Record<string, unknown>)[key] = Object.create(null);
      }
      safeDeepMerge((target as Record<string, unknown>)[key] as Record<string, unknown>, sourceVal);
    } else {
      (target as Record<string, unknown>)[key] = sourceVal;
    }
  }

  return target;
}

function safeJsonParse<T>(rawJson: string): T {
  const parsed: unknown = JSON.parse(rawJson);
  if (!isPlainObject(parsed)) {
    return parsed as T;
  }

  const cleanObject = Object.create(null) as Record<string, unknown>;
  return safeDeepMerge(cleanObject, parsed) as T;
}

export { safeDeepMerge, safeJsonParse, isPlainObject };

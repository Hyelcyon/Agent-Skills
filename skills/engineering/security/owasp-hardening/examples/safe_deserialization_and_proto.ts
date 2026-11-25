const FORBIDDEN_KEYS: ReadonlySet<string> = new Set([
  '__proto__',
  'constructor',
  'prototype'
]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function sanitizeJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeJsonValue(item));
  }
  if (!isPlainObject(value)) {
    return value;
  }

  const clean = Object.create(null) as Record<string, unknown>;
  for (const key of Object.keys(value)) {
    if (FORBIDDEN_KEYS.has(key)) {
      continue;
    }
    clean[key] = sanitizeJsonValue(value[key]);
  }
  return clean;
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
      (target as Record<string, unknown>)[key] = sanitizeJsonValue(sourceVal);
    }
  }

  return target;
}

function safeJsonParse<T>(rawJson: string): T {
  const parsed: unknown = JSON.parse(rawJson);
  return sanitizeJsonValue(parsed) as T;
}

export { safeDeepMerge, safeJsonParse, sanitizeJsonValue, isPlainObject };

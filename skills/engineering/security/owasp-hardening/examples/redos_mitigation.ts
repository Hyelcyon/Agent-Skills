const MAX_REGEX_INPUT_LENGTH = 512;

// Keep sync patterns strictly linear (no nested quantifiers or overlapping alternations).
const SAFE_ALPHANUMERIC_PATTERN = /^[a-zA-Z0-9_-]{1,128}$/;
const SAFE_EMAIL_PATTERN = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]{1,64}@[a-zA-Z0-9-]{1,63}(?:\.[a-zA-Z0-9-]{1,63})+$/;

function validateWithLengthBound(input: string, pattern: RegExp): boolean {
  if (input.length > MAX_REGEX_INPUT_LENGTH) {
    throw new Error(`Input length ${input.length} exceeds maximum bound ${MAX_REGEX_INPUT_LENGTH}`);
  }
  return pattern.test(input);
}

// Note: JS timers cannot interrupt synchronous RegExp.test on the main thread; enforce length bounds and DFA patterns (or worker_threads / node-re2) for untrusted patterns.
function validateUsernameAndEmail(username: string, email: string): boolean {
  return (
    validateWithLengthBound(username, SAFE_ALPHANUMERIC_PATTERN) &&
    validateWithLengthBound(email, SAFE_EMAIL_PATTERN)
  );
}

export {
  SAFE_ALPHANUMERIC_PATTERN,
  SAFE_EMAIL_PATTERN,
  validateWithLengthBound,
  validateUsernameAndEmail
};

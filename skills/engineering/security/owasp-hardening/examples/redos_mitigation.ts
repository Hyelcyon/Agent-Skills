const MAX_REGEX_INPUT_LENGTH = 512;

const SAFE_ALPHANUMERIC_PATTERN = /^[a-zA-Z0-9_-]+$/;
const SAFE_EMAIL_PATTERN = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

function validateWithLengthBound(input: string, pattern: RegExp): boolean {
  if (input.length > MAX_REGEX_INPUT_LENGTH) {
    throw new Error(`Input length ${input.length} exceeds maximum bound ${MAX_REGEX_INPUT_LENGTH}`);
  }
  return pattern.test(input);
}

async function matchWithTimeout(input: string, pattern: RegExp, timeoutMs: number = 200): Promise<boolean> {
  if (input.length > MAX_REGEX_INPUT_LENGTH) {
    throw new Error('Input exceeds safe evaluation length');
  }

  return new Promise<boolean>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Regex evaluation timed out'));
    }, timeoutMs);

    try {
      const result = pattern.test(input);
      clearTimeout(timer);
      resolve(result);
    } catch (err) {
      clearTimeout(timer);
      reject(err);
    }
  });
}

export {
  SAFE_ALPHANUMERIC_PATTERN,
  SAFE_EMAIL_PATTERN,
  validateWithLengthBound,
  matchWithTimeout
};

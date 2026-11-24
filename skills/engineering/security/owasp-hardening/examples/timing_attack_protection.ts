import { timingSafeEqual, createHash, createHmac } from 'node:crypto';

function secureCompareTokens(providedToken: string, expectedToken: string): boolean {
  const hashProvided = createHash('sha256').update(providedToken, 'utf8').digest();
  const hashExpected = createHash('sha256').update(expectedToken, 'utf8').digest();

  return timingSafeEqual(hashProvided, hashExpected);
}

function verifyHmacSignature(
  payload: string,
  providedSignatureHex: string,
  secretKey: string
): boolean {
  const computedSignatureHex = createHmac('sha256', secretKey)
    .update(payload, 'utf8')
    .digest('hex');

  const providedBuffer = Buffer.from(providedSignatureHex, 'utf8');
  const computedBuffer = Buffer.from(computedSignatureHex, 'utf8');

  if (providedBuffer.length !== computedBuffer.length) {
    return false;
  }

  return timingSafeEqual(providedBuffer, computedBuffer);
}

export { secureCompareTokens, verifyHmacSignature };

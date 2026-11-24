import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';

interface PkcePair {
  codeVerifier: string;
  codeChallenge: string;
  codeChallengeMethod: 'S256';
}

function generatePkcePair(): PkcePair {
  const codeVerifier = randomBytes(32)
    .toString('base64url');

  const codeChallenge = createHash('sha256')
    .update(codeVerifier, 'ascii')
    .digest('base64url');

  return {
    codeVerifier,
    codeChallenge,
    codeChallengeMethod: 'S256'
  };
}

function verifyPkceChallenge(codeVerifier: string, expectedChallenge: string): boolean {
  const computedChallenge = createHash('sha256')
    .update(codeVerifier, 'ascii')
    .digest('base64url');

  const computedBuf = Buffer.from(computedChallenge, 'utf8');
  const expectedBuf = Buffer.from(expectedChallenge, 'utf8');

  if (computedBuf.length !== expectedBuf.length) {
    return false;
  }

  return timingSafeEqual(computedBuf, expectedBuf);
}

export { generatePkcePair, verifyPkceChallenge };
export type { PkcePair };

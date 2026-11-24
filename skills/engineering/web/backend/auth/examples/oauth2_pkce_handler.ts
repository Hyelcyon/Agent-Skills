import { randomBytes, createHash } from 'node:crypto';

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

  return computedChallenge === expectedChallenge;
}

export { generatePkcePair, verifyPkceChallenge };
export type { PkcePair };

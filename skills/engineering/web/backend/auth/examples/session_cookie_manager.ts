import { randomBytes } from 'node:crypto';

interface SessionCookieOptions {
  name: string;
  maxAgeSeconds: number;
  domain?: string;
  path?: string;
}

interface SerializedCookie {
  cookieHeader: string;
  sessionId: string;
}

function createSecureSessionCookie(options: SessionCookieOptions): SerializedCookie {
  const sessionId = randomBytes(32).toString('hex');
  const path = options.path ?? '/';
  const domainPart = options.domain ? `; Domain=${options.domain}` : '';

  const cookieHeader = `${options.name}=${sessionId}; Max-Age=${options.maxAgeSeconds}; Path=${path}${domainPart}; HttpOnly; Secure; SameSite=Strict; Priority=High`;

  return {
    cookieHeader,
    sessionId
  };
}

function clearSessionCookie(name: string, path: string = '/'): string {
  return `${name}=; Max-Age=0; Path=${path}; HttpOnly; Secure; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export { createSecureSessionCookie, clearSessionCookie };
export type { SessionCookieOptions, SerializedCookie };

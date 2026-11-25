import { randomBytes } from 'node:crypto';

interface SessionCookieOptions {
  name: string;
  maxAgeSeconds: number;
  domain?: string;
  path?: string;
  sameSite?: 'Strict' | 'Lax';
}

interface SerializedCookie {
  cookieHeader: string;
  sessionId: string;
}

const VALID_COOKIE_NAME = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;

function createSecureSessionCookie(options: SessionCookieOptions): SerializedCookie {
  if (!VALID_COOKIE_NAME.test(options.name)) {
    throw new Error(`Invalid cookie name: ${options.name}`);
  }
  if (!Number.isInteger(options.maxAgeSeconds) || options.maxAgeSeconds < 0) {
    throw new Error(`Invalid maxAgeSeconds: ${options.maxAgeSeconds}`);
  }

  const path = options.path ?? '/';
  if (options.name.startsWith('__Host-')) {
    if (options.domain) {
      throw new Error('__Host- cookies must omit Domain attribute or browsers will silently reject them');
    }
    if (path !== '/') {
      throw new Error('__Host- cookies must set Path=/');
    }
  }

  const sessionId = randomBytes(32).toString('hex');
  const domainPart = options.domain ? `; Domain=${options.domain}` : '';
  const sameSite = options.sameSite ?? 'Lax';

  const cookieHeader = `${options.name}=${sessionId}; Max-Age=${options.maxAgeSeconds}; Path=${path}${domainPart}; HttpOnly; Secure; SameSite=${sameSite}; Priority=High`;

  return {
    cookieHeader,
    sessionId
  };
}

function clearSessionCookie(name: string, path: string = '/'): string {
  if (!VALID_COOKIE_NAME.test(name)) {
    throw new Error(`Invalid cookie name: ${name}`);
  }
  return `${name}=; Max-Age=0; Path=${path}; HttpOnly; Secure; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export { createSecureSessionCookie, clearSessionCookie };
export type { SessionCookieOptions, SerializedCookie };

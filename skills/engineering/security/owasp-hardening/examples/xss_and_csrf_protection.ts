import DOMPurify from 'dompurify';
import { timingSafeEqual, randomBytes } from 'node:crypto';

interface CsrfSessionContext {
  sessionId: string;
  csrfToken: string;
}

function escapeHtml(unsafeText: string): string {
  return unsafeText
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function sanitizeRichText(dirtyHtml: string): string {
  return DOMPurify.sanitize(dirtyHtml, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'ol', 'li', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'title', 'target'],
    ALLOW_DATA_ATTR: false,
    SAFE_FOR_TEMPLATES: true
  });
}

function generateCsrfToken(): string {
  return randomBytes(32).toString('hex');
}

function validateCsrfToken(sessionToken: string, requestHeaderToken: string): boolean {
  if (!sessionToken || !requestHeaderToken) {
    return false;
  }

  const sessionBuffer = Buffer.from(sessionToken, 'utf8');
  const headerBuffer = Buffer.from(requestHeaderToken, 'utf8');

  if (sessionBuffer.length !== headerBuffer.length) {
    return false;
  }

  return timingSafeEqual(sessionBuffer, headerBuffer);
}

export {
  escapeHtml,
  sanitizeRichText,
  generateCsrfToken,
  validateCsrfToken
};
export type { CsrfSessionContext };

import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';

const TRUSTED_API_PREFIX = '/api/';

@Injectable({ providedIn: 'root' })
export class SessionService {
  readonly token = signal<string | null>(null);
}

export const functionalAuthInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const session = inject(SessionService);
  const currentToken = session.token();

  // Never attach bearer credentials to arbitrary external URLs
  if (!currentToken || !req.url.startsWith(TRUSTED_API_PREFIX)) {
    return next(req);
  }

  const authenticatedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${currentToken}`,
      'X-Client-Version': '19.0.0'
    }
  });

  return next(authenticatedRequest);
};

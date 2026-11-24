import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SessionService {
  readonly token = signal<string | null>('jwt_session_token_sample');
}

export const functionalAuthInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const session = inject(SessionService);
  const currentToken = session.token();

  if (!currentToken) {
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

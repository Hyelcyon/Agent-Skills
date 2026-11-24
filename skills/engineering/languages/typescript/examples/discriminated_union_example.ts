type Result<T, E = Error> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

type UserEvent =
  | { readonly type: 'USER_LOGIN'; readonly payload: { userId: string; timestamp: number } }
  | { readonly type: 'USER_LOGOUT'; readonly payload: { userId: string } };

function dispatchEvent(event: UserEvent): string {
  switch (event.type) {
    case 'USER_LOGIN':
      return `User logged in: ${event.payload.userId}`;
    case 'USER_LOGOUT':
      return `User logged out: ${event.payload.userId}`;
    default: {
      const exhaustiveCheck: never = event;
      return exhaustiveCheck;
    }
  }
}

interface ApiEndpoints {
  readonly auth: string;
  readonly billing: string;
}

const API_ENDPOINTS: ApiEndpoints = {
  auth: '/api/v1/auth',
  billing: '/api/v1/billing',
} as const satisfies ApiEndpoints;

export { dispatchEvent, API_ENDPOINTS };
export type { Result, UserEvent, ApiEndpoints };

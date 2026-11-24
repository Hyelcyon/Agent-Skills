# RBAC, ABAC, and Enterprise Session Security

Technical standards for role-based and attribute-based access control, session fixation prevention, and token security boundaries.

---

## 1. Access Control Paradigms: RBAC vs ABAC

- **Role-Based Access Control (RBAC)**:
  - Grants permissions according to user roles (`ADMIN`, `OPERATOR`, `VIEWER`).
  - Best for coarse-grained administrative actions.
- **Attribute-Based Access Control (ABAC)**:
  - Evaluates fine-grained contextual attributes (e.g., resource ownership, tenant ID, request time, user location, environmental risk score).
  - Essential for multi-tenant isolation:
    $$\text{Permission} = \text{RoleMatch} \land (\text{User.tenantId} == \text{Resource.tenantId}) \land \text{IsWithinWorkingHours}$$

---

## 2. Session Fixation and Rotation Invariants

To eliminate session fixation vulnerabilities:
- Always regenerate the session ID immediately upon any privilege escalation or authentication event (login, MFA step-up).
- Destroy the previous session record in Redis or the database immediately upon issuance of the new session ID.
- Bind sessions to client cryptographic fingerprints or user-agent / IP subnets where appropriate.

---

## 3. Cookie Flags Defense in Depth

Session cookies set via `Set-Cookie` must enforce all four defense flags:

```http
Set-Cookie: __Host-session=jwt_val; Secure; HttpOnly; SameSite=Strict; Path=/; Partitioned
```

### Explanations
- `__Host-` prefix: Prevents subdomain overwriting and forces `Secure` and `Path=/`.
- `HttpOnly`: Prevents client-side JavaScript access via `document.cookie` (XSS mitigation).
- `SameSite=Strict`: Eliminates Cross-Site Request Forgery (CSRF).
- `Partitioned`: Supports modern browser CHIPS (Cookies Having Independent Partitioned State) storage isolation.

---

## 4. JWT Invariants & Security Guardrails
- Reject the `none` algorithm unconditionally.
- Verify the expiration `exp` with a tight clock skew tolerance ($\le 60\text{s}$).
- Enforce asymmetric signature verification using RS256 or Ed25519; never accept shared symmetric HMAC keys across disparate microservices.

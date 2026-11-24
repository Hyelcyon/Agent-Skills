# Enterprise Broken Access Control & SSRF Defense Architecture

A senior architectural guide for neutralizing Server-Side Request Forgery (SSRF, CWE-918), Path Traversal (CWE-22), Insecure Direct Object References (IDOR, CWE-862), and Mass Assignment (CWE-915).

---

## 1. Server-Side Request Forgery (SSRF) & The DNS Rebinding Trap

### The TOCTOU Problem (Time-of-Check to Time-of-Use)
A standard implementation mistake is resolving a hostname once, validating that the resolved IP address is public, and then calling an HTTP library with the original URL.
An attacker controls an authoritative DNS server configured with a Time-To-Live (TTL) of 0 seconds:
- First query (the check): Resolves to a harmless public IP (e.g. `93.184.216.34`).
- Second query (the fetch): Resolves to `127.0.0.1` or the cloud metadata service `169.254.169.254`.
The client connects directly to the internal asset, completely defeating the pre-validation filter.

### The Complete SSRF Defense Model
1. **IP Pinning**:
   - Resolve the target hostname once.
   - Verify every IP in the resolution set against blocked CIDR ranges (loopback, RFC 1918, link-local, multicast, cloud metadata).
   - Instruct the low-level HTTP transport socket to connect directly to the verified safe IP, passing the original domain name in the `Host` header and TLS Server Name Indication (SNI).
2. **Strict Protocol Allowlisting**:
   - Restrict allowed schemes strictly to `https:`. Reject `file:`, `gopher:`, `ftp:`, `dict:`, `ldap:`.
3. **Disable or Re-evaluate HTTP Redirects**:
   - Attackers frequently bypass pre-flight filters by pointing to a public URL that returns an HTTP `302 Found` redirecting to `http://169.254.169.254/latest/meta-data/`.
   - Never allow automatic redirects without subjecting every redirect target URL to the full IP pinning and CIDR verification pipeline.

---

## 2. Path Traversal & Arbitrary File Access

### Root Cause
Using untrusted input containing directory manipulation sequences (`../`, `..\`, null bytes `%00`, encoded dots) to construct filesystem paths.

### Defense Strategy
1. **Strict Path Resolution & Jail Boundary Verification**:
   - Resolve the untrusted path to its canonical, absolute form using `path.resolve` (Node.js) or `pathlib.Path.resolve()` (Python).
   - Ensure the canonical target path starts strictly with the canonical base directory path, terminated by a path separator.
   - In Python: use `target_path.is_relative_to(base_dir)`.
   - In Node.js: verify `targetPath.startsWith(baseDir + path.sep)`.
2. **Identifier Mappings Instead of Filesystem Names**:
   - Store files on disk using randomized UUIDs (e.g. `uuidv4()`).
   - Store metadata and original filenames in a database record mapped to the UUID.
   - Serve files by UUID lookup rather than by user-provided filename strings.

---

## 3. Insecure Direct Object References (IDOR) & Scoped Data Access

### Root Cause
Accepting an object identifier (such as `user_id`, `invoice_id`, `document_id`) from a client request and looking it up directly without verifying that the authenticated user possesses authorization to access or mutate that specific record.

### Defense Strategy
1. **Tenant-Scoped Database Queries**:
   - Never query solely by primary key (`WHERE id = :id`).
   - Enforce ownership and tenant boundaries in every query: `WHERE id = :id AND organization_id = :org_id AND user_id = :user_id`.
2. **Row-Level Security (RLS)**:
   - In PostgreSQL, enable Row-Level Security policies to automatically restrict query output based on the authenticated session context (`current_setting('app.current_user_id')`).

---

## 4. Mass Assignment & Parameter Tampering

### Root Cause
Directly passing raw HTTP request bodies (`req.body` or `request.json()`) into ORM update or insert methods without field filtering. An attacker can inject fields like `is_admin: true`, `role: "SUPERUSER"`, or `account_balance: 999999`.

### Defense Strategy
1. **Strict Input Schema Validation**:
   - In TypeScript: use Zod or TypeBox schemas configured to reject or strip unknown properties (`.strict()`).
   - In Python: use Pydantic models with explicit field definitions and `extra = 'forbid'`.
2. **Explicit DTO Projections**:
   - Construct database update payloads explicitly from validated DTO fields rather than passing arbitrary request objects.

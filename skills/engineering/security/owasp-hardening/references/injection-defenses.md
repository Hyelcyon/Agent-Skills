# Enterprise Injection Defense Architecture

A comprehensive security manual for neutralizing SQL Injection (CWE-89), OS Command Injection (CWE-78), Code Injection (CWE-94), and LDAP Injection (CWE-90).

---

## 1. SQL Injection (SQLi) In-Depth

### Root Cause
SQL injection occurs when an interpreter treats untrusted data as executable SQL commands rather than literal data parameters.

### Defense-in-Depth Strategy
1. **Parameterized Queries / Prepared Statements**:
   - Compiles the SQL query structure in the database engine before binding parameters.
   - User input cannot break out of quotes or inject SQL tokens (`OR`, `UNION`, `DROP`).
2. **Identifier Whitelisting (The Dynamic Query Problem)**:
   - SQL standards do not allow column names, table names, or sort directions (`ASC`/`DESC`) to be parameterized with bind variables (`$1`, `?`).
   - Any dynamic identifiers must be strictly checked against an immutable allowlist. If the requested identifier is not in the allowlist, the query must either reject the request or fall back to a safe default.
3. **Principle of Least Privilege**:
   - The database user connecting from the application must have the minimal necessary permissions (`SELECT`, `INSERT`, `UPDATE` on specific schemas), with no `SUPERUSER`, `DROP`, or `ALTER` privileges.

---

## 2. OS Command Injection In-Depth

### Root Cause
Passing unvalidated user data directly to a system shell interpreter (such as `/bin/sh`, `bash`, or `cmd.exe`). Attackers exploit shell metacharacters (`;`, `&`, `|`, `` ` ``, `$()`, `>`, `<`) to execute arbitrary operating system commands.

### Defense-in-Depth Strategy
1. **Never Invoke the Shell**:
   - In Node.js / TypeScript: use `child_process.execFile` or `child_process.spawn` with `{ shell: false }`. Pass arguments as an explicit array of strings (`string[]`), never as a single interpolated command string.
   - In Python: use `subprocess.run(["binary", "arg1", "arg2"], shell=False, check=True)`.
2. **Strict Allowlisting for Dynamic Executables or Arguments**:
   - If an argument determines a command mode or flag, validate it against an enum or lookup set.
3. **Path Canonicalization for Executables**:
   - Specify the absolute path to the binary (for example `/usr/bin/git` or `C:\Program Files\Git\bin\git.exe`) instead of relying on the system `PATH` variable, which can be hijacked.

---

## 3. Code Injection & Dynamic Evaluation

### Root Cause
Invoking dynamic evaluation functions (`eval()`, `Function()`, `setTimeout(string)`, Python `exec()`, `eval()`) on strings containing user-influenced input.

### Defense-in-Depth Strategy
1. Ban `eval()` and dynamic code construction at the linter and compiler level (`@typescript-eslint/no-implied-eval`, ESLint `no-eval`).
2. Use static lookup tables and strategy patterns instead of dynamically computing function names or class names from user requests.
3. For math or expression evaluation, use dedicated sandboxed parsers with an abstract syntax tree (AST) whitelist rather than passing expressions to runtime evaluators.

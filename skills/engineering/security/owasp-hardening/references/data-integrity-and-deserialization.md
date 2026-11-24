# Enterprise Data Integrity, Deserialization & ReDoS Defense

A comprehensive architectural manual covering Insecure Deserialization (CWE-502), Prototype Pollution (CWE-1321), Regular Expression Denial of Service (ReDoS, CWE-1333), and XML External Entity (XXE, CWE-611).

---

## 1. Insecure Deserialization

### The Flaw
Native object deserialization frameworks reconstruct live in-memory objects from binary or structured byte streams. When untrusted input is deserialized, magic methods and gadget chains execute arbitrary code (RCE) or mutate critical application state during object hydration.

### Vulnerable Formats vs Safe Alternatives
- **Python**:
  - Unsafe: `pickle.loads()`, `marshal.loads()`, `yaml.load()` without `SafeLoader`.
  - Safe: `json.loads()` validated through Pydantic or TypedDict schemas, `yaml.safe_load()`.
- **Node.js / TypeScript**:
  - Unsafe: `eval()`, `node-serialize` deserialize routines, unstructured object casting.
  - Safe: `JSON.parse()` strictly validated with schema validators (Zod, TypeBox, ArkType).

---

## 2. JavaScript / TypeScript Prototype Pollution

### Root Cause
In JavaScript, objects inherit properties from prototypes. If an untrusted input payload contains special keys (`__proto__`, `constructor`, `prototype`), naive recursive merge or deep clone algorithms can traverse up the prototype chain and modify `Object.prototype`. This alters properties across every object in the runtime environment, leading to bypass of security checks or Remote Code Execution.

### Defense Strategy
1. **Explicit Key Whitelisting & Filtering**:
   - In any recursive merge, clone, or property assignment function, explicitly reject any key equal to `__proto__`, `constructor`, or `prototype`.
2. **Prototype-less Dictionaries**:
   - When using objects as hash maps or key-value lookup tables, instantiate them using `Object.create(null)` or use the modern `Map` collection, which does not inherit from `Object.prototype`.
3. **Immutability & Freezing**:
   - Apply `Object.freeze(Object.prototype)` during application initialization in high-security environments to prevent runtime prototype modification.

---

## 3. Regular Expression Denial of Service (ReDoS)

### Root Cause: Catastrophic Backtracking
Standard Nondeterministic Finite Automaton (NFA) regex engines evaluate complex regular expressions by backtracking through permutations when a match fails.
Patterns with:
- Nested quantifiers: `(a+)+`
- Overlapping alternations inside quantifiers: `(a|aa)+`
- Ambiguous wildcards: `.*[a-z]+.*`

When fed crafted non-matching input strings (e.g. `aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!`), the evaluation complexity explodes exponentially ($O(2^n)$), freezing the event loop or process thread and causing full Denial of Service.

### Defense Strategy
1. **Linear-Time Regex Engines**:
   - Use DFA-based regex engines like Google RE2 (`re2` in Node.js, `google-re2` in Python) which guarantee $O(n)$ linear execution time regardless of pattern complexity or input string structure.
2. **Eliminate Ambiguous and Nested Quantifiers**:
   - Refactor overlapping groups to use atomic grouping or non-overlapping character classes.
3. **Input Length Constraints & Timeouts**:
   - Enforce strict maximum length boundaries on inputs subjected to regular expressions (e.g. limit email strings to 254 characters).
   - Execute regex operations within timeout-bounded execution wrappers or background workers.

---

## 4. XML External Entity (XXE) Prevention

### Root Cause
XML parsers configured with default settings evaluate Document Type Definitions (DTDs) and expand external entity references (`<!ENTITY ext SYSTEM "http://169.254.169.254/latest/meta-data/">` or `<!ENTITY file SYSTEM "file:///etc/passwd">`). This enables arbitrary local file disclosure, internal network port scanning, and billion laughs denial-of-service attacks.

### Defense Strategy
1. **Disable DTD Processing Entirely**:
   - Instruct the XML parser configuration to disable DTD parsing (`disallow_doctype = True`, `resolve_entities = False`).
2. **Use Defused Parsers**:
   - In Python, use the `defusedxml` package (`defusedxml.ElementTree`), which automatically neutralizes entity expansion, billion laughs bombs, and external network requests.

# macOS Security & Codesigning Invariants Guide

A senior engineering guide to Apple Silicon codesigning requirements, Hardened Runtime, Gatekeeper assessments, and System Integrity Protection (SIP).

---

## 1. Apple Silicon (arm64) Mandatory Signing Invariant

On Apple Silicon (M1/M2/M3/M4+), the Darwin kernel refuses to execute unsigned Mach-O binaries. Attempting to run an unsigned binary results in an immediate `SIGKILL` (Code: `COREDUMP` or `Killed: 9`).
- **Ad-Hoc Signing (Local Development)**:
  ```bash
  codesign --force --deep --sign - ./bin/local_binary
  ```
- **Enterprise / Developer ID Signing (Distribution)**:
  ```bash
  codesign --force --options runtime --timestamp --sign "Developer ID Application: Company (TEAMID)" ./bin/binary
  ```

---

## 2. Hardened Runtime & Entitlements

The Hardened Runtime (`--options runtime`) prevents unauthorized memory modifications, dylib hijacking, and code injection. If an application requires specific runtime capabilities, they must be declared in an entitlements XML file (`entitlements.plist`):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- Required for JIT runtimes like Node.js, V8, or JVM -->
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <!-- Required if loading unsigned legacy dylibs -->
    <key>com.apple.security.cs.disable-library-validation</key>
    <false/>
</dict>
</plist>
```

Apply entitlements:
```bash
codesign --force --options runtime --entitlements entitlements.plist --sign "Developer ID Application" ./bin/app
```

---

## 3. Gatekeeper & Extended Attributes (`xattr`)

When files are downloaded via browsers or tools like `curl`, macOS attaches the `com.apple.quarantine` extended attribute.
- **Inspect Attributes**:
  ```bash
  xattr -l ./downloaded_tool
  ```
- **Remove Quarantine Flag**:
  ```bash
  xattr -d com.apple.quarantine ./downloaded_tool
  ```
- **Evaluate Gatekeeper Policy**:
  ```bash
  spctl --assess --type execute --verbose ./downloaded_tool
  ```

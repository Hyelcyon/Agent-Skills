---
name: ida
description: Use when analyzing compiled binaries (PE, ELF, Mach-O, firmware) with IDA Pro or idalib, executing headless IDAPython automation, querying symbols and decompilation pseudocode via the official ida-mcp server, or recovering legacy binary architectures.
---

# IDA Pro & idalib Senior Engineering

Senior standards for headless binary disassembly, decompiler AST analysis, and symbol recovery using the official Hex-Rays `ida-mcp` server, `idalib`, and IDAPython.

## When to Use
- Reverse engineering compiled binaries (Windows PE, Linux ELF, Mach-O, firmware).
- Performing automated decompilation and function analysis headlessly via `ida-mcp`.
- Writing IDAPython automation scripts to recover structs, rename symbols, or trace cross-references.
- Inspecting legacy libraries and native dependencies without source code.

## When NOT to Use
- Source code analysis for high-level languages where compilers/linters suffice.
- Web application penetration testing or network traffic inspection (use `owasp-hardening`).

---

## 5-Phase Agent Operational Protocol

```
Phase 1: Binary Discovery & Workspace Staging
Phase 2: Headless Database Lease Acquisition (open_database)
Phase 3: Synchronous Auto-Analysis & Inspection (execute_python)
Phase 4: Struct Reconstruction & Symbol Naming
Phase 5: Database Persistence & Clean Lease Release (close_database)
```

### Phase 1: Binary Discovery & Staging
Never analyze binaries directly in protected system paths (such as `System32`) because IDA requires write permissions to create `.i64` database files. Copy targets to a dedicated scratch or build directory.

### Phase 2: Database Lease Acquisition
Acquire an active database session using the official MCP tool:
```json
{
  "name": "open_database",
  "arguments": {
    "path": "C:\\path\\to\\staged\\target.exe"
  }
}
```

### Phase 3: Synchronous Auto-Analysis & Inspection
Execute IDAPython code against the active session. Always verify `ida_auto.auto_wait()` before querying function tables or calling the decompiler:
```python
import ida_auto
import ida_funcs
import ida_ida

ida_auto.auto_wait()
min_ea = ida_ida.inf_get_min_ea()
total_funcs = ida_funcs.get_func_qty()
```

### Phase 4: Struct Reconstruction & Symbol Naming
Convert raw offset arithmetic into typed structures and assign unique, semantic names to unlabelled subroutines (`sub_401000` $\rightarrow$ `parse_network_frame`).

### Phase 5: Persistence & Clean Release
Save the database if modifications were made, and release the worker lease to prevent file locks:
```json
{
  "name": "close_database",
  "arguments": {}
}
```

---

## Prohibited Anti-Patterns

- ❌ Querying cross-references before `ida_auto.auto_wait()` completes.
- ❌ Leaving database sessions open without calling `close_database()`.
- ❌ Blindly trusting decompiled pseudocode without checking underlying assembly instructions.
- ❌ Running analysis directly inside protected OS directories without staging.

---

## References & Documentation
- Headless Architecture & Leases: [references/ida-mcp-headless-architecture.md](./references/ida-mcp-headless-architecture.md)
- IDAPython Scripting Standards: [references/idapython-scripting-and-domain-api.md](./references/idapython-scripting-and-domain-api.md)
- Binary Analysis Hygiene: [references/binary-analysis-hygiene-and-antipatterns.md](./references/binary-analysis-hygiene-and-antipatterns.md)

## Resources & Examples
- Headless Binary Inspector: [examples/headless_binary_inspector.py](./examples/headless_binary_inspector.py)
- Symbol & Xref Tracker: [examples/symbol_xref_tracker.py](./examples/symbol_xref_tracker.py)
- Decompiler AST Visitor: [examples/decompiler_ast_visitor.py](./examples/decompiler_ast_visitor.py)
- Official ida-mcp Configuration: [resources/ida-mcp-config.json](./resources/ida-mcp-config.json)
- IDAPython Runtime Init Script: [resources/idapythonrc.template.py](./resources/idapythonrc.template.py)
- Analysis Options Preset: [resources/analysis-options.cfg](./resources/analysis-options.cfg)

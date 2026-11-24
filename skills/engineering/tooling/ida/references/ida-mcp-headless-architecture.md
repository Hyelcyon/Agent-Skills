# IDA MCP Headless Architecture and Session Lifecycle

Architectural guidelines for automating binary disassembly, decompilation, and reverse engineering using the official Hex-Rays IDA MCP server and idalib.

## 1. The Headless idalib Architecture

Traditional binary analysis requires launching the interactive IDA graphical user interface (`ida.exe`). With IDA 9.0+, Hex-Rays introduced `idalib`, enabling IDA's complete disassembly, typing, and Hex-Rays decompiler engines to execute as a scriptable headless library.

The official `ida-mcp` server acts as a supervisor process:
- Spawns background `idalib` worker processes on demand.
- Operates via standard Model Context Protocol (MCP) `stdio` or HTTP transports.
- Eliminates the need to maintain an active GUI application window.
- Manages database locks and file leases cleanly.

---

## 2. Session Lifecycle and Database Leases

The MCP server coordinates access to compiled binaries through a 4-step lifecycle:

```
1. open_database(path) ──► Spawns idalib worker, initiates auto-analysis
       │
       ▼
2. execute_python(code) ─► Queries symbols, runs decompiler, edits names
       │
       ▼
3. save_database() ──────► Persists changes to .i64 / .idb database file
       │
       ▼
4. close_database() ─────► Releases database lock, terminates worker process
```

### Filesystem Permissions and Output Path Rule

When analyzing system binaries (for example, files located in protected operating system directories like `C:\Windows\System32`), IDA attempts to create the corresponding `.i64` database file in the same directory as the target executable.

Because protected directories reject write operations from standard user accounts, always copy target binaries to a dedicated, writable working directory prior to invoking `open_database`.

---

## 3. Real-Time Collaboration with Live GUI via ida-nexus

If an analyst opens the same database in the IDA Pro GUI while an AI agent is connected through `ida-mcp`:
- The underlying `ida-nexus` multiplexer coordinates database mutations.
- Symbol renames, type definitions, and comments applied by the agent reflect immediately in the analyst's active GUI disassembly and pseudocode views.
- Eliminates file lock conflicts between automated background agents and human operators.

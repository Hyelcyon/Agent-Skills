# IDAPython Scripting and Domain API Standards

Engineering guidelines for authoring robust, automated analysis scripts using IDAPython and the Hex-Rays decompiler API in modern IDA Pro 9.x.

## 1. Waiting for Auto-Analysis Completion

When opening a binary headlessly or programmatically, IDA schedules background analysis passes (cross-reference generation, type propagation, function boundary discovery). Querying functions or decompilers before auto-analysis finishes produces incomplete or corrupted results.

Always synchronize execution using `ida_auto.auto_wait()`:

```python
import ida_auto
import ida_funcs
import ida_ida

ida_auto.auto_wait()

image_base = ida_ida.inf_get_min_ea()
total_functions = ida_funcs.get_func_qty()
```

---

## 2. Iterating Functions and Inspecting Properties

Iterate over discovered function entries without manual pointer arithmetic:

```python
import ida_funcs
import ida_name

function_count = ida_funcs.get_func_qty()
for index in range(min(function_count, 100)):
    func = ida_funcs.getn_func(index)
    if not func:
        continue

    entry_ea = func.start_ea
    name = ida_name.get_name(entry_ea)
    size = func.end_ea - func.start_ea
```

---

## 3. Hex-Rays Decompilation and Pseudocode Access

Generate high-level C-like pseudocode from compiled machine code:

```python
import ida_hexrays

def generate_pseudocode(address: int) -> str | None:
    if not ida_hexrays.init_hexrays_plugin():
        return None

    try:
        cfunc = ida_hexrays.decompile(address)
        if not cfunc:
            return None
        return str(cfunc)
    except ida_hexrays.DecompilationFailure:
        return None
```

Always wrap `ida_hexrays.decompile` inside a `try...except` block because functions with irregular stack frames, obfuscation, or indirect jump tables can raise decompilation exceptions.

---

## 4. Safe Symbol Renaming

When naming recovered functions or global memory variables, validate that the target name is unique and does not collide with existing IDA symbols:

```python
import ida_name

def assign_function_name(address: int, new_name: str) -> bool:
    flags = ida_name.SN_CHECK | ida_name.SN_NODUMMY
    return bool(ida_name.set_name(address, new_name, flags))
```

Passing `SN_CHECK` rejects conflicting or invalid names, and `SN_NODUMMY` refuses auto-generated dummy prefixes.

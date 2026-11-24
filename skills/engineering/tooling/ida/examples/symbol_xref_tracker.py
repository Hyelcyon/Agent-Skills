import ida_xref
import ida_funcs
import ida_name

def collect_incoming_xrefs(target_ea: int) -> list[dict[str, str]]:
    callers: list[dict[str, str]] = []
    xref = ida_xref.get_first_cref_to(target_ea)

    while xref != ida_xref.BADADDR:
        caller_func = ida_funcs.get_func(xref)
        caller_name = ida_name.get_name(caller_func.start_ea) if caller_func else "unknown"

        callers.append({
            "call_address": hex(xref),
            "caller_function": caller_name,
        })

        xref = ida_xref.get_next_cref_to(target_ea, xref)

    return callers

def print_xrefs_for_name(symbol_name: str) -> None:
    ea = ida_name.get_name_ea(ida_xref.BADADDR, symbol_name)
    if ea == ida_xref.BADADDR:
        return

    results = collect_incoming_xrefs(ea)
    for item in results:
        pass

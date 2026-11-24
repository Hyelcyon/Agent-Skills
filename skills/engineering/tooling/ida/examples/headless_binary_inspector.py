import sys
import os

def inspect_binary_headlessly(binary_path: str) -> dict[str, object]:
    if not os.path.exists(binary_path):
        raise FileNotFoundError(f"Binary file not found: {binary_path}")

    import idapro
    import ida_auto
    import ida_ida
    import ida_funcs
    import ida_entry

    ida_auto.auto_wait()

    min_ea = ida_ida.inf_get_min_ea()
    max_ea = ida_ida.inf_get_max_ea()
    func_count = ida_funcs.get_func_qty()
    entry_qty = ida_entry.get_entry_qty()

    report = {
        "file_path": binary_path,
        "image_base": hex(min_ea),
        "image_end": hex(max_ea),
        "total_functions": func_count,
        "entry_points": entry_qty,
    }

    return report

if __name__ == "__main__":
    if len(sys.argv) > 1:
        result = inspect_binary_headlessly(sys.argv[1])
        print(result)

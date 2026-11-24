import ida_hexrays
import ida_funcs
import ida_name

class CallTargetVisitor(ida_hexrays.ctree_visitor_t):
    def __init__(self):
        super().__init__(ida_hexrays.CV_FAST)
        self.invoked_functions: list[str] = []

    def visit_expr(self, expr: ida_hexrays.cexpr_t) -> int:
        if expr.op == ida_hexrays.cot_call:
            target_expr = expr.x
            if target_expr.op == ida_hexrays.cot_obj:
                target_ea = target_expr.obj_ea
                func_name = ida_name.get_name(target_ea)
                self.invoked_functions.append(func_name)
        return 0

def extract_function_calls(func_ea: int) -> list[str]:
    if not ida_hexrays.init_hexrays_plugin():
        return []

    cfunc = ida_hexrays.decompile(func_ea)
    if not cfunc:
        return []

    visitor = CallTargetVisitor()
    visitor.apply_to(cfunc.body, None)
    return visitor.invoked_functions

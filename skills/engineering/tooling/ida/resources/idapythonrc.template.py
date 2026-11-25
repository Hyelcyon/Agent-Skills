import ida_auto
import ida_funcs
import ida_ida


def init_analysis_environment():
    ida_auto.auto_wait()
    return {
        "status": "ready",
        "min_ea": ida_ida.inf_get_min_ea(),
        "total_functions": ida_funcs.get_func_qty()
    }

init_analysis_environment()

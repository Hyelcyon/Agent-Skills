import time
from concurrent import futures
from typing import Any, Callable, Iterator

import grpc

class ServerAuthInterceptor(grpc.ServerInterceptor):
    def __init__(self, required_token: str = "Bearer production-secret-key"):
        self._token = required_token

    def intercept_service(self, continuation: Callable[[grpc.HandlerCallDetails], Any],
                          handler_call_details: grpc.HandlerCallDetails) -> Any:
        metadata = dict(handler_call_details.invocation_metadata)
        auth_header = metadata.get("authorization", "")

        if auth_header != self._token:
            def abort_call(request: Any, context: grpc.ServicerContext) -> Any:
                context.abort(grpc.StatusCode.UNAUTHENTICATED, "Invalid or missing authorization token")
            return grpc.unary_unary_rpc_method_handler(abort_call)

        return continuation(handler_call_details)

class MockOrderServicer:
    def CreateOrder(self, request: Any, context: grpc.ServicerContext) -> Any:
        if not request.customer_id:
            context.abort(grpc.StatusCode.INVALID_ARGUMENT, "customer_id is required")

        return {
            "order_id": "ord-2026-xyz",
            "customer_id": request.customer_id,
            "status": 1,
            "total_amount_cents": 4500
        }

    def StreamOrders(self, request: Any, context: grpc.ServicerContext) -> Iterator[Any]:
        for i in range(5):
            if not context.is_active():
                break
            time.sleep(0.05)
            yield {
                "order_id": f"ord-stream-{i}",
                "customer_id": request.customer_id,
                "status": 3,
                "total_amount_cents": 1200 * (i + 1)
            }

def serve(port: int = 50051) -> grpc.Server:
    server = grpc.server(
        futures.ThreadPoolExecutor(max_workers=16),
        interceptors=[ServerAuthInterceptor()]
    )
    server.add_insecure_port(f"0.0.0.0:{port}")
    server.start()
    return server

if __name__ == "__main__":
    s = serve()
    print("gRPC order server running on port 50051")
    s.wait_for_termination()

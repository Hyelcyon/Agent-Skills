import hmac
import os
import time
from collections.abc import Callable, Iterator
from concurrent import futures
from types import SimpleNamespace
from typing import Any

import grpc


class ServerAuthInterceptor(grpc.ServerInterceptor):
    def __init__(self, required_token: str):
        if not required_token:
            raise ValueError("required_token must be a non-empty secret value")
        self._token = required_token

    def intercept_service(
        self,
        continuation: Callable[[grpc.HandlerCallDetails], Any],
        handler_call_details: grpc.HandlerCallDetails,
    ) -> Any:
        metadata = dict(handler_call_details.invocation_metadata)
        auth_header = metadata.get("authorization", "")

        if not hmac.compare_digest(auth_header.encode("utf-8"), self._token.encode("utf-8")):
            def abort_call(request: Any, context: grpc.ServicerContext) -> Any:
                context.abort(grpc.StatusCode.UNAUTHENTICATED, "Invalid or missing authorization token")

            return grpc.unary_unary_rpc_method_handler(abort_call)

        return continuation(handler_call_details)


class OrderServicer:
    """Example servicer delegating protobuf response construction to an injected message factory."""

    def __init__(self, response_factory: Callable[..., Any] = SimpleNamespace):
        self._response_factory = response_factory

    def CreateOrder(self, request: Any, context: grpc.ServicerContext) -> Any:
        if not getattr(request, "customer_id", None):
            context.abort(grpc.StatusCode.INVALID_ARGUMENT, "customer_id is required")

        return self._response_factory(
            order_id="ord-2026-xyz",
            customer_id=request.customer_id,
            status=1,
            total_amount_cents=4500,
        )

    def StreamOrders(self, request: Any, context: grpc.ServicerContext) -> Iterator[Any]:
        for i in range(5):
            if not context.is_active():
                break
            time.sleep(0.05)
            yield self._response_factory(
                order_id=f"ord-stream-{i}",
                customer_id=request.customer_id,
                status=3,
                total_amount_cents=1200 * (i + 1),
            )


def serve(required_token: str, host: str = "127.0.0.1", port: int = 50051) -> grpc.Server:
    server = grpc.server(
        futures.ThreadPoolExecutor(max_workers=16),
        interceptors=[ServerAuthInterceptor(required_token=required_token)],
    )
    server.add_insecure_port(f"{host}:{port}")
    server.start()
    return server


if __name__ == "__main__":
    token = os.environ["GRPC_AUTH_TOKEN"]
    bind_host = os.environ.get("GRPC_BIND_HOST", "127.0.0.1")
    srv = serve(required_token=token, host=bind_host)
    try:
        srv.wait_for_termination()
    except KeyboardInterrupt:
        srv.stop(grace=5.0)

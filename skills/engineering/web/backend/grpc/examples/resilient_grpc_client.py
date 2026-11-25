import random
import time
from collections.abc import Callable
from types import TracebackType
from typing import Any, Self

import grpc


class ResilientGrpcClient:
    def __init__(self, target: str, auth_token: str):
        if not auth_token:
            raise ValueError("auth_token must not be empty")
        self.target = target
        self.auth_token = auth_token
        self.channel: grpc.Channel | None = None

    def __enter__(self) -> Self:
        self.connect()
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc_val: BaseException | None,
        exc_tb: TracebackType | None,
    ) -> None:
        self.close()

    def connect(self) -> None:
        options = [
            ("grpc.keepalive_time_ms", 30000),
            ("grpc.keepalive_timeout_ms", 10000),
            ("grpc.keepalive_permit_without_calls", True),
            ("grpc.http2.max_pings_without_data", 0),
        ]
        self.channel = grpc.insecure_channel(self.target, options=options)

    def execute_with_retry(
        self,
        call_fn: Callable[..., Any],
        request: Any,
        *,
        is_idempotent: bool = False,
        timeout_sec: float = 3.0,
        max_attempts: int = 3,
        base_delay_sec: float = 0.1,
        max_delay_sec: float = 2.0,
    ) -> Any:
        if max_attempts < 1:
            raise ValueError("max_attempts must be >= 1")
        if self.channel is None:
            self.connect()

        metadata = (("authorization", self.auth_token),)
        attempts = max_attempts if is_idempotent else 1

        for attempt in range(attempts):
            try:
                return call_fn(request, timeout=timeout_sec, metadata=metadata)
            except grpc.RpcError as rpc_error:
                code = rpc_error.code()
                retryable = code in (grpc.StatusCode.UNAVAILABLE, grpc.StatusCode.RESOURCE_EXHAUSTED)
                if not retryable or attempt == attempts - 1:
                    raise
                backoff = min(max_delay_sec, base_delay_sec * (2**attempt))
                time.sleep(random.uniform(0.0, backoff))

        raise RuntimeError("Unreachable retry termination")

    def close(self) -> None:
        if self.channel is not None:
            self.channel.close()
            self.channel = None

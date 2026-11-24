import time
from typing import Any, Dict, Optional

import grpc

class ResilientGrpcClient:
    def __init__(self, target: str, auth_token: str = "Bearer production-secret-key"):
        self.target = target
        self.auth_token = auth_token
        self.channel: Optional[grpc.Channel] = None

    def connect(self) -> None:
        options = [
            ("grpc.keepalive_time_ms", 30000),
            ("grpc.keepalive_timeout_ms", 10000),
            ("grpc.keepalive_permit_without_calls", True),
            ("grpc.http2.max_pings_without_data", 0),
        ]
        self.channel = grpc.insecure_channel(self.target, options=options)

    def execute_with_retry(self, call_fn: Any, request: Any, timeout_sec: float = 3.0, max_retries: int = 3) -> Any:
        if self.channel is None:
            self.connect()

        metadata = (("authorization", self.auth_token),)
        delay = 0.1

        for attempt in range(max_retries):
            try:
                return call_fn(request, timeout=timeout_sec, metadata=metadata)
            except grpc.RpcError as rpc_error:
                code = rpc_error.code()
                if code in (grpc.StatusCode.UNAVAILABLE, grpc.StatusCode.RESOURCE_EXHAUSTED):
                    if attempt == max_retries - 1:
                        raise
                    time.sleep(delay)
                    delay *= 2.0
                else:
                    raise

    def close(self) -> None:
        if self.channel is not None:
            self.channel.close()
            self.channel = None

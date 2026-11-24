import time
import uuid
from typing import Any, Tuple

class SlidingWindowRateLimiter:
    def __init__(self, redis_client: Any, max_requests: int, window_seconds: int):
        self.client = redis_client
        self.max_requests = max_requests
        self.window_seconds = window_seconds

    def is_allowed(self, client_id: str) -> Tuple[bool, int]:
        key = f"ratelimit:{client_id}"
        now_ms = int(time.time() * 1000)
        window_start_ms = now_ms - (self.window_seconds * 1000)
        member_id = f"{now_ms}-{uuid.uuid4().hex[:8]}"

        pipe = self.client.pipeline(transaction=True)
        pipe.zremrangebyscore(key, 0, window_start_ms)
        pipe.zadd(key, {member_id: now_ms})
        pipe.zcard(key)
        pipe.expire(key, self.window_seconds + 1)

        results = pipe.execute()
        current_count = results[2]

        if current_count <= self.max_requests:
            remaining = self.max_requests - current_count
            return True, remaining
        else:
            self.client.zrem(key, member_id)
            return False, 0

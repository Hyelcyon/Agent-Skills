import time
import uuid
from typing import Any

# Atomic Lua check-and-add prevents rejected requests from briefly consuming quota or leaking ZSET members
SLIDING_WINDOW_LUA = """
local key = KEYS[1]
local now_ms = tonumber(ARGV[1])
local window_start_ms = tonumber(ARGV[2])
local max_requests = tonumber(ARGV[3])
local ttl_ms = tonumber(ARGV[4])
local member_id = ARGV[5]

redis.call("ZREMRANGEBYSCORE", key, "-inf", window_start_ms)
local current_count = redis.call("ZCARD", key)

if current_count < max_requests then
    redis.call("ZADD", key, now_ms, member_id)
    redis.call("PEXPIRE", key, ttl_ms)
    return {1, max_requests - (current_count + 1)}
end

return {0, 0}
"""


class SlidingWindowRateLimiter:
    """Atomic Redis Sorted Set sliding-window rate limiter using Lua evaluation."""

    def __init__(self, redis_client: Any, max_requests: int, window_seconds: int) -> None:
        if max_requests < 1:
            raise ValueError("max_requests must be at least 1")
        if window_seconds < 1:
            raise ValueError("window_seconds must be at least 1")
        self.client = redis_client
        self.max_requests = max_requests
        self.window_seconds = window_seconds

    def is_allowed(self, client_id: str) -> tuple[bool, int]:
        """Return (allowed, remaining_quota) for client_id within the sliding window."""
        if not client_id:
            raise ValueError("client_id must be non-empty")

        key = f"ratelimit:{{{client_id}}}"
        now_ms = int(time.time() * 1000)
        window_ms = self.window_seconds * 1000
        window_start_ms = now_ms - window_ms
        member_id = f"{now_ms}-{uuid.uuid4().hex[:8]}"

        allowed_flag, remaining = self.client.eval(
            SLIDING_WINDOW_LUA,
            1,
            key,
            now_ms,
            window_start_ms,
            self.max_requests,
            window_ms + 1000,
            member_id,
        )
        return bool(allowed_flag), max(0, int(remaining))

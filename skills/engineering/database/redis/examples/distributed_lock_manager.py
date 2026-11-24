import threading
import time
import uuid
from typing import Any, Optional

RELEASE_LOCK_LUA = """
if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
else
    return 0
end
"""

EXTEND_LOCK_LUA = """
if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("pexpire", KEYS[1], ARGV[2])
else
    return 0
end
"""

class DistributedLock:
    def __init__(self, redis_client: Any, key: str, ttl_ms: int = 30000, heartbeat: bool = True):
        self.client = redis_client
        self.key = key
        self.ttl_ms = ttl_ms
        self.token = str(uuid.uuid4())
        self.heartbeat = heartbeat
        self._running = False
        self._thread: Optional[threading.Thread] = None

    def acquire(self, timeout_sec: float = 10.0) -> bool:
        deadline = time.monotonic() + timeout_sec
        while time.monotonic() < deadline:
            acquired = self.client.set(self.key, self.token, nx=True, px=self.ttl_ms)
            if acquired:
                if self.heartbeat:
                    self._start_heartbeat()
                return True
            time.sleep(0.05)
        return False

    def release(self) -> bool:
        self._stop_heartbeat()
        try:
            result = self.client.eval(RELEASE_LOCK_LUA, 1, self.key, self.token)
            return bool(result)
        except Exception:
            return False

    def _start_heartbeat(self) -> None:
        self._running = True
        interval = (self.ttl_ms / 1000.0) / 3.0

        def _extend():
            while self._running:
                time.sleep(interval)
                if not self._running:
                    break
                try:
                    self.client.eval(EXTEND_LOCK_LUA, 1, self.key, self.token, self.ttl_ms)
                except Exception:
                    pass

        self._thread = threading.Thread(target=_extend, daemon=True)
        self._thread.start()

    def _stop_heartbeat(self) -> None:
        self._running = False
        if self._thread and self._thread.is_alive():
            self._thread.join(timeout=1.0)

    def __enter__(self):
        if not self.acquire():
            raise TimeoutError(f"Could not acquire distributed lock for key: {self.key}")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.release()

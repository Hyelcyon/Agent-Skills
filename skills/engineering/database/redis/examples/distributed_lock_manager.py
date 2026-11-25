import logging
import threading
import time
import uuid
from types import TracebackType
from typing import Any, Self

logger = logging.getLogger(__name__)

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
    """Non-reentrant Redis distributed mutex with token validation and lease heartbeat.

    Callers running long critical sections must check ``self.lost`` periodically to
    detect heartbeat renewal failures before committing downstream side effects.
    """

    def __init__(
        self,
        redis_client: Any,
        key: str,
        ttl_ms: int = 30000,
        heartbeat: bool = True,
    ) -> None:
        if ttl_ms <= 0:
            raise ValueError("ttl_ms must be positive")
        self.client = redis_client
        self.key = key
        self.ttl_ms = ttl_ms
        self.token = str(uuid.uuid4())
        self.heartbeat = heartbeat
        self.lost = False
        self._stop_event = threading.Event()
        self._thread: threading.Thread | None = None

    def acquire(self, timeout_sec: float = 10.0) -> bool:
        """Attempt atomic NX PX acquisition until timeout_sec elapses."""
        if timeout_sec < 0:
            raise ValueError("timeout_sec must be non-negative")
        deadline = time.monotonic() + timeout_sec
        while True:
            acquired = self.client.set(self.key, self.token, nx=True, px=self.ttl_ms)
            if acquired:
                self.lost = False
                if self.heartbeat:
                    self._start_heartbeat()
                return True
            if time.monotonic() >= deadline:
                return False
            time.sleep(0.05)

    def release(self) -> bool:
        """Stop lease heartbeat and release key only if ownership token still matches."""
        self._stop_heartbeat()
        try:
            result = self.client.eval(RELEASE_LOCK_LUA, 1, self.key, self.token)
            return bool(result)
        except (OSError, TimeoutError, RuntimeError) as err:
            logger.warning("Failed releasing distributed lock for %s: %s", self.key, err)
            return False

    def _start_heartbeat(self) -> None:
        self._stop_event.clear()
        interval = max(0.05, (self.ttl_ms / 1000.0) / 3.0)

        def _extend() -> None:
            # Event.wait wakes immediately on release() instead of hanging until TTL/3
            while not self._stop_event.wait(timeout=interval):
                try:
                    extended = self.client.eval(
                        EXTEND_LOCK_LUA, 1, self.key, self.token, self.ttl_ms
                    )
                    if not extended:
                        self.lost = True
                        logger.error("Lost lock ownership for %s during heartbeat extension", self.key)
                        break
                except (OSError, TimeoutError, RuntimeError) as err:
                    self.lost = True
                    logger.warning("Heartbeat extend failed for %s: %s", self.key, err)
                    break

        self._thread = threading.Thread(target=_extend, daemon=True)
        self._thread.start()

    def _stop_heartbeat(self) -> None:
        self._stop_event.set()
        if self._thread and self._thread.is_alive():
            self._thread.join(timeout=1.0)

    def __enter__(self) -> Self:
        if not self.acquire():
            raise TimeoutError(f"Could not acquire distributed lock for key: {self.key}")
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc_val: BaseException | None,
        exc_tb: TracebackType | None,
    ) -> None:
        self.release()

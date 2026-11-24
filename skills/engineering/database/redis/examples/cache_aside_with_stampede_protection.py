import json
import math
import random
import time
from typing import Any, Callable, Dict, Optional

class CacheAsideXFetch:
    def __init__(self, redis_client: Any, default_ttl: int = 300, beta: float = 1.0):
        self.client = redis_client
        self.default_ttl = default_ttl
        self.beta = beta

    def get_or_set(self, key: str, compute_fn: Callable[[], Any], ttl: Optional[int] = None) -> Any:
        active_ttl = ttl if ttl is not None else self.default_ttl
        raw = self.client.get(key)

        if raw is not None:
            try:
                cached_envelope = json.loads(raw)
                val = cached_envelope["val"]
                expiry_ts = cached_envelope["expiry"]
                delta_sec = cached_envelope["delta"]

                remaining_sec = expiry_ts - time.time()
                rand_val = max(random.random(), 1e-9)

                # Probabilistic early recomputation (XFetch)
                if -delta_sec * self.beta * math.log(rand_val) > remaining_sec:
                    self._recompute_and_save(key, compute_fn, active_ttl)

                return val
            except (KeyError, json.JSONDecodeError):
                pass

        return self._recompute_and_save(key, compute_fn, active_ttl)

    def _recompute_and_save(self, key: str, compute_fn: Callable[[], Any], ttl: int) -> Any:
        start = time.monotonic()
        val = compute_fn()
        delta_sec = time.monotonic() - start

        envelope = {
            "val": val,
            "expiry": time.time() + ttl,
            "delta": max(delta_sec, 0.001)
        }
        jitter = int(ttl * 0.1 * (random.random() * 2 - 1))
        self.client.set(key, json.dumps(envelope), ex=ttl + jitter)
        return val

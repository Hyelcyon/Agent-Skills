import json
import logging
import math
import random
import time
from collections.abc import Callable
from typing import Any

logger = logging.getLogger(__name__)


class CacheAsideXFetch:
    """Cache-aside reader implementing probabilistic early expiration (XFetch)."""

    def __init__(self, redis_client: Any, default_ttl: int = 300, beta: float = 1.0) -> None:
        if default_ttl < 1:
            raise ValueError("default_ttl must be at least 1 second")
        if beta <= 0:
            raise ValueError("beta must be positive")
        self.client = redis_client
        self.default_ttl = default_ttl
        self.beta = beta

    def get_or_set(
        self,
        key: str,
        compute_fn: Callable[[], Any],
        ttl: int | None = None,
    ) -> Any:
        """Return cached value or recompute atomically with XFetch early refresh."""
        active_ttl = ttl if ttl is not None else self.default_ttl
        if active_ttl < 1:
            raise ValueError("ttl must be at least 1 second")

        raw = self.client.get(key)
        if raw is not None:
            try:
                cached_envelope = json.loads(raw)
                if not isinstance(cached_envelope, dict):
                    raise TypeError("Cache envelope must be a JSON object")
                val = cached_envelope["val"]
                expiry_ts = float(cached_envelope["expiry"])
                delta_sec = float(cached_envelope["delta"])

                remaining_sec = expiry_ts - time.time()
                # Clamp away from 0 so math.log never raises ValueError
                rand_val = max(random.random(), 1e-9)

                if -delta_sec * self.beta * math.log(rand_val) > remaining_sec:
                    return self._recompute_and_save(key, compute_fn, active_ttl)

                return val
            except (KeyError, TypeError, ValueError) as err:
                logger.warning("Ignoring invalid cache envelope for %s: %s", key, err)

        return self._recompute_and_save(key, compute_fn, active_ttl)

    def _recompute_and_save(self, key: str, compute_fn: Callable[[], Any], ttl: int) -> Any:
        start = time.monotonic()
        val = compute_fn()
        delta_sec = time.monotonic() - start

        jitter = int(ttl * 0.1 * (random.random() * 2 - 1))
        effective_ttl = max(1, ttl + jitter)
        envelope = {
            "val": val,
            "expiry": time.time() + effective_ttl,
            "delta": max(delta_sec, 0.001),
        }
        self.client.set(key, json.dumps(envelope), ex=effective_ttl)
        return val

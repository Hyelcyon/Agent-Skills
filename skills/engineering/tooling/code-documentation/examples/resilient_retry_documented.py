import random
import time
from collections.abc import Callable
from typing import TypeVar

T = TypeVar("T")


def execute_with_jittered_retry(
    operation: Callable[[], T],
    max_attempts: int = 5,
    base_backoff_seconds: float = 0.5,
    max_backoff_seconds: float = 10.0,
    retryable_exceptions: tuple[type[Exception], ...] = (OSError, TimeoutError),
) -> T:
    """Execute a callable with exponential backoff and randomized full jitter.

    Full jitter spreads retry wakeups uniformly across ``[0, ceiling]`` to prevent
    synchronized thundering-herd spikes against recovering downstream services.

    Args:
        operation: Zero-argument callable representing a transient I/O operation.
        max_attempts: Total execution budget (>= 1) before re-raising the final failure.
        base_backoff_seconds: Base delay in seconds (> 0) scaled by ``2^(attempt - 1)``.
        max_backoff_seconds: Upper ceiling in seconds clamping exponential growth.
        retryable_exceptions: Exception classes eligible for retry; non-matching errors fail fast.

    Returns:
        The return value produced by the first succeeding invocation of ``operation``.

    Raises:
        ValueError: If ``max_attempts < 1``, ``base_backoff_seconds <= 0``, or ``max_backoff_seconds < base_backoff_seconds``.
        Exception: Re-raises the final caught ``retryable_exceptions`` instance once attempts are exhausted.
    """
    if max_attempts < 1:
        raise ValueError("max_attempts must be at least 1")
    if base_backoff_seconds <= 0:
        raise ValueError("base_backoff_seconds must be positive")
    if max_backoff_seconds < base_backoff_seconds:
        raise ValueError("max_backoff_seconds must be >= base_backoff_seconds")

    last_exception: Exception | None = None

    for attempt in range(1, max_attempts + 1):
        try:
            return operation()
        except retryable_exceptions as err:
            last_exception = err
            if attempt == max_attempts:
                break

            exponential_ceiling = min(
                max_backoff_seconds,
                base_backoff_seconds * (2 ** (attempt - 1)),
            )
            # Uniform [0, ceiling] sampling maximizes decorrelation across concurrent callers (AWS full-jitter).
            sleep_duration = random.uniform(0, exponential_ceiling)
            time.sleep(sleep_duration)

    if last_exception is not None:
        raise last_exception
    raise RuntimeError("Retry loop exited unexpectedly without result or exception")

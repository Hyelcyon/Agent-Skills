import random
import time
from typing import Callable, TypeVar

T = TypeVar("T")

def execute_with_jittered_retry(
    operation: Callable[[], T],
    max_attempts: int = 5,
    base_backoff_seconds: float = 0.5,
    max_backoff_seconds: float = 10.0,
) -> T:
    """Executes a callable with exponential backoff and randomized full jitter.

    Decorrelation using full jitter decorrelates concurrent retry attempts across
    worker threads, mitigating thundering-herd spikes against struggling downstream services.

    Args:
        operation: A zero-argument callable representing the network or database operation.
        max_attempts: Maximum number of execution attempts before re-raising the last exception.
        base_backoff_seconds: Initial backoff duration for the first retry.
        max_backoff_seconds: Upper bound cap on exponential backoff delay.

    Returns:
        The successful return value produced by `operation`.

    Raises:
        Exception: The final caught exception if all `max_attempts` fail.
        ValueError: If `max_attempts` is less than 1 or `base_backoff_seconds` is non-positive.
    """
    if max_attempts < 1:
        raise ValueError("max_attempts must be at least 1")
    if base_backoff_seconds <= 0:
        raise ValueError("base_backoff_seconds must be positive")

    last_exception: Exception | None = None

    for attempt in range(1, max_attempts + 1):
        try:
            return operation()
        except Exception as err:
            last_exception = err
            if attempt == max_attempts:
                break

            # Calculate deterministic exponential ceiling: base * 2^(attempt - 1)
            exponential_ceiling = min(
                max_backoff_seconds,
                base_backoff_seconds * (2 ** (attempt - 1))
            )

            # Apply AWS full-jitter formula: sleep = Uniform(0, exponential_ceiling)
            # Uniform random distribution guarantees maximum decorrelation between client spikes.
            sleep_duration = random.uniform(0, exponential_ceiling)
            time.sleep(sleep_duration)

    if last_exception:
        raise last_exception
    raise RuntimeError("Retry loop exited unexpectedly without result or exception")

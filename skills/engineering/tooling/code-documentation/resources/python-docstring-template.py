"""Python interface documentation template adhering to Google Style Docstrings."""

from typing import Protocol


class RateLimiterProtocol(Protocol):
    """Contract for thread-safe distributed sliding-window rate limiters.

    Implementations must synchronize quota state atomically across worker
    processes via a centralized backing store.
    """

    def acquire_token(self, client_identifier: str, requested_cost: int = 1) -> bool:
        """Consume token capacity for a client within its 60-second sliding window.

        Args:
            client_identifier: Non-empty tenant, API token, or IP key scoped to the limiter.
            requested_cost: Strictly positive token count to deduct. Defaults to 1.

        Returns:
            True if sufficient quota existed and was deducted atomically; False when rate-limited.

        Raises:
            ValueError: If `client_identifier` is empty or `requested_cost` is non-positive.
            ConnectionError: If the backing store does not respond within the configured timeout.
        """
        ...

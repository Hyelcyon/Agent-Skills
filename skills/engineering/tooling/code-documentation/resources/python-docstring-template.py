"""Enterprise Python documentation template adhering to Google Style Docstrings."""

from typing import Final, Protocol

class RateLimiterProtocol(Protocol):
    """Defines the public interface for distributed sliding-window rate limiters.

    Implementations must be thread-safe and maintain atomic state synchronization
    across multi-process worker nodes using a centralized storage backend.
    """

    def acquire_token(self, client_identifier: str, requested_cost: int = 1) -> bool:
        """Attempts to consume token capacity for a specific client identity.

        Evaluates the client's consumed quota against the configured burst capacity
        over the preceding 60-second sliding window.

        Args:
            client_identifier: Unique string identifying the tenant, API token, or IP address.
            requested_cost: Number of tokens requested for this specific operation. Defaults to 1.

        Returns:
            True if sufficient quota was available and the tokens were deducted atomically;
            False if the request exceeds available burst capacity.

        Raises:
            ValueError: If `client_identifier` is empty or `requested_cost` is non-positive.
            ConnectionError: If the backing synchronization store cannot be reached within timeout.
        """
        ...

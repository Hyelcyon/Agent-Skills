interface TokenBucketOptions {
  capacity: number;
  refillRatePerSecond: number;
}

/**
 * Lazy-refill Token Bucket rate limiter for inbound request throttling.
 *
 * @remarks
 * Replenishment is calculated on demand at each {@link tryConsume} call instead of
 * scheduling background interval timers, avoiding timer drift and idle wakeup overhead.
 */
class TokenBucketRateLimiter {
  private readonly capacity: number;
  private readonly refillRatePerSecond: number;
  private currentTokens: number;
  private lastRefillTimestampMs: number;

  /**
   * Initializes the rate limiter at full burst capacity.
   *
   * @param options - Positive `capacity` burst ceiling and sustained `refillRatePerSecond`.
   * @throws {@link RangeError} If `capacity` or `refillRatePerSecond` is not strictly positive.
   */
  constructor(options: TokenBucketOptions) {
    if (
      !Number.isFinite(options.capacity) ||
      options.capacity <= 0 ||
      !Number.isFinite(options.refillRatePerSecond) ||
      options.refillRatePerSecond <= 0
    ) {
      throw new RangeError('Bucket capacity and refill rate must be finite positive numbers');
    }

    this.capacity = options.capacity;
    this.refillRatePerSecond = options.refillRatePerSecond;
    this.currentTokens = options.capacity;
    this.lastRefillTimestampMs = performance.now();
  }

  /**
   * Attempts to atomically consume `requestedTokens` from the current bucket balance.
   *
   * @param requestedTokens - Finite positive token count to deduct; defaults to `1`.
   * @returns `true` if sufficient tokens were available and deducted; otherwise `false`.
   * @throws {@link RangeError} If `requestedTokens` is non-finite or less than or equal to zero.
   */
  tryConsume(requestedTokens: number = 1): boolean {
    if (!Number.isFinite(requestedTokens) || requestedTokens <= 0) {
      throw new RangeError('requestedTokens must be a finite positive number');
    }

    const now = performance.now();

    // Clamp to zero to guard against non-monotonic timer anomalies in virtualized or mocked clocks.
    const elapsedSeconds = Math.max(0, (now - this.lastRefillTimestampMs) / 1000);
    this.lastRefillTimestampMs = now;

    this.currentTokens = Math.min(
      this.capacity,
      this.currentTokens + elapsedSeconds * this.refillRatePerSecond
    );

    if (this.currentTokens >= requestedTokens) {
      this.currentTokens -= requestedTokens;
      return true;
    }

    return false;
  }
}

export { TokenBucketRateLimiter };
export type { TokenBucketOptions };

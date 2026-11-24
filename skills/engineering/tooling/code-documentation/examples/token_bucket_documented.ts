interface TokenBucketOptions {
  capacity: number;
  refillRatePerSecond: number;
}

/**
 * High-precision Token Bucket rate limiter for regulating inbound API requests.
 *
 * @remarks
 * This implementation computes token replenishment lazily on each consumption call
 * rather than maintaining an active interval timer, eliminating background thread overhead.
 * Clock skew is handled by clamping elapsed time deltas to zero if system time shifts backward.
 */
class TokenBucketRateLimiter {
  private readonly capacity: number;
  private readonly refillRatePerSecond: number;
  private currentTokens: number;
  private lastRefillTimestampMs: number;

  /**
   * Initializes the rate limiter with full burst capacity.
   *
   * @param options - Configuration defining maximum burst tokens and sustained refill rate.
   *
   * @throws {@link RangeError}
   * Thrown if `capacity` or `refillRatePerSecond` is non-positive.
   */
  constructor(options: TokenBucketOptions) {
    if (options.capacity <= 0 || options.refillRatePerSecond <= 0) {
      throw new RangeError('Bucket capacity and refill rate must be strictly positive');
    }

    this.capacity = options.capacity;
    this.refillRatePerSecond = options.refillRatePerSecond;
    this.currentTokens = options.capacity;
    this.lastRefillTimestampMs = performance.now();
  }

  /**
   * Attempts to consume a specified number of tokens from the bucket.
   *
   * @param requestedTokens - The count of tokens to deduct for the incoming operation.
   * @returns `true` if sufficient tokens existed and were deducted; otherwise `false`.
   */
  tryConsume(requestedTokens: number = 1): boolean {
    const now = performance.now();

    // Guard against monotonicity violations caused by NTP clock synchronizations.
    const elapsedSeconds = Math.max(0, (now - this.lastRefillTimestampMs) / 1000);
    this.lastRefillTimestampMs = now;

    // Fractional tokens accumulate smoothly without requiring millisecond timer ticks.
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

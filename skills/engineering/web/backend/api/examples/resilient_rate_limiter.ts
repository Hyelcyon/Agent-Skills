export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
  retryAfterSeconds: number;
}

/**
 * Atomic Redis sorted-set sliding window check for multi-instance deployments.
 * Uses unique per-request members (`${nowMs}:${requestId}`) to prevent same-millisecond overwrites.
 */
export const SLIDING_WINDOW_REDIS_LUA = `
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window_ms = tonumber(ARGV[2])
local max_requests = tonumber(ARGV[3])
local member = ARGV[4]

redis.call('ZREMRANGEBYSCORE', key, '-inf', now - window_ms)
local count = redis.call('ZCARD', key)
if count >= max_requests then
  local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
  local oldest_score = tonumber(oldest[2]) or now
  local retry_ms = math.max(1, oldest_score + window_ms - now)
  return {0, 0, math.ceil(retry_ms / 1000)}
end

redis.call('ZADD', key, now, member)
redis.call('PEXPIRE', key, window_ms)
local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
local oldest_score = tonumber(oldest[2]) or now
local reset_ms = math.max(1, oldest_score + window_ms - now)
return {1, max_requests - (count + 1), math.ceil(reset_ms / 1000)}
`.trim();

export class SlidingWindowRateLimiter {
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private readonly maxTrackedClients: number;
  private readonly storage = new Map<string, number[]>();

  constructor(
    windowMs: number = 60_000,
    maxRequests: number = 100,
    maxTrackedClients: number = 50_000
  ) {
    if (!Number.isFinite(windowMs) || windowMs <= 0) {
      throw new RangeError('windowMs must be a positive number');
    }
    if (!Number.isInteger(maxRequests) || maxRequests < 1) {
      throw new RangeError('maxRequests must be an integer >= 1');
    }
    if (!Number.isInteger(maxTrackedClients) || maxTrackedClients < 1) {
      throw new RangeError('maxTrackedClients must be an integer >= 1');
    }
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.maxTrackedClients = maxTrackedClients;
  }

  isAllowed(clientId: string, now: number = Date.now()): RateLimitResult {
    const windowStart = now - this.windowMs;
    this.evictIfNeeded(windowStart);

    const existing = this.storage.get(clientId) ?? [];
    const active = existing.filter((t) => t > windowStart);

    if (active.length >= this.maxRequests) {
      this.storage.set(clientId, active);
      const oldestInWindow = active[0] ?? now;
      const retryAfterSeconds = Math.max(1, Math.ceil((oldestInWindow + this.windowMs - now) / 1000));
      return {
        allowed: false,
        limit: this.maxRequests,
        remaining: 0,
        resetSeconds: retryAfterSeconds,
        retryAfterSeconds
      };
    }

    active.push(now);
    this.storage.set(clientId, active);
    const oldestInWindow = active[0] ?? now;
    const resetSeconds = Math.max(1, Math.ceil((oldestInWindow + this.windowMs - now) / 1000));

    return {
      allowed: true,
      limit: this.maxRequests,
      remaining: this.maxRequests - active.length,
      resetSeconds,
      retryAfterSeconds: 0
    };
  }

  private evictIfNeeded(windowStart: number): void {
    if (this.storage.size < this.maxTrackedClients) {
      return;
    }

    for (const [key, timestamps] of this.storage) {
      const latest = timestamps[timestamps.length - 1] ?? 0;
      if (latest <= windowStart) {
        this.storage.delete(key);
      }
    }

    while (this.storage.size >= this.maxTrackedClients) {
      const oldestKey = this.storage.keys().next().value;
      if (oldestKey === undefined) break;
      this.storage.delete(oldestKey);
    }
  }
}

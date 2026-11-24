export type RateLimiter = {
    consume: (self: RateLimiter, playerId: number) -> boolean
}

local RateLimiterImpl = {}
RateLimiterImpl.__index = RateLimiterImpl

function RateLimiterImpl.new(maxTokens: number, refillRatePerSec: number): RateLimiter
    local self = setmetatable({
        _maxTokens = maxTokens,
        _refillRate = refillRatePerSec,
        _buckets = {} :: { [number]: { tokens: number, lastUpdate: number } }
    }, RateLimiterImpl)
    return (self :: any) :: RateLimiter
end

function RateLimiterImpl.consume(self: any, playerId: number): boolean
    local now = os.clock()
    local bucket = self._buckets[playerId]

    if not bucket then
        bucket = { tokens = self._maxTokens, lastUpdate = now }
        self._buckets[playerId] = bucket
    else
        local elapsed = now - bucket.lastUpdate
        bucket.tokens = math.min(self._maxTokens, bucket.tokens + elapsed * self._refillRate)
        bucket.lastUpdate = now
    end

    if bucket.tokens >= 1 then
        bucket.tokens -= 1
        return true
    end

    return false
end

return {
    new = RateLimiterImpl.new
}

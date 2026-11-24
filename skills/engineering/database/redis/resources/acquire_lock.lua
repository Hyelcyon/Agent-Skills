-- Reentrant / Conditional Lock Acquisition
-- KEYS[1]: Lock key name
-- ARGV[1]: Unique owner token
-- ARGV[2]: Lock expiration in milliseconds

local lock_key = KEYS[1]
local owner_token = ARGV[1]
local expire_ms = tonumber(ARGV[2])

local current_owner = redis.call("get", lock_key)

if current_owner == false then
    -- Lock does not exist; acquire it
    redis.call("set", lock_key, owner_token, "PX", expire_ms)
    return 1
elseif current_owner == owner_token then
    -- Reentrant acquisition by same owner; extend lease
    redis.call("pexpire", lock_key, expire_ms)
    return 1
else
    -- Held by another owner
    return 0
end

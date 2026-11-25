-- Idempotent / Lease-Extending Lock Acquisition (NOT reference-counted reentrant)
-- release_lock.lua deletes the key on first release; do not nest release() across call frames
-- KEYS[1]: Lock key name
-- ARGV[1]: Unique owner token
-- ARGV[2]: Lock expiration in milliseconds (> 0)

local lock_key = KEYS[1]
local owner_token = ARGV[1]
local expire_ms = tonumber(ARGV[2])

if not expire_ms or expire_ms <= 0 then
    return redis.error_reply("ERR invalid expire_ms")
end

local current_owner = redis.call("get", lock_key)

if current_owner == false then
    redis.call("set", lock_key, owner_token, "PX", expire_ms)
    return 1
elseif current_owner == owner_token then
    redis.call("pexpire", lock_key, expire_ms)
    return 1
else
    return 0
end

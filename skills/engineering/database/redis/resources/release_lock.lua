-- Safe Atomic Lock Release
-- KEYS[1]: Lock key name
-- ARGV[1]: Unique owner token expected

if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
else
    return 0
end

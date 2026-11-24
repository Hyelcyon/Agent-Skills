# Luau Actor Multithreading, SharedTable, and Secure Networking

Architectural standards for parallel task execution, shared cross-actor memory buffers, and secure client-server networking in enterprise Luau.

## 1. Parallel Luau Architecture with Actors

Luau allows parallel execution across multiple CPU cores using the Actor model. Each Actor instance runs in an isolated state thread, preventing race conditions.

### Thread Synchronization Lifecycle

To perform heavy computations off the main thread, transition the task into parallel execution using `task.desynchronize()`, then return to serial execution using `task.synchronize()` before modifying game scene hierarchies.

```lua
--!strict
local function calculateParallelSimulation(particles: { Vector3 }): { Vector3 }
    task.desynchronize()

    local updated = table.create(#particles)
    for index, pos in ipairs(particles) do
        local velocity = Vector3.new(0, -9.8, 0) * 0.016
        updated[index] = pos + velocity
    end

    task.synchronize()
    return updated
end
```

State mutations to scene instances or firing external network events while desynchronized throw runtime safety errors.

---

## 2. Shared Memory Buffers with SharedTable

Passing standard tables between Actors clones the table data, causing memory allocation overhead. Use `SharedTable` to share memory references across Actor boundaries without duplication:

```lua
--!strict
local function populateSharedRegistry(registry: SharedTable, workerId: string, count: number): ()
    SharedTable.increment(registry, "total_tasks", count)
    registry[workerId] = os.clock()
end

local function readWorkerHeartbeat(registry: SharedTable, workerId: string): number?
    return registry[workerId]
end
```

Atomic methods such as `SharedTable.increment` update scalar counters safely across concurrent threads without explicit locks.

---

## 3. Secure Network Remotes Architecture

All client-to-server network calls (`RemoteEvent` and `RemoteFunction`) are untrusted. Never accept client-supplied identifiers or currency values without server-side validation.

### Strict Remote Validation Pattern

```lua
--!strict
export type PurchaseRequest = {|
    itemId: string,
    quantity: number,
|}

local function isValidPurchase(request: unknown): (boolean, PurchaseRequest?)
    if type(request) ~= "table" then
        return false, nil
    end

    local candidate = request :: { [string]: unknown }
    if type(candidate.itemId) ~= "string" or #candidate.itemId > 64 then
        return false, nil
    end

    if type(candidate.quantity) ~= "number" or candidate.quantity <= 0 or candidate.quantity > 99 then
        return false, nil
    end

    if candidate.quantity ~= math.floor(candidate.quantity) then
        return false, nil
    end

    return true, {
        itemId = candidate.itemId,
        quantity = candidate.quantity,
    }
end
```

Always verify integer boundaries and length constraints. Unchecked float values can bypass ceiling checks and cause integer overflow vulnerabilities.

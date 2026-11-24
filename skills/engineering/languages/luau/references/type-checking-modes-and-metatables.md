# Luau Type Checking Modes, Metatables, and Soundness Architecture

Guidelines for strict mode type inference, nominal typing, metatable OOP patterns, and algebraic type narrowing in modern enterprise Luau.

## 1. Type Checking Modes

Luau provides three file-level modes:
1. `nocheck`: Dynamic execution without static verification.
2. `nonstrict`: Soft type verification where untyped variables default to `any`.
3. `strict`: Full bidirectional inference and exhaustiveness checking.

Production services and shared packages must always enable strict mode at the first line of the module.

```lua
--!strict
local Service = {}
Service.__index = Service

export type ServiceInstance = typeof(setmetatable({} :: {
    name: string,
    active: boolean,
}, Service))

function Service.new(name: string): ServiceInstance
    local self = setmetatable({
        name = name,
        active = true,
    }, Service)
    return self
end

function Service.deactivate(self: ServiceInstance): ()
    self.active = false
end

return Service
```

Using `typeof(setmetatable(...))` binds the metatable prototype methods to the type instance, ensuring that calling `:deactivate()` is checked statically by the compiler.

---

## 2. Table Shapes: Exact vs Open Tables

Luau distinguishes between open and exact table types:

### Open Tables (`{ [string]: any }`)

Allow additional fields, which can lead to accidental typos being treated as valid dynamic property assignments.

### Exact Tables (`{| key: Type |}`)

Enforce strict property boundaries. Assigning an undeclared property produces a compile-time error.

```lua
--!strict
export type UserProfile = {|
    id: number,
    displayName: string,
    roles: { string },
|}

local function formatUser(profile: UserProfile): string
    return profile.displayName .. " (ID: " .. tostring(profile.id) .. ")"
end
```

---

## 3. Discriminated Unions and Type Refinement

Luau supports algebraic data types through tagged union tables, narrowing types when inspecting discriminator fields.

```lua
--!strict
export type RequestIdle = {|
    status: "idle",
|}

export type RequestSuccess = {|
    status: "success",
    payload: string,
|}

export type RequestFailure = {|
    status: "failure",
    errorMessage: string,
|}

export type RequestState = RequestIdle | RequestSuccess | RequestFailure

local function inspectState(state: RequestState): string
    if state.status == "idle" then
        return "Waiting"
    elseif state.status == "success" then
        return "Received: " .. state.payload
    else
        return "Error: " .. state.errorMessage
    end
end
```

Inspecting `state.status == "success"` refines `state` to `RequestSuccess`, granting safe access to `state.payload`.

---

## 4. Metamethod Typing and Operators

When implementing custom mathematical structures or data buffers, define metamethods with explicit signatures:

```lua
--!strict
local Vector2D = {}
Vector2D.__index = Vector2D

export type Vector2D = typeof(setmetatable({} :: {
    x: number,
    y: number,
}, Vector2D))

function Vector2D.new(x: number, y: number): Vector2D
    return setmetatable({ x = x, y = y }, Vector2D)
end

function Vector2D.__add(a: Vector2D, b: Vector2D): Vector2D
    return Vector2D.new(a.x + b.x, a.y + b.y)
end

function Vector2D.__eq(a: Vector2D, b: Vector2D): boolean
    return a.x == b.x and a.y == b.y
end

return Vector2D
```

Declaring `__add` and `__eq` in the metatable table allows Luau to verify vector arithmetic operators statically.

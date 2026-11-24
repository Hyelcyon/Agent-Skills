# Luau Enterprise Tooling & Anti-Spaghetti Architecture

Detailed reference for Rojo synchronization, Wally package management, Selene linter rules, and decoupled Service-Controller architecture.

---

## 1. Toolchain Setup (`rokit.toml` / `default.project.json`)

```json
{
  "name": "roblox-production",
  "tree": {
    "$className": "DataModel",
    "ReplicatedStorage": {
      "Shared": {
        "$path": "src/shared"
      },
      "Packages": {
        "$path": "Packages"
      }
    },
    "ServerScriptService": {
      "Server": {
        "$path": "src/server"
      }
    },
    "StarterPlayer": {
      "StarterPlayerScripts": {
        "Client": {
          "$path": "src/client"
        }
      }
    }
  }
}
```

---

## 2. Selene Linter Configuration (`selene.toml`)

Catch variable shadowing, global leaks, and cyclomatic complexity early:

```toml
std = "roblox"

[rules]
shadowing = "error"
unused_variable = "error"
empty_if = "error"
global_usage = "error"
multiple_statements = "error"
```

---

## 3. Decoupled Service-Controller Architecture (No Spatial Coupling)

Never write `script.Parent.Parent.Parent`. Use explicit dependency injection:

```lua
--!strict

local PlayerDataService = {}
PlayerDataService.__index = PlayerDataService

type PlayerRecord = {
    UserId: number,
    Coins: number,
}

local sessions: { [number]: PlayerRecord } = {}

function PlayerDataService.Load(userId: number): PlayerRecord
    local record = {
        UserId = userId,
        Coins = 100,
    }
    sessions[userId] = record
    return record
end

function PlayerDataService.GetCoins(userId: number): number
    local record = sessions[userId]
    if record == nil then
        return 0
    end
    return record.Coins
end

return PlayerDataService
```

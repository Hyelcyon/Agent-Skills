--!strict

local EntityService = {}

export type Entity = {
    Id: string,
    Health: number,
    Active: boolean,
}

local registry: { [string]: Entity } = {}

function EntityService.Register(id: string, initialHealth: number): Entity
    local entity: Entity = {
        Id = id,
        Health = initialHealth,
        Active = true,
    }
    registry[id] = entity
    return entity
end

function EntityService.ApplyDamage(id: string, amount: number): boolean
    local entity = registry[id]
    if entity == nil or not entity.Active then
        return false
    end
    entity.Health = math.max(0, entity.Health - amount)
    if entity.Health == 0 then
        entity.Active = false
    end
    return true
end

return EntityService

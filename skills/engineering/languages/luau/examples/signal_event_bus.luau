--!strict

export type Connection = {
    disconnect: () => ()
}

export type Signal<T> = {
    connect: (self: Signal<T>, callback: (value: T) -> ()) -> Connection,
    fire: (self: Signal<T>, value: T) -> ()
}

local SignalImpl = {}
SignalImpl.__index = SignalImpl

function SignalImpl.new<T>(): Signal<T>
    local self = setmetatable({
        _listeners = {} :: { (T) -> () }
    }, SignalImpl)
    return (self :: any) :: Signal<T>
end

function SignalImpl.connect<T>(self: any, callback: (T) -> ()): Connection
    table.insert(self._listeners, callback)
    return {
        disconnect = function()
            local index = table.find(self._listeners, callback)
            if index then
                table.remove(self._listeners, index)
            end
        end
    }
end

function SignalImpl.fire<T>(self: any, value: T): ()
    for _, callback in self._listeners do
        task.spawn(callback, value)
    end
end

return {
    new = SignalImpl.new
}

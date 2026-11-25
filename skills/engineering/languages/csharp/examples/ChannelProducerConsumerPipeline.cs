namespace Enterprise.Core.Concurrency;

using System.Threading.Channels;

public sealed record TelemetryEvent
{
    public required Guid Id { get; init; }
    public required string EventType { get; init; }
    public required DateTime TimestampUtc { get; init; }
    public required byte[] Payload { get; init; }
}

public sealed class ChannelProducerConsumerPipeline
{
    private readonly Channel<TelemetryEvent> _channel;

    public ChannelProducerConsumerPipeline(int capacity = 50_000)
    {
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(capacity);
        var options = new BoundedChannelOptions(capacity)
        {
            FullMode = BoundedChannelFullMode.Wait,
            SingleWriter = false,
            SingleReader = false
        };
        _channel = Channel.CreateBounded<TelemetryEvent>(options);
    }

    public ValueTask EnqueueAsync(TelemetryEvent telemetryEvent, CancellationToken ct)
    {
        ArgumentNullException.ThrowIfNull(telemetryEvent);
        return _channel.Writer.WriteAsync(telemetryEvent, ct);
    }

    public async Task StartConsumerAsync(Func<TelemetryEvent, CancellationToken, Task> handler, CancellationToken ct)
    {
        ArgumentNullException.ThrowIfNull(handler);
        var reader = _channel.Reader;
        while (await reader.WaitToReadAsync(ct))
        {
            while (reader.TryRead(out var item))
            {
                await handler(item, ct);
            }
        }
    }

    public void Complete()
    {
        _channel.Writer.Complete();
    }
}

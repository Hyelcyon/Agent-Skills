# gRPC Streaming Patterns, Flow Control, and Backpressure

This document covers RPC interaction modes (Unary, Server Streaming, Client Streaming, Bidirectional Streaming), HTTP/2 multiplexing, and backpressure management.

---

## 1. The Four RPC Interaction Paradigms

```
1. Unary RPC
Client [Request] -------------> Server
Client <------------- [Response] Server

2. Server Streaming RPC
Client [Request] -------------> Server
Client <------------- [Stream 1] Server
Client <------------- [Stream 2] Server
Client <------------- [Stream N] Server

3. Client Streaming RPC
Client [Stream 1] -------------> Server
Client [Stream 2] -------------> Server
Client [Stream N] -------------> Server
Client <------------- [Response] Server

4. Bidirectional Streaming RPC
Client [Stream A1] ---------> Server
Client <--------- [Stream B1] Server
Client [Stream A2] ---------> Server
Client <--------- [Stream B2] Server
```

### Choosing the Correct Paradigm
- **Unary**: Standard request/response transactions (fetching an entity, processing a payment).
- **Server Streaming**: Large dataset export, real-time event feeds, audit log subscriptions.
- **Client Streaming**: Large file or chunked video upload, batch telemetry ingestion.
- **Bidirectional Streaming**: Chat protocols, collaborative live editing, real-time gaming synchronization.

---

## 2. HTTP/2 Flow Control and Backpressure

gRPC runs exclusively over HTTP/2. Individual RPC calls map to concurrent HTTP/2 streams multiplexed over a single TCP connection.

### The Slow Consumer Problem
If a server streams messages at 10,000 items/sec but the client can only process 100 items/sec:
1. TCP receive window and HTTP/2 stream flow control windows on the client fill up.
2. The client stops acknowledging `WINDOW_UPDATE` frames to the server.
3. The server's outbound HTTP/2 buffer saturates.
4. If the server does not check for stream write blockage, the server's process memory balloons, triggering an OOM kill.

### Server-Side Mitigation
- In Go, `stream.Send()` blocks when the HTTP/2 stream flow-control buffer is full.
- In Python/Node, always check stream writability and monitor context cancellation:
```python
def SubscribeEvents(self, request, context):
    for event in event_generator():
        if not context.is_active():
            # Client disconnected or cancelled stream; abort immediately
            break
        yield event
```

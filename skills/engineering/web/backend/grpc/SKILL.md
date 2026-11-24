---
name: grpc
description: Use when designing, authoring, or optimizing gRPC and Protocol Buffers (proto3) microservices, authoring streaming RPCs (server, client, bidirectional), implementing interceptors for auth and tracing, configuring deadlines and cancellations, or setting up health checks and load balancing.
---

# Enterprise gRPC & Protocol Buffers Standard

This skill establishes the production standard for high-performance binary RPC architectures using gRPC and Protocol Buffers (proto3). It mandates backward-compatible schema evolution, streaming backpressure, explicit deadline propagation, and strict interceptor design.

---

## 1. Senior Craftsmanship Principles

1. **Strict Schema Evolution & Tag Immobility**:
   - In proto3, field tags (numbers) define binary wire identity, NOT field names. Never renumber, alter, or repurpose existing field numbers.
   - When deprecating a field, mark both the tag number and the identifier as `reserved` to prevent future collisions.
   - Enum zero values MUST represent an uninitialized default (`UNKNOWN = 0` or `UNSPECIFIED = 0`) to prevent accidental default assignments.
2. **Mandatory Client Deadlines**:
   - Every outgoing gRPC client call must set an explicit, bounded deadline (`timeout`). Unbounded calls cause thread starvation and cascading pool exhaustion during upstream latency spikes.
3. **Context Cancellation Propagation**:
   - Streaming handlers must continuously check client context cancellation (`context.Done()` or `context.is_active()`). Continuing computation after a client disconnects wastes cluster CPU and memory.
4. **Standardized Rich Error Codes**:
   - Never return raw, unformatted internal exceptions or database error strings. Map failures to canonical gRPC status codes (`codes.InvalidArgument`, `codes.NotFound`, `codes.Unauthenticated`, `codes.Unavailable`).
5. **Cross-Cutting Isolation via Interceptors**:
   - Keep business handlers clean. Encapsulate authentication, authorization, distributed tracing context propagation, and structured logging in client/server interceptors.

---

## 2. Hard Anti-Patterns (Prohibited)

| Anti-Pattern | Operational Risk | Production Remedy |
| :--- | :--- | :--- |
| Changing or reusing field tags in `.proto` | Silent binary deserialization corruption | Mark deleted tags as `reserved 3, 7; reserved "old_field";` |
| Calling gRPC without deadlines | Connection leaks and hanging worker threads | Enforce `timeout` on every client invocation |
| Non-zero enum default as valid business state | Unset fields default to valid enum silently | Set enum tag 0 to `_UNSPECIFIED` (e.g. `STATUS_UNSPECIFIED = 0`) |
| Returning generic `UNKNOWN` or raw stack traces | Information disclosure; caller cannot handle errors | Return canonical gRPC status codes with localized ErrorDetails |
| Creating a new `grpc.Channel` per request | Connection storm, TLS handshake latency spikes | Maintain a single, long-lived multiplexed `grpc.Channel` per target |

---

## 3. The 5-Phase gRPC Operational Protocol

```
+-------------------------------------------------------------+
| Phase 1: Contract & Schema Modeling                         |
| Define proto3 schema, reserved tags & UNSPECIFIED zero enums|
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
| Phase 2: Schema Validation & Code Generation                |
| Execute buf lint, buf breaking change detection & code gen  |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
| Phase 3: Deterministic Service & Interceptor Implementation |
| Author Unary/Stream handlers, Auth and Tracing interceptors |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
| Phase 4: Resilience & Deadline Propagation                  |
| Configure client timeouts, retry policies & health checks   |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
| Phase 5: Verification & Contract Interrogation              |
| Verify with grpcurl reflection & grpc-health-probe          |
+-------------------------------------------------------------+
```

### Phase 1: Contract & Schema Modeling
Structure production `.proto` with package versioning and reserved blocks:
```protobuf
syntax = "proto3";

package payment.v1;

enum PaymentStatus {
  PAYMENT_STATUS_UNSPECIFIED = 0;
  PAYMENT_STATUS_PENDING = 1;
  PAYMENT_STATUS_CAPTURED = 2;
  PAYMENT_STATUS_FAILED = 3;
}

message ProcessPaymentRequest {
  reserved 3, 5;
  reserved "legacy_token", "merchant_tax_id";

  string order_id = 1;
  int64 amount_cents = 2;
  string currency = 4;
}
```

### Phase 2: Schema Validation & Code Generation
Run `buf` to enforce API style consistency and detect breaking changes:
```bash
# Verify style and conventions
buf lint

# Compare against master branch to ensure backward compatibility
buf breaking --against ".git#branch=main"

# Generate target language bindings
buf generate
```

### Phase 3: Deterministic Service & Interceptor Implementation
Attach logging and auth interceptors to the gRPC server:
```python
server = grpc.server(
    futures.ThreadPoolExecutor(max_workers=32),
    interceptors=[AuthInterceptor(), TracingInterceptor()]
)
```

### Phase 4: Resilience & Deadline Propagation
Invoke client with explicit context timeouts:
```python
# Pass 3.0 second deadline
response = stub.ProcessPayment(request, timeout=3.0)
```

### Phase 5: Verification & Contract Interrogation
Query the running server via reflection without local proto files:
```bash
# List exposed services
grpcurl -plaintext localhost:50051 list

# Call health check endpoint
grpcurl -plaintext -d '{"service": "payment.v1.PaymentService"}' localhost:50051 grpc.health.v1.Health/Check
```

---

## 4. Deep References & Production Assets

- [Protobuf Schema Design and Evolution Reference](./references/protobuf-schema-design-and-evolution.md)
- [Streaming Patterns and Backpressure Reference](./references/streaming-patterns-and-backpressure.md)
- [Interceptors, Deadlines, and Health Checks Reference](./references/interceptors-deadlines-and-health.md)
- [Production Proto Schema Template](./resources/service.proto)
- [Buf Linter Configuration Template](./resources/buf.yaml)
- [Buf Generator Configuration Template](./resources/buf.gen.yaml)
- [Production gRPC Server Implementation](./examples/order_service_server.py)
- [Resilient gRPC Client Implementation](./examples/resilient_grpc_client.py)
- [gRPC Health Probe Script](./examples/grpc_health_probe.sh)

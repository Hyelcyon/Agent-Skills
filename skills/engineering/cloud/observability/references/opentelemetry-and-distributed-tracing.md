# OpenTelemetry Architecture, W3C TraceContext, and Distributed Spans

This document details OpenTelemetry (OTel) instrumentation standards, context propagation mechanics, and span lifecycle protocols.

---

## 1. Distributed Tracing & W3C TraceContext

In microservice architectures, an incoming client request traverses multiple services, queues, and databases. Distributed tracing reconstructs this execution path as a directed acyclic graph (DAG) of Spans.

```
Client HTTP Request
      |
      v  [Headers: traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01]
+-------------------------------------------------------------+
| Service A (API Gateway) - Root Span                         |
| Duration: 120ms                                             |
+-------------------------------------------------------------+
      |
      +---> [traceparent propagated via gRPC metadata / HTTP]
      |
      v
+-------------------------------------------------------------+
| Service B (Order Service) - Child Span                      |
| Duration: 95ms                                              |
|   |                                                         |
|   +---> Database Query Span (PostgreSQL: 25ms)              |
|   +---> Cache Lookup Span (Redis: 3ms)                      |
+-------------------------------------------------------------+
```

### The `traceparent` Header Specification
W3C TraceContext uses four hyphen-separated fields:
`version-trace_id-parent_id-trace_flags`
- `version`: `00` (current W3C standard).
- `trace_id`: 16-byte array (32 hex characters) uniquely identifying the entire distributed transaction.
- `parent_id`: 8-byte array (16 hex characters) identifying the immediate caller span.
- `trace_flags`: 8-bit field (e.g., `01` signals that the trace was sampled).

---

## 2. In-Process Span Lifecycle and Exception Handling

Spans must be bounded in duration and safely closed even when unhandled exceptions occur.

```python
from opentelemetry import trace
from opentelemetry.trace import Status, StatusCode

tracer = trace.get_tracer("order-service")

def process_order(order_id: str) -> None:
    with tracer.start_as_current_span("process_order") as span:
        span.set_attribute("order.id", order_id)
        try:
            execute_payment_capture(order_id)
            span.set_status(Status(StatusCode.OK))
        except PaymentDeclinedError as exc:
            span.record_exception(exc)
            span.set_status(Status(StatusCode.ERROR, description=str(exc)))
            span.set_attribute("error.type", "payment_declined")
            raise
```

### Span Attribute Rules
1. **Semantic Conventions**: Follow standard OTel naming conventions (e.g., `http.request.method`, `db.system.name`, `rpc.service`).
2. **Never Put PII in Span Attributes**: Passwords, auth tokens, social security numbers, and full credit card details must NEVER be attached to spans.
3. **Always Set Error Status**: Catching an exception without setting `span.set_status(StatusCode.ERROR)` results in the trace appearing successful in APM search filters.

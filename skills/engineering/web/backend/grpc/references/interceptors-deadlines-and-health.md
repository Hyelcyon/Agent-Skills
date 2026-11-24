# gRPC Interceptors, Deadline Propagation, and Health Checking

This document details client and server interceptors, context deadline propagation across distributed microservices, and the standard gRPC Health Checking Protocol.

---

## 1. Interceptor Pipeline Architecture

Interceptors provide middleware-style interception for cross-cutting concerns without polluting service business logic.

```
Incoming RPC Request
       |
       v
+-----------------------------+
| Auth Interceptor (JWT/mTLS) | ---> Fails: Aborts with codes.Unauthenticated
+-----------------------------+
       |
       v
+-----------------------------+
| Tracing Interceptor (OTel)  | ---> Extracts W3C traceparent from metadata; starts span
+-----------------------------+
       |
       v
+-----------------------------+
| Logging / Metrics Interceptor| ---> Starts timer; records RED metrics
+-----------------------------+
       |
       v
+-----------------------------+
| Actual Service Handler      | ---> Executes business computation
+-----------------------------+
```

---

## 2. Deadline & Timeout Propagation

A deadline is an absolute point in time by which an operation must complete. Unlike relative timeouts, deadlines propagate cleanly across multiple downstream RPC hops.

### The Cascading Timeout Problem
If Service A calls Service B with a 5-second timeout, and Service B calls Service C:
- Service B must NOT use a fresh 5-second timeout.
- Service B must propagate the *remaining* time left on Service A's original deadline.
- When the deadline expires, all intermediate services immediately abort work and free resources.

### Canonical Error Handling
When a deadline expires, gRPC returns `codes.DeadlineExceeded` (HTTP status code mapping: `504 Gateway Timeout`).

---

## 3. The Standard gRPC Health Checking Protocol

Kubernetes and load balancers cannot probe gRPC endpoints with simple HTTP `/healthz` checks unless an HTTP translation gateway is present. gRPC defines the official `grpc.health.v1.Health` standard service:

```protobuf
syntax = "proto3";

package grpc.health.v1;

message HealthCheckRequest {
  string service = 1;
}

message HealthCheckResponse {
  enum ServingStatus {
    UNKNOWN = 0;
    SERVING = 1;
    NOT_SERVING = 2;
    SERVICE_UNKNOWN = 3;
  }
  ServingStatus status = 1;
}

service Health {
  rpc Check(HealthCheckRequest) returns (HealthCheckResponse);
  rpc Watch(HealthCheckRequest) returns (stream HealthCheckResponse);
}
```

Kubernetes probes can target this natively:
```yaml
livenessProbe:
  grpc:
    port: 50051
    service: payment.v1.PaymentService
  initialDelaySeconds: 5
  periodSeconds: 10
```

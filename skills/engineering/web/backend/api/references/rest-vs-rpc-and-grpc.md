# Modern API Protocols: REST vs RPC and ConnectRPC

Engineering standards for selecting and implementing synchronous client-server interfaces.

---

## 1. Protocol Architectural Matrix

| Metric | REST (JSON / HTTP) | ConnectRPC / gRPC (Protobuf / HTTP/2 & HTTP/3) |
| :--- | :--- | :--- |
| **Contract Definition** | OpenAPI 3.1 / JSON Schema | Protocol Buffers (`.proto`) |
| **Serialization Overhead** | Text-based JSON (high payload weight) | Binary Protobuf (up to 10x smaller payload) |
| **Streaming Capabilities** | Server-Sent Events (SSE) / WebSockets | Native bidirectional, client, and server streaming |
| **Browser Compatibility** | Universal (native `fetch`) | Universal via Connect protocol; gRPC-Web fallback |
| **Type Safety** | Generated TypeScript types via OpenAPI | End-to-end generated types from `.proto` source |

---

## 2. When to Select REST vs ConnectRPC

- **Default to REST for**:
  - Public-facing developer APIs where third-party consumers expect standard HTTP methods (`GET`, `POST`, `PUT`, `DELETE`).
  - Webhooks and payment callback endpoints.
  - CRUD resources where browser caching via `ETag` and `Cache-Control` is critical, or where YAGNI favors avoiding `.proto` codegen pipelines.
- **Default to ConnectRPC / gRPC for**:
  - High-throughput internal microservice-to-microservice communication.
  - Real-time full-duplex data feeds (telemetry, live collaborative state).
  - Strongly-typed multi-language backend ecosystems (Go, Rust, Python, Node.js).

---

## 3. ConnectRPC Implementation Standards

When implementing ConnectRPC handlers in TypeScript, throw typed `ConnectError` codes instead of plain `Error` (which maps to `Code.Unknown`):

```typescript
import { Code, ConnectError, type ConnectRouter } from '@connectrpc/connect';
import { UserService } from './gen/user_pb';

export function registerUserRoutes(router: ConnectRouter) {
  router.service(UserService, {
    async getUser(req) {
      if (!req.userId) {
        throw new ConnectError('userId is required', Code.InvalidArgument);
      }
      return {
        id: req.userId,
        name: 'Enterprise Service'
      };
    }
  });
}
```

---

## 4. Anti-Patterns in Protocol Selection
- ❌ Tunneling arbitrary database queries across REST endpoints without schema boundaries.
- ❌ Using raw WebSockets when Server-Sent Events or unary ConnectRPC fulfills the requirement.
- ❌ Manually authoring TypeScript types instead of generating them from Protobuf or OpenAPI schemas.

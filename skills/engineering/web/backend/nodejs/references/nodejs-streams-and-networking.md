# Node.js Streams, Networking, and Graceful Lifecycle

Engineering standards for stream processing, native fetch, WebSockets, and zero-downtime graceful process shutdown.

---

## 1. Web Streams and Node.js Streams Interoperability

Modern Node.js fully supports standard W3C Web Streams (`ReadableStream`, `WritableStream`, `TransformStream`) alongside `node:stream`:

```typescript
import { Readable } from 'node:stream';

export async function processWebStreamToText(webStream: ReadableStream<Uint8Array>): Promise<string> {
  const nodeStream = Readable.fromWeb(webStream as Parameters<typeof Readable.fromWeb>[0]);
  let accumulated = '';
  for await (const chunk of nodeStream) {
    accumulated += chunk.toString('utf8');
  }
  return accumulated;
}
```

---

## 2. Native Global Networking: `fetch` and `WebSocket`

Node.js provides native global networking APIs without external packages:

### Native Global Fetch
```typescript
export async function fetchRemoteResource<T>(url: string, timeoutMs: number = 5000): Promise<T> {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Remote HTTP error: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}
```

### Native Global WebSocket Client
```typescript
export function connectTelemetrySocket(socketUrl: string, onMessage: (data: string) => void): () => void {
  const socket = new WebSocket(socketUrl);

  socket.onmessage = (event) => {
    onMessage(String(event.data));
  };

  return () => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.close();
    }
  };
}
```

---

## 3. Production Graceful Shutdown Standard

Always handle operating system process termination signals (`SIGTERM`, `SIGINT`) to finish inflight requests and close database connections cleanly:

```typescript
import type { Server } from 'node:http';

export function setupGracefulShutdown(server: Server, cleanupCallback: () => Promise<void>): void {
  let isShuttingDown = false;

  const initiateShutdown = (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    server.close(async () => {
      try {
        await cleanupCallback();
        process.exit(0);
      } catch (err) {
        process.exit(1);
      }
    });

    setTimeout(() => {
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGTERM', () => initiateShutdown('SIGTERM'));
  process.on('SIGINT', () => initiateShutdown('SIGINT'));
}
```

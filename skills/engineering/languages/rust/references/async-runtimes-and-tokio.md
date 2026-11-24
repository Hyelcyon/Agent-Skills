# Async Rust and Tokio Runtime Architecture

Architectural patterns for asynchronous concurrent systems in Rust using the Tokio runtime, focusing on cancellation safety, channel semantics, actor patterns, and deterministic graceful shutdown.

## 1. Cancellation Safety in tokio::select!

When `tokio::select!` evaluates multiple futures, the branch that completes first wins. The remaining branches are immediately dropped. A future is considered cancellation-safe if dropping it midway through execution does not corrupt state or drop unprocessed messages.

### Cancellation-Unsafe Pattern: Asynchronous Reads Across Buffers

If an asynchronous read is interrupted by another branch before reading the entire packet, the partially consumed byte buffer is dropped, desynchronizing the network protocol.

### Cancellation-Safe Pattern: Retaining Owned State

```rust
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::TcpStream;

pub async fn process_socket(mut stream: TcpStream, mut stop_rx: tokio::sync::watch::Receiver<bool>) {
    let mut buffer = [0u8; 1024];

    loop {
        tokio::select! {
            _ = stop_rx.changed() => {
                if *stop_rx.borrow() {
                    break;
                }
            }
            res = stream.read(&mut buffer) => {
                match res {
                    Ok(0) => break,
                    Ok(n) => {
                        if stream.write_all(&buffer[..n]).await.is_err() {
                            break;
                        }
                    }
                    Err(_) => break,
                }
            }
        }
    }
}
```

Reading into a local persistent buffer inside the loop preserves bytes between loop iterations without state loss.

---

## 2. Choosing Tokio Synchronization Channels

Selecting the correct channel primitive prevents throughput collapse and memory leaks:

1. **`tokio::sync::mpsc` (Multi-Producer, Single-Consumer)**:
   - Always prefer bounded channels (`mpsc::channel(buffer_size)`).
   - Unbounded channels (`mpsc::unbounded_channel()`) create unbounded memory buffers under traffic spikes.
2. **`tokio::sync::broadcast` (Multi-Producer, Multi-Consumer)**:
   - Broadcasts every message to every receiver.
   - Slower receivers encounter `RecvError::Lagged`, dropping older messages.
3. **`tokio::sync::watch` (Single-Producer, Multi-Consumer Latest State)**:
   - Stores only the single latest value.
   - Ideal for configuration updates, heartbeat state, and shutdown signals.
4. **`tokio::sync::oneshot`**:
   - Single message handover, commonly used for request-response pairing in actor loops.

---

## 3. The Actor Pattern in Tokio

In Rust, avoid sharing mutex-protected structures (`Arc<Mutex<State>>`) across threads when data flows sequentially. Instead, encapsulate state inside a dedicated task that listens on an `mpsc` channel.

```rust
use tokio::sync::{mpsc, oneshot};

pub enum Command {
    Increment { amount: u64 },
    GetCount { respond_to: oneshot::Sender<u64> },
}

pub struct CounterActor {
    receiver: mpsc::Receiver<Command>,
    count: u64,
}

impl CounterActor {
    pub fn new(receiver: mpsc::Receiver<Command>) -> Self {
        Self { receiver, count: 0 }
    }

    pub async fn run(mut self) {
        while let Some(cmd) = self.receiver.recv().await {
            match cmd {
                Command::Increment { amount } => {
                    self.count += amount;
                }
                Command::GetCount { respond_to } => {
                    let _ = respond_to.send(self.count);
                }
            }
        }
    }
}
```

This pattern guarantees zero lock contention and ensures all mutations to `count` occur sequentially on a single thread.

---

## 4. Deterministic Graceful Shutdown Pipeline

Production services must drain inflight requests, flush storage buffers, and signal background workers before exiting.

```rust
use tokio::signal;
use tokio::sync::broadcast;

pub async fn run_service() {
    let (shutdown_tx, _) = broadcast::channel(1);

    let mut shutdown_rx = shutdown_tx.subscribe();
    let worker_handle = tokio::spawn(async move {
        loop {
            tokio::select! {
                _ = shutdown_rx.recv() => {
                    break;
                }
                _ = tokio::time::sleep(tokio::time::Duration::from_millis(50)) => {}
            }
        }
    });

    signal::ctrl_c().await.expect("Failed to listen for ctrl+c");
    let _ = shutdown_tx.send(());

    let _ = worker_handle.await;
}
```

Using a broadcast channel triggers all subscribed workers simultaneously, allowing them to exit their processing loops cleanly.

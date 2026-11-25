# Architectural Benchmark Evaluation: Messaging Engines

## 1. Executive Summary
Empirical comparison of Apache Kafka, RabbitMQ (Quorum Queues), and Amazon SQS for high-throughput order event ingestion and decoupled point-to-point background jobs.

## 2. Capability & Load Matrix

| Criterion | Apache Kafka | RabbitMQ (Quorum Queues) | Amazon SQS |
| :--- | :--- | :--- | :--- |
| **Sustained Throughput** | > 100,000 msgs/sec per cluster | ~25,000 msgs/sec (quorum replication bound) | Managed / Auto-scaled |
| **Ordering Guarantees** | Strict per partition | Strict per queue | Strict per `MessageGroupId` in FIFO mode (300 TPS unbatched; 3,000 msgs/s batched; higher via High Throughput FIFO) |
| **Operational Burden** | High (KRaft metadata quorum; legacy ZooKeeper removed in Kafka 4.0) | Moderate (Erlang cluster & Raft quorum disks) | Zero (Serverless managed service) |
| **Replay Capability** | Yes (Immutable log offset rewind) | No (Destructive acks; Streams plugin required for log replay) | No (Destructive delete after visibility timeout) |

## 3. Weighted Decision Matrix (Event Streaming Workload)

| Criterion | Weight | Kafka | RabbitMQ Quorum | AWS SQS FIFO |
| :--- | :--- | :--- | :--- | :--- |
| **Throughput & Headroom** | `0.35` | `5` (1.75) | `3` (1.05) | `3` (1.05) |
| **Log Replay & Auditability** | `0.30` | `5` (1.50) | `2` (0.60) | `1` (0.30) |
| **Day-2 Operational Simplicity** | `0.20` | `2` (0.40) | `3` (0.60) | `5` (1.00) |
| **Cost Predictability** | `0.15` | `3` (0.45) | `4` (0.60) | `4` (0.60) |
| **Weighted Total** | **`1.00`** | **`4.10`** | **`2.85`** | **`2.95`** |

## 4. Recommendation
Standardize on **Apache Kafka (KRaft)** for replayable order/telemetry event streaming (`4.10` weighted score); use **Amazon SQS** for decoupled point-to-point worker queues where log replay is not required.

# Architectural Benchmark Evaluation: Messaging Engines

## 1. Executive Summary
Empirical comparison of Kafka, RabbitMQ, and AWS SQS for high-throughput order event ingestion.

## 2. Evaluation Matrix

| Criterion | Apache Kafka | RabbitMQ (Quorum Queues) | AWS SQS |
| :--- | :--- | :--- | :--- |
| **Max Throughput** | > 100,000 msgs/sec | ~25,000 msgs/sec | Managed / Auto-scaled |
| **Ordering Guarantees** | Strict per partition | Strict per queue | Strict in FIFO mode (300/s) |
| **Operational Burden** | High (KRaft / ZooKeeper) | Moderate | Zero (Serverless) |
| **Replay Capability** | Yes (Log offset rewind) | No (Destructive reads) | No |

## 3. Recommendation
Standardize on Apache Kafka for telemetry event streaming; utilize AWS SQS for decoupled point-to-point worker queues.

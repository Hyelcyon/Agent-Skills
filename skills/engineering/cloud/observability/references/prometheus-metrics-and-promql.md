# Prometheus Metrics, RED & USE Methods, and PromQL Invariants

This document outlines metrics architecture, the RED/USE methodologies, time-series cardinality management, and mathematical PromQL evaluation.

---

## 1. Metrics Methodologies: RED vs USE

Choosing what to measure is critical to avoiding blind spots and metric bloat.

### 1.1 The RED Method (For Request-Driven Services)
Apply to microservices, HTTP handlers, gRPC endpoints, and batch workers:
- **Rate**: Throughput in requests per second (`sum(rate(http_requests_total[5m]))`).
- **Errors**: Number of failed requests per second (`sum(rate(http_requests_total{status=~"5.."}[5m]))`).
- **Duration**: Distribution of request latencies (`histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))`).

### 1.2 The USE Method (For Resources & Infrastructure)
Apply to CPU, memory, disk, network interfaces, connection pools, and worker threads:
- **Utilization**: Percentage of time the resource was busy (e.g. CPU busy time).
- **Saturation**: Degree of queued or delayed work waiting for the resource (e.g. Linux load average, disk queue depth, thread pool queue length).
- **Errors**: Error count (e.g. network interface drop rate, ECC memory errors).

---

## 2. Metric Types and PromQL Calculations

### The Fundamental PromQL Rule: `rate()` Before `sum()`
Prometheus Counters can reset to 0 at any time when a process restarts or a pod is rescheduled.
- **CORRECT**: `sum(rate(http_requests_total[5m]))`
  - Calculates the per-second rate of increase for each individual time series (handling counter resets correctly), then sums them together.
- **INCORRECT**: `rate(sum(http_requests_total[5m]))`
  - Sums raw counter values first. When one pod restarts and its counter drops from 10,000 to 0, the sum drops drastically, causing `rate()` to interpret this as a massive negative dip or spurious rate spike.

### Tail Latency Quantile Calculation
```promql
# Calculate p99 latency across all pods in production
histogram_quantile(
  0.99,
  sum by (le, handler) (
    rate(http_request_duration_seconds_bucket{environment="production"}[5m])
  )
)
```

---

## 3. High-Cardinality Defenses

Cardinality = $\prod_{i} (\text{distinct values of label } i)$.

If a metric has:
- `service`: 10 values
- `endpoint`: 50 values
- `status`: 5 values
- **Total Series**: $10 \times 50 \times 5 = 2,500$ series (healthy).

If someone adds `user_id` (1,000,000 active users):
- **Total Series**: $2,500 \times 1,000,000 = 2,500,000,000$ series.
- **Result**: Prometheus OOM crash, unrecoverable disk saturation.

### Cardinality Invariant
Metric labels must ONLY contain values with a bounded, small set of discrete states (enums, known HTTP methods, normalized routes). Never allow unbounded identifiers in labels.

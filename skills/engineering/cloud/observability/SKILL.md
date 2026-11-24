---
name: observability
description: Use when designing, instrumenting, or auditing production telemetry pipelines, implementing OpenTelemetry (OTel) tracing, Prometheus metrics (RED/USE methods), structured JSON logging with trace context correlation, Grafana dashboards, or Alertmanager alerting rules and SLO/SLI budgets.
---

# Enterprise Observability & Telemetry Standard

This skill establishes the production standard for full-stack observability. It mandates OpenTelemetry (OTel) distributed tracing, Prometheus metrics following the RED/USE methods, structured JSON logging with correlated trace identifiers, and Google SRE multi-window SLO burn-rate alerting.

---

## 1. Senior Craftsmanship Principles

1. **The Three Pillars Unified via Context Propagation**:
   - **Traces**: Provide causal, end-to-end execution trees across distributed service boundaries using W3C TraceContext (`traceparent`).
   - **Metrics**: Provide low-overhead, aggregatable real-time health indicators (RED for requests; USE for hardware/runtimes).
   - **Logs**: Provide structured, contextual event details. Every application log line MUST embed `trace_id` and `span_id` to enable seamless correlation.
2. **Cardinality Governance**: Never inject high-cardinality values (user IDs, email addresses, order UUIDs, raw URLs with path parameters) into Prometheus metric labels. High cardinality causes memory explosions and scraping timeouts in the time-series database (TSDB).
3. **Deterministic Histogram Bucketing**: Default Prometheus histogram buckets (`.005, .01, .025, ... 10`) are often misaligned with real SLAs. Tailor bucket boundaries explicitly around target p50, p90, p99 latencies (e.g., `[5ms, 15ms, 50ms, 100ms, 250ms, 500ms, 1s, 2.5s, 5s]`).
4. **Symptom-Based Multi-Window Burn-Rate Alerting**: Alert on user-facing symptoms and SLO error-budget consumption rate rather than raw internal metrics (e.g. alert on 14.4x 1-hour error budget burn rate rather than a transient 85% CPU utilization spike).
5. **Rate Before Sum Invariant**: In PromQL, always calculate per-second rate first before aggregating across labels (`sum(rate(http_requests_total[5m]))`, NEVER `rate(sum(...))`).

---

## 2. Hard Anti-Patterns (Prohibited)

| Anti-Pattern | Operational Risk | Production Remedy |
| :--- | :--- | :--- |
| Dynamic values in metric labels (UUIDs, timestamps) | TSDB OOM crash; metric explosion | Move dynamic identifiers to structured log attributes or trace span tags |
| Uncorrelated plain text logs | Impossible to isolate specific request traces across microservices | Enforce structured JSON logging with automatic `trace_id` / `span_id` injection |
| `rate(sum(metric[5m]))` in PromQL | Erroneous rate calculation when pods restart (counter resets missed) | Enforce `sum(rate(metric[5m]))` across all dashboards and alerting rules |
| Single-window alerts without burn rates | Alert fatigue (flapping alerts on short spikes; missed slow burns) | Implement multi-window multi-burn-rate SLO alerting (e.g., 1h and 6h windows) |
| Monolithic in-process telemetry exporters | High application latency overhead and memory buffer bloat | Offload export to an out-of-process OpenTelemetry Collector daemon or sidecar |

---

## 3. The 5-Phase Observability Operational Protocol

```
+-------------------------------------------------------------+
| Phase 1: Telemetry Architecture & Cardinality Profiling     |
| Identify OTLP collector endpoints, sampling rates & labels  |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
| Phase 2: Context Propagation & Tracing Setup                |
| Configure W3C TraceContext, TracerProvider & BatchProcessor |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
| Phase 3: Deterministic Metric & Log Correlation             |
| Instrument RED metrics, tailored histograms & JSON logging  |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
| Phase 4: Local Telemetry Pipeline Verification              |
| Verify span tree in OTel Collector and validate with promtool|
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
| Phase 5: Production Dashboards & SLO Alerting Gates         |
| Enforce multi-burn-rate alerts and verify p99 visualizations|
+-------------------------------------------------------------+
```

### Phase 1: Telemetry Architecture & Cardinality Profiling
Audit metric label schemas to guarantee bounded cardinality:
```python
# Allowed static labels: method, route, status_code, environment
# FORBIDDEN dynamic labels: user_id, order_id, query_params
ALLOWED_LABELS = ("http_method", "http_route", "http_status_code")
```

### Phase 2: Context Propagation & Tracing Setup
Initialize OpenTelemetry with non-blocking batch span processing:
```python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.resources import Resource

resource = Resource.create({"service.name": "order-api", "service.version": "1.0.0"})
provider = TracerProvider(resource=resource)
processor = BatchSpanProcessor(OTLPSpanExporter(endpoint="otel-collector:4317", insecure=True))
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)
```

### Phase 3: Deterministic Metric & Log Correlation
Inject active trace context into every structured log record:
```json
{
  "timestamp": "2026-11-24T12:00:00.123Z",
  "level": "ERROR",
  "message": "Payment authorization rejected by gateway",
  "service": "order-api",
  "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736",
  "span_id": "00f067aa0ba902b7",
  "error_code": "INSUFFICIENT_FUNDS"
}
```

### Phase 4: Local Telemetry Pipeline Verification
Run `promtool` to validate alerting rules and unit test scenarios:
```bash
# Verify Prometheus syntax and PromQL logic
promtool check rules ./resources/prometheus-alerts.rules.yaml

# Execute unit test suites for alerts
promtool test rules ./resources/promtool.tests.yaml
```

### Phase 5: Production Dashboards & SLO Alerting Gates
Implement multi-burn-rate alerting for a 99.9% availability SLO:
```yaml
- alert: ErrorBudgetBurnRateFast
  expr: |
    (
      sum(rate(http_requests_total{status=~"5.."}[1h]))
      /
      sum(rate(http_requests_total[1h]))
    ) > (14.4 * (1 - 0.999))
  for: 2m
  labels:
    severity: page
  annotations:
    summary: "High error budget consumption rate (14.4x burn rate over 1h)"
```

---

## 4. Deep References & Production Assets

- [OpenTelemetry and Distributed Tracing Reference](./references/opentelemetry-and-distributed-tracing.md)
- [Prometheus Metrics and PromQL Reference](./references/prometheus-metrics-and-promql.md)
- [SLO, SLI, and Alertmanager Rules Reference](./references/slo-sli-and-alertmanager-rules.md)
- [OpenTelemetry Collector Configuration Template](./resources/otel-collector-config.yaml)
- [Prometheus Alerting Rules Template](./resources/prometheus-alerts.rules.yaml)
- [Promtool Unit Test Suite Template](./resources/promtool.tests.yaml)
- [Instrumented Microservice Example](./examples/otel_instrumented_service.py)
- [Promtool Rule Verification Script](./examples/promtool_verifier.sh)
- [Cardinality Analyzer Script](./examples/cardinality_analyzer.py)

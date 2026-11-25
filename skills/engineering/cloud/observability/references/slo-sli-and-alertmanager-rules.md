# Service Level Objectives (SLOs), Error Budgets, and Multi-Window Burn-Rate Alerts

This document establishes the Google SRE framework for defining Service Level Indicators (SLIs), Service Level Objectives (SLOs), and implementing multi-window multi-burn-rate Alertmanager rules.

---

## 1. The SRE Reliability Hierarchy: SLI, SLO, and Error Budget

```
+-------------------------------------------------------------+
| SLI (Service Level Indicator): What is actually measured    |
| (e.g., % of HTTP requests returning < 500 status code)     |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
| SLO (Service Level Objective): Target goal over a time frame|
| (e.g., 99.9% availability over a rolling 30-day window)     |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
| Error Budget: Permissible unreliability (100% - SLO)        |
| (e.g., 0.1% error budget = 43.2 minutes of total downtime/mo)|
+-------------------------------------------------------------+
```

### The Error Budget Principle
If the error budget is healthy (> 0%), engineering teams deploy new features at standard velocity. If the error budget is exhausted (< 0%), feature deployments are halted, and engineering priority shifts strictly to reliability, bug fixes, and infrastructure resilience.

---

## 2. Multi-Window Multi-Burn-Rate Alerting

Traditional alerts check static thresholds over a short window (e.g., error rate > 1% for 5 minutes). These cause two major problems:
1. **Flapping / Fatigue**: Brief 1-minute bursts page on-call engineers unnecessarily.
2. **Detection Blindspot**: A slow 0.5% error rate will exhaust the entire monthly error budget over 3 days without ever breaching a 1% threshold.

### Burn Rate Definition
A **Burn Rate of 1** means the entire 30-day error budget will be consumed in exactly 30 days (nominal rate).
- **Burn Rate 14.4**: Consumes 2% of budget in 1 hour (PagerDuty Page).
- **Burn Rate 6.0**: Consumes 5% of budget in 6 hours (Ticket / Slack notification).

### Multi-Window Rule Table (99.9% SLO)
To prevent paging on brief spikes that immediately subside, Google SRE mandates checking both a **short window** (to confirm the error rate is still active) and a **long window** (to confirm sufficient budget consumption):

| Severity | Long Window | Short Window | Burn Rate | % Budget Consumed | Notification Channel |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Page** | 1 Hour | 5 Minutes | 14.4 | 2% | PagerDuty / Opsgenie |
| **Page** | 6 Hours | 30 Minutes | 6.0 | 5% | PagerDuty / Opsgenie |
| **Ticket** | 3 days | 3 Hours | 1.0 | 10% | Jira / Slack |

### Prometheus Rule Example for 1-Hour Burn Rate
```yaml
- alert: ApiAvailabilityBurnRateUrgent
  expr: |
    (
      sum by (service) (rate(http_requests_total{status=~"5.."}[1h]))
      /
      clamp_min(sum by (service) (rate(http_requests_total[1h])), 1e-9)
    ) > (14.4 * (1 - 0.999))
    and
    (
      sum by (service) (rate(http_requests_total{status=~"5.."}[5m]))
      /
      clamp_min(sum by (service) (rate(http_requests_total[5m])), 1e-9)
    ) > (14.4 * (1 - 0.999))
  for: 2m
  labels:
    severity: page
  annotations:
    summary: "High API Error Budget Consumption (14.4x Burn Rate) on {{ $labels.service }}"
    description: "The API has consumed 2% of its 30-day error budget in the last hour, and the condition is ongoing."
```

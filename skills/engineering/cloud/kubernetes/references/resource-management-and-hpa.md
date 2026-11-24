# Resource Management, Quality of Service (QoS), and Autoscaling

This document covers resource sizing, Linux cgroups v2 integration, eviction mechanics, and Horizontal Pod Autoscaler (HPA v2) design.

---

## 1. Requests vs Limits & Quality of Service (QoS) Classes

Kubernetes calculates pod scheduling strictly based on `requests`, but enforces container throttling and eviction based on `limits`.

```
+-------------------------------------------------------------+
| Guaranteed QoS Class                                        |
| requests.cpu == limits.cpu AND requests.memory == limits.memory |
| Lowest eviction priority. Guaranteed dedicated resources.   |
+-------------------------------------------------------------+
                              ^
+-------------------------------------------------------------+
| Burstable QoS Class                                         |
| requests < limits OR requests.cpu set without limits        |
| Medium eviction priority. Eligible for burst capacity.     |
+-------------------------------------------------------------+
                              ^
+-------------------------------------------------------------+
| BestEffort QoS Class                                        |
| No requests and no limits specified.                        |
| First to be killed when node memory pressure occurs.        |
+-------------------------------------------------------------+
```

### CPU Resource Semantics
- **Compressible Resource**: When a container exceeds its CPU limit, it is throttled via Linux CFS (Completely Fair Scheduler) quotas. It is NOT terminated.
- **Throttling Warning**: Aggressive CPU limits can cause high tail latency (p99 spikes) even when average CPU usage appears low due to CFS quota burst exhaustion within the 100ms CFS period.
- **Rule of Thumb**: For latency-sensitive web services, set `requests.cpu` to expected steady-state load, and set `limits.cpu` higher (or omit limits in clusters managed with CPU ballooning) to avoid CFS throttling.

### Memory Resource Semantics
- **Non-Compressible Resource**: When a container exceeds its memory limit, the Linux kernel Out-Of-Memory (OOM) killer terminates the process (`OOMKilled`, Exit Code 137).
- **Rule**: Always specify `requests.memory` and `limits.memory`. For predictable production workloads, set `requests.memory == limits.memory` to achieve `Guaranteed` QoS and eliminate swap thrashing.

```yaml
resources:
  requests:
    cpu: "250m"
    memory: "512Mi"
  limits:
    cpu: "1000m"
    memory: "512Mi"
```

---

## 2. Horizontal Pod Autoscaler (HPA v2) Architecture

The Horizontal Pod Autoscaler queries the Metrics Server or Prometheus Adapter to scale replica counts dynamically.

### Production HPA v2 Configuration
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: order-service-hpa
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: order-service
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
        - type: Percent
          value: 100
          periodSeconds: 15
        - type: Pods
          value: 4
          periodSeconds: 15
      selectPolicy: Max
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 10
          periodSeconds: 60
      selectPolicy: Min
```

### Key Scaling Invariants
1. **Stabilization Window**: `scaleDown.stabilizationWindowSeconds: 300` prevents flapping (thrashing) when brief load dips occur.
2. **Rate Limiting Scale Down**: Scaling down at max 10% per minute protects against cascading overload during traffic fluctuations.
3. **Minimum Replicas**: Never set `minReplicas: 1` in production. Always maintain at least 2 (preferably 3) replicas across different nodes to survive node drains and unplanned hardware failures.

# Pod Lifecycle, Health Probes, and Graceful Termination

This document specifies the technical mechanics of the Kubernetes Pod lifecycle, probe configuration protocols, and zero-downtime shutdown sequencing.

---

## 1. The Pod Probe Triad Architecture

Kubernetes uses three distinct probes to manage container health. Conflating their purposes is a primary cause of cascading service outages.

```
Container Start
      |
      v
+------------------+
|  startupProbe    | ---> Failing: Wait until initialDelay + (period * failureThreshold)
+------------------+      Exceeded: Kill container and restart according to restartPolicy
      | Success
      v
+-----------------------------------------------------+
| Container Running                                   |
|                                                     |
|  +--------------------+      +--------------------+ |
|  |   livenessProbe    |      |   readinessProbe   | |
|  +--------------------+      +--------------------+ |
|            |                           |            |
|       Fails:                      Fails:            |
|       Kill & Restart              Remove from       |
|       Container                   EndpointSlices    |
+-----------------------------------------------------+
```

### 1.1 Startup Probe (Initialization Guard)
- **Purpose**: Grants slow-starting applications (JVM warm-up, large cache loading, schema migrations) sufficient time to start without being killed by a premature liveness check.
- **Rule**: While the startup probe is active, liveness and readiness probes are disabled.
- **Formula**: Total allowed startup time = `failureThreshold * periodSeconds`.

```yaml
startupProbe:
  httpGet:
    path: /healthz/startup
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5
  failureThreshold: 24  # Allows up to 120 seconds for slow initialization
```

### 1.2 Liveness Probe (Deadlock Recovery)
- **Purpose**: Detects internal deadlocks, thread exhaustion, or corrupted non-recoverable state where the process is running but cannot make progress.
- **Rule**: MUST NOT check external dependencies (databases, Redis, downstream APIs). If an upstream database fails and all instances fail their liveness probes, Kubernetes restarts the entire fleet simultaneously, causing a catastrophic cluster restart storm.
- **Failure Consequence**: Container is killed and restarted.

```yaml
livenessProbe:
  httpGet:
    path: /healthz/liveness
    port: 8080
  periodSeconds: 10
  timeoutSeconds: 2
  failureThreshold: 3
```

### 1.3 Readiness Probe (Traffic Gatekeeper)
- **Purpose**: Signals whether the container is ready to accept user network traffic.
- **Rule**: Can verify essential local readiness (e.g., active database connection pool initialized, warmup requests completed).
- **Failure Consequence**: Container is NOT restarted. Its IP is removed from all associated `Endpoints` and `EndpointSlices`. Traffic stops flowing until it passes again.

```yaml
readinessProbe:
  httpGet:
    path: /healthz/readiness
    port: 8080
  periodSeconds: 5
  timeoutSeconds: 2
  successThreshold: 1
  failureThreshold: 2
```

---

## 2. Graceful Shutdown & Zero-Downtime Termination

When a Pod is deleted (e.g. during a rolling update), two asynchronous processes occur simultaneously:

1. **Endpoint Removal**: The API Server marks the Pod `Terminating`. Kube-proxy and ingress controllers asynchronously remove the Pod IP from IPVS/iptables routing tables.
2. **Kubelet Termination**: Kubelet executes the `preStop` hook, then sends `SIGTERM` to PID 1 inside each container.

### The Inherent Race Condition
If the application exits immediately upon receiving `SIGTERM`, clients whose requests are still in-flight or clients whose DNS/iptables have not yet updated will receive `502 Bad Gateway` or `Connection Refused` errors.

### The Mitigation: preStop Sleep Pattern
```yaml
lifecycle:
  preStop:
    exec:
      command: ["/bin/sh", "-c", "sleep 5"]
terminationGracePeriodSeconds: 30
```

1. **`sleep 5`**: Pauses the shutdown of the process for 5 seconds.
2. During these 5 seconds, EndpointSlices propagate across all cluster nodes and ingress proxies.
3. Kubelet sends `SIGTERM` to the container process.
4. The process stops accepting new connections, drains existing HTTP requests, flushes logs, and closes database pools.
5. If the process does not terminate within `terminationGracePeriodSeconds - preStopDuration`, Kubelet issues `SIGKILL`.

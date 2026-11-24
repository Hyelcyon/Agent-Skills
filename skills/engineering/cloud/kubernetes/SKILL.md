---
name: kubernetes
description: Use when authoring, auditing, or deploying Kubernetes (v1.28 - v1.32+) manifests, Helm charts, Kustomize overlays, configuring health probes, resource requests/limits, PodDisruptionBudgets, NetworkPolicies, or troubleshooting CrashLoopBackOff and OOMKilled workloads.
---

# Kubernetes Production Engineering Standard

This skill establishes the production standard for container orchestration on Kubernetes (v1.28 through v1.32+). It enforces zero-downtime rollouts, strict Pod Security Standards (Restricted Profile), deterministic QoS classes, and defensive network policies.

---

## 1. Senior Craftsmanship Principles

1. **Deterministic QoS Allocation**: Every container must declare explicit `requests` and `limits` for both CPU and memory. Omission triggers cluster eviction instability and uncapped node starvation.
2. **Explicit Probe Triad**:
   - `startupProbe`: Shields slow-starting initialization without triggering premature restarts.
   - `livenessProbe`: Detects deadlocks and fatal memory corruptions to trigger container restarts.
   - `readinessProbe`: Dictates traffic admission via Endpoints/EndpointSlices without terminating containers.
3. **Pod Security Standards (Restricted Profile)**:
   - Always run as non-root (`runAsNonRoot: true`, explicit `runAsUser`).
   - Immutable root filesystem (`readOnlyRootFilesystem: true`) with ephemeral volumes for `/tmp`.
   - Drop all Linux capabilities (`drop: ["ALL"]`).
   - Enforce `seccompProfile: { type: RuntimeDefault }`.
4. **Availability & Failure Domains**:
   - Always configure `PodDisruptionBudget` (`minAvailable` or `maxUnavailable`) for multi-replica services.
   - Distribute pods across nodes and zones using `topologySpreadConstraints` and `podAntiAffinity`.
5. **Graceful Termination Architecture**:
   - Handle `SIGTERM` gracefully within the application process.
   - Configure `preStop` sleep hook (e.g. `sleep 5`) to allow iptables / IPVS endpoint propagation before server shutdown.
   - Align `terminationGracePeriodSeconds` (default 30s) to workload drain requirements.

---

## 2. Hard Anti-Patterns (Prohibited)

| Anti-Pattern | Operational Risk | Production Remedy |
| :--- | :--- | :--- |
| `image: app:latest` | Non-reproducible deployments; cache drift across nodes | Pin exact immutable semantic tags or sha256 digests (`app:v1.4.2@sha256:...`) |
| Unbounded memory limits (`limits.memory: null`) | Node-level OOM killer terminates arbitrary system pods | Set explicit memory limit equal to or slightly above request |
| Identical Liveness & Readiness endpoints | Transient downstream latency triggers restart loops (cascade failure) | Readiness checks downstream dependencies; Liveness checks internal event loop only |
| Running as UID 0 (`root`) | Container breakout grants host root access | Enforce `runAsNonRoot: true` with non-privileged UID (e.g. `10001`) |
| Missing `readOnlyRootFilesystem` | Malware persistence and arbitrary binary execution | Set `readOnlyRootFilesystem: true` and mount `emptyDir` on `/tmp` |
| Default `default` namespace usage | Blast radius contamination and RBAC leakage | Deploy workloads into dedicated, purpose-bound namespaces |

---

## 3. The 5-Phase Kubernetes Operational Protocol

```
+-------------------------------------------------------------+
| Phase 1: Cluster & Workload Profiling                      |
| Inspect target k8s version, API deprecations & resources   |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
| Phase 2: Security & Sandboxing Baseline                     |
| Enforce Restricted PSS, drop capabilities, NetworkPolicy   |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
| Phase 3: Deterministic Manifest Authoring                   |
| Configure Probes, QoS, PDB, TopologySpread & preStop       |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
| Phase 4: Static Validation & Dry-Run                        |
| Execute kubectl --dry-run=client, kubeconform & pluto      |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
| Phase 5: Rollout & Health Verification                      |
| Verify rollout status, endpoint readiness & zero restarts   |
+-------------------------------------------------------------+
```

### Phase 1: Cluster & Workload Profiling
Inspect target API versions and cluster capabilities:
```bash
# Verify cluster version and supported API resources
kubectl version --output=yaml
kubectl api-resources --verbs=list --namespaced -o wide

# Check node capacity and allocatable resource margins
kubectl describe nodes | grep -A 8 "Allocatable:"
```

### Phase 2: Security & Sandboxing Baseline
Enforce the Restricted Pod Security Standard within the workload specification:
```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 10001
  runAsGroup: 10001
  fsGroup: 10001
  seccompProfile:
    type: RuntimeDefault
```
Inside the container spec:
```yaml
securityContext:
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: true
  capabilities:
    drop:
      - ALL
```

### Phase 3: Deterministic Manifest Authoring
Structure pods with zero-downtime termination semantics:
```yaml
lifecycle:
  preStop:
    exec:
      command: ["/bin/sh", "-c", "sleep 5"]
terminationGracePeriodSeconds: 30
```
Pair deployments with an explicit `PodDisruptionBudget`:
```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: order-service-pdb
spec:
  minAvailable: 1
  selector:
    matchLabels:
      app.kubernetes.io/name: order-service
```

### Phase 4: Static Validation & Dry-Run
Run schema and deprecation checks before applying:
```bash
# Client-side static dry-run
kubectl apply --dry-run=client -f ./manifests/

# Server-side dry-run to validate admission controllers (webhooks, validating policies)
kubectl apply --dry-run=server -f ./manifests/
```

### Phase 5: Rollout & Health Verification
Observe rollout progression deterministically:
```bash
# Monitor rollout state
kubectl rollout status deployment/order-service --timeout=120s

# Verify Pod QoS class, endpoints, and restart counts
kubectl get pods -l app.kubernetes.io/name=order-service -o custom-columns=\
NAME:.metadata.name,\
READY:.status.containerStatuses[0].ready,\
RESTARTS:.status.containerStatuses[0].restartCount,\
QOS:.status.qosClass
```

---

## 4. Deep References & Production Assets

- [Pod Lifecycle and Probes Reference](./references/pod-lifecycle-and-probes.md)
- [Resource Management and HPA Reference](./references/resource-management-and-hpa.md)
- [Security Hardening and Network Policies Reference](./references/security-hardening-and-network-policies.md)
- [Production Hardened Deployment Template](./resources/deployment.hardened.yaml)
- [Default-Deny NetworkPolicy Template](./resources/network-policy.default-deny.yaml)
- [Kustomize Base Template](./resources/kustomization.base.yaml)
- [Production Service Workload Example](./examples/production_service_workload.yaml)
- [Canary Rollout Manager Script](./examples/canary_rollout_manager.sh)
- [Cluster Pod Diagnoser Script](./examples/cluster_pod_diagnoser.py)

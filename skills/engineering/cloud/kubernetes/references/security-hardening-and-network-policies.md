# Security Hardening, Pod Security Standards, and Network Policies

This document details defense-in-depth isolation protocols for Kubernetes workloads, including Pod Security Standards (Restricted), container sandboxing, and zero-trust NetworkPolicies.

---

## 1. Pod Security Standards (PSS) - Restricted Baseline

The Kubernetes Pod Security Standards replace legacy PodSecurityPolicies (PSP). Production enterprise workloads must comply with the `Restricted` standard.

```
+-------------------------------------------------------------+
| Privileged: Unrestricted, root access, host network/IPC     |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
| Baseline: Default permissions, prevents known escalations   |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
| Restricted: Hardened hardening, non-root, read-only root FS, |
| drops all capabilities, no privilege escalation             |
+-------------------------------------------------------------+
```

### Namespace Level Enforcement
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: payment-processing
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/enforce-version: latest
    pod-security.kubernetes.io/warn: restricted
    pod-security.kubernetes.io/audit: restricted
```

### Pod and Container Hardening Block
```yaml
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 10001
    runAsGroup: 10001
    fsGroup: 10001
    seccompProfile:
      type: RuntimeDefault
  containers:
    - name: app
      image: registry.example.com/payment:v2.1.0
      securityContext:
        allowPrivilegeEscalation: false
        readOnlyRootFilesystem: true
        capabilities:
          drop:
            - ALL
      volumeMounts:
        - name: tmp-volume
          mountPath: /tmp
  volumes:
    - name: tmp-volume
      emptyDir:
        medium: Memory
        sizeLimit: 64Mi
```

---

## 2. Zero-Trust Network Policies

By default, pod networking is unsegmented: any pod can communicate with any other pod across all namespaces. Production environments must establish a Default-Deny baseline.

### Default-Deny All Ingress and Egress
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: payment-processing
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
```

### Controlled Egress: CoreDNS Resolution
When egress is blocked by default, pods cannot resolve domain names without an explicit DNS rule:
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-dns-egress
  namespace: payment-processing
spec:
  podSelector: {}
  policyTypes:
    - Egress
  egress:
    - to:
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: kube-system
          podSelector:
            matchLabels:
              k8s-app: kube-dns
      ports:
        - protocol: UDP
          port: 53
        - protocol: TCP
          port: 53
```

### Targeted Ingress Rule
Allow ingress exclusively from the ingress controller or authorized upstream API gateway:
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-ingress-from-gateway
  namespace: payment-processing
spec:
  podSelector:
    matchLabels:
      app.kubernetes.io/name: payment-api
  policyTypes:
    - Ingress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: gateway-system
          podSelector:
            matchLabels:
              app.kubernetes.io/name: envoy-gateway
      ports:
        - protocol: TCP
          port: 8080
```

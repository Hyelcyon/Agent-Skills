import json
import subprocess
import sys
from typing import Any, Dict, List

def run_kubectl(args: List[str]) -> Dict[str, Any]:
    cmd = ["kubectl"] + args + ["-o", "json"]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        return {"error": proc.stderr.strip(), "items": []}
    try:
        return json.loads(proc.stdout)
    except json.JSONDecodeError as exc:
        return {"error": str(exc), "items": []}

def diagnose_pod_issues(namespace: str = "") -> Dict[str, Any]:
    args = ["get", "pods"]
    if namespace:
        args.extend(["-n", namespace])
    else:
        args.append("--all-namespaces")

    data = run_kubectl(args)
    if "error" in data and not data.get("items"):
        return {"status": "error", "message": data["error"], "findings": []}

    findings: List[Dict[str, Any]] = []

    for pod in data.get("items", []):
        metadata = pod.get("metadata", {})
        pod_name = metadata.get("name", "unknown")
        pod_ns = metadata.get("namespace", "default")
        status = pod.get("status", {})
        phase = status.get("phase", "Unknown")

        container_statuses = status.get("containerStatuses", [])
        for cs in container_statuses:
            c_name = cs.get("name", "")
            restart_count = cs.get("restartCount", 0)
            state = cs.get("state", {})
            waiting = state.get("waiting", {})
            terminated = state.get("terminated", {})

            if waiting:
                reason = waiting.get("reason", "")
                if reason in ("CrashLoopBackOff", "ImagePullBackOff", "ErrImagePull", "CreateContainerConfigError"):
                    findings.append({
                        "severity": "CRITICAL",
                        "namespace": pod_ns,
                        "pod": pod_name,
                        "container": c_name,
                        "issue": reason,
                        "message": waiting.get("message", "Container is failing to start")
                    })

            if terminated:
                term_reason = terminated.get("reason", "")
                exit_code = terminated.get("exitCode", 0)
                if term_reason == "OOMKilled" or exit_code == 137:
                    findings.append({
                        "severity": "CRITICAL",
                        "namespace": pod_ns,
                        "pod": pod_name,
                        "container": c_name,
                        "issue": "OOMKilled",
                        "exitCode": exit_code,
                        "message": "Container exceeded its memory limit"
                    })

            if restart_count > 5 and not waiting and not terminated:
                findings.append({
                    "severity": "WARNING",
                    "namespace": pod_ns,
                    "pod": pod_name,
                    "container": c_name,
                    "issue": "HighRestartCount",
                    "restartCount": restart_count,
                    "message": f"Container has restarted {restart_count} times"
                })

        spec = pod.get("spec", {})
        containers = spec.get("containers", [])
        for c in containers:
            c_name = c.get("name", "")
            resources = c.get("resources", {})
            requests = resources.get("requests", {})
            limits = resources.get("limits", {})
            missing = []
            if "cpu" not in requests:
                missing.append("requests.cpu")
            if "memory" not in requests:
                missing.append("requests.memory")
            if "memory" not in limits:
                missing.append("limits.memory")

            if missing:
                findings.append({
                    "severity": "INFO",
                    "namespace": pod_ns,
                    "pod": pod_name,
                    "container": c_name,
                    "issue": "MissingResourceDeclarations",
                    "missing": missing
                })

    return {
        "status": "success",
        "total_pods_scanned": len(data.get("items", [])),
        "total_findings": len(findings),
        "findings": findings
    }

def main() -> int:
    ns = sys.argv[1] if len(sys.argv) > 1 else ""
    report = diagnose_pod_issues(ns)
    print(json.dumps(report, indent=2))
    return 0 if report.get("status") == "success" else 1

if __name__ == "__main__":
    sys.exit(main())

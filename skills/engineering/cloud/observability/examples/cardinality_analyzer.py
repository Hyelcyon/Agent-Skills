import re
import sys
from collections import defaultdict
from typing import Dict, List, Set, Tuple

METRIC_LINE_REGEX = re.compile(r"^([a-zA-Z_:][a-zA-Z0-9_:]*)\{([^}]+)\}\s+([0-9\.\-e\+]+)")
LABEL_PAIR_REGEX = re.compile(r'([a-zA-Z_][a-zA-Z0-9_]*)=("(?:\\.|[^"\\])*")')

def analyze_cardinality(raw_metrics_text: str, max_label_cardinality: int = 50) -> Dict[str, Any]:
    metric_series_counts: Dict[str, int] = defaultdict(int)
    label_unique_values: Dict[str, Dict[str, Set[str]]] = defaultdict(lambda: defaultdict(set))
    warnings: List[str] = []

    for line in raw_metrics_text.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue

        match = METRIC_LINE_REGEX.match(line)
        if not match:
            continue

        metric_name, labels_part, _ = match.groups()
        metric_series_counts[metric_name] += 1

        for label_match in LABEL_PAIR_REGEX.finditer(labels_part):
            key, val = label_match.groups()
            label_unique_values[metric_name][key].add(val)

    high_cardinality_metrics: List[Dict[str, Any]] = []

    for metric_name, labels_dict in label_unique_values.items():
        for label_key, values_set in labels_dict.items():
            count = len(values_set)
            if count > max_label_cardinality:
                warnings.append(
                    f"Label explosion detected: metric '{metric_name}' has {count} distinct values for label '{label_key}'"
                )

        if metric_series_counts[metric_name] > 500:
            high_cardinality_metrics.append({
                "metric": metric_name,
                "total_series": metric_series_counts[metric_name],
                "labels": {k: len(v) for k, v in labels_dict.items()}
            })

    return {
        "total_metrics_evaluated": len(metric_series_counts),
        "high_cardinality_metrics": high_cardinality_metrics,
        "warnings": warnings,
        "status": "FAIL" if warnings else "PASS"
    }

def main() -> int:
    import json
    if len(sys.argv) > 1:
        with open(sys.argv[1], "r", encoding="utf-8") as f:
            content = f.read()
    else:
        sample_metrics = """
http_requests_total{method="GET",handler="/api/v1/orders",status="200"} 1240
http_requests_total{method="POST",handler="/api/v1/orders",status="201"} 310
http_requests_total{method="GET",handler="/api/v1/orders",status="500"} 12
"""
        content = sample_metrics

    result = analyze_cardinality(content)
    print(json.dumps(result, indent=2))
    return 0 if result["status"] == "PASS" else 1

if __name__ == "__main__":
    sys.exit(main())

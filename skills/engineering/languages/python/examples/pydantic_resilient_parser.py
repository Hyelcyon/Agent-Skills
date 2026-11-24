from dataclasses import dataclass
from typing import Optional, Dict, Any

@dataclass(frozen=True)
class TenantConfig:
    tenant_id: str
    max_concurrency: int
    enable_debug: bool = False

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "TenantConfig":
        raw_id = data.get("tenant_id")
        if not isinstance(raw_id, str) or not raw_id.strip():
            raise ValueError("tenant_id must be a non-empty string")

        raw_concurrency = data.get("max_concurrency", 10)
        if not isinstance(raw_concurrency, int) or raw_concurrency <= 0:
            raise ValueError("max_concurrency must be a positive integer")

        raw_debug = bool(data.get("enable_debug", False))

        return cls(
            tenant_id=raw_id.strip(),
            max_concurrency=raw_concurrency,
            enable_debug=raw_debug
        )

def safe_parse_tenant(payload: Dict[str, Any]) -> Optional[TenantConfig]:
    try:
        return TenantConfig.from_dict(payload)
    except ValueError:
        return None

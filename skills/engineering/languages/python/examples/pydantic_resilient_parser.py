from typing import Any
from pydantic import BaseModel, ConfigDict, Field, ValidationError

class TenantConfig(BaseModel):
    model_config = ConfigDict(strict=True, frozen=True, extra="forbid")

    tenant_id: str = Field(min_length=1)
    max_concurrency: int = Field(default=10, gt=0)
    enable_debug: bool = Field(default=False)

def safe_parse_tenant(payload: dict[str, Any]) -> TenantConfig | None:
    try:
        return TenantConfig.model_validate(payload)
    except ValidationError:
        return None

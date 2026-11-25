from typing import Any

import yaml
from pydantic import BaseModel, Field, ValidationError


class UserProfilePayload(BaseModel):
    user_id: str = Field(min_length=1, max_length=64)
    display_name: str = Field(min_length=1, max_length=100)
    email: str = Field(min_length=3, max_length=254)
    is_active: bool = True

    model_config = {
        "extra": "forbid",
        "frozen": True,
    }

def deserialize_json_payload(raw_json: str) -> UserProfilePayload:
    if len(raw_json) > 1024 * 1024:
        raise ValueError("Payload size exceeds maximum allowed threshold")

    try:
        return UserProfilePayload.model_validate_json(raw_json)
    except ValidationError as err:
        raise ValueError(f"Payload validation failed: {err}") from err

def deserialize_safe_yaml(raw_yaml: str) -> dict[str, Any]:
    if len(raw_yaml) > 512 * 1024:
        raise ValueError("YAML size exceeds maximum threshold")

    parsed = yaml.safe_load(raw_yaml)
    if not isinstance(parsed, dict):
        raise TypeError("Parsed YAML root must be a dictionary")

    return parsed

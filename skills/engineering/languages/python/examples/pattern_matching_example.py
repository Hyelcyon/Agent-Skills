from typing import Literal, TypeIs
from pydantic import BaseModel, ConfigDict, Field

class OrderPlaced(BaseModel):
    model_config = ConfigDict(strict=True, frozen=True, extra="forbid")
    event_type: Literal["order_placed"]
    order_id: str = Field(min_length=1)
    amount: float = Field(gt=0.0)

class OrderCancelled(BaseModel):
    model_config = ConfigDict(strict=True, frozen=True, extra="forbid")
    event_type: Literal["order_cancelled"]
    order_id: str
    reason: str

OrderEvent = OrderPlaced | OrderCancelled

def is_order_placed(event: OrderEvent) -> TypeIs[OrderPlaced]:
    return event.event_type == "order_placed"

def process_order_event(event: OrderEvent) -> str:
    match event:
        case OrderPlaced(order_id=oid, amount=amt):
            return f"Processed order {oid} for ${amt:.2f}"
        case OrderCancelled(order_id=oid, reason=reason):
            return f"Cancelled order {oid}: {reason}"

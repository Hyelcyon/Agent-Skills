# Python Modern Type Hints and Pydantic v2 Validation Architecture

Comprehensive guide to modern static typing (PEP 695, PEP 604, PEP 742) and high-performance domain validation using Pydantic v2 in Python 3.12 and 3.13.

## 1. Modern Generics and PEP 695 Syntax

Python 3.12 introduced dedicated syntactic support for generic classes, functions, and type aliases, eliminating verbose `TypeVar` and `Generic` boilerplate.

### Generic Class and Function Definitions

```python
from typing import Protocol

class Identifiable(Protocol):
    id: str

class EntityRepository[T: Identifiable]:
    def __init__(self) -> None:
        self._registry: dict[str, T] = {}

    def save(self, entity: T) -> None:
        self._registry[entity.id] = entity

    def get(self, entity_id: str) -> T | None:
        return self._registry.get(entity_id)

def find_first[T](items: list[T], default: T) -> T:
    return items[0] if items else default
```

The bracket syntax `[T: Identifiable]` creates an upper-bound constraint checked statically by type checkers.

### Type Statement for Aliases

```python
type JSONValue = str | int | float | bool | None | list[JSONValue] | dict[str, JSONValue]
type RecordMap[K: str, V] = dict[K, list[V]]
```

---

## 2. Advanced Type Narrowing with TypeIs (PEP 742)

Python 3.13 introduces `TypeIs` to replace `TypeGuard`. Unlike `TypeGuard` which only narrows in the positive branch, `TypeIs` safely narrows both the positive `if` branch and the negative `else` branch.

```python
from collections.abc import Sequence
from typing import TypeIs


def is_integer_sequence(items: Sequence[object]) -> TypeIs[Sequence[int]]:
    # Exclude bool because isinstance(True, int) is True in Python.
    return all(isinstance(x, int) and not isinstance(x, bool) for x in items)


def process_elements(elements: Sequence[str | int]) -> int:
    if is_integer_sequence(elements):
        return sum(elements)
    return len(elements)
```

In the negative branch, the static analyzer knows `elements` cannot be `list[int]`, narrowing it down to `list[str]`.

---

## 3. Pydantic v2 Validation Engine

Pydantic v2 utilizes a native Rust core (`pydantic-core`), providing a substantial speedup over v1.

### Strict Immutability and Schema Validation

```python
from pydantic import BaseModel, ConfigDict, Field, field_validator

class TransactionRecord(BaseModel):
    model_config = ConfigDict(
        strict=True,
        frozen=True,
        extra="forbid"
    )

    transaction_id: str = Field(min_length=8, max_length=64)
    amount_cents: int = Field(gt=0)
    currency: str = Field(min_length=3, max_length=3)

    @field_validator("currency")
    @classmethod
    def validate_currency_uppercase(cls, value: str) -> str:
        if not value.isupper():
            raise ValueError("Currency must be an uppercase ISO code")
        return value
```

### Direct Serialization with TypeAdapter

For validating primitive structures, collections, or untyped JSON without creating synthetic model wrappers, use `TypeAdapter`:

```python
from pydantic import TypeAdapter

type Coordinates = tuple[float, float]

coordinate_adapter = TypeAdapter(list[Coordinates])

raw_input = [[37.7749, -122.4194], [40.7128, -74.0060]]
validated_points = coordinate_adapter.validate_python(raw_input)
```

### Discriminated Unions for Domain Events

```python
from typing import Annotated, Literal, Union
from pydantic import BaseModel, Field

class OrderPlaced(BaseModel):
    kind: Literal["placed"]
    order_id: str
    amount: int

class OrderCancelled(BaseModel):
    kind: Literal["cancelled"]
    order_id: str
    reason: str

type OrderEvent = Annotated[
    Union[OrderPlaced, OrderCancelled],
    Field(discriminator="kind")
]
```

The discriminator attribute instructs Pydantic to check the discriminator key directly, yielding instant parsing without evaluating multiple subschemas sequentially.

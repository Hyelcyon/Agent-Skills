---
name: python
description: Use when writing or reviewing modern Python 3.12/3.13+ code, designing Pydantic v2 schemas, implementing structural pattern matching, using bidirectional type narrowing (TypeIs), or managing free-threaded concurrency.
---

# Modern Python Senior Engineering (3.12 / 3.13+)

Senior guidelines and idioms for high-performance, strictly typed modern Python utilizing native generics, structural pattern matching, and Pydantic v2 validation.

## When to Use
- Writing Python 3.12/3.13 code with modern native type unions (`|`) and generic syntax.
- Implementing structural pattern matching (`match` / `case`) over complex DTOs.
- Designing strictly typed boundaries and immutable data structures with Pydantic v2.
- Type narrowing with `TypeIs` and static validation via `mypy` or `pyright`.
- Concurrency planning under Python 3.13 free-threaded (No-GIL) execution.

## When NOT to Use
- Orchestrating multi-node cloud deployments or Docker builds (use `ci-cd` or `docker`).
- Writing raw low-level memory algorithms where C/Rust is preferred.

---

## 5-Phase Agent Operational Protocol

```
Phase 1: Environment & Toolchain Inspection (pyproject.toml, Python 3.12+)
Phase 2: Data Model Design & Boundary Validation (Pydantic v2, frozen=True)
Phase 3: Deterministic Logic Execution (Pattern matching, TypeIs, pathlib)
Phase 4: Concurrency & Resource Isolation (asyncio.TaskGroup, context managers)
Phase 5: Automated Verification & Type-Checking (ruff, mypy, pytest)
```

### Phase 1: Environment & Toolchain Inspection
Verify Python runtime targets 3.12 or 3.13. Validate that `pyproject.toml` configures Ruff for formatting and strict type-checking (`mypy --strict`).

### Phase 2: Data Model Design & Boundary Validation
Define strict domain contracts using Pydantic v2 (`strict=True`, `frozen=True`, `extra="forbid"`). Never represent monetary values with binary `float`—use `Decimal` or integer minor units (`amount_cents: int`):
```python
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field

class OrderPayload(BaseModel):
    model_config = ConfigDict(strict=True, frozen=True, extra="forbid")
    order_id: str = Field(min_length=1)
    amount: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
```
Use `strict=True` for internal trusted boundaries; validate and coerce untrusted JSON strings safely at API ingress before instantiating strict models.

### Phase 3: Deterministic Logic Execution
Use structural pattern matching (`match` / `case`) and native type syntax (`X | Y`). Use `pathlib.Path` instead of `os.path`. Eliminate mutable default arguments.

### Phase 4: Concurrency & Resource Isolation
Manage async concurrency via `asyncio.TaskGroup` to prevent orphaned background tasks. In Python 3.13 free-threaded environments, protect mutable state with thread locks.

### Phase 5: Verification & Quality Gate
Run automated linting, type validation, and test coverage:
```bash
ruff check src/ tests/
mypy --strict src/
pytest tests/
```

---

## Prohibited Anti-Patterns

- ❌ Using mutable default arguments (`def func(x=[])`).
- ❌ Naked `except:` or broad `except Exception:` without re-raising or context.
- ❌ Using legacy `os.path` (Standardize strictly on `pathlib.Path`).
- ❌ Reliance on runtime implicit type coercion in API contracts.
- ❌ Mutating shared state across threads in free-threaded runtimes without locks.

---

## References & Documentation
- Implementation Playbook: [references/implementation-playbook.md](./references/implementation-playbook.md)
- Modern Concurrency & AsyncIO: [references/modern-concurrency-and-asyncio.md](./references/modern-concurrency-and-asyncio.md)
- Type Hints & Pydantic Validation: [references/type-hints-and-pydantic-validation.md](./references/type-hints-and-pydantic-validation.md)

## Resources & Examples
- Strict Pyproject Starter: [resources/pyproject.strict.toml](./resources/pyproject.strict.toml)
- Ruff Linter & Formatter Config: [resources/ruff.toml](./resources/ruff.toml)
- Pytest Strict Suite Config: [resources/pytest.ini](./resources/pytest.ini)
- Pattern Matching Example: [examples/pattern_matching_example.py](./examples/pattern_matching_example.py)
- Async TaskGroup Concurrency Example: [examples/async_task_group.py](./examples/async_task_group.py)
- Pydantic Resilient Parser Example: [examples/pydantic_resilient_parser.py](./examples/pydantic_resilient_parser.py)

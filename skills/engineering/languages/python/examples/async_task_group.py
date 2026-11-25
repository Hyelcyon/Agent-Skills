import asyncio
from typing import Any


async def fetch_tenant_metric(tenant_id: str, delay: float) -> dict[str, Any]:
    await asyncio.sleep(delay)
    return {"tenant_id": tenant_id, "status": "active", "throughput": 150}

async def gather_all_telemetry(tenant_ids: list[str]) -> list[dict[str, Any]]:
    results: list[dict[str, Any]] = []
    async with asyncio.TaskGroup() as tg:
        tasks = [
            tg.create_task(fetch_tenant_metric(tid, 0.05))
            for tid in tenant_ids
        ]

    for task in tasks:
        results.append(task.result())

    return results

if __name__ == "__main__":
    data = asyncio.run(gather_all_telemetry(["t1", "t2", "t3"]))
    assert len(data) == 3

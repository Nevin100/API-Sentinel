"""Live host system stats (CPU/RAM/disk) for the dashboard."""
import os

import psutil
from fastapi import APIRouter

router = APIRouter()

@router.get("/stats")
def system_stats():
    per_core = psutil.cpu_percent(interval=0.5, percpu=True) or [0.0]
    mem = psutil.virtual_memory()
    disk = psutil.disk_usage(os.path.abspath(os.sep))
    return {
        "cpu_percent": round(sum(per_core) / len(per_core), 1),
        "cpu_count": psutil.cpu_count(),
        "cpu_per_core": per_core,
        "ram_percent": mem.percent,
        "ram_used_gb": round(mem.used / (1024 ** 3), 2),
        "ram_total_gb": round(mem.total / (1024 ** 3), 2),
        "disk_percent": disk.percent,
        "disk_used_gb": round(disk.used / (1024 ** 3), 2),
        "disk_total_gb": round(disk.total / (1024 ** 3), 2),
    }

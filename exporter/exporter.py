"""Tiny Prometheus exporter: per-container CPU % and memory via the Docker API.

Runs inside Docker with the host's docker.sock mounted, polls `stats`
for every running container every 10s, exposes gauges on :9101/metrics.
"""
import threading
import time

import docker
from prometheus_client import Gauge, start_http_server

CPU = Gauge(
    "docker_container_cpu_percent",
    "Container CPU usage as percent of total host CPU",
    ["name"],
)
MEM = Gauge(
    "docker_container_memory_bytes",
    "Container memory usage in bytes",
    ["name"],
)

client = docker.from_env()


def cpu_percent(stats: dict) -> float:
    cpu = stats["cpu_stats"]["cpu_usage"]["total_usage"]
    precpu = stats["precpu_stats"]["cpu_usage"]["total_usage"]
    sys = stats["cpu_stats"].get("system_cpu_usage", 0)
    presys = stats["precpu_stats"].get("system_cpu_usage", 0)
    percpu = stats["cpu_stats"]["cpu_usage"].get("percpu_usage") or []
    cpus = stats["cpu_stats"].get("online_cpus") or len(percpu) or 1
    if sys - presys <= 0:
        return 0.0
    return (cpu - precpu) / (sys - presys) * cpus * 100.0


def collect_forever():
    while True:
        try:
            seen = set()
            for container in client.containers.list():
                try:
                    s = container.stats(stream=False)
                    name = s.get("name", container.name).lstrip("/")
                    CPU.labels(name=name).set(cpu_percent(s))
                    MEM.labels(name=name).set(
                        s.get("memory_stats", {}).get("usage", 0)
                    )
                    seen.add(name)
                except Exception:
                    continue
            # drop series for containers that no longer exist
            for gauge in (CPU, MEM):
                for labels in list(gauge._metrics.keys()):
                    if labels[0] not in seen:
                        gauge.remove(labels[0])
        except Exception:
            pass
        time.sleep(10)


if __name__ == "__main__":
    start_http_server(9101)
    threading.Thread(target=collect_forever, daemon=True).start()
    threading.Event().wait()  # block forever

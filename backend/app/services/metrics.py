from prometheus_client import Counter, Histogram, Gauge

REQUESTS_SENT = Counter(
    "sentinel_requests_sent_total",
    "Total manual tester requests sent",
)

CHECKS_TOTAL = Counter(
    "sentinel_checks_total",
    "Total health checks run",
    ["endpoint_id", "ok"],
)

CHECK_LATENCY = Histogram(
    "sentinel_check_latency_seconds",
    "Health check latency in seconds",
    ["endpoint_id"],
)

ENDPOINT_UP = Gauge(
    "sentinel_endpoint_up",
    "Whether the endpoint is up (1) or down (0)",
    ["endpoint_id", "name"],
)

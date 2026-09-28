import time
import httpx

def send_request(method: str, url: str, headers: dict | None = None,
                 body: str | None = None, timeout: float = 30.0) -> dict:
    start = time.perf_counter()
    try:
        with httpx.Client(timeout=timeout, follow_redirects=True) as client:
            resp = client.request(method, url, headers=headers or {}, content=body)
        latency_ms = (time.perf_counter() - start) * 1000
        return {"ok": True, "status_code": resp.status_code,
                "latency_ms": round(latency_ms, 2),
                "headers": dict(resp.headers),
                "body": resp.text[:100_000],
                "size_bytes": len(resp.content)}
    except Exception as e:
        latency_ms = (time.perf_counter() - start) * 1000
        return {"ok": False, "status_code": None,
                "latency_ms": round(latency_ms, 2), "error": str(e)}

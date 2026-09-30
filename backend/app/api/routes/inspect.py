from fastapi import APIRouter
from urllib.parse import urlparse
from app.services.sender import send_request
from app.services.inspector import dns_lookup, ssl_info, waterfall

router = APIRouter()

@router.get("/deep")
def deep_inspect(url: str):
    """Network X-ray for a URL: HTTP timing + DNS + SSL + phase waterfall."""
    host = urlparse(url).hostname or url
    result = send_request("GET", url)
    out = {
        "timing": {"total_ms": result.get("latency_ms")},
        "http": {"status_code": result.get("status_code"), "ok": result.get("ok")},
        "dns": dns_lookup(host),
        "waterfall": waterfall(url),
    }
    if url.startswith("https"):
        out["ssl"] = ssl_info(host)
    return out

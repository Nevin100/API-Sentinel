import socket
import ssl
import time
from urllib.parse import urlparse

def dns_lookup(hostname: str) -> dict:
    """Resolve a hostname and time it."""
    start = time.perf_counter()
    try:
        infos = socket.getaddrinfo(hostname, None)
        ips = sorted({info[4][0] for info in infos})
        return {
            "ok": True,
            "ips": ips,
            "lookup_ms": round((time.perf_counter() - start) * 1000, 2),
        }
    except Exception as e:
        return {"ok": False, "ips": [], "error": str(e)}


def ssl_info(hostname: str, port: int = 443, timeout: float = 10.0) -> dict:
    """Fetch the TLS certificate details for a host."""
    try:
        ctx = ssl.create_default_context()
        with socket.create_connection((hostname, port), timeout=timeout) as sock:
            with ctx.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()
                return {
                    "ok": True,
                    "subject": dict(x[0] for x in cert.get("subject", [])),
                    "issuer": dict(x[0] for x in cert.get("issuer", [])),
                    "not_before": cert.get("notBefore"),
                    "not_after": cert.get("notAfter"),
                    "tls_version": ssock.version(),
                    "cipher": ssock.cipher()[0],
                }
    except Exception as e:
        return {"ok": False, "error": str(e)}


def waterfall(url: str, timeout: float = 15.0) -> dict:
    """Break one request into network phases over a single socket:
    DNS -> TCP connect -> TLS handshake -> time to first byte."""
    phases: dict = {}
    parsed = urlparse(url)
    host = parsed.hostname
    if not host:
        return {"ok": False, "error": "no hostname in url", "phases": phases}
    port = parsed.port or (443 if parsed.scheme == "https" else 80)

    # 1. DNS
    t0 = time.perf_counter()
    try:
        ip = socket.getaddrinfo(host, port)[0][4][0]
    except Exception as e:
        return {"ok": False, "error": f"DNS failed: {e}", "phases": phases}
    phases["dns_ms"] = round((time.perf_counter() - t0) * 1000, 2)

    # 2. TCP connect
    t0 = time.perf_counter()
    try:
        sock = socket.create_connection((ip, port), timeout=timeout)
    except Exception as e:
        return {"ok": False, "error": f"TCP failed: {e}", "phases": phases}
    phases["tcp_ms"] = round((time.perf_counter() - t0) * 1000, 2)

    # 3. TLS handshake
    if parsed.scheme == "https":
        t0 = time.perf_counter()
        try:
            ctx = ssl.create_default_context()
            sock = ctx.wrap_socket(sock, server_hostname=host)
        except Exception as e:
            sock.close()
            return {"ok": False, "error": f"TLS failed: {e}", "phases": phases}
        phases["tls_ms"] = round((time.perf_counter() - t0) * 1000, 2)
    else:
        phases["tls_ms"] = 0.0

    # 4. TTFB — minimal GET over our own socket
    t0 = time.perf_counter()
    try:
        path = parsed.path or "/"
        if parsed.query:
            path += "?" + parsed.query
        req = (f"GET {path} HTTP/1.1\r\nHost: {host}\r\n"
               f"Connection: close\r\nUser-Agent: api-sentinel\r\n\r\n")
        sock.sendall(req.encode())
        first = sock.recv(1)
        phases["ttfb_ms"] = round((time.perf_counter() - t0) * 1000, 2)
        rest = sock.recv(4096)
        status_line = (first + rest).split(b"\r\n", 1)[0].decode(errors="ignore")
        parts = status_line.split()
        status_code = int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else None
    except Exception as e:
        sock.close()
        return {"ok": False, "error": f"HTTP failed: {e}", "phases": phases}
    finally:
        sock.close()

    phases["total_ms"] = round(sum(phases.values()), 2)
    return {"ok": True, "status_code": status_code, "phases": phases}

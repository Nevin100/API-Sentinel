import socket, ssl

def dns_lookup(host: str) -> dict:
    try:
        infos = socket.getaddrinfo(host, None)
        return {"ips": sorted({i[4][0] for i in infos})}
    except Exception as e:
        return {"ips": [], "error": str(e)}

def ssl_info(host: str, port: int = 443) -> dict:
    ctx = ssl.create_default_context()
    try:
        with socket.create_connection((host, port), timeout=10) as sock:
            with ctx.wrap_socket(sock, server_hostname=host) as ssock:
                cert = ssock.getpeercert()
                return {"ok": True,
                        "subject": dict(x[0] for x in cert.get("subject", [])),
                        "issuer": dict(x[0] for x in cert.get("issuer", [])),
                        "not_after": cert.get("notAfter"),
                        "tls_version": ssock.version(),
                        "cipher": ssock.cipher()[0]}
    except Exception as e:
        return {"ok": False, "error": str(e)}

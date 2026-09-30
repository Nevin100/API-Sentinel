import httpx

def send_discord_alert(webhook_url: str, endpoint_name: str, url: str,
                       failures: int, last_error: str | None) -> bool:
    """Post a downtime alert to a Discord webhook. Returns True if delivered."""
    if not webhook_url:
        return False
    payload = {
        "content": f"\U0001f6a8 API Sentinel alert: **{endpoint_name}** is DOWN",
        "embeds": [
            {
                "title": endpoint_name,
                "description": url,
                "color": 15158332,
                "fields": [
                    {"name": "Consecutive failures",
                     "value": str(failures), "inline": True},
                    {"name": "Last error",
                     "value": (last_error or "no response")[:500],
                     "inline": False},
                ],
            }
        ],
    }
    try:
        r = httpx.post(webhook_url, json=payload, timeout=10)
        return r.status_code in (200, 204)
    except Exception:
        return False

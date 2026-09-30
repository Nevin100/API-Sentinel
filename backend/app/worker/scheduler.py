from apscheduler.schedulers.background import BackgroundScheduler
from app.core.config import settings
from app.db.session import SessionLocal
from app.models.model import Endpoint, CheckResult
from app.services.sender import send_request
from app.services.alerts import send_discord_alert
from app.services.metrics import CHECKS_TOTAL, CHECK_LATENCY, ENDPOINT_UP

def run_checks():
    """Ping every active endpoint, store result, update metrics, alert on failures."""
    db = SessionLocal()
    try:
        endpoints = db.query(Endpoint).filter(Endpoint.is_active == True).all()
        for ep in endpoints:
            r = send_request(ep.method, ep.url, timeout=20)
            ok = r.get("ok") and (r.get("status_code") or 500) < 400
            db.add(CheckResult(
                endpoint_id=ep.id,
                status_code=r.get("status_code"),
                latency_ms=r.get("latency_ms"),
                ok=ok,
                error=r.get("error"),
            ))
            # prometheus metrics
            CHECKS_TOTAL.labels(endpoint_id=str(ep.id), ok=str(ok).lower()).inc()
            if r.get("latency_ms") is not None:
                CHECK_LATENCY.labels(endpoint_id=str(ep.id)).observe(r["latency_ms"] / 1000)
            ENDPOINT_UP.labels(endpoint_id=str(ep.id), name=ep.name).set(1 if ok else 0)
            # downtime alerting
            if ok:
                ep.consecutive_failures = 0
                ep.alert_sent = False
            else:
                ep.consecutive_failures = (ep.consecutive_failures or 0) + 1
                if (ep.consecutive_failures >= settings.alert_threshold
                        and not ep.alert_sent):
                    if send_discord_alert(settings.alert_webhook_url, ep.name,
                                          ep.url, ep.consecutive_failures,
                                          r.get("error")):
                        ep.alert_sent = True
            db.commit()
    finally:
        db.close()

def start_scheduler(interval_seconds: int = 300) -> BackgroundScheduler:
    sched = BackgroundScheduler()
    sched.add_job(run_checks, "interval", seconds=interval_seconds)
    sched.start()
    return sched

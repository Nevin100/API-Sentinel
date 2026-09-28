from apscheduler.schedulers.background import BackgroundScheduler
from app.db.session import SessionLocal
from app.models.model import Endpoint, CheckResult
from app.services.sender import send_request

def run_checks():
    db = SessionLocal()
    try:
        for ep in db.query(Endpoint).filter(Endpoint.is_active == True).all():
            r = send_request(ep.method, ep.url, timeout=20)
            db.add(CheckResult(
                endpoint_id=ep.id,
                status_code=r.get("status_code"),
                latency_ms=r.get("latency_ms"),
                ok=r.get("ok") and (r.get("status_code") or 500) < 400,
                error=r.get("error")))
        db.commit()
    finally:
        db.close()

def start_scheduler(interval_seconds: int = 300) -> BackgroundScheduler:
    sched = BackgroundScheduler()
    sched.add_job(run_checks, "interval", seconds=interval_seconds)
    sched.start()
    return sched

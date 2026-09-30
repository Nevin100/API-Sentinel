import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.model import Endpoint, CheckResult

router = APIRouter()


def _pct(ok: int, total: int) -> float:
    return round(ok / total * 100, 2) if total else 100.0


def _percentile(sorted_vals: list, p: float):
    if not sorted_vals:
        return None
    k = (len(sorted_vals) - 1) * p / 100
    f = int(k)
    c = min(f + 1, len(sorted_vals) - 1)
    return round(sorted_vals[f] + (sorted_vals[c] - sorted_vals[f]) * (k - f), 2)


def _latency_stats(rows) -> dict:
    lats = sorted(r.latency_ms for r in rows if r.latency_ms is not None)
    return {
        "avg": round(sum(lats) / len(lats), 2) if lats else None,
        "p50": _percentile(lats, 50),
        "p95": _percentile(lats, 95),
        "p99": _percentile(lats, 99),
        "max": lats[-1] if lats else None,
    }


@router.get("/endpoints/{endpoint_id}")
def endpoint_stats(endpoint_id: int, db: Session = Depends(get_db)):
    """Uptime % + latency percentiles for the 24h and 7d windows."""
    now = datetime.datetime.utcnow()
    out: dict = {}
    for label, hours in (("24h", 24), ("7d", 24 * 7)):
        since = now - datetime.timedelta(hours=hours)
        rows = (
            db.query(CheckResult)
            .filter(CheckResult.endpoint_id == endpoint_id,
                    CheckResult.checked_at >= since)
            .all()
        )
        ok_count = sum(1 for r in rows if r.ok)
        out[label] = {
            "uptime_pct": _pct(ok_count, len(rows)),
            "total_checks": len(rows),
            "failed_checks": len(rows) - ok_count,
            "latency_ms": _latency_stats(rows),
        }
    last = (
        db.query(CheckResult)
        .filter(CheckResult.endpoint_id == endpoint_id)
        .order_by(CheckResult.id.desc())
        .first()
    )
    out["last_check"] = (
        {"status_code": last.status_code, "latency_ms": last.latency_ms,
         "ok": last.ok, "checked_at": last.checked_at}
        if last else None
    )
    return out


@router.get("/endpoints/{endpoint_id}/daily")
def daily_uptime(endpoint_id: int, days: int = 30, db: Session = Depends(get_db)):
    """Per-day uptime buckets — feeds the heatmap."""
    since = datetime.datetime.utcnow() - datetime.timedelta(days=days)
    rows = (
        db.query(CheckResult)
        .filter(CheckResult.endpoint_id == endpoint_id,
                CheckResult.checked_at >= since)
        .all()
    )
    buckets: dict = {}
    for r in rows:
        day = r.checked_at.date().isoformat()
        b = buckets.setdefault(day, {"checks": 0, "failures": 0})
        b["checks"] += 1
        if not r.ok:
            b["failures"] += 1
    return [
        {"date": day, "checks": v["checks"], "failures": v["failures"],
         "uptime_pct": _pct(v["checks"] - v["failures"], v["checks"])}
        for day, v in sorted(buckets.items())
    ]


@router.get("/summary")
def summary(db: Session = Depends(get_db)):
    """Dashboard cards: every endpoint with last status + 24h uptime."""
    since = datetime.datetime.utcnow() - datetime.timedelta(hours=24)
    cards = []
    for ep in db.query(Endpoint).all():
        rows = (
            db.query(CheckResult)
            .filter(CheckResult.endpoint_id == ep.id,
                    CheckResult.checked_at >= since)
            .all()
        )
        ok_count = sum(1 for r in rows if r.ok)
        last = (
            db.query(CheckResult)
            .filter(CheckResult.endpoint_id == ep.id)
            .order_by(CheckResult.id.desc())
            .first()
        )
        cards.append({
            "id": ep.id, "name": ep.name, "url": ep.url,
            "is_active": ep.is_active,
            "uptime_24h_pct": _pct(ok_count, len(rows)),
            "last_ok": last.ok if last else None,
            "last_status": last.status_code if last else None,
            "last_latency_ms": last.latency_ms if last else None,
            "last_checked_at": last.checked_at if last else None,
        })
    return cards


@router.get("/failures")
def recent_failures(limit: int = 20, db: Session = Depends(get_db)):
    """Latest failed checks across all endpoints."""
    rows = (
        db.query(CheckResult, Endpoint.name)
        .join(Endpoint, CheckResult.endpoint_id == Endpoint.id)
        .filter(CheckResult.ok == False)
        .order_by(CheckResult.id.desc())
        .limit(limit)
        .all()
    )
    return [
        {"endpoint_id": r[0].endpoint_id, "endpoint_name": r[1],
         "status_code": r[0].status_code, "latency_ms": r[0].latency_ms,
         "error": r[0].error, "checked_at": r[0].checked_at}
        for r in rows
    ]

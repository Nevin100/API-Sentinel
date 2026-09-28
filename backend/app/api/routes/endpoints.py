from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.model import Endpoint, CheckResult

router = APIRouter()


class EndpointIn(BaseModel):
    name: str
    url: str
    method: str = "GET"
    interval_seconds: int = 300


@router.post("")
def create_endpoint(payload: EndpointIn, db: Session = Depends(get_db)):
    ep = Endpoint(**payload.model_dump())
    db.add(ep)
    db.commit()
    db.refresh(ep)
    return {"id": ep.id, "name": ep.name, "url": ep.url}


@router.get("")
def list_endpoints(db: Session = Depends(get_db)):
    return [
        {"id": e.id, "name": e.name, "url": e.url,
         "method": e.method, "is_active": e.is_active}
        for e in db.query(Endpoint).all()
    ]


@router.get("/{endpoint_id}/results")
def results(endpoint_id: int, limit: int = 100, db: Session = Depends(get_db)):
    rows = (
        db.query(CheckResult)
        .filter(CheckResult.endpoint_id == endpoint_id)
        .order_by(CheckResult.id.desc())
        .limit(limit)
        .all()
    )
    return [
        {"status_code": r.status_code, "latency_ms": r.latency_ms,
         "ok": r.ok, "checked_at": r.checked_at}
        for r in rows
    ]

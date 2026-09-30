from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.model import RequestLog
from app.services.sender import send_request
from app.services.metrics import REQUESTS_SENT

router = APIRouter()

class SendBody(BaseModel):
    method: str = "GET"
    url: str
    headers: dict = {}
    body: str | None = None


@router.post("/send")
def send(payload: SendBody, db: Session = Depends(get_db)):
    """Postman-lite: send a request, log it, return the response."""
    REQUESTS_SENT.inc()
    result = send_request(payload.method, payload.url, payload.headers, payload.body)
    db.add(RequestLog(
        method=payload.method,
        url=payload.url,
        status_code=result.get("status_code"),
        latency_ms=result.get("latency_ms"),
        response_size=result.get("size_bytes"),
        error=result.get("error"),
    ))
    db.commit()
    return result


@router.get("/logs")
def logs(limit: int = 50, db: Session = Depends(get_db)):
    rows = db.query(RequestLog).order_by(RequestLog.id.desc()).limit(limit).all()
    return [
        {"id": r.id, "method": r.method, "url": r.url,
         "status_code": r.status_code, "latency_ms": r.latency_ms,
         "created_at": r.created_at}
        for r in rows
    ]

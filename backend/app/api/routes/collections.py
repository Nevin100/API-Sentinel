import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.model import Collection, SavedRequest, Environment, RequestLog
from app.services.sender import send_request
from app.services.variables import load_variables, substitute, substitute_headers
from app.services.metrics import REQUESTS_SENT

router = APIRouter()


# ---------------- collections ----------------
class CollectionIn(BaseModel):
    name: str


@router.post("/collections")
def create_collection(payload: CollectionIn, db: Session = Depends(get_db)):
    c = Collection(name=payload.name)
    db.add(c)
    db.commit()
    db.refresh(c)
    return {"id": c.id, "name": c.name}


@router.get("/collections")
def list_collections(db: Session = Depends(get_db)):
    return [{"id": c.id, "name": c.name} for c in db.query(Collection).all()]


# ---------------- saved requests ----------------
class SavedRequestIn(BaseModel):
    name: str
    method: str = "GET"
    url: str
    headers: dict = {}
    body: str | None = None


@router.post("/collections/{collection_id}/requests")
def save_request(collection_id: int, payload: SavedRequestIn,
                 db: Session = Depends(get_db)):
    r = SavedRequest(
        collection_id=collection_id,
        name=payload.name,
        method=payload.method,
        url=payload.url,
        headers=json.dumps(payload.headers),
        body=payload.body,
    )
    db.add(r)
    db.commit()
    db.refresh(r)
    return {"id": r.id, "name": r.name}


@router.get("/collections/{collection_id}/requests")
def list_requests(collection_id: int, db: Session = Depends(get_db)):
    rows = (
        db.query(SavedRequest)
        .filter(SavedRequest.collection_id == collection_id)
        .all()
    )
    return [
        {"id": r.id, "name": r.name, "method": r.method, "url": r.url}
        for r in rows
    ]


@router.post("/requests/{request_id}/send")
def send_saved(request_id: int, db: Session = Depends(get_db)):
    """Send a saved request, resolving {{vars}} from the active environment."""
    r = db.query(SavedRequest).filter(SavedRequest.id == request_id).first()
    if not r:
        raise HTTPException(404, "saved request not found")
    env = db.query(Environment).filter(Environment.is_active == True).first()
    variables = load_variables(env) if env else {}
    url = substitute(r.url, variables)
    headers = substitute_headers(json.loads(r.headers or "{}"), variables)
    body = substitute(r.body, variables)
    REQUESTS_SENT.inc()
    result = send_request(r.method, url, headers, body)
    db.add(RequestLog(
        method=r.method,
        url=url,
        status_code=result.get("status_code"),
        latency_ms=result.get("latency_ms"),
        response_size=result.get("size_bytes"),
        error=result.get("error"),
    ))
    db.commit()
    return result


# ---------------- environments ----------------
class EnvironmentIn(BaseModel):
    name: str
    variables: dict = {}


@router.post("/environments")
def create_environment(payload: EnvironmentIn, db: Session = Depends(get_db)):
    e = Environment(name=payload.name, variables=json.dumps(payload.variables))
    db.add(e)
    db.commit()
    db.refresh(e)
    return {"id": e.id, "name": e.name}


@router.get("/environments")
def list_environments(db: Session = Depends(get_db)):
    return [
        {"id": e.id, "name": e.name, "is_active": e.is_active,
         "variables": json.loads(e.variables or "{}")}
        for e in db.query(Environment).all()
    ]


@router.post("/environments/{environment_id}/activate")
def activate_environment(environment_id: int, db: Session = Depends(get_db)):
    db.query(Environment).update({"is_active": False})
    e = db.query(Environment).filter(Environment.id == environment_id).first()
    if not e:
        raise HTTPException(404, "environment not found")
    e.is_active = True
    db.commit()
    return {"id": e.id, "name": e.name, "is_active": True}

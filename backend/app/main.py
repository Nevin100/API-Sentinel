from contextlib import asynccontextmanager
from fastapi import Depends, FastAPI, Request
from fastapi.responses import PlainTextResponse
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from app.core.config import settings
from app.db.session import Base, engine
from app.worker.scheduler import start_scheduler
from app.api.routes import endpoints, requests, inspect, collections, stats, system, auth
from app.api.routes.auth import get_current_user
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    sched = start_scheduler(settings.check_interval_seconds)
    yield
    sched.shutdown()

app = FastAPI(title="API Sentinel", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    resp = await call_next(request)
    resp.headers["X-Content-Type-Options"] = "nosniff"
    resp.headers["X-Frame-Options"] = "DENY"
    resp.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return resp

# Auth routes are public; everything under /api/* needs auth (cookie or Bearer).
app.include_router(auth.router, prefix="/auth", tags=["auth"])

authed = [Depends(get_current_user)]
app.include_router(endpoints.router, prefix="/api/endpoints", tags=["endpoints"], dependencies=authed)
app.include_router(requests.router, prefix="/api/requests", tags=["requests"], dependencies=authed)
app.include_router(inspect.router, prefix="/api/inspect", tags=["inspect"], dependencies=authed)
app.include_router(collections.router, prefix="/api", tags=["collections"], dependencies=authed)
app.include_router(stats.router, prefix="/api/stats", tags=["stats"], dependencies=authed)
app.include_router(system.router, prefix="/api/system", tags=["system"], dependencies=authed)

@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/metrics")
def metrics():
    return PlainTextResponse(generate_latest(), media_type=CONTENT_TYPE_LATEST)

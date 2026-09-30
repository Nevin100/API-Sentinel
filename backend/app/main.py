from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.core.config import settings
from app.db.session import Base, engine
from app.api.routes import endpoints, requests, inspect, collections
from app.worker.scheduler import start_scheduler

Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    sched = start_scheduler(settings.check_interval_seconds)
    yield
    sched.shutdown()

app = FastAPI(title="API Sentinel", lifespan=lifespan)

app.include_router(endpoints.router, prefix="/api/endpoints", tags=["endpoints"])
app.include_router(requests.router, prefix="/api/requests", tags=["requests"])
app.include_router(inspect.router, prefix="/api/inspect", tags=["inspect"])
app.include_router(collections.router, prefix="/api", tags=["collections"])

@app.get("/health")
def health():
    return {"status": "ok"}

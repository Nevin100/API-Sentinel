import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text
from app.db.session import Base


class Endpoint(Base):
    """Monitored API endpoint (health checks run against this)."""
    __tablename__ = "endpoints"

    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    url = Column(String(2000), nullable=False)
    method = Column(String(10), default="GET")
    interval_seconds = Column(Integer, default=300)
    is_active = Column(Boolean, default=True)
    consecutive_failures = Column(Integer, default=0)
    alert_sent = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class CheckResult(Base):
    """One health-check run result."""
    __tablename__ = "check_results"

    id = Column(Integer, primary_key=True)
    endpoint_id = Column(Integer, nullable=False, index=True)
    status_code = Column(Integer, nullable=True)
    latency_ms = Column(Float, nullable=True)
    ok = Column(Boolean, default=False)
    error = Column(Text, nullable=True)
    checked_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)


class RequestLog(Base):
    """Log of every manual request sent via the tester."""
    __tablename__ = "request_logs"

    id = Column(Integer, primary_key=True)
    method = Column(String(10))
    url = Column(String(2000))
    status_code = Column(Integer, nullable=True)
    latency_ms = Column(Float, nullable=True)
    response_size = Column(Integer, nullable=True)
    error = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)


class Collection(Base):
    """Folder of saved requests (Postman collection)."""
    __tablename__ = "collections"

    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class SavedRequest(Base):
    """One saved request inside a collection."""
    __tablename__ = "saved_requests"

    id = Column(Integer, primary_key=True)
    collection_id = Column(Integer, nullable=False, index=True)
    name = Column(String(200), nullable=False)
    method = Column(String(10), default="GET")
    url = Column(String(2000), nullable=False)
    headers = Column(Text, default="{}")  # JSON dict
    body = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Environment(Base):
    """Variable set, e.g. dev/staging/prod. One active at a time."""
    __tablename__ = "environments"

    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    variables = Column(Text, default="{}")  # JSON dict
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

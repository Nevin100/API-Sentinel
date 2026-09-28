import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text
from app.db.session import Base

class Endpoint(Base):
    __tablename__ = "endpoints"
    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    url = Column(String(2000), nullable=False)
    method = Column(String(10), default="GET")
    interval_seconds = Column(Integer, default=300)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class CheckResult(Base):
    __tablename__ = "check_results"
    id = Column(Integer, primary_key=True)
    endpoint_id = Column(Integer, nullable=False, index=True)
    status_code = Column(Integer, nullable=True)
    latency_ms = Column(Float, nullable=True)
    ok = Column(Boolean, default=False)
    error = Column(Text, nullable=True)
    checked_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

class RequestLog(Base):
    __tablename__ = "request_logs"
    id = Column(Integer, primary_key=True)
    method = Column(String(10))
    url = Column(String(2000))
    status_code = Column(Integer, nullable=True)
    latency_ms = Column(Float, nullable=True)
    response_size = Column(Integer, nullable=True)
    error = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

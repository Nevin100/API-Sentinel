import datetime
from sqlalchemy import Column, Integer, String, DateTime
from app.db.session import Base


class User(Base):
    """App user (email + password auth)."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.services import auth as auth_svc

router = APIRouter()
bearer = HTTPBearer(auto_error=False)


class SignupIn(BaseModel):
    name: str
    email: str
    password: str


class LoginIn(BaseModel):
    email: str
    password: str


def _out(u: User) -> dict:
    return {
        "id": u.id,
        "name": u.name,
        "email": u.email,
        "created_at": u.created_at.isoformat() if u.created_at else None,
    }


@router.post("/signup")
def signup(payload: SignupIn, db: Session = Depends(get_db)):
    name = payload.name.strip()
    email = payload.email.lower().strip()
    if not name or "@" not in email or len(payload.password) < 6:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Name, a valid email and a 6+ character password are required",
        )
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Email already registered")
    u = User(
        name=name, email=email, password_hash=auth_svc.hash_password(payload.password)
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    return {"token": auth_svc.create_token(u.id), "user": _out(u)}


@router.post("/login")
def login(payload: LoginIn, db: Session = Depends(get_db)):
    u = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    if not u or not auth_svc.verify_password(payload.password, u.password_hash):
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED, "Invalid email or password"
        )
    return {"token": auth_svc.create_token(u.id), "user": _out(u)}


def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(bearer),
    db: Session = Depends(get_db),
) -> User:
    if creds is None or creds.scheme.lower() != "bearer":
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")
    uid = auth_svc.decode_token(creds.credentials)
    u = db.query(User).get(uid) if uid else None
    if u is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token")
    return u


@router.get("/me")
def me(user: User = Depends(get_current_user)):
    return _out(user)

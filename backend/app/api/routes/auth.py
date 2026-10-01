from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.config import settings
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


def _authed_response(user_out: dict, token: str) -> JSONResponse:
    """Token goes into an httpOnly cookie — JS can never read it."""
    resp = JSONResponse({"user": user_out})
    resp.set_cookie(
        key=settings.cookie_name,
        value=token,
        max_age=settings.jwt_expire_days * 86400,
        httponly=True,
        samesite=settings.cookie_samesite,
        secure=settings.cookie_secure,
        path="/",
    )
    return resp


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
    return _authed_response(_out(u), auth_svc.create_token(u.id))


@router.post("/login")
def login(payload: LoginIn, db: Session = Depends(get_db)):
    u = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    if not u or not auth_svc.verify_password(payload.password, u.password_hash):
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED, "Invalid email or password"
        )
    return _authed_response(_out(u), auth_svc.create_token(u.id))


@router.post("/logout")
def logout():
    resp = JSONResponse({"ok": True})
    resp.delete_cookie(key=settings.cookie_name, path="/")
    return resp


def get_current_user(
    request: Request,
    creds: HTTPAuthorizationCredentials = Depends(bearer),
    db: Session = Depends(get_db),
) -> User:
    # Cookie first (browser flow); Bearer fallback (scripts/API clients)
    token = request.cookies.get(settings.cookie_name)
    if not token and creds is not None and creds.scheme.lower() == "bearer":
        token = creds.credentials
    uid = auth_svc.decode_token(token) if token else None
    u = db.query(User).get(uid) if uid else None
    if u is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")
    return u


@router.get("/me")
def me(user: User = Depends(get_current_user)):
    return _out(user)

from datetime import timedelta

from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException
from jose import JWTError, jwt
from pydantic import BaseModel

from config import get_settings
from dependencies import ALGORITHM, create_access_token, create_refresh_token, hash_password, verify_password
from models.user import User
from schemas.user import TokenPair, UserCreate, UserLogin, UserRead


router = APIRouter(prefix="/api/auth", tags=["auth"])


class RefreshRequest(BaseModel):
    refresh_token: str


def token_pair(user: User) -> TokenPair:
    user_id = str(user.id)
    return TokenPair(
        access_token=create_access_token(user_id),
        refresh_token=create_refresh_token(user_id),
        user=UserRead.model_validate(user),
    )


@router.post("/signup", response_model=TokenPair)
async def signup(payload: UserCreate):
    if await User.find_one(User.email == payload.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    if await User.find_one(User.username == payload.username):
        raise HTTPException(status_code=400, detail="Username already taken")
    user = User(
        email=payload.email,
        username=payload.username,
        hashed_password=hash_password(payload.password),
        role=payload.role,
    )
    await user.insert()
    return token_pair(user)


@router.post("/login", response_model=TokenPair)
async def login(payload: UserLogin):
    user = await User.find_one(User.email == payload.email)
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return token_pair(user)


@router.post("/refresh", response_model=TokenPair)
async def refresh(payload: RefreshRequest):
    settings = get_settings()
    try:
        claims = jwt.decode(payload.refresh_token, settings.secret_key, algorithms=[ALGORITHM])
        if claims.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid refresh token")
        user = await User.get(PydanticObjectId(claims["sub"]))
    except (JWTError, KeyError, ValueError) as exc:
        raise HTTPException(status_code=401, detail="Invalid refresh token") from exc
    if not user:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    return token_pair(user)

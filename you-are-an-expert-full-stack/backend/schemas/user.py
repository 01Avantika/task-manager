from datetime import datetime
from typing import Literal, Optional

from beanie import PydanticObjectId
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(min_length=2, max_length=40)
    password: str = Field(min_length=6, max_length=72)
    role: Literal["admin", "member"] = "member"


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=72)


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(default=None, min_length=2, max_length=40)
    password: Optional[str] = Field(default=None, min_length=6, max_length=72)


class UserRoleUpdate(BaseModel):
    role: Literal["admin", "member"]


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: PydanticObjectId = Field(alias="_id")
    email: EmailStr
    username: str
    role: Literal["admin", "member"]
    created_at: datetime


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: Optional[UserRead] = None

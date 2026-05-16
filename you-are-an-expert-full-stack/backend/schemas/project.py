from datetime import datetime
from typing import List, Optional

from beanie import PydanticObjectId
from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator


class ProjectCreate(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    description: str = ""


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=80)
    description: Optional[str] = None


class ProjectMemberAdd(BaseModel):
    user_id: Optional[PydanticObjectId] = None
    email: Optional[EmailStr] = None
    username: Optional[str] = None

    @model_validator(mode="after")
    def has_identifier(self):
        if not self.user_id and not self.email and not self.username:
            raise ValueError("Provide user_id, email, or username")
        return self


class ProjectRead(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: PydanticObjectId = Field(alias="_id")
    name: str
    description: str
    owner_id: PydanticObjectId
    member_ids: List[PydanticObjectId]
    admin_ids: List[PydanticObjectId] = Field(default_factory=list)
    created_at: datetime
    owner_username: Optional[str] = None
    task_count: int = 0

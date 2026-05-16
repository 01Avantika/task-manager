from datetime import datetime

from beanie import PydanticObjectId
from pydantic import BaseModel, ConfigDict, Field, field_validator


class CommentCreate(BaseModel):
    body: str

    @field_validator("body")
    @classmethod
    def body_not_empty(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("comment body cannot be empty")
        return value.strip()


class CommentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: PydanticObjectId = Field(alias="_id")
    body: str
    task_id: PydanticObjectId
    author_id: PydanticObjectId
    author_username: str | None = None
    created_at: datetime

from datetime import datetime, timezone
from typing import Literal, Optional

from beanie import PydanticObjectId
from pydantic import BaseModel, ConfigDict, Field, field_validator


class TaskCreate(BaseModel):
    title: str = Field(min_length=2, max_length=120)
    description: str = ""
    assigned_to: Optional[PydanticObjectId] = None
    status: Literal["todo", "in_progress", "done"] = "todo"
    priority: Literal["low", "medium", "high"] = "medium"
    due_date: Optional[datetime] = None

    @field_validator("due_date")
    @classmethod
    def due_date_not_past(cls, value: Optional[datetime]) -> Optional[datetime]:
        if value and value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        if value and value < datetime.now(timezone.utc):
            raise ValueError("due_date cannot be in past")
        return value


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=2, max_length=120)
    description: Optional[str] = None
    assigned_to: Optional[PydanticObjectId] = None
    status: Optional[Literal["todo", "in_progress", "done"]] = None
    priority: Optional[Literal["low", "medium", "high"]] = None
    due_date: Optional[datetime] = None

    @field_validator("due_date")
    @classmethod
    def due_date_not_past(cls, value: Optional[datetime]) -> Optional[datetime]:
        if value and value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        if value and value < datetime.now(timezone.utc):
            raise ValueError("due_date cannot be in past")
        return value


class TaskRead(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: PydanticObjectId = Field(alias="_id")
    title: str
    description: str
    project_id: PydanticObjectId
    assigned_to: Optional[PydanticObjectId]
    status: Literal["todo", "in_progress", "done"]
    priority: Literal["low", "medium", "high"]
    due_date: Optional[datetime]
    created_by: PydanticObjectId
    created_at: datetime
    updated_at: datetime

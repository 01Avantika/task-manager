from datetime import datetime, timezone
from typing import Literal, Optional

from beanie import Document, PydanticObjectId
from pydantic import Field


class Task(Document):
    title: str
    description: str = ""
    project_id: PydanticObjectId
    assigned_to: Optional[PydanticObjectId] = None
    status: Literal["todo", "in_progress", "done"] = "todo"
    priority: Literal["low", "medium", "high"] = "medium"
    due_date: Optional[datetime] = None
    created_by: PydanticObjectId
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "tasks"

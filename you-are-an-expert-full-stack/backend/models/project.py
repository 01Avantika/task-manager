from datetime import datetime, timezone
from typing import List

from beanie import Document, PydanticObjectId
from pydantic import Field


class Project(Document):
    name: str
    description: str = ""
    owner_id: PydanticObjectId
    member_ids: List[PydanticObjectId] = Field(default_factory=list)
    admin_ids: List[PydanticObjectId] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "projects"

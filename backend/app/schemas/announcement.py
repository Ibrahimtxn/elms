from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class AnnouncementCreate(BaseModel):
    title: str
    content: str


class AnnouncementOut(BaseModel):
    id: int
    class_id: Optional[int]
    posted_by: int
    title: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True
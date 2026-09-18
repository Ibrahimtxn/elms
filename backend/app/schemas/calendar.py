from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator

from app.models.enums import EventType


class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    event_type: EventType
    start_time: datetime
    end_time: datetime

    @field_validator("end_time")
    @classmethod
    def end_after_start(cls, v: datetime, info):
        start = info.data.get("start_time")
        if start and v <= start:
            raise ValueError("end_time must be after start_time.")
        return v


class EventOut(BaseModel):
    id: int
    class_id: Optional[int]
    created_by: int
    title: str
    description: Optional[str]
    event_type: EventType
    start_time: datetime
    end_time: datetime

    class Config:
        from_attributes = True
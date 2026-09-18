from datetime import datetime
from typing import Optional
from pydantic import BaseModel

from app.models.enums import NotificationType


class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    notification_type: NotificationType
    related_entity_type: Optional[str]
    related_entity_id: Optional[int]
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
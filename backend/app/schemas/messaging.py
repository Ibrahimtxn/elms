from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class ConversationCreate(BaseModel):
    participant_ids: List[int]
    title: Optional[str] = None


class ConversationOut(BaseModel):
    id: int
    title: Optional[str]
    is_group: bool
    created_at: datetime

    class Config:
        from_attributes = True


class MessageCreate(BaseModel):
    content: str


class MessageOut(BaseModel):
    id: int
    conversation_id: int
    sender_id: int
    content: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
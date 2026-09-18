from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class MaterialOut(BaseModel):
    id: int
    class_id: int
    uploaded_by: int
    title: str
    description: Optional[str]
    file_path: str
    created_at: datetime

    class Config:
        from_attributes = True
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class SaveMaterialToBackpack(BaseModel):
    material_id: int
    title: Optional[str] = None  # defaults to the material's own title if omitted


class BackpackItemOut(BaseModel):
    id: int
    user_id: int
    material_id: Optional[int]
    title: str
    file_path: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
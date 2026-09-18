from datetime import datetime
from typing import Optional
from pydantic import BaseModel

from app.models.enums import EnrollmentStatus


class EnrollmentCreate(BaseModel):
    class_id: int


class AdminEnrollmentCreate(BaseModel):
    student_id: int
    class_id: int
    is_carryover: bool = False


class EnrollmentStatusUpdate(BaseModel):
    status: EnrollmentStatus


class EnrollmentOut(BaseModel):
    id: int
    student_id: int
    class_id: int
    status: EnrollmentStatus
    is_carryover: bool
    enrolled_at: datetime

class Config:
    from_attributes = True

class RosterEntryOut(BaseModel):
    enrollment_id: int
    student_id: int
    student_name: str
    student_email: str
    status: EnrollmentStatus
    is_carryover: bool
    enrolled_at: datetime
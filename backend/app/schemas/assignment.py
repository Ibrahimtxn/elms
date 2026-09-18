from datetime import datetime
from typing import Optional
from pydantic import BaseModel

from app.models.enums import SubmissionStatus


class AssignmentCreate(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: datetime
    max_score: int = 100


class AssignmentOut(BaseModel):
    id: int
    class_id: int
    created_by: int
    title: str
    description: Optional[str]
    due_date: datetime
    max_score: int

    class Config:
        from_attributes = True


class SubmissionOut(BaseModel):
    id: int
    assignment_id: int
    student_id: int
    file_path: str
    score: Optional[int]
    feedback: Optional[str]
    status: SubmissionStatus
    submitted_at: datetime

    class Config:
        from_attributes = True


class GradeSubmission(BaseModel):
    score: int
    feedback: Optional[str] = None
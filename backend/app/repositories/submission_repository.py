from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.content import Submission


class SubmissionRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, submission_id: int) -> Optional[Submission]:
        return self.db.query(Submission).filter(Submission.id == submission_id).first()

    def get_by_assignment_and_student(self, assignment_id: int, student_id: int) -> Optional[Submission]:
        return (
            self.db.query(Submission)
            .filter(Submission.assignment_id == assignment_id, Submission.student_id == student_id)
            .first()
        )

    def list_for_assignment(self, assignment_id: int) -> List[Submission]:
        return self.db.query(Submission).filter(Submission.assignment_id == assignment_id).all()

    def create(self, submission: Submission) -> Submission:
        self.db.add(submission)
        self.db.commit()
        self.db.refresh(submission)
        return submission

    def save(self, submission: Submission) -> Submission:
        self.db.commit()
        self.db.refresh(submission)
        return submission
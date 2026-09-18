from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.content import Assignment


class AssignmentRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, assignment_id: int) -> Optional[Assignment]:
        return self.db.query(Assignment).filter(Assignment.id == assignment_id).first()

    def list_for_class(self, class_id: int) -> List[Assignment]:
        return self.db.query(Assignment).filter(Assignment.class_id == class_id).all()

    def create(self, assignment: Assignment) -> Assignment:
        self.db.add(assignment)
        self.db.commit()
        self.db.refresh(assignment)
        return assignment
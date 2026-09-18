from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.enrollment import Enrollment


class EnrollmentRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, enrollment_id: int) -> Optional[Enrollment]:
        return self.db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()
    
    def get_by_student_and_class(self, student_id: int, class_id: int) -> Optional[Enrollment]:
        return (
            self.db.query(Enrollment)
            .filter(Enrollment.student_id == student_id, Enrollment.class_id == class_id)
            .first()
        )

    def list_for_student(self, student_id: int) -> List[Enrollment]:
        return self.db.query(Enrollment).filter(Enrollment.student_id == student_id).all()

    def list_for_class(self, class_id: int) -> List[Enrollment]:
        return self.db.query(Enrollment).filter(Enrollment.class_id == class_id).all()

    def create(self, enrollment: Enrollment) -> Enrollment:
        self.db.add(enrollment)
        self.db.commit()
        self.db.refresh(enrollment)
        return enrollment

    def save(self, enrollment: Enrollment) -> Enrollment:
        self.db.commit()
        self.db.refresh(enrollment)
        return enrollment
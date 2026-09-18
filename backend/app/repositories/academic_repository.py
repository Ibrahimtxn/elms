from typing import List, Optional, Type, TypeVar
from sqlalchemy.orm import Session

from app.models.academic import Department, Level, AcademicYear, Course, Class

ModelT = TypeVar("ModelT")


class _BaseRepo:
    """Small generic CRUD helper shared by the academic-entity repositories."""

    model: Type[ModelT]

    def __init__(self, db: Session):
        self.db = db

    def list_all(self) -> List[ModelT]:
        return self.db.query(self.model).all()

    def get(self, id_: int) -> Optional[ModelT]:
        return self.db.query(self.model).filter(self.model.id == id_).first()

    def create(self, instance: ModelT) -> ModelT:
        self.db.add(instance)
        self.db.commit()
        self.db.refresh(instance)
        return instance

    def delete(self, instance: ModelT) -> None:
        self.db.delete(instance)
        self.db.commit()

    
    def save(self, instance: ModelT) -> ModelT:
        self.db.commit()
        self.db.refresh(instance)
        return instance


class DepartmentRepository(_BaseRepo):
    model = Department

    def get_by_code(self, code: str) -> Optional[Department]:
        return self.db.query(Department).filter(Department.code == code).first()


class LevelRepository(_BaseRepo):
    model = Level


class AcademicYearRepository(_BaseRepo):
    model = AcademicYear


class CourseRepository(_BaseRepo):
    model = Course

    def get_by_code(self, code: str) -> Optional[Course]:
        return self.db.query(Course).filter(Course.code == code).first()


class ClassRepository(_BaseRepo):
    model = Class
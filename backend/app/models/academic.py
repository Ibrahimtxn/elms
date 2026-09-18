from typing import List, Optional
from datetime import date
from sqlalchemy import String, Integer, ForeignKey, UniqueConstraint, Date, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin


class Department(Base, TimestampMixin):
    __tablename__ = "departments"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(150), unique=True, nullable=False)
    code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False, index=True)

    users: Mapped[List["User"]] = relationship(back_populates="department")
    courses: Mapped[List["Course"]] = relationship(back_populates="department")


class Level(Base, TimestampMixin):
    __tablename__ = "levels"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)  # "100", "200"...
    ordering: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    courses: Mapped[List["Course"]] = relationship(back_populates="level")
    classes: Mapped[List["Class"]] = relationship(back_populates="level")


class AcademicYear(Base, TimestampMixin):
    __tablename__ = "academic_years"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)  # "2025/2026"
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    is_current: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    classes: Mapped[List["Class"]] = relationship(back_populates="academic_year")


class Course(Base, TimestampMixin):
    __tablename__ = "courses"
    __table_args__ = (UniqueConstraint("code", name="uq_course_code"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(2000), nullable=True)
    credit_units: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    department_id: Mapped[int] = mapped_column(ForeignKey("departments.id"), nullable=False, index=True)
    level_id: Mapped[int] = mapped_column(ForeignKey("levels.id"), nullable=False, index=True)

    department: Mapped["Department"] = relationship(back_populates="courses")
    level: Mapped["Level"] = relationship(back_populates="courses")
    classes: Mapped[List["Class"]] = relationship(back_populates="course")


class Class(Base, TimestampMixin):
    """A specific offering of a Course in a given academic year/level, taught by one lecturer."""
    __tablename__ = "classes"
    __table_args__ = (
        UniqueConstraint("course_id", "academic_year_id", "level_id", name="uq_class_offering"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    course_id: Mapped[int] = mapped_column(ForeignKey("courses.id"), nullable=False, index=True)
    academic_year_id: Mapped[int] = mapped_column(ForeignKey("academic_years.id"), nullable=False, index=True)
    level_id: Mapped[int] = mapped_column(ForeignKey("levels.id"), nullable=False, index=True)
    lecturer_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    course: Mapped["Course"] = relationship(back_populates="classes")
    academic_year: Mapped["AcademicYear"] = relationship(back_populates="classes")
    level: Mapped["Level"] = relationship(back_populates="classes")
    lecturer: Mapped[Optional["User"]] = relationship(foreign_keys=[lecturer_id])
    enrollments: Mapped[List["Enrollment"]] = relationship(back_populates="klass")
    materials: Mapped[List["Material"]] = relationship(back_populates="klass")
    assignments: Mapped[List["Assignment"]] = relationship(back_populates="klass")
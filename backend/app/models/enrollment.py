from sqlalchemy import ForeignKey, UniqueConstraint, Enum, DateTime, Boolean, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime

from app.db.base import Base
from app.models.mixins import TimestampMixin
from app.models.enums import EnrollmentStatus


class Enrollment(Base, TimestampMixin):
    __tablename__ = "enrollments"
    __table_args__ = (UniqueConstraint("student_id", "class_id", name="uq_student_class"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    class_id: Mapped[int] = mapped_column(ForeignKey("classes.id"), nullable=False, index=True)
    status: Mapped[EnrollmentStatus] = mapped_column(
        Enum(EnrollmentStatus, name="enrollment_status"),
        default=EnrollmentStatus.ACTIVE,
        nullable=False,
    )
    enrolled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    is_carryover: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    student: Mapped["User"] = relationship(foreign_keys=[student_id])
    klass: Mapped["Class"] = relationship(back_populates="enrollments")
from app.core.errors import ConflictError, NotFoundError, PermissionDeniedError
from app.models.enrollment import Enrollment
from app.models.enums import EnrollmentStatus
from app.repositories.academic_repository import ClassRepository
from app.repositories.enrollment_repository import EnrollmentRepository
from app.schemas.enrollment import EnrollmentCreate, AdminEnrollmentCreate


class EnrollmentService:
    def __init__(self, enrollments: EnrollmentRepository, classes: ClassRepository):
        self.enrollments = enrollments
        self.classes = classes

    def enroll_student(self, student_id: int, data: EnrollmentCreate) -> Enrollment:
        klass = self.classes.get(data.class_id)
        if not klass:
            raise NotFoundError("Class not found.")
        if not klass.is_active:
            raise ConflictError("This class is not currently active.")

        existing = self.enrollments.get_by_student_and_class(student_id, data.class_id)
        if existing and existing.status == EnrollmentStatus.ACTIVE:
            raise ConflictError("You are already enrolled in this class.")

        return self.enrollments.create(Enrollment(student_id=student_id, class_id=data.class_id))

    def drop(self, student_id: int, enrollment_id: int) -> Enrollment:
        enrollment = self.enrollments.get(enrollment_id)
        if not enrollment:
            raise NotFoundError("Enrollment not found.")
        if enrollment.student_id != student_id:
            raise PermissionDeniedError("This enrollment does not belong to you.")
        if enrollment.status != EnrollmentStatus.ACTIVE:
            raise ConflictError("Only active enrollments can be dropped.")

        enrollment.status = EnrollmentStatus.DROPPED
        return self.enrollments.save(enrollment)

    # --- Admin management ---
    def admin_enroll(self, data: AdminEnrollmentCreate) -> Enrollment:
        klass = self.classes.get(data.class_id)
        if not klass:
            raise NotFoundError("Class not found.")

        existing = self.enrollments.get_by_student_and_class(data.student_id, data.class_id)
        if existing and existing.status == EnrollmentStatus.ACTIVE:
            raise ConflictError("This student is already actively enrolled in this class.")

        return self.enrollments.create(
            Enrollment(
                student_id=data.student_id,
                class_id=data.class_id,
                is_carryover=data.is_carryover,
            )
        )

    def admin_update_status(self, enrollment_id: int, status: EnrollmentStatus) -> Enrollment:
        enrollment = self.enrollments.get(enrollment_id)
        if not enrollment:
            raise NotFoundError("Enrollment not found.")
        enrollment.status = status
        return self.enrollments.save(enrollment)

    def list_history_for_student(self, student_id: int) -> list[Enrollment]:
        return self.enrollments.list_for_student(student_id)
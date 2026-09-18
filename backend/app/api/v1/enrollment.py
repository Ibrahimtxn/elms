from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.db.session import get_db
from app.models.enums import UserRole
from app.models.user import User
from app.repositories.academic_repository import ClassRepository
from app.repositories.enrollment_repository import EnrollmentRepository
from app.schemas.enrollment import (
    EnrollmentCreate,
    EnrollmentOut,
    AdminEnrollmentCreate,
    EnrollmentStatusUpdate,
    RosterEntryOut,
)
from app.services.enrollment_service import EnrollmentService

router = APIRouter()
admin_only = require_roles(UserRole.ADMIN)


def get_enrollment_service(db: Session = Depends(get_db)) -> EnrollmentService:
    return EnrollmentService(EnrollmentRepository(db), ClassRepository(db))


@router.post(
    "/enrollments",
    response_model=EnrollmentOut,
    status_code=201,
    dependencies=[Depends(require_roles(UserRole.STUDENT))],
)
def enroll(
    data: EnrollmentCreate,
    current_user: User = Depends(get_current_user),
    service: EnrollmentService = Depends(get_enrollment_service),
):
    return service.enroll_student(current_user.id, data)


@router.patch(
    "/enrollments/{enrollment_id}/drop",
    response_model=EnrollmentOut,
    dependencies=[Depends(require_roles(UserRole.STUDENT))],
)
def drop_enrollment(
    enrollment_id: int,
    current_user: User = Depends(get_current_user),
    service: EnrollmentService = Depends(get_enrollment_service),
):
    return service.drop(current_user.id, enrollment_id)


@router.get("/enrollments/me", response_model=list[EnrollmentOut])
def my_enrollments(
    current_user: User = Depends(get_current_user),
    service: EnrollmentService = Depends(get_enrollment_service),
):
    return service.enrollments.list_for_student(current_user.id)


@router.get(
    "/classes/{class_id}/roster",
    response_model=list[RosterEntryOut],
    dependencies=[Depends(require_roles(UserRole.ADMIN, UserRole.LECTURER))],
)
def class_roster(
    class_id: int,
    service: EnrollmentService = Depends(get_enrollment_service),
    db: Session = Depends(get_db),
):
    from app.repositories.user_repository import UserRepository

    users = UserRepository(db)
    entries = service.enrollments.list_for_class(class_id)
    result = []
    for e in entries:
        student = users.get_by_id(e.student_id)
        result.append(
            RosterEntryOut(
                enrollment_id=e.id,
                student_id=e.student_id,
                student_name=f"{student.first_name} {student.last_name}" if student else "Unknown",
                student_email=student.email if student else "",
                status=e.status,
                is_carryover=e.is_carryover,
                enrolled_at=e.enrolled_at,
            )
        )
    return result

# --- Admin-only enrollment management ---
@router.post(
    "/admin/enrollments", response_model=EnrollmentOut, status_code=201, dependencies=[Depends(admin_only)]
)
def admin_enroll(data: AdminEnrollmentCreate, service: EnrollmentService = Depends(get_enrollment_service)):
    return service.admin_enroll(data)


@router.patch(
    "/admin/enrollments/{enrollment_id}/status",
    response_model=EnrollmentOut,
    dependencies=[Depends(admin_only)],
)
def admin_update_enrollment_status(
    enrollment_id: int, data: EnrollmentStatusUpdate, service: EnrollmentService = Depends(get_enrollment_service)
):
    return service.admin_update_status(enrollment_id, data.status)


@router.get(
    "/admin/students/{student_id}/enrollments",
    response_model=list[EnrollmentOut],
    dependencies=[Depends(admin_only)],
)
def admin_student_history(student_id: int, service: EnrollmentService = Depends(get_enrollment_service)):
    return service.list_history_for_student(student_id)
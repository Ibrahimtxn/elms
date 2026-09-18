from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.errors import NotFoundError
from app.db.session import get_db
from app.models.user import User
from app.repositories.academic_repository import ClassRepository
from app.repositories.assignment_repository import AssignmentRepository
from app.repositories.enrollment_repository import EnrollmentRepository
from app.repositories.submission_repository import SubmissionRepository
from app.schemas.assignment import AssignmentCreate, AssignmentOut, SubmissionOut, GradeSubmission
from app.services.assignment_service import AssignmentService

router = APIRouter()


def get_assignment_service(db: Session = Depends(get_db)) -> AssignmentService:
    return AssignmentService(
        AssignmentRepository(db),
        SubmissionRepository(db),
        ClassRepository(db),
        EnrollmentRepository(db),
    )


@router.post("/classes/{class_id}/assignments", response_model=AssignmentOut, status_code=201)
def create_assignment(
    class_id: int,
    data: AssignmentCreate,
    current_user: User = Depends(get_current_user),
    service: AssignmentService = Depends(get_assignment_service),
):
    return service.create_assignment(current_user, class_id, data)


@router.get("/classes/{class_id}/assignments", response_model=list[AssignmentOut])
def list_assignments(
    class_id: int,
    current_user: User = Depends(get_current_user),
    service: AssignmentService = Depends(get_assignment_service),
):
    return service.list_assignments(current_user, class_id)


@router.post("/assignments/{assignment_id}/submissions", response_model=SubmissionOut, status_code=201)
def submit_assignment(
    assignment_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    service: AssignmentService = Depends(get_assignment_service),
):
    return service.submit(current_user, assignment_id, file)


@router.get("/assignments/{assignment_id}/submissions", response_model=list[SubmissionOut])
def list_submissions(
    assignment_id: int,
    current_user: User = Depends(get_current_user),
    service: AssignmentService = Depends(get_assignment_service),
):
    return service.list_submissions(current_user, assignment_id)


@router.get("/assignments/{assignment_id}/submissions/me", response_model=SubmissionOut)
def my_submission(
    assignment_id: int,
    current_user: User = Depends(get_current_user),
    service: AssignmentService = Depends(get_assignment_service),
):
    submission = service.my_submission(current_user, assignment_id)
    if not submission:
        raise NotFoundError("You have not submitted this assignment yet.")
    return submission


@router.patch("/submissions/{submission_id}/grade", response_model=SubmissionOut)
def grade_submission(
    submission_id: int,
    data: GradeSubmission,
    current_user: User = Depends(get_current_user),
    service: AssignmentService = Depends(get_assignment_service),
):
    return service.grade(current_user, submission_id, data)
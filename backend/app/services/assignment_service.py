from datetime import datetime, timezone

from fastapi import UploadFile

from app.core.errors import NotFoundError, PermissionDeniedError, ConflictError
from app.core.storage import save_upload
from app.models.content import Assignment, Submission
from app.models.enums import UserRole, SubmissionStatus
from app.models.user import User
from app.repositories.academic_repository import ClassRepository
from app.repositories.assignment_repository import AssignmentRepository
from app.repositories.enrollment_repository import EnrollmentRepository
from app.repositories.submission_repository import SubmissionRepository
from app.schemas.assignment import AssignmentCreate, GradeSubmission


class AssignmentService:
    def __init__(
        self,
        assignments: AssignmentRepository,
        submissions: SubmissionRepository,
        classes: ClassRepository,
        enrollments: EnrollmentRepository,
    ):
        self.assignments = assignments
        self.submissions = submissions
        self.classes = classes
        self.enrollments = enrollments

    def _can_manage_class(self, user: User, class_id: int) -> bool:
        if user.role == UserRole.ADMIN:
            return True
        klass = self.classes.get(class_id)
        return bool(klass and klass.lecturer_id == user.id)

    def _is_enrolled(self, user: User, class_id: int) -> bool:
        return bool(self.enrollments.get_by_student_and_class(user.id, class_id))

    # --- Assignments ---
    def create_assignment(self, user: User, class_id: int, data: AssignmentCreate) -> Assignment:
        if not self.classes.get(class_id):
            raise NotFoundError("Class not found.")
        if not self._can_manage_class(user, class_id):
            raise PermissionDeniedError("You do not teach this class.")

        return self.assignments.create(
            Assignment(
                class_id=class_id,
                created_by=user.id,
                title=data.title,
                description=data.description,
                due_date=data.due_date,
                max_score=data.max_score,
            )
        )

    def list_assignments(self, user: User, class_id: int) -> list[Assignment]:
        if not self.classes.get(class_id):
            raise NotFoundError("Class not found.")
        if not (self._can_manage_class(user, class_id) or self._is_enrolled(user, class_id)):
            raise PermissionDeniedError("You are not enrolled in this class.")
        return self.assignments.list_for_class(class_id)

    # --- Submissions ---
    def submit(self, user: User, assignment_id: int, file: UploadFile) -> Submission:
        assignment = self.assignments.get(assignment_id)
        if not assignment:
            raise NotFoundError("Assignment not found.")
        if not self._is_enrolled(user, assignment.class_id):
            raise PermissionDeniedError("You are not enrolled in this class.")
        if self.submissions.get_by_assignment_and_student(assignment_id, user.id):
            raise ConflictError("You have already submitted this assignment.")

        file_path = save_upload(file, subfolder="submissions")
        now = datetime.now(timezone.utc)
        status = SubmissionStatus.LATE if now > assignment.due_date else SubmissionStatus.SUBMITTED

        return self.submissions.create(
            Submission(
                assignment_id=assignment_id,
                student_id=user.id,
                file_path=file_path,
                submitted_at=now,
                status=status,
            )
        )

    def list_submissions(self, user: User, assignment_id: int) -> list[Submission]:
        assignment = self.assignments.get(assignment_id)
        if not assignment:
            raise NotFoundError("Assignment not found.")
        if not self._can_manage_class(user, assignment.class_id):
            raise PermissionDeniedError("You do not teach this class.")
        return self.submissions.list_for_assignment(assignment_id)

    def my_submission(self, user: User, assignment_id: int) -> Submission | None:
        return self.submissions.get_by_assignment_and_student(assignment_id, user.id)

    def grade(self, user: User, submission_id: int, data: GradeSubmission) -> Submission:
        submission = self.submissions.get(submission_id)
        if not submission:
            raise NotFoundError("Submission not found.")
        assignment = self.assignments.get(submission.assignment_id)
        if not self._can_manage_class(user, assignment.class_id):
            raise PermissionDeniedError("You do not teach this class.")

        submission.score = data.score
        submission.feedback = data.feedback
        submission.status = SubmissionStatus.GRADED
        return self.submissions.save(submission)
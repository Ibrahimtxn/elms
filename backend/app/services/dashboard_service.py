from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.academic import Department, Course, Class
from app.models.calendar import Event
from app.models.communication import Announcement, Notification
from app.models.content import Assignment, Submission
from app.models.enrollment import Enrollment
from app.models.enums import EnrollmentStatus, SubmissionStatus, UserRole
from app.models.user import User


class DashboardService:
    def __init__(self, db: Session):
        self.db = db

    def admin_dashboard(self) -> dict:
        db = self.db
        return {
            "total_users": db.query(User).count(),
            "total_students": db.query(User).filter(User.role == UserRole.STUDENT).count(),
            "total_lecturers": db.query(User).filter(User.role == UserRole.LECTURER).count(),
            "total_departments": db.query(Department).count(),
            "total_courses": db.query(Course).count(),
            "total_classes": db.query(Class).count(),
            "active_enrollments": db.query(Enrollment)
            .filter(Enrollment.status == EnrollmentStatus.ACTIVE)
            .count(),
            "total_submissions": db.query(Submission).count(),
            "pending_submissions": db.query(Submission)
            .filter(Submission.status != SubmissionStatus.GRADED)
            .count(),
            "total_announcements": db.query(Announcement).count(),
        }

    def lecturer_dashboard(self, lecturer_id: int) -> dict:
        db = self.db
        my_class_ids = [c.id for c in db.query(Class).filter(Class.lecturer_id == lecturer_id).all()]

        total_students_taught = 0
        if my_class_ids:
            total_students_taught = (
                db.query(Enrollment.student_id)
                .filter(Enrollment.class_id.in_(my_class_ids))
                .distinct()
                .count()
            )

        pending_grading = 0
        if my_class_ids:
            assignment_ids = [
                a.id for a in db.query(Assignment).filter(Assignment.class_id.in_(my_class_ids)).all()
            ]
            if assignment_ids:
                pending_grading = (
                    db.query(Submission)
                    .filter(
                        Submission.assignment_id.in_(assignment_ids),
                        Submission.status != SubmissionStatus.GRADED,
                    )
                    .count()
                )

        now = datetime.now(timezone.utc)
        upcoming_events = 0
        if my_class_ids:
            upcoming_events = (
                db.query(Event)
                .filter(Event.class_id.in_(my_class_ids), Event.start_time >= now)
                .count()
            )

        return {
            "my_classes": len(my_class_ids),
            "total_students_taught": total_students_taught,
            "pending_grading": pending_grading,
            "upcoming_events": upcoming_events,
        }

    def student_dashboard(self, student_id: int) -> dict:
        db = self.db
        my_class_ids = [
            e.class_id
            for e in db.query(Enrollment).filter(Enrollment.student_id == student_id).all()
        ]

        pending_assignments = 0
        if my_class_ids:
            assignments = db.query(Assignment).filter(Assignment.class_id.in_(my_class_ids)).all()
            submitted_ids = {
                s.assignment_id
                for s in db.query(Submission).filter(Submission.student_id == student_id).all()
            }
            pending_assignments = len([a for a in assignments if a.id not in submitted_ids])

        unread_notifications = (
            db.query(Notification)
            .filter(Notification.user_id == student_id, Notification.is_read.is_(False))
            .count()
        )

        now = datetime.now(timezone.utc)
        upcoming_events = 0
        if my_class_ids:
            upcoming_events = (
                db.query(Event)
                .filter(Event.class_id.in_(my_class_ids), Event.start_time >= now)
                .count()
            )

        return {
            "my_classes": len(my_class_ids),
            "pending_assignments": pending_assignments,
            "unread_notifications": unread_notifications,
            "upcoming_events": upcoming_events,
        }
from app.core.errors import NotFoundError, PermissionDeniedError
from app.models.communication import Announcement
from app.models.enums import NotificationType, UserRole
from app.models.user import User
from app.repositories.academic_repository import ClassRepository
from app.repositories.announcement_repository import AnnouncementRepository
from app.repositories.enrollment_repository import EnrollmentRepository
from app.repositories.user_repository import UserRepository
from app.schemas.announcement import AnnouncementCreate
from app.services.notification_service import NotificationService


class AnnouncementService:
    def __init__(
        self,
        announcements: AnnouncementRepository,
        classes: ClassRepository,
        enrollments: EnrollmentRepository,
        notifications: NotificationService,
        db,  # raw session, only used for the "all active users" global-announcement query
    ):
        self.announcements = announcements
        self.classes = classes
        self.enrollments = enrollments
        self.notifications = notifications
        self.db = db

    def _can_manage_class(self, user: User, class_id: int) -> bool:
        if user.role == UserRole.ADMIN:
            return True
        klass = self.classes.get(class_id)
        return bool(klass and klass.lecturer_id == user.id)

    def post_global(self, user: User, data: AnnouncementCreate) -> Announcement:
        if user.role != UserRole.ADMIN:
            raise PermissionDeniedError("Only admins can post school-wide announcements.")

        announcement = self.announcements.create(
            Announcement(class_id=None, posted_by=user.id, title=data.title, content=data.content)
        )

        active_user_ids = [
            row[0] for row in self.db.query(User.id).filter(User.is_active.is_(True)).all()
        ]
        self.notifications.notify_many(
            active_user_ids,
            title=f"Announcement: {data.title}",
            message=data.content[:200],
            notification_type=NotificationType.ANNOUNCEMENT,
            related_entity_type="announcement",
            related_entity_id=announcement.id,
        )
        return announcement

    def post_to_class(self, user: User, class_id: int, data: AnnouncementCreate) -> Announcement:
        if not self.classes.get(class_id):
            raise NotFoundError("Class not found.")
        if not self._can_manage_class(user, class_id):
            raise PermissionDeniedError("You do not teach this class.")

        announcement = self.announcements.create(
            Announcement(class_id=class_id, posted_by=user.id, title=data.title, content=data.content)
        )

        student_ids = [e.student_id for e in self.enrollments.list_for_class(class_id)]
        self.notifications.notify_many(
            student_ids,
            title=f"Announcement: {data.title}",
            message=data.content[:200],
            notification_type=NotificationType.ANNOUNCEMENT,
            related_entity_type="announcement",
            related_entity_id=announcement.id,
        )
        return announcement

    def list_global(self) -> list[Announcement]:
        return self.announcements.list_global()

    def list_for_class(self, user: User, class_id: int) -> list[Announcement]:
        if not self.classes.get(class_id):
            raise NotFoundError("Class not found.")
        is_enrolled = bool(self.enrollments.get_by_student_and_class(user.id, class_id))
        if not (self._can_manage_class(user, class_id) or is_enrolled):
            raise PermissionDeniedError("You are not enrolled in this class.")
        return self.announcements.list_for_class(class_id)
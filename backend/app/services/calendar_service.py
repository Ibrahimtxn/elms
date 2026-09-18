from app.core.errors import NotFoundError, PermissionDeniedError
from app.models.calendar import Event
from app.models.enums import UserRole
from app.models.user import User
from app.repositories.academic_repository import ClassRepository
from app.repositories.enrollment_repository import EnrollmentRepository
from app.repositories.event_repository import EventRepository
from app.schemas.calendar import EventCreate


class CalendarService:
    def __init__(
        self,
        events: EventRepository,
        classes: ClassRepository,
        enrollments: EnrollmentRepository,
    ):
        self.events = events
        self.classes = classes
        self.enrollments = enrollments

    def _can_manage_class(self, user: User, class_id: int) -> bool:
        if user.role == UserRole.ADMIN:
            return True
        klass = self.classes.get(class_id)
        return bool(klass and klass.lecturer_id == user.id)

    def create_class_event(self, user: User, class_id: int, data: EventCreate) -> Event:
        if not self.classes.get(class_id):
            raise NotFoundError("Class not found.")
        if not self._can_manage_class(user, class_id):
            raise PermissionDeniedError("You do not teach this class.")

        return self.events.create(
            Event(
                class_id=class_id,
                created_by=user.id,
                title=data.title,
                description=data.description,
                event_type=data.event_type,
                start_time=data.start_time,
                end_time=data.end_time,
            )
        )

    def create_global_event(self, user: User, data: EventCreate) -> Event:
        if user.role != UserRole.ADMIN:
            raise PermissionDeniedError("Only admins can create school-wide events.")

        return self.events.create(
            Event(
                class_id=None,
                created_by=user.id,
                title=data.title,
                description=data.description,
                event_type=data.event_type,
                start_time=data.start_time,
                end_time=data.end_time,
            )
        )

    def _class_ids_for_user(self, user: User) -> list[int]:
        if user.role == UserRole.ADMIN:
            return [c.id for c in self.classes.list_all()]
        if user.role == UserRole.LECTURER:
            return [c.id for c in self.classes.list_all() if c.lecturer_id == user.id]
        # student
        return [e.class_id for e in self.enrollments.list_for_student(user.id)]

    def list_my_calendar(self, user: User) -> list[Event]:
        global_events = self.events.list_global()
        class_events = self.events.list_for_classes(self._class_ids_for_user(user))
        combined = global_events + class_events
        return sorted(combined, key=lambda e: e.start_time)
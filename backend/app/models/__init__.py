"""Import every model so Base.metadata (and Alembic autogenerate) sees them all."""
from app.models.user import User
from app.models.academic import Department, Level, AcademicYear, Course, Class
from app.models.enrollment import Enrollment
from app.models.content import Material, Assignment, Submission
from app.models.communication import (
    Announcement,
    Notification,
    Conversation,
    ConversationMember,
    Message,
)
from app.models.backpack import BackpackItem
from app.models.calendar import Event
from app.models.audit import AuditLog

__all__ = [
    "User", "Department", "Level", "AcademicYear", "Course", "Class",
    "Enrollment", "Material", "Assignment", "Submission",
    "Announcement", "Notification", "Conversation", "ConversationMember", "Message",
    "BackpackItem", "Event", "AuditLog",
]
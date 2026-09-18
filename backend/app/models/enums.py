"""Enums shared across models."""
import enum


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    LECTURER = "lecturer"
    STUDENT = "student"


class EnrollmentStatus(str, enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    DROPPED = "dropped"


class SubmissionStatus(str, enum.Enum):
    SUBMITTED = "submitted"
    LATE = "late"
    GRADED = "graded"
    RETURNED = "returned"


class NotificationType(str, enum.Enum):
    ANNOUNCEMENT = "announcement"
    ASSIGNMENT = "assignment"
    MESSAGE = "message"
    GRADE = "grade"
    SYSTEM = "system"


class EventType(str, enum.Enum):
    CLASS = "class"
    EXAM = "exam"
    DEADLINE = "deadline"
    HOLIDAY = "holiday"
    OTHER = "other"
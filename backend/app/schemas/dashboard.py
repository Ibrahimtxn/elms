from typing import Optional
from pydantic import BaseModel


class AdminDashboardOut(BaseModel):
    total_users: int
    total_students: int
    total_lecturers: int
    total_departments: int
    total_courses: int
    total_classes: int
    active_enrollments: int
    total_submissions: int
    pending_submissions: int
    total_announcements: int


class LecturerDashboardOut(BaseModel):
    my_classes: int
    total_students_taught: int
    pending_grading: int
    upcoming_events: int


class StudentDashboardOut(BaseModel):
    my_classes: int
    pending_assignments: int
    unread_notifications: int
    upcoming_events: int
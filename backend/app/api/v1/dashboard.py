from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.errors import AppError
from app.db.session import get_db
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.dashboard import AdminDashboardOut, LecturerDashboardOut, StudentDashboardOut
from app.services.dashboard_service import DashboardService

router = APIRouter()


@router.get("/dashboard")
def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = DashboardService(db)

    if current_user.role == UserRole.ADMIN:
        return AdminDashboardOut(**service.admin_dashboard())
    if current_user.role == UserRole.LECTURER:
        return LecturerDashboardOut(**service.lecturer_dashboard(current_user.id))
    return StudentDashboardOut(**service.student_dashboard(current_user.id))
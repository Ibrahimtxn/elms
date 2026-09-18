from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.repositories.academic_repository import ClassRepository
from app.repositories.announcement_repository import AnnouncementRepository
from app.repositories.enrollment_repository import EnrollmentRepository
from app.repositories.notification_repository import NotificationRepository
from app.schemas.announcement import AnnouncementCreate, AnnouncementOut
from app.services.announcement_service import AnnouncementService
from app.services.notification_service import NotificationService

router = APIRouter()


def get_announcement_service(db: Session = Depends(get_db)) -> AnnouncementService:
    return AnnouncementService(
        AnnouncementRepository(db),
        ClassRepository(db),
        EnrollmentRepository(db),
        NotificationService(NotificationRepository(db)),
        db,
    )


@router.get("/announcements", response_model=list[AnnouncementOut])
def list_global_announcements(service: AnnouncementService = Depends(get_announcement_service)):
    return service.list_global()


@router.post("/announcements", response_model=AnnouncementOut, status_code=201)
def post_global_announcement(
    data: AnnouncementCreate,
    current_user: User = Depends(get_current_user),
    service: AnnouncementService = Depends(get_announcement_service),
):
    return service.post_global(current_user, data)


@router.get("/classes/{class_id}/announcements", response_model=list[AnnouncementOut])
def list_class_announcements(
    class_id: int,
    current_user: User = Depends(get_current_user),
    service: AnnouncementService = Depends(get_announcement_service),
):
    return service.list_for_class(current_user, class_id)


@router.post("/classes/{class_id}/announcements", response_model=AnnouncementOut, status_code=201)
def post_class_announcement(
    class_id: int,
    data: AnnouncementCreate,
    current_user: User = Depends(get_current_user),
    service: AnnouncementService = Depends(get_announcement_service),
):
    return service.post_to_class(current_user, class_id, data)
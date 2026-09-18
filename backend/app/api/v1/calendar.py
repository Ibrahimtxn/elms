from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.repositories.academic_repository import ClassRepository
from app.repositories.enrollment_repository import EnrollmentRepository
from app.repositories.event_repository import EventRepository
from app.schemas.calendar import EventCreate, EventOut
from app.services.calendar_service import CalendarService

router = APIRouter()


def get_calendar_service(db: Session = Depends(get_db)) -> CalendarService:
    return CalendarService(EventRepository(db), ClassRepository(db), EnrollmentRepository(db))


@router.get("/calendar", response_model=list[EventOut])
def my_calendar(
    current_user: User = Depends(get_current_user),
    service: CalendarService = Depends(get_calendar_service),
):
    return service.list_my_calendar(current_user)


@router.post("/events", response_model=EventOut, status_code=201)
def create_global_event(
    data: EventCreate,
    current_user: User = Depends(get_current_user),
    service: CalendarService = Depends(get_calendar_service),
):
    return service.create_global_event(current_user, data)


@router.post("/classes/{class_id}/events", response_model=EventOut, status_code=201)
def create_class_event(
    class_id: int,
    data: EventCreate,
    current_user: User = Depends(get_current_user),
    service: CalendarService = Depends(get_calendar_service),
):
    return service.create_class_event(current_user, class_id, data)
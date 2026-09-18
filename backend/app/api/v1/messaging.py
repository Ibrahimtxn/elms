from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.repositories.conversation_repository import ConversationRepository, MessageRepository
from app.repositories.notification_repository import NotificationRepository
from app.repositories.user_repository import UserRepository
from app.schemas.messaging import ConversationCreate, ConversationOut, MessageCreate, MessageOut
from app.services.messaging_service import MessagingService
from app.services.notification_service import NotificationService

router = APIRouter()


def get_messaging_service(db: Session = Depends(get_db)) -> MessagingService:
    from app.repositories.academic_repository import ClassRepository
    from app.repositories.enrollment_repository import EnrollmentRepository

    return MessagingService(
        ConversationRepository(db),
        MessageRepository(db),
        UserRepository(db),
        NotificationService(NotificationRepository(db)),
        classes=ClassRepository(db),
        enrollments=EnrollmentRepository(db),
    )

from app.schemas.user import UserOut


@router.get("/messaging/contacts", response_model=list[UserOut])
def list_contacts(
    current_user: User = Depends(get_current_user),
    service: MessagingService = Depends(get_messaging_service),
):
    return service.get_contacts(current_user)


@router.post("/conversations", response_model=ConversationOut, status_code=201)
def start_conversation(
    data: ConversationCreate,
    current_user: User = Depends(get_current_user),
    service: MessagingService = Depends(get_messaging_service),
):
    return service.start_conversation(current_user, data)


@router.get("/conversations", response_model=list[ConversationOut])
def list_my_conversations(
    current_user: User = Depends(get_current_user),
    service: MessagingService = Depends(get_messaging_service),
):
    return service.list_my_conversations(current_user)


@router.get("/conversations/{conversation_id}/messages", response_model=list[MessageOut])
def list_messages(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    service: MessagingService = Depends(get_messaging_service),
):
    return service.list_messages(current_user, conversation_id)


@router.post("/conversations/{conversation_id}/messages", response_model=MessageOut, status_code=201)
def send_message(
    conversation_id: int,
    data: MessageCreate,
    current_user: User = Depends(get_current_user),
    service: MessagingService = Depends(get_messaging_service),
):
    return service.send_message(current_user, conversation_id, data.content)
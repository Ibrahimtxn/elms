from datetime import datetime, timezone

from app.core.errors import NotFoundError, PermissionDeniedError, ConflictError
from app.models.communication import Conversation, ConversationMember, Message
from app.models.enums import NotificationType
from app.models.user import User
from app.repositories.conversation_repository import ConversationRepository, MessageRepository
from app.repositories.user_repository import UserRepository
from app.schemas.messaging import ConversationCreate
from app.services.notification_service import NotificationService


class MessagingService:
    def __init__(
        self,
        conversations: ConversationRepository,
        messages: MessageRepository,
        users: UserRepository,
        notifications: NotificationService,
        classes=None,
        enrollments=None,
    ):
        self.conversations = conversations
        self.messages = messages
        self.users = users
        self.notifications = notifications
        self.classes = classes
        self.enrollments = enrollments

    def get_contacts(self, current_user: User) -> list[User]:
        """Returns who this user is allowed to message, based on role -
        not everyone can message everyone."""
        from app.models.enums import UserRole, EnrollmentStatus

        contacts: list[User] = []

        if current_user.role == UserRole.ADMIN:
            contacts = self.users.list_all()

        elif current_user.role == UserRole.LECTURER:
            my_class_ids = [c.id for c in self.classes.list_all() if c.lecturer_id == current_user.id]
            student_ids = set()
            for cid in my_class_ids:
                for e in self.enrollments.list_for_class(cid):
                    if e.status == EnrollmentStatus.ACTIVE:
                        student_ids.add(e.student_id)
            contacts = [self.users.get_by_id(sid) for sid in student_ids]
            contacts += [u for u in self.users.list_all() if u.role == UserRole.ADMIN]

        else:  # student
            my_enrollments = self.enrollments.list_for_student(current_user.id)
            lecturer_ids = set()
            for e in my_enrollments:
                if e.status != EnrollmentStatus.ACTIVE:
                    continue
                klass = self.classes.get(e.class_id)
                if klass and klass.lecturer_id:
                    lecturer_ids.add(klass.lecturer_id)
            contacts = [self.users.get_by_id(lid) for lid in lecturer_ids]
            contacts += [u for u in self.users.list_all() if u.role == UserRole.ADMIN]

        seen = set()
        unique: list[User] = []
        for c in contacts:
            if c and c.id != current_user.id and c.id not in seen:
                seen.add(c.id)
                unique.append(c)
        return unique

    def start_conversation(self, current_user: User, data: ConversationCreate) -> Conversation:
        participant_ids = set(data.participant_ids) - {current_user.id}
        if not participant_ids:
            raise ConflictError("A conversation needs at least one other participant.")

        for uid in participant_ids:
            if not self.users.get_by_id(uid):
                raise NotFoundError(f"User {uid} not found.")

        all_ids = participant_ids | {current_user.id}
        is_group = len(all_ids) > 2

        if not is_group:
            other_id = next(iter(participant_ids))
            existing = self.conversations.find_direct_conversation(current_user.id, other_id)
            if existing:
                return existing

        conversation = self.conversations.create(
            Conversation(title=data.title, is_group=is_group)
        )
        now = datetime.now(timezone.utc)
        for uid in all_ids:
            self.conversations.add_member(
                ConversationMember(conversation_id=conversation.id, user_id=uid, joined_at=now)
            )
        self.conversations.commit()
        return conversation

    def send_message(self, current_user: User, conversation_id: int, content: str) -> Message:
        from app.core.config import settings
        from app.models.enums import UserRole

        if not self.conversations.get(conversation_id):
            raise NotFoundError("Conversation not found.")
        if not self.conversations.is_member(conversation_id, current_user.id):
            raise PermissionDeniedError("You are not part of this conversation.")

        if current_user.role == UserRole.STUDENT:
            sent_today = self.messages.count_sent_today(current_user.id)
            if sent_today >= settings.MAX_STUDENT_MESSAGES_PER_DAY:
                raise ConflictError(
                    f"You've reached your daily limit of {settings.MAX_STUDENT_MESSAGES_PER_DAY} messages. Try again tomorrow."
                )
        message = self.messages.create(
            Message(conversation_id=conversation_id, sender_id=current_user.id, content=content)
        )

        recipient_ids = [
            uid for uid in self.conversations.member_ids(conversation_id) if uid != current_user.id
        ]
        self.notifications.notify_many(
            recipient_ids,
            title=f"New message from {current_user.first_name}",
            message=content[:200],
            notification_type=NotificationType.MESSAGE,
            related_entity_type="conversation",
            related_entity_id=conversation_id,
        )
        return message

    def list_my_conversations(self, current_user: User) -> list[Conversation]:
        return self.conversations.list_for_user(current_user.id)

    def list_messages(self, current_user: User, conversation_id: int) -> list[Message]:
        if not self.conversations.get(conversation_id):
            raise NotFoundError("Conversation not found.")
        if not self.conversations.is_member(conversation_id, current_user.id):
            raise PermissionDeniedError("You are not part of this conversation.")

        self.messages.mark_read_for_recipient(conversation_id, current_user.id)
        return self.messages.list_for_conversation(conversation_id)
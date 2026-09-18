from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.communication import Conversation, ConversationMember, Message


class ConversationRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, conversation: Conversation) -> Conversation:
        self.db.add(conversation)
        self.db.commit()
        self.db.refresh(conversation)
        return conversation

    def add_member(self, member: ConversationMember) -> None:
        self.db.add(member)

    def commit(self) -> None:
        self.db.commit()

    def get(self, conversation_id: int) -> Optional[Conversation]:
        return self.db.query(Conversation).filter(Conversation.id == conversation_id).first()

    def is_member(self, conversation_id: int, user_id: int) -> bool:
        return (
            self.db.query(ConversationMember)
            .filter(
                ConversationMember.conversation_id == conversation_id,
                ConversationMember.user_id == user_id,
            )
            .first()
            is not None
        )

    def member_ids(self, conversation_id: int) -> List[int]:
        rows = (
            self.db.query(ConversationMember.user_id)
            .filter(ConversationMember.conversation_id == conversation_id)
            .all()
        )
        return [r[0] for r in rows]

    def find_direct_conversation(self, user_a: int, user_b: int) -> Optional[Conversation]:
        """Finds an existing non-group conversation between exactly these two users."""
        candidates = (
            self.db.query(Conversation)
            .join(ConversationMember)
            .filter(Conversation.is_group.is_(False), ConversationMember.user_id.in_([user_a, user_b]))
            .all()
        )
        for convo in candidates:
            members = set(self.member_ids(convo.id))
            if members == {user_a, user_b}:
                return convo
        return None

    def list_for_user(self, user_id: int) -> List[Conversation]:
        return (
            self.db.query(Conversation)
            .join(ConversationMember)
            .filter(ConversationMember.user_id == user_id)
            .order_by(Conversation.updated_at.desc())
            .all()
        )


class MessageRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, message: Message) -> Message:
        self.db.add(message)
        self.db.commit()
        self.db.refresh(message)
        return message

    def list_for_conversation(self, conversation_id: int) -> List[Message]:
        return (
            self.db.query(Message)
            .filter(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
            .all()
        )
    
    def count_sent_today(self, sender_id: int) -> int:
        from datetime import datetime, timezone
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        return (
            self.db.query(Message)
            .filter(Message.sender_id == sender_id, Message.created_at >= today_start)
            .count()
        )
    
    def mark_read_for_recipient(self, conversation_id: int, reader_id: int) -> None:
        self.db.query(Message).filter(
            Message.conversation_id == conversation_id,
            Message.sender_id != reader_id,
            Message.is_read == False,  # noqa: E712
        ).update({"is_read": True})
        self.db.commit()
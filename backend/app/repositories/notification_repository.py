from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.communication import Notification


class NotificationRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, notification: Notification) -> Notification:
        self.db.add(notification)
        return notification  # caller commits (used for bulk creation)

    def commit(self) -> None:
        self.db.commit()

    def list_for_user(self, user_id: int) -> List[Notification]:
        return (
            self.db.query(Notification)
            .filter(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
            .all()
        )

    def get(self, notification_id: int) -> Optional[Notification]:
        return self.db.query(Notification).filter(Notification.id == notification_id).first()

    def mark_all_read(self, user_id: int) -> None:
        self.db.query(Notification).filter(
            Notification.user_id == user_id, Notification.is_read == False  # noqa: E712
        ).update({"is_read": True})
        self.db.commit()
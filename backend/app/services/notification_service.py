from app.core.errors import NotFoundError, PermissionDeniedError
from app.models.communication import Notification
from app.models.enums import NotificationType
from app.repositories.notification_repository import NotificationRepository


class NotificationService:
    def __init__(self, notifications: NotificationRepository):
        self.notifications = notifications

    def notify(
        self,
        user_id: int,
        title: str,
        message: str,
        notification_type: NotificationType,
        related_entity_type: str | None = None,
        related_entity_id: int | None = None,
    ) -> Notification:
        """Creates one notification. Caller is responsible for committing
        when bulk-creating many at once (see notify_many)."""
        n = Notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type=notification_type,
            related_entity_type=related_entity_type,
            related_entity_id=related_entity_id,
        )
        return self.notifications.create(n)

    def notify_many(
        self,
        user_ids: list[int],
        title: str,
        message: str,
        notification_type: NotificationType,
        related_entity_type: str | None = None,
        related_entity_id: int | None = None,
    ) -> None:
        for uid in user_ids:
            self.notify(uid, title, message, notification_type, related_entity_type, related_entity_id)
        self.notifications.commit()

    def list_mine(self, user_id: int) -> list[Notification]:
        return self.notifications.list_for_user(user_id)

    def mark_read(self, user_id: int, notification_id: int) -> Notification:
        notification = self.notifications.get(notification_id)
        if not notification:
            raise NotFoundError("Notification not found.")
        if notification.user_id != user_id:
            raise PermissionDeniedError("This notification does not belong to you.")
        notification.is_read = True
        self.notifications.commit()
        return notification

    def mark_all_read(self, user_id: int) -> None:
        self.notifications.mark_all_read(user_id)
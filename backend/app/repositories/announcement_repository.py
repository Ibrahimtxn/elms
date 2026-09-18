from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.communication import Announcement


class AnnouncementRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, announcement: Announcement) -> Announcement:
        self.db.add(announcement)
        self.db.commit()
        self.db.refresh(announcement)
        return announcement

    def list_global(self) -> List[Announcement]:
        return (
            self.db.query(Announcement)
            .filter(Announcement.class_id.is_(None))
            .order_by(Announcement.created_at.desc())
            .all()
        )

    def list_for_class(self, class_id: int) -> List[Announcement]:
        return (
            self.db.query(Announcement)
            .filter(Announcement.class_id == class_id)
            .order_by(Announcement.created_at.desc())
            .all()
        )
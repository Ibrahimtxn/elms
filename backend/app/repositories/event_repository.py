from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.calendar import Event


class EventRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, event_id: int) -> Optional[Event]:
        return self.db.query(Event).filter(Event.id == event_id).first()

    def create(self, event: Event) -> Event:
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        return event

    def list_global(self) -> List[Event]:
        return self.db.query(Event).filter(Event.class_id.is_(None)).order_by(Event.start_time).all()

    def list_for_classes(self, class_ids: List[int]) -> List[Event]:
        if not class_ids:
            return []
        return (
            self.db.query(Event)
            .filter(Event.class_id.in_(class_ids))
            .order_by(Event.start_time)
            .all()
        )
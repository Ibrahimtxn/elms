from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.backpack import BackpackItem


class BackpackRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, item_id: int) -> Optional[BackpackItem]:
        return self.db.query(BackpackItem).filter(BackpackItem.id == item_id).first()

    def list_for_user(self, user_id: int) -> List[BackpackItem]:
        return (
            self.db.query(BackpackItem)
            .filter(BackpackItem.user_id == user_id)
            .order_by(BackpackItem.created_at.desc())
            .all()
        )

    def already_saved(self, user_id: int, material_id: int) -> Optional[BackpackItem]:
        return (
            self.db.query(BackpackItem)
            .filter(BackpackItem.user_id == user_id, BackpackItem.material_id == material_id)
            .first()
        )

    def create(self, item: BackpackItem) -> BackpackItem:
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def delete(self, item: BackpackItem) -> None:
        self.db.delete(item)
        self.db.commit()
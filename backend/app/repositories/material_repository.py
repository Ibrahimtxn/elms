from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.content import Material


class MaterialRepository:
    def __init__(self, db: Session):
        self.db = db

    def get(self, material_id: int) -> Optional[Material]:
        return self.db.query(Material).filter(Material.id == material_id).first()

    def list_for_class(self, class_id: int) -> List[Material]:
        return self.db.query(Material).filter(Material.class_id == class_id).all()

    def create(self, material: Material) -> Material:
        self.db.add(material)
        self.db.commit()
        self.db.refresh(material)
        return material

    def delete(self, material: Material) -> None:
        self.db.delete(material)
        self.db.commit()
from typing import Optional
from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin


class BackpackItem(Base, TimestampMixin):
    """A user's personally saved file — either a bookmarked Material or their own upload."""
    __tablename__ = "backpack_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    material_id: Mapped[Optional[int]] = mapped_column(ForeignKey("materials.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    user: Mapped["User"] = relationship(foreign_keys=[user_id])
    material: Mapped[Optional["Material"]] = relationship(foreign_keys=[material_id])
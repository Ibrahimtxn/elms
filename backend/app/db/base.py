"""
Shared declarative base for all ORM models.

Later sprints will do:  from app.db.base import Base
                         class User(Base): ...

Alembic's env.py imports Base.metadata to autogenerate migrations, and it
imports this module (via app.db.base_all, added in Sprint 2+) so every
model is registered before autogenerate runs.
"""
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass

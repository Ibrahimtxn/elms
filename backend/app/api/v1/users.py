"""Admin-only user administration."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.core.errors import NotFoundError
from app.db.session import get_db
from app.models.enums import UserRole
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserOut, UserCreate

router = APIRouter()
admin_only = require_roles(UserRole.ADMIN)

def get_auth_service_for_admin(db: Session = Depends(get_db)):
    from app.services.auth_service import AuthService
    return AuthService(UserRepository(db))

@router.post("/users", response_model=UserOut, status_code=201, dependencies=[Depends(admin_only)])
def admin_create_user(data: "UserCreate", service=Depends(get_auth_service_for_admin)):
    return service.admin_create(data)

@router.get("/users", response_model=list[UserOut], dependencies=[Depends(admin_only)])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).all()


@router.patch("/users/{user_id}/deactivate", response_model=UserOut, dependencies=[Depends(admin_only)])
def deactivate_user(user_id: int, db: Session = Depends(get_db)):
    repo = UserRepository(db)
    user = repo.get_by_id(user_id)
    if not user:
        raise NotFoundError("User not found.")
    user.is_active = False
    db.commit()
    db.refresh(user)
    return user


@router.patch("/users/{user_id}/activate", response_model=UserOut, dependencies=[Depends(admin_only)])
def activate_user(user_id: int, db: Session = Depends(get_db)):
    repo = UserRepository(db)
    user = repo.get_by_id(user_id)
    if not user:
        raise NotFoundError("User not found.")
    user.is_active = True
    db.commit()
    db.refresh(user)
    return user
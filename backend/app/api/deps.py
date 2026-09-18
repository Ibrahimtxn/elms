"""
Shared FastAPI dependencies: DB session, current user, role guards.
"""
from typing import Iterable

from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.errors import UnauthorizedError, PermissionDeniedError
from app.core.security import decode_token
from app.db.session import get_db
from app.models.enums import UserRole
from app.models.user import User
from app.repositories.user_repository import UserRepository

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None:
        raise UnauthorizedError("Not authenticated.")

    payload = decode_token(credentials.credentials)
    if not payload or payload.get("type") != "access":
        raise UnauthorizedError("Invalid or expired access token.")

    user = UserRepository(db).get_by_id(int(payload["sub"]))
    if not user or not user.is_active:
        raise UnauthorizedError("Account no longer active.")

    return user


def require_roles(*allowed_roles: UserRole):
    """Usage: Depends(require_roles(UserRole.ADMIN, UserRole.LECTURER))"""

    def dependency(user: User = Depends(get_current_user)) -> User:
        if user.role not in allowed_roles:
            raise PermissionDeniedError("You do not have permission to perform this action.")
        return user

    return dependency
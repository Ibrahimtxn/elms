from app.core.errors import ConflictError, UnauthorizedError, NotFoundError, PermissionDeniedError
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, TokenPair


class AuthService:
    def __init__(self, repo: UserRepository):
        self.repo = repo

    def register(self, data: UserCreate) -> User:
        """Public self-registration. Admin accounts can't be created this
        way - they must be provisioned by an existing admin (see admin_create)."""
        from app.models.enums import UserRole

        if data.role == UserRole.ADMIN:
            raise PermissionDeniedError(
                "Admin accounts cannot be self-registered. Contact an existing administrator."
            )
        return self._create_user(data)

    def admin_create(self, data: UserCreate) -> User:
        """Used by the admin-only 'create user' endpoint - allows any role,
        including admin."""
        return self._create_user(data)

    def _create_user(self, data: UserCreate) -> User:
        if self.repo.get_by_email(data.email):
            raise ConflictError("An account with this email already exists.")

        user = User(
            first_name=data.first_name,
            last_name=data.last_name,
            email=data.email,
            password_hash=hash_password(data.password),
            role=data.role,
            department_id=data.department_id,
        )
        return self.repo.create(user)

    def authenticate(self, email: str, password: str) -> TokenPair:
        user = self.repo.get_by_email(email)
        if not user or not verify_password(password, user.password_hash):
            raise UnauthorizedError("Incorrect email or password.")
        if not user.is_active:
            raise UnauthorizedError("This account has been deactivated.")

        return TokenPair(
            access_token=create_access_token(user.id, user.role.value),
            refresh_token=create_refresh_token(user.id, user.role.value),
        )

    def refresh(self, refresh_token: str) -> TokenPair:
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise UnauthorizedError("Invalid or expired refresh token.")

        user = self.repo.get_by_id(int(payload["sub"]))
        if not user or not user.is_active:
            raise UnauthorizedError("Account no longer active.")

        return TokenPair(
            access_token=create_access_token(user.id, user.role.value),
            refresh_token=create_refresh_token(user.id, user.role.value),
        )
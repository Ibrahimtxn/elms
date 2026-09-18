"""
Automatic audit logging middleware.

Rather than sprinkling audit_service.log() calls through every service,
this middleware logs every successful state-changing request (POST/PUT/
PATCH/DELETE) automatically: who did it, what endpoint, when, from where.
"""
import json
from datetime import datetime, timezone

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.core.security import decode_token
from app.db.session import SessionLocal
from app.models.audit import AuditLog

AUDITED_METHODS = {"POST", "PUT", "PATCH", "DELETE"}


def _extract_user_id(request: Request) -> int | None:
    auth_header = request.headers.get("authorization", "")
    if not auth_header.lower().startswith("bearer "):
        return None
    token = auth_header.split(" ", 1)[1]
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        return None
    try:
        return int(payload["sub"])
    except (KeyError, ValueError, TypeError):
        return None


def _entity_type_from_path(path: str) -> str:
    # "/api/v1/classes/3/materials" -> "materials"; falls back to first segment.
    segments = [s for s in path.split("/") if s and not s.isdigit()]
    # Drop the "api"/"v1" prefix if present.
    segments = [s for s in segments if s not in ("api", "v1")]
    return segments[-1] if segments else "unknown"


class AuditLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)

        if request.method in AUDITED_METHODS and response.status_code < 400:
            db = SessionLocal()
            try:
                log = AuditLog(
                    user_id=_extract_user_id(request),
                    action=f"{request.method} {request.url.path}",
                    entity_type=_entity_type_from_path(request.url.path),
                    entity_id=None,
                    details={"status_code": response.status_code},
                    ip_address=request.client.host if request.client else None,
                )
                db.add(log)
                db.commit()
            except Exception:
                db.rollback()  # audit logging must never break the actual request
            finally:
                db.close()

        return response
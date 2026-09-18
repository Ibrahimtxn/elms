from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.db.session import get_db
from app.models.enums import UserRole
from app.repositories.audit_repository import AuditRepository
from app.schemas.audit import AuditLogOut

router = APIRouter()
admin_only = require_roles(UserRole.ADMIN)


@router.get("/audit-logs", response_model=list[AuditLogOut], dependencies=[Depends(admin_only)])
def list_audit_logs(
    user_id: Optional[int] = Query(None),
    entity_type: Optional[str] = Query(None),
    limit: int = Query(100, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    return AuditRepository(db).list(user_id=user_id, entity_type=entity_type, limit=limit, offset=offset)
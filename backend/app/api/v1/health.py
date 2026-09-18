"""
Health-check endpoint.

Public (no auth). Used by uptime monitors, load balancers, and by you to
confirm Sprint 1 is wired up correctly: app boots, DB is reachable.
"""
from fastapi import APIRouter

from app.core.config import settings
from app.db.session import check_db_connection

router = APIRouter(tags=["health"])


@router.get("/health")
def health_check():
    db_ok = check_db_connection()
    return {
        "status": "ok" if db_ok else "degraded",
        "app": settings.APP_NAME,
        "environment": settings.ENVIRONMENT,
        "database": "connected" if db_ok else "unreachable",
    }

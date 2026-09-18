from fastapi import APIRouter

from app.api.v1 import (
    health,
    auth,
    academic,
    enrollment,
    users,
    materials,
    assignments,
    announcements,
    notifications,
    messaging,
    backpack,
    calendar,
    dashboard,
    audit,
)

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(academic.router, prefix="", tags=["academic"])
api_router.include_router(enrollment.router, prefix="", tags=["enrollment"])
api_router.include_router(users.router, prefix="", tags=["users"])
api_router.include_router(materials.router, prefix="", tags=["materials"])
api_router.include_router(assignments.router, prefix="", tags=["assignments"])
api_router.include_router(announcements.router, prefix="", tags=["announcements"])
api_router.include_router(notifications.router, prefix="", tags=["notifications"])
api_router.include_router(messaging.router, prefix="", tags=["messaging"])
api_router.include_router(backpack.router, prefix="", tags=["backpack"])
api_router.include_router(calendar.router, prefix="", tags=["calendar"])
api_router.include_router(dashboard.router, prefix="", tags=["dashboard"])
api_router.include_router(audit.router, prefix="", tags=["audit"])
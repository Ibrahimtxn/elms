"""
Application entry point.

Run locally with:
    uvicorn app.main:app --reload
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.errors import register_exception_handlers
from app.core.logging import configure_logging

from pathlib import Path
from fastapi.responses import FileResponse

def create_app() -> FastAPI:
    configure_logging()

    app = FastAPI(
        title=settings.APP_NAME,
        description="E-Learning Management System for Federal University Dutse",
        version="0.1.0",
        docs_url="/docs" if settings.DEBUG else None,
        redoc_url="/redoc" if settings.DEBUG else None,
    )

    # CORS: allow the configured frontend origin(s) to call this API with
    # credentials (needed once cookie/JWT-based auth lands in Sprint 2).
    from app.middleware.audit import AuditLoggingMiddleware
    from slowapi.errors import RateLimitExceeded
    from slowapi import _rate_limit_exceeded_handler
    from app.core.rate_limit import limiter
    from app.middleware.audit import AuditLoggingMiddleware
    from app.middleware.security_headers import SecurityHeadersMiddleware

    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS or ["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(AuditLoggingMiddleware)
    app.add_middleware(SecurityHeadersMiddleware)

    register_exception_handlers(app)

    app.include_router(api_router, prefix=settings.API_V1_PREFIX)

    # Serve the built React frontend (present only in the Docker image,
    # not in local dev - in dev you run `npm run dev` separately).
    frontend_dist = Path(__file__).resolve().parent.parent / "static"
    if frontend_dist.is_dir():
        @app.get("/{full_path:path}")
        async def serve_frontend(full_path: str):
            candidate = frontend_dist / full_path
            if full_path and candidate.is_file():
                return FileResponse(candidate)
            return FileResponse(frontend_dist / "index.html")

    return app

app = create_app()

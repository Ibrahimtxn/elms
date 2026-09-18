"""
Shared pytest fixtures: an isolated in-memory SQLite database per test
(so tests never touch your real Postgres data), a TestClient wired to it,
and helpers for registering/logging in test users.
"""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from app.db.base import Base
from app.db.session import get_db
import app.db.session as db_session_module
import app.middleware.audit as audit_module
import app.models  # noqa: F401 - registers all models on Base.metadata
from app.core.rate_limit import limiter
from app.main import app

TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

db_session_module.SessionLocal = TestingSessionLocal
audit_module.SessionLocal = TestingSessionLocal


@pytest.fixture(autouse=True)
def reset_rate_limiter():
    """
    Rate-limit counters live in memory for the whole process, not per test.
    Without this, tests that call /auth/login or /auth/register several
    times across the suite start tripping the real production rate limits
    (5 logins/min, 10 registrations/hour) purely because of test ordering,
    not because anything is actually broken.
    """
    limiter.reset()
    yield
    limiter.reset()


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def register_user(client):
    def _register(email, password, role, first_name="Test", last_name="User"):
        resp = client.post(
            "/api/v1/auth/register",
            json={
                "first_name": first_name,
                "last_name": last_name,
                "email": email,
                "password": password,
                "role": role,
            },
        )
        assert resp.status_code == 201, resp.text
        return resp.json()

    return _register


@pytest.fixture
def login_user(client):
    def _login(email, password):
        resp = client.post("/api/v1/auth/login", json={"email": email, "password": password})
        assert resp.status_code == 200, resp.text
        return resp.json()

    return _login


@pytest.fixture
def auth_headers(login_user):
    def _headers(email, password):
        tokens = login_user(email, password)
        return {"Authorization": f"Bearer {tokens['access_token']}"}

    return _headers
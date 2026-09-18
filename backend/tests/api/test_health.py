from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_check_returns_200():
    response = client.get("/api/v1/health")
    assert response.status_code == 200


def test_health_check_response_shape():
    response = client.get("/api/v1/health")
    body = response.json()
    assert "status" in body
    assert "database" in body
    assert body["app"] == "ELMS"

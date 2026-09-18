def test_register_creates_user(client):
    resp = client.post(
        "/api/v1/auth/register",
        json={
            "first_name": "Ada",
            "last_name": "Lovelace",
            "email": "ada@fud.edu.ng",
            "password": "password123",
            "role": "student",
        },
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["email"] == "ada@fud.edu.ng"
    assert "password" not in body
    assert "password_hash" not in body


def test_duplicate_registration_rejected(client, register_user):
    register_user("dup@fud.edu.ng", "password123", "student")
    resp = client.post(
        "/api/v1/auth/register",
        json={
            "first_name": "Dup",
            "last_name": "User",
            "email": "dup@fud.edu.ng",
            "password": "password123",
            "role": "student",
        },
    )
    assert resp.status_code == 409


def test_short_password_rejected(client):
    resp = client.post(
        "/api/v1/auth/register",
        json={
            "first_name": "Short",
            "last_name": "Pw",
            "email": "short@fud.edu.ng",
            "password": "123",
            "role": "student",
        },
    )
    assert resp.status_code == 422


def test_login_success(client, register_user, login_user):
    register_user("login@fud.edu.ng", "password123", "student")
    tokens = login_user("login@fud.edu.ng", "password123")
    assert "access_token" in tokens
    assert "refresh_token" in tokens


def test_login_wrong_password_rejected(client, register_user):
    register_user("wrongpw@fud.edu.ng", "password123", "student")
    resp = client.post(
        "/api/v1/auth/login", json={"email": "wrongpw@fud.edu.ng", "password": "nope12345"}
    )
    assert resp.status_code == 401


def test_me_requires_token(client):
    resp = client.get("/api/v1/auth/me")
    assert resp.status_code == 401


def test_me_returns_current_user(client, register_user, auth_headers):
    register_user("me@fud.edu.ng", "password123", "student")
    headers = auth_headers("me@fud.edu.ng", "password123")
    resp = client.get("/api/v1/auth/me", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["email"] == "me@fud.edu.ng"
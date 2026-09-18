def test_student_cannot_create_department(client, register_user, auth_headers):
    register_user("student1@fud.edu.ng", "password123", "student")
    headers = auth_headers("student1@fud.edu.ng", "password123")
    resp = client.post(
        "/api/v1/departments", json={"name": "Physics", "code": "PHY"}, headers=headers
    )
    assert resp.status_code == 403


def test_admin_can_create_department(client, register_user, auth_headers):
    register_user("admin1@fud.edu.ng", "adminpass123", "admin")
    headers = auth_headers("admin1@fud.edu.ng", "adminpass123")
    resp = client.post(
        "/api/v1/departments", json={"name": "Physics", "code": "PHY"}, headers=headers
    )
    assert resp.status_code == 201


def test_duplicate_department_code_rejected(client, register_user, auth_headers):
    register_user("admin2@fud.edu.ng", "adminpass123", "admin")
    headers = auth_headers("admin2@fud.edu.ng", "adminpass123")
    client.post("/api/v1/departments", json={"name": "Math", "code": "MTH"}, headers=headers)
    resp = client.post(
        "/api/v1/departments", json={"name": "Mathematics", "code": "MTH"}, headers=headers
    )
    assert resp.status_code == 409
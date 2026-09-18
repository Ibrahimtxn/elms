def _admin_headers(client, register_user, auth_headers):
    register_user("enradmin@fud.edu.ng", "adminpass123", "admin")
    return auth_headers("enradmin@fud.edu.ng", "adminpass123")


def test_full_enrollment_flow(client, register_user, auth_headers):
    admin_headers = _admin_headers(client, register_user, auth_headers)

    dept = client.post(
        "/api/v1/departments", json={"name": "CS", "code": "CS1"}, headers=admin_headers
    ).json()
    level = client.post(
        "/api/v1/levels", json={"name": "100", "ordering": 1}, headers=admin_headers
    ).json()
    year = client.post(
        "/api/v1/academic-years",
        json={
            "name": "2025/2026",
            "start_date": "2025-09-01",
            "end_date": "2026-07-31",
            "is_current": True,
        },
        headers=admin_headers,
    ).json()
    course = client.post(
        "/api/v1/courses",
        json={
            "code": "CSC101",
            "title": "Intro to CS",
            "credit_units": 3,
            "department_id": dept["id"],
            "level_id": level["id"],
        },
        headers=admin_headers,
    ).json()
    klass = client.post(
        "/api/v1/classes",
        json={"course_id": course["id"], "academic_year_id": year["id"], "level_id": level["id"]},
        headers=admin_headers,
    ).json()

    register_user("enrstudent@fud.edu.ng", "password123", "student")
    student_headers = auth_headers("enrstudent@fud.edu.ng", "password123")

    resp = client.post(
        "/api/v1/enrollments", json={"class_id": klass["id"]}, headers=student_headers
    )
    assert resp.status_code == 201

    dup = client.post(
        "/api/v1/enrollments", json={"class_id": klass["id"]}, headers=student_headers
    )
    assert dup.status_code == 409

    roster = client.get(f"/api/v1/classes/{klass['id']}/roster", headers=admin_headers)
    assert roster.status_code == 200
    assert len(roster.json()) == 1

    forbidden = client.get(f"/api/v1/classes/{klass['id']}/roster", headers=student_headers)
    assert forbidden.status_code == 403
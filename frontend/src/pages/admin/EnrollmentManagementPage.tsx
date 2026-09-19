import { FormEvent, useEffect, useState } from "react";

import { enrollmentApi, Enrollment } from "@/api/enrollment";
import { academicApi, ClassOffering, Course } from "@/api/academic";
import { usersApi } from "@/api/users";
import { UserOut } from "@/api/auth";
import { getApiErrorMessage } from "@/api/client";
import { Card } from "@/components/Card";
import { DataTable } from "@/components/DataTable";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { StatusBadge } from "@/components/StatusBadge";
import { useSearchParams } from "react-router-dom";
import { BackLink } from "@/components/BackLink";

export function EnrollmentManagementPage() {
  const [searchParams] = useSearchParams();
  const [students, setStudents] = useState<UserOut[]>([]);
  const [classes, setClasses] = useState<ClassOffering[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [studentId, setStudentId] = useState<number | "">("");
  const [classId, setClassId] = useState<number | "">("");
  const [isCarryover, setIsCarryover] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [historyStudentId, setHistoryStudentId] = useState<number | "">("");
  const [history, setHistory] = useState<Enrollment[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([usersApi.listAll(), academicApi.listClasses(), academicApi.listCourses()])
      .then(([us, cl, co]) => {
        setStudents(us.filter((u) => u.role === "student"));
        setClasses(cl);
        setCourses(co);
      })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  };

   useEffect(load, []);

  // If the header search sent us here with a specific student in mind,
  // pre-select them and load their history immediately.
  useEffect(() => {
    const studentIdParam = searchParams.get("studentId");
    if (studentIdParam) {
      const id = Number(studentIdParam);
      setHistoryStudentId(id);
      loadHistory(id);
    }
  }, [searchParams]);

  const handleEnroll = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!studentId || !classId) {
      setFormError("Please select a student and a class.");
      return;
    }
    setSubmitting(true);
    try {
      await enrollmentApi.adminEnroll(studentId, classId, isCarryover);
      setIsCarryover(false);
      if (historyStudentId === studentId) loadHistory(studentId);
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const loadHistory = (id: number) => {
    setHistoryLoading(true);
    enrollmentApi
      .adminStudentHistory(id)
      .then(setHistory)
      .catch((err) => setFormError(getApiErrorMessage(err)))
      .finally(() => setHistoryLoading(false));
  };

  const handleStatusChange = async (enrollmentId: number, status: Enrollment["status"]) => {
    try {
      const updated = await enrollmentApi.adminUpdateStatus(enrollmentId, status);
      setHistory((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    }
  };

  if (loading) return <LoadingState label="Loading enrollment management…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const courseLabel = (classId: number) => {
    const klass = classes.find((c) => c.id === classId);
    if (!klass) return `Class ${classId}`;
    const course = courses.find((c) => c.id === klass.course_id);
    return course ? `${course.code} - ${course.title}` : `Class ${classId}`;
  };

    return (
    <div>
      <BackLink label="Back" />
      <h2>Enrollment Management</h2>
      {formError && <ErrorState message={formError} />}

      <Card title="Enroll a Student (e.g. for carryover courses)">
        <form onSubmit={handleEnroll} style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center" }}>
          <select value={studentId} onChange={(e) => setStudentId(Number(e.target.value))} required style={{ padding: "0.5rem" }}>
            <option value="">Student…</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
            ))}
          </select>
          <select value={classId} onChange={(e) => setClassId(Number(e.target.value))} required style={{ padding: "0.5rem" }}>
            <option value="">Class…</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{courseLabel(c.id)}</option>
            ))}
          </select>
          <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.85rem" }}>
            <input type="checkbox" checked={isCarryover} onChange={(e) => setIsCarryover(e.target.checked)} />
            Carryover
          </label>
          <button type="submit" disabled={submitting}>{submitting ? "Enrolling…" : "Enroll"}</button>
        </form>
      </Card>

            <Card title="View a Student's Enrollment History">
        {searchParams.get("studentId") && (
          <div className="pill pill-primary" style={{ marginBottom: "0.9rem" }}>
            Jumped here from search
          </div>
        )}
        <div style={{ display: "flex", gap: "0.6rem", marginBottom: "1rem" }}>
          <select
            value={historyStudentId}
            onChange={(e) => {
              const id = Number(e.target.value);
              setHistoryStudentId(id);
              if (id) loadHistory(id);
            }}
            style={{ padding: "0.5rem" }}
          >
            <option value="">Select a student…</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>
            ))}
          </select>
        </div>

        {historyLoading ? (
          <LoadingState label="Loading history…" />
        ) : (
          <DataTable
            rowKey={(e) => e.id}
            emptyMessage={historyStudentId ? "No enrollment history for this student." : "Select a student above."}
            columns={[
              { header: "Class", render: (e) => courseLabel(e.class_id) },
              { header: "Status", render: (e) => <StatusBadge status={e.status} /> },
              { header: "Carryover", render: (e) => (e.is_carryover ? "Yes" : "") },
              { header: "Enrolled", render: (e) => new Date(e.enrolled_at).toLocaleDateString() },
              {
                header: "",
                render: (e) => (
                  <select
                    value={e.status}
                    onChange={(ev) => handleStatusChange(e.id, ev.target.value as Enrollment["status"])}
                    style={{ padding: "0.3rem", fontSize: "0.8rem" }}
                  >
                    <option value="active">Active</option>
                    <option value="dropped">Dropped</option>
                    <option value="completed">Completed</option>
                  </select>
                ),
              },
            ]}
            rows={history}
          />
        )}
      </Card>
    </div>
  );
}
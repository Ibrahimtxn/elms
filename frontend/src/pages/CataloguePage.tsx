import { useEffect, useState } from "react";

import { academicApi, ClassOffering, Course, AcademicYear, Level } from "@/api/academic";
import { enrollmentApi, Enrollment } from "@/api/enrollment";
import { getApiErrorMessage } from "@/api/client";
import { Card } from "@/components/Card";
import { DataTable } from "@/components/DataTable";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { useSearchParams } from "react-router-dom";

export function CataloguePage() {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get("q") || "").toLowerCase();
  const [classes, setClasses] = useState<ClassOffering[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [myEnrollments, setMyEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [enrollingId, setEnrollingId] = useState<number | null>(null);

  const loadAll = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      academicApi.listClasses(),
      academicApi.listCourses(),
      academicApi.listAcademicYears(),
      academicApi.listLevels(),
      enrollmentApi.myEnrollments(),
    ])
      .then(([cl, co, yr, lv, en]) => {
        setClasses(cl.filter((c) => c.is_active));
        setCourses(co);
        setYears(yr);
        setLevels(lv);
        setMyEnrollments(en);
      })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(loadAll, []);

    const activeEnrollment = (classId: number) =>
    myEnrollments.find((e) => e.class_id === classId && e.status === "active");

    const [droppingId, setDroppingId] = useState<number | null>(null);

  const handleDrop = async (enrollmentId: number) => {
    setActionError(null);
    setDroppingId(enrollmentId);
    try {
      const updated = await enrollmentApi.drop(enrollmentId);
      setMyEnrollments((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    } finally {
      setDroppingId(null);
    }
  };
  const handleEnroll = async (classId: number) => {
    setActionError(null);
    setEnrollingId(classId);
    try {
      const enrollment = await enrollmentApi.enroll(classId);
      setMyEnrollments((prev) => [...prev, enrollment]);
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    } finally {
      setEnrollingId(null);
    }
  };

  const filteredClasses = query
    ? classes.filter((c) => {
        const course = courses.find((co) => co.id === c.course_id);
        if (!course) return false;
        return course.title.toLowerCase().includes(query) || course.code.toLowerCase().includes(query);
      })
    : classes;

  if (loading) return <LoadingState label="Loading course catalogue…" />;
  if (error) return <ErrorState message={error} onRetry={loadAll} />;

  const courseLabel = (id: number) => {
    const c = courses.find((c) => c.id === id);
    return c ? `${c.code} - ${c.title}` : String(id);
  };
  const yearLabel = (id: number) => years.find((y) => y.id === id)?.name ?? String(id);
  const levelLabel = (id: number) => levels.find((l) => l.id === id)?.name ?? String(id);

  return (
    <div>
      <h2>Course Catalogue</h2>
      {actionError && <ErrorState message={actionError} />}
      <Card title="Available Classes">
        <DataTable
          rowKey={(c) => c.id}
          emptyMessage={query ? `No classes match "${query}".` : "No classes available yet."}
          columns={[
            { header: "Course", render: (c) => courseLabel(c.course_id) },
            { header: "Year", render: (c) => yearLabel(c.academic_year_id) },
            { header: "Level", render: (c) => levelLabel(c.level_id) },
            {
              header: "",
                            render: (c) => {
                const enrollment = activeEnrollment(c.id);
                if (enrollment) {
                  return (
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <a href={`/classes/${c.id}`} style={{ color: "var(--color-primary)", fontWeight: 500 }}>
                        View Materials →
                      </a>
                      <button
                        onClick={() => handleDrop(enrollment.id)}
                        disabled={droppingId === enrollment.id}
                        style={{ background: "var(--color-danger)", fontSize: "0.8rem" }}
                      >
                        {droppingId === enrollment.id ? "Dropping…" : "Drop"}
                      </button>
                    </div>
                  );
                }
                return (
                  <button onClick={() => handleEnroll(c.id)} disabled={enrollingId === c.id}>
                    {enrollingId === c.id ? "Enrolling…" : "Enroll"}
                  </button>
                );
              },
            },
          ]}
          rows={filteredClasses}
        />
      </Card>
    </div>
  );
}
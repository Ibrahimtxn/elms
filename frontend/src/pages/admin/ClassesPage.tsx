import { FormEvent, useEffect, useState } from "react";

import { academicApi, ClassOffering, Course, AcademicYear, Level } from "@/api/academic";
import { usersApi } from "@/api/users";
import { UserOut } from "@/api/auth";
import { getApiErrorMessage } from "@/api/client";
import { Card } from "@/components/Card";
import { DataTable } from "@/components/DataTable";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { useSearchParams } from "react-router-dom";
import { BackLink } from "@/components/BackLink";
export function ClassesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterCourseId = searchParams.get("courseId") ? Number(searchParams.get("courseId")) : null;
  const [classes, setClasses] = useState<ClassOffering[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [lecturers, setLecturers] = useState<UserOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [courseId, setCourseId] = useState<number | "">("");
  const [yearId, setYearId] = useState<number | "">("");
  const [levelId, setLevelId] = useState<number | "">("");
  const [lecturerId, setLecturerId] = useState<number | "">("");

  const loadAll = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      academicApi.listClasses(),
      academicApi.listCourses(),
      academicApi.listAcademicYears(),
      academicApi.listLevels(),
      usersApi.listAll(),
    ])
      .then(([cl, co, yr, lv, us]) => {
        setClasses(cl);
        setCourses(co);
        setYears(yr);
        setLevels(lv);
        setLecturers(us.filter((u) => u.role === "lecturer"));
      })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(loadAll, []);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!courseId || !yearId || !levelId) {
      setFormError("Please select a course, academic year, and level.");
      return;
    }
    try {
      const klass = await academicApi.createClass({
        course_id: courseId,
        academic_year_id: yearId,
        level_id: levelId,
        lecturer_id: lecturerId || undefined,
      });
      setClasses((prev) => [...prev, klass]);
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    }
  };

    if (loading) return <LoadingState label="Loading classes…" />;
  if (error) return <ErrorState message={error} onRetry={loadAll} />;

  const visibleClasses = filterCourseId ? classes.filter((c) => c.course_id === filterCourseId) : classes;
  const filteredCourse = filterCourseId ? courses.find((c) => c.id === filterCourseId) : null;

  const courseLabel = (id: number) => {
    const c = courses.find((c) => c.id === id);
    return c ? `${c.code} - ${c.title}` : id;
  };
  const yearLabel = (id: number) => years.find((y) => y.id === id)?.name ?? id;
  const levelLabel = (id: number) => levels.find((l) => l.id === id)?.name ?? id;
  const lecturerLabel = (id: number | null) => {
    if (!id) return "Unassigned";
    const l = lecturers.find((l) => l.id === id);
    return l ? `${l.first_name} ${l.last_name}` : id;
  };

    return (
    <div>
      <BackLink label="Back" />
      <h2>Classes (Course Offerings)</h2>
      {formError && <ErrorState message={formError} />}
      <Card title="Create a Class">
        <form onSubmit={handleAdd} style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <select value={courseId} onChange={(e) => setCourseId(Number(e.target.value))} required style={{ padding: "0.4rem" }}>
            <option value="">Course…</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.code} - {c.title}</option>
            ))}
          </select>
          <select value={yearId} onChange={(e) => setYearId(Number(e.target.value))} required style={{ padding: "0.4rem" }}>
            <option value="">Academic Year…</option>
            {years.map((y) => (
              <option key={y.id} value={y.id}>{y.name}</option>
            ))}
          </select>
          <select value={levelId} onChange={(e) => setLevelId(Number(e.target.value))} required style={{ padding: "0.4rem" }}>
            <option value="">Level…</option>
            {levels.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
          <select value={lecturerId} onChange={(e) => setLecturerId(Number(e.target.value))} style={{ padding: "0.4rem" }}>
            <option value="">Lecturer (optional)…</option>
            {lecturers.map((l) => (
              <option key={l.id} value={l.id}>{l.first_name} {l.last_name}</option>
            ))}
          </select>
          <button type="submit">Create</button>
        </form>
      </Card>
            <Card title={filteredCourse ? `Classes for ${filteredCourse.code} — ${filteredCourse.title}` : "All Classes"}>
        {filterCourseId && (
          <div style={{ marginBottom: "0.9rem" }}>
            <button
              onClick={() => setSearchParams({})}
              style={{ background: "var(--color-bg)", color: "var(--color-text)", border: "1px solid var(--color-border)", fontSize: "0.8rem" }}
            >
              ✕ Clear filter — show all classes
            </button>
          </div>
        )}
        <DataTable
          rowKey={(c) => c.id}
          columns={[
            { header: "Course", render: (c) => courseLabel(c.course_id) },
            { header: "Year", render: (c) => yearLabel(c.academic_year_id) },
            { header: "Level", render: (c) => levelLabel(c.level_id) },
            { header: "Lecturer", render: (c) => lecturerLabel(c.lecturer_id) },
                       { header: "Active", render: (c) => (c.is_active ? "Yes" : "No") },
            {
              header: "",
              render: (c) => (
                <a href={`/classes/${c.id}`} style={{ color: "var(--color-primary)", fontWeight: 500 }}>
                  Manage →
                </a>
              ),
            },
          ]}
          rows={visibleClasses}
        />
      </Card>
    </div>
  );
}
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { academicApi, ClassOffering, Course, AcademicYear, Level } from "@/api/academic";
import { getApiErrorMessage } from "@/api/client";
import { useAuth } from "@/auth/AuthContext";
import { Card } from "@/components/Card";
import { DataTable } from "@/components/DataTable";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";

export function MyClassesPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassOffering[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      academicApi.listClasses(),
      academicApi.listCourses(),
      academicApi.listAcademicYears(),
      academicApi.listLevels(),
    ])
      .then(([cl, co, yr, lv]) => {
        setClasses(cl.filter((c) => c.lecturer_id === user?.id));
        setCourses(co);
        setYears(yr);
        setLevels(lv);
      })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [user?.id]);

  if (loading) return <LoadingState label="Loading your classes…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const courseLabel = (id: number) => {
    const c = courses.find((c) => c.id === id);
    return c ? `${c.code} - ${c.title}` : String(id);
  };
  const yearLabel = (id: number) => years.find((y) => y.id === id)?.name ?? String(id);
  const levelLabel = (id: number) => levels.find((l) => l.id === id)?.name ?? String(id);

  return (
    <div>
      <h2>My Classes</h2>
      <Card title="Classes You Teach">
        <DataTable
          rowKey={(c) => c.id}
          emptyMessage="You haven't been assigned to any classes yet. Contact an administrator."
          columns={[
            { header: "Course", render: (c) => courseLabel(c.course_id) },
            { header: "Academic Year", render: (c) => yearLabel(c.academic_year_id) },
            { header: "Level", render: (c) => levelLabel(c.level_id) },
            { header: "Active", render: (c) => (c.is_active ? "Yes" : "No") },
                        {
              header: "",
              render: (c) => (
                <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                  <Link to={`/classes/${c.id}?tab=materials`} style={{ color: "var(--color-primary)", fontWeight: 600, fontSize: "0.85rem" }}>
                    Materials
                  </Link>
                  <Link to={`/classes/${c.id}?tab=assignments`} style={{ color: "var(--color-primary)", fontWeight: 600, fontSize: "0.85rem" }}>
                    Assignments
                  </Link>
                  <Link to={`/classes/${c.id}?tab=roster`} style={{ color: "var(--color-primary)", fontWeight: 600, fontSize: "0.85rem" }}>
                    Roster
                  </Link>
                  <Link to={`/classes/${c.id}?tab=announcements`} style={{ color: "var(--color-primary)", fontWeight: 600, fontSize: "0.85rem" }}>
                    Announcements
                  </Link>
                </div>
              ),
            },
          ]}
          rows={classes}
        />
      </Card>
    </div>
  );
}
import { FormEvent, useEffect, useState } from "react";

import { academicApi, Course, Department, Level } from "@/api/academic";
import { getApiErrorMessage } from "@/api/client";
import { Card } from "@/components/Card";
import { DataTable } from "@/components/DataTable";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";

export function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [creditUnits, setCreditUnits] = useState(3);
  const [departmentId, setDepartmentId] = useState<number | "">("");
  const [levelId, setLevelId] = useState<number | "">("");

  const loadAll = () => {
    setLoading(true);
    setError(null);
    Promise.all([academicApi.listCourses(), academicApi.listDepartments(), academicApi.listLevels()])
      .then(([c, d, l]) => {
        setCourses(c);
        setDepartments(d);
        setLevels(l);
      })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(loadAll, []);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!departmentId || !levelId) {
      setFormError("Please select a department and level.");
      return;
    }
    try {
      const course = await academicApi.createCourse({
        code, title, credit_units: creditUnits, department_id: departmentId, level_id: levelId,
      });
      setCourses((prev) => [...prev, course]);
      setCode("");
      setTitle("");
      setCreditUnits(3);
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    }
  };

  if (loading) return <LoadingState label="Loading courses…" />;
  if (error) return <ErrorState message={error} onRetry={loadAll} />;

  const deptName = (id: number) => departments.find((d) => d.id === id)?.name ?? id;
  const levelName = (id: number) => levels.find((l) => l.id === id)?.name ?? id;

  return (
    <div>
      <h2>Courses</h2>
      {formError && <ErrorState message={formError} />}
      <Card title="Add a Course">
        <form onSubmit={handleAdd} style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <input placeholder="Code (e.g. CSC201)" value={code} onChange={(e) => setCode(e.target.value)} required style={{ padding: "0.4rem" }} />
          <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ flex: 1, padding: "0.4rem" }} />
          <input type="number" placeholder="Units" value={creditUnits} onChange={(e) => setCreditUnits(Number(e.target.value))} style={{ width: 80, padding: "0.4rem" }} />
          <select value={departmentId} onChange={(e) => setDepartmentId(Number(e.target.value))} required style={{ padding: "0.4rem" }}>
            <option value="">Department…</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <select value={levelId} onChange={(e) => setLevelId(Number(e.target.value))} required style={{ padding: "0.4rem" }}>
            <option value="">Level…</option>
            {levels.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
          <button type="submit">Add</button>
        </form>
      </Card>
      <Card title="All Courses">
        <DataTable
          rowKey={(c) => c.id}
          columns={[
            { header: "Code", render: (c) => c.code },
            { header: "Title", render: (c) => c.title },
            { header: "Units", render: (c) => c.credit_units },
            { header: "Department", render: (c) => deptName(c.department_id) },
            { header: "Level", render: (c) => levelName(c.level_id) },
          ]}
          rows={courses}
        />
      </Card>
    </div>
  );
}
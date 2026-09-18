import { FormEvent, useEffect, useState } from "react";

import { academicApi, Department, Level, AcademicYear } from "@/api/academic";
import { getApiErrorMessage } from "@/api/client";
import { Card } from "@/components/Card";
import { DataTable } from "@/components/DataTable";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";

export function AcademicSetupPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [deptName, setDeptName] = useState("");
  const [deptCode, setDeptCode] = useState("");
  const [levelName, setLevelName] = useState("");
  const [levelOrder, setLevelOrder] = useState(0);
  const [yearName, setYearName] = useState("");
  const [yearStart, setYearStart] = useState("");
  const [yearEnd, setYearEnd] = useState("");
  const [yearCurrent, setYearCurrent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadAll = () => {
    setLoading(true);
    setError(null);
    Promise.all([academicApi.listDepartments(), academicApi.listLevels(), academicApi.listAcademicYears()])
      .then(([d, l, y]) => {
        setDepartments(d);
        setLevels(l);
        setYears(y);
      })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(loadAll, []);

  const handleAddDepartment = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      const dept = await academicApi.createDepartment({ name: deptName, code: deptCode });
      setDepartments((prev) => [...prev, dept]);
      setDeptName("");
      setDeptCode("");
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    }
  };

  const handleAddLevel = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      const level = await academicApi.createLevel({ name: levelName, ordering: levelOrder });
      setLevels((prev) => [...prev, level]);
      setLevelName("");
      setLevelOrder(0);
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    }
  };

  const handleAddYear = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      const year = await academicApi.createAcademicYear({
        name: yearName, start_date: yearStart, end_date: yearEnd, is_current: yearCurrent,
      });
      setYears((prev) => [...prev, year]);
      setYearName("");
      setYearStart("");
      setYearEnd("");
      setYearCurrent(false);
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    }
  };

  if (loading) return <LoadingState label="Loading academic setup…" />;
  if (error) return <ErrorState message={error} onRetry={loadAll} />;

  return (
    <div>
      <h2>Academic Setup</h2>
      {formError && <ErrorState message={formError} />}

      <Card title="Departments">
        <form onSubmit={handleAddDepartment} style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          <input placeholder="Name (e.g. Computer Science)" value={deptName} onChange={(e) => setDeptName(e.target.value)} required style={{ flex: 2, padding: "0.4rem" }} />
          <input placeholder="Code (e.g. CSC)" value={deptCode} onChange={(e) => setDeptCode(e.target.value)} required style={{ flex: 1, padding: "0.4rem" }} />
          <button type="submit">Add</button>
        </form>
        <DataTable
          rowKey={(d) => d.id}
          columns={[
            { header: "Name", render: (d) => d.name },
            { header: "Code", render: (d) => d.code },
          ]}
          rows={departments}
        />
      </Card>

      <Card title="Levels">
        <form onSubmit={handleAddLevel} style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
          <input placeholder="Name (e.g. 100)" value={levelName} onChange={(e) => setLevelName(e.target.value)} required style={{ flex: 2, padding: "0.4rem" }} />
          <input type="number" placeholder="Order" value={levelOrder} onChange={(e) => setLevelOrder(Number(e.target.value))} style={{ flex: 1, padding: "0.4rem" }} />
          <button type="submit">Add</button>
        </form>
        <DataTable
          rowKey={(l) => l.id}
          columns={[
            { header: "Name", render: (l) => l.name },
            { header: "Order", render: (l) => l.ordering },
          ]}
          rows={levels}
        />
      </Card>

      <Card title="Academic Years">
        <form onSubmit={handleAddYear} style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          <input placeholder="Name (e.g. 2025/2026)" value={yearName} onChange={(e) => setYearName(e.target.value)} required style={{ flex: 2, padding: "0.4rem" }} />
          <input type="date" value={yearStart} onChange={(e) => setYearStart(e.target.value)} required style={{ padding: "0.4rem" }} />
          <input type="date" value={yearEnd} onChange={(e) => setYearEnd(e.target.value)} required style={{ padding: "0.4rem" }} />
          <label style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <input type="checkbox" checked={yearCurrent} onChange={(e) => setYearCurrent(e.target.checked)} />
            Current
          </label>
          <button type="submit">Add</button>
        </form>
        <DataTable
          rowKey={(y) => y.id}
          columns={[
            { header: "Name", render: (y) => y.name },
            { header: "Start", render: (y) => y.start_date },
            { header: "End", render: (y) => y.end_date },
            { header: "Current", render: (y) => (y.is_current ? "Yes" : "") },
          ]}
          rows={years}
        />
      </Card>
    </div>
  );
}
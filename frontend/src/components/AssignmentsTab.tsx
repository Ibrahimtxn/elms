import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { assignmentsApi, Assignment } from "@/api/assignments";
import { getApiErrorMessage } from "@/api/client";
import { Card } from "@/components/Card";
import { DataTable } from "@/components/DataTable";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";

export function AssignmentsTab({ classId, canManage }: { classId: number; canManage: boolean }) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [maxScore, setMaxScore] = useState(100);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    assignmentsApi
      .listForClass(classId)
      .then(setAssignments)
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [classId]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const assignment = await assignmentsApi.create(classId, {
        title,
        description,
        due_date: new Date(dueDate).toISOString(),
        max_score: maxScore,
      });
      setAssignments((prev) => [...prev, assignment]);
      setTitle("");
      setDescription("");
      setDueDate("");
      setMaxScore(100);
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState label="Loading assignments…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      {formError && <ErrorState message={formError} />}

      {canManage && (
        <Card title="Create Assignment">
          <form onSubmit={handleCreate}>
            <div style={{ display: "flex", gap: "0.6rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
              <input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{ flex: 1, padding: "0.5rem", minWidth: 180 }}
              />
              <input
                type="number"
                placeholder="Max score"
                value={maxScore}
                onChange={(e) => setMaxScore(Number(e.target.value))}
                style={{ width: 120, padding: "0.5rem" }}
              />
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                style={{ padding: "0.5rem" }}
              />
            </div>
            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              style={{ width: "100%", padding: "0.5rem", marginBottom: "0.75rem" }}
            />
            <button type="submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create Assignment"}
            </button>
          </form>
        </Card>
      )}

      <Card title="Assignments">
        <DataTable
          rowKey={(a) => a.id}
          emptyMessage="No assignments yet."
          columns={[
            { header: "Title", render: (a) => <Link to={`/assignments/${a.id}`}>{a.title}</Link> },
            { header: "Due", render: (a) => new Date(a.due_date).toLocaleString() },
            { header: "Max Score", render: (a) => a.max_score },
          ]}
          rows={assignments}
        />
      </Card>
    </div>
  );
}
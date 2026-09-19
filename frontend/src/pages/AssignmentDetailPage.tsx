import { FormEvent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { assignmentsApi, Submission } from "@/api/assignments";
import { getApiErrorMessage } from "@/api/client";
import { useAuth } from "@/auth/AuthContext";
import { Card } from "@/components/Card";
import { DataTable } from "@/components/DataTable";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { BackLink } from "@/components/BackLink";
import { StatusBadge } from "@/components/StatusBadge";

export function AssignmentDetailPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const id = Number(assignmentId);
  const { user } = useAuth();
  const isStudent = user?.role === "student";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Student view state
  const [mySubmission, setMySubmission] = useState<Submission | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Lecturer/admin view state
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [gradingId, setGradingId] = useState<number | null>(null);
  const [scoreInput, setScoreInput] = useState<Record<number, string>>({});
  const [feedbackInput, setFeedbackInput] = useState<Record<number, string>>({});

  const load = () => {
    setLoading(true);
    setError(null);
    if (isStudent) {
      assignmentsApi
        .mySubmission(id)
        .then(setMySubmission)
        .catch((err) => setError(getApiErrorMessage(err)))
        .finally(() => setLoading(false));
    } else {
      assignmentsApi
        .listSubmissions(id)
        .then(setSubmissions)
        .catch((err) => setError(getApiErrorMessage(err)))
        .finally(() => setLoading(false));
    }
  };

  useEffect(load, [id, isStudent]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setActionError(null);
    if (!file) {
      setActionError("Please choose a file to submit.");
      return;
    }
    setSubmitting(true);
    try {
      const submission = await assignmentsApi.submit(id, file);
      setMySubmission(submission);
      setFile(null);
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGrade = async (submissionId: number) => {
    setActionError(null);
    const score = Number(scoreInput[submissionId]);
    if (!scoreInput[submissionId] || Number.isNaN(score)) {
      setActionError("Please enter a valid score.");
      return;
    }
    setGradingId(submissionId);
    try {
      const graded = await assignmentsApi.grade(submissionId, score, feedbackInput[submissionId] || "");
      setSubmissions((prev) => prev.map((s) => (s.id === submissionId ? graded : s)));
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    } finally {
      setGradingId(null);
    }
  };

  if (loading) return <LoadingState label="Loading assignment…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

   return (
    <div>
      <BackLink label="Back to Class" />
      <h2>Assignment</h2>
      {actionError && <ErrorState message={actionError} />}

      {isStudent ? (
        <Card title="Your Submission">
          {mySubmission ? (
            <div>
                            <p>Status: <StatusBadge status={mySubmission.status} /></p>
              <p>Submitted: {new Date(mySubmission.submitted_at).toLocaleString()}</p>
              {mySubmission.status === "graded" && (
                <>
                  <p>Score: <strong>{mySubmission.score}</strong></p>
                  {mySubmission.feedback && <p>Feedback: {mySubmission.feedback}</p>}
                </>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
                <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} required />
                <button type="submit" disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit"}
                </button>
              </div>
            </form>
          )}
        </Card>
      ) : (
        <Card title="Submissions">
          <DataTable
            rowKey={(s) => s.id}
            emptyMessage="No submissions yet."
            columns={[
              { header: "Student ID", render: (s) => s.student_id },
                            { header: "Status", render: (s) => <StatusBadge status={s.status} /> },
              { header: "Submitted", render: (s) => new Date(s.submitted_at).toLocaleString() },
              {
                header: "Grade",
                render: (s) =>
                  s.status === "graded" ? (
                    <span>{s.score} pts{s.feedback ? ` — ${s.feedback}` : ""}</span>
                  ) : (
                    <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                      <input
                        type="number"
                        placeholder="Score"
                        value={scoreInput[s.id] ?? ""}
                        onChange={(e) => setScoreInput((prev) => ({ ...prev, [s.id]: e.target.value }))}
                        style={{ width: 70, padding: "0.35rem" }}
                      />
                      <input
                        placeholder="Feedback"
                        value={feedbackInput[s.id] ?? ""}
                        onChange={(e) => setFeedbackInput((prev) => ({ ...prev, [s.id]: e.target.value }))}
                        style={{ width: 140, padding: "0.35rem" }}
                      />
                      <button onClick={() => handleGrade(s.id)} disabled={gradingId === s.id} style={{ fontSize: "0.8rem" }}>
                        {gradingId === s.id ? "Saving…" : "Grade"}
                      </button>
                    </div>
                  ),
              },
            ]}
            rows={submissions}
          />
        </Card>
      )}
    </div>
  );
}
import { FormEvent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { materialsApi, Material } from "@/api/materials";
import { backpackApi } from "@/api/backpack";
import { getApiErrorMessage } from "@/api/client";
import { useAuth } from "@/auth/AuthContext";
import { Card } from "@/components/Card";
import { DataTable } from "@/components/DataTable";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { Tabs } from "@/components/Tabs";
import { AssignmentsTab } from "@/components/AssignmentsTab";
import { announcementsApi } from "@/api/announcements";
import { AnnouncementsTab } from "@/components/AnnouncementsTab";
import { BackLink } from "@/components/BackLink";
import { enrollmentApi, RosterEntry } from "@/api/enrollment";
import { StatusBadge } from "@/components/StatusBadge";
import { useSearchParams } from "react-router-dom";

export function ClassDetailPage() {
  const { classId } = useParams<{ classId: string }>();
  const id = Number(classId);
  const { user } = useAuth();
  const canManage = user?.role === "admin" || user?.role === "lecturer";

  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as "materials" | "assignments" | "announcements" | "roster") || "materials";
  const [activeTab, setActiveTab] = useState<"materials" | "assignments" | "announcements" | "roster">(initialTab);
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [rosterError, setRosterError] = useState<string | null>(null);

  const loadRoster = () => {
    setRosterLoading(true);
    setRosterError(null);
    enrollmentApi
      .classRoster(id)
      .then(setRoster)
      .catch((err) => setRosterError(getApiErrorMessage(err)))
      .finally(() => setRosterLoading(false));
  };

  useEffect(() => {
    if (activeTab === "roster" && canManage) loadRoster();
  }, [activeTab, id]);
  
  const load = () => {
    setLoading(true);
    setError(null);
    materialsApi
      .listForClass(id)
      .then(setMaterials)
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    setActionError(null);
    if (!file) {
      setActionError("Please choose a file to upload.");
      return;
    }
    setUploading(true);
    try {
      const material = await materialsApi.upload(id, title, description, file);
      setMaterials((prev) => [material, ...prev]);
      setTitle("");
      setDescription("");
      setFile(null);
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (materialId: number) => {
    setActionError(null);
    try {
      await materialsApi.remove(materialId);
      setMaterials((prev) => prev.filter((m) => m.id !== materialId));
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    }
  };

  const handleSaveToBackpack = async (materialId: number) => {
    setActionError(null);
    setActionMessage(null);
    setSavingId(materialId);
    try {
      await backpackApi.saveMaterial(materialId);
      setActionMessage("Saved to your backpack.");
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <LoadingState label="Loading class materials…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

      
  return (
    <div>
      <BackLink label="Back to Classes" />
      <h2>Class</h2>
                  <Tabs
        tabs={[
          { key: "materials", label: "Materials" },
          { key: "assignments", label: "Assignments" },
          { key: "announcements", label: "Announcements" },
          ...(canManage ? [{ key: "roster", label: "Roster" }] : []),
        ]}
        active={activeTab}
        onChange={(key) => setActiveTab(key as "materials" | "assignments" | "announcements" | "roster")}
      />

      {activeTab === "roster" ? (
        rosterLoading ? (
          <LoadingState label="Loading roster…" />
        ) : rosterError ? (
          <ErrorState message={rosterError} onRetry={loadRoster} />
        ) : (
          <Card title="Enrolled Students">
            <DataTable
              rowKey={(r) => r.enrollment_id}
              emptyMessage="No students enrolled in this class yet."
              columns={[
                { header: "Name", render: (r) => r.student_name },
                { header: "Email", render: (r) => r.student_email },
                { header: "Status", render: (r) => <StatusBadge status={r.status} /> },
                { header: "Carryover", render: (r) => (r.is_carryover ? "Yes" : "") },
              ]}
              rows={roster}
            />
          </Card>
        )
      ) : activeTab === "assignments" ? (
        <AssignmentsTab classId={id} canManage={canManage} />
      ) : activeTab === "announcements" ? (
        <AnnouncementsTab
          canPost={canManage}
          fetcher={() => announcementsApi.listForClass(id)}
          poster={(title, content) => announcementsApi.postToClass(id, title, content)}
        />
      ) : (
        <>
      {actionError && <ErrorState message={actionError} />}
      {actionMessage && (
        <div className="state-message loading" style={{ marginBottom: "1rem" }}>{actionMessage}</div>
      )}

      {canManage && (
        <Card title="Upload Material">
          <form onSubmit={handleUpload}>
            <div style={{ display: "flex", gap: "0.6rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
              <input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{ flex: 1, padding: "0.5rem", minWidth: 180 }}
              />
              <input
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ flex: 2, padding: "0.5rem", minWidth: 220 }}
              />
            </div>
            <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
              <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} required />
              <button type="submit" disabled={uploading}>
                {uploading ? "Uploading…" : "Upload"}
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card title="Materials">
        <DataTable
          rowKey={(m) => m.id}
          emptyMessage="No materials uploaded yet."
          columns={[
            { header: "Title", render: (m) => m.title },
            { header: "Description", render: (m) => m.description || "—" },
            {
              header: "Uploaded",
              render: (m) => new Date(m.created_at).toLocaleDateString(),
            },
            {
              header: "",
              render: (m) => (
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  
                                      <button
                    onClick={() => materialsApi.download(m.id, m.title)}
                    style={{ fontSize: "0.85rem", background: "var(--color-bg)", color: "var(--color-text)", border: "1px solid var(--color-border)" }}
                  >
                    Download
                  </button>
                  {!canManage && (
                    <button
                      onClick={() => handleSaveToBackpack(m.id)}
                      disabled={savingId === m.id}
                      style={{ fontSize: "0.85rem" }}
                    >
                      {savingId === m.id ? "Saving…" : "Save"}
                    </button>
                  )}
                  {canManage && (
                    <button
                      onClick={() => handleDelete(m.id)}
                      style={{ fontSize: "0.85rem", background: "var(--color-danger)" }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              ),
            },
          ]}
          rows={materials}
        />
           </Card>
        </>
      )}
    </div>
  );
}
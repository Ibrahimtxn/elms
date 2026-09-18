import { FormEvent, useEffect, useState } from "react";

import { backpackApi, BackpackItem } from "@/api/backpack";
import { getApiErrorMessage } from "@/api/client";
import { Card } from "@/components/Card";
import { DataTable } from "@/components/DataTable";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";

export function BackpackPage() {
  const [items, setItems] = useState<BackpackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    backpackApi
      .list()
      .then(setItems)
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    setActionError(null);
    if (!file) {
      setActionError("Please choose a file.");
      return;
    }
    setUploading(true);
    try {
      // Backpack personal uploads reuse the same multipart pattern as
      // materials, but there's no dedicated API wrapper for it yet -
      // call it directly here.
      const { apiClient } = await import("@/api/client");
      const form = new FormData();
      form.append("title", title);
      form.append("file", file);
      const { data } = await apiClient.post<BackpackItem>("/backpack/uploads", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setItems((prev) => [data, ...prev]);
      setTitle("");
      setFile(null);
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (id: number) => {
    setActionError(null);
    try {
      await backpackApi.remove(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    }
  };

  if (loading) return <LoadingState label="Loading your backpack…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      <h2>My Backpack</h2>
      {actionError && <ErrorState message={actionError} />}

      <Card title="Upload a Personal File">
        <form onSubmit={handleUpload} style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap" }}>
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ flex: 1, padding: "0.5rem", minWidth: 180 }}
          />
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} required />
          <button type="submit" disabled={uploading}>{uploading ? "Uploading…" : "Upload"}</button>
        </form>
      </Card>

      <Card title="Saved Items">
        <DataTable
          rowKey={(i) => i.id}
          emptyMessage="Your backpack is empty. Save materials from a class, or upload your own files above."
          columns={[
            { header: "Title", render: (i) => i.title },
            { header: "Type", render: (i) => (i.material_id ? "Saved Material" : "Personal Upload") },
            { header: "Saved", render: (i) => new Date(i.created_at).toLocaleDateString() },
            {
              header: "",
              render: (i) => (
                <button
                  onClick={() => handleRemove(i.id)}
                  style={{ fontSize: "0.85rem", background: "var(--color-danger)" }}
                >
                  Remove
                </button>
              ),
            },
          ]}
          rows={items}
        />
      </Card>
    </div>
  );
}
import { FormEvent, useEffect, useState } from "react";

import { Announcement } from "@/api/announcements";
import { getApiErrorMessage } from "@/api/client";
import { Card } from "@/components/Card";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";

interface AnnouncementsTabProps {
  canPost: boolean;
  fetcher: () => Promise<Announcement[]>;
  poster: (title: string, content: string) => Promise<Announcement>;
}

export function AnnouncementsTab({ canPost, fetcher, poster }: AnnouncementsTabProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    fetcher()
      .then(setAnnouncements)
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handlePost = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setPosting(true);
    try {
      const announcement = await poster(title, content);
      setAnnouncements((prev) => [announcement, ...prev]);
      setTitle("");
      setContent("");
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    } finally {
      setPosting(false);
    }
  };

  if (loading) return <LoadingState label="Loading announcements…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div>
      {formError && <ErrorState message={formError} />}
      {canPost && (
        <Card title="Post an Announcement">
          <form onSubmit={handlePost}>
            <input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ width: "100%", padding: "0.5rem", marginBottom: "0.6rem" }}
            />
            <textarea
              placeholder="What would you like to announce?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={3}
              style={{ width: "100%", padding: "0.5rem", marginBottom: "0.6rem" }}
            />
            <button type="submit" disabled={posting}>{posting ? "Posting…" : "Post"}</button>
          </form>
        </Card>
      )}

      {announcements.length === 0 ? (
        <p style={{ color: "var(--color-muted)" }}>No announcements yet.</p>
      ) : (
        announcements.map((a) => (
          <Card key={a.id} title={a.title}>
            <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{a.content}</p>
            <p style={{ margin: "0.6rem 0 0", fontSize: "0.78rem", color: "var(--color-muted)" }}>
              {new Date(a.created_at).toLocaleString()}
            </p>
          </Card>
        ))
      )}
    </div>
  );
}
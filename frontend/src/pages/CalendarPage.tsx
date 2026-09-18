import { FormEvent, useEffect, useState } from "react";

import { calendarApi, CalendarEvent, EventType } from "@/api/calendar";
import { academicApi, ClassOffering, Course } from "@/api/academic";
import { getApiErrorMessage } from "@/api/client";
import { useAuth } from "@/auth/AuthContext";
import { Card } from "@/components/Card";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";

const EVENT_TYPE_COLORS: Record<EventType, string> = {
  class: "#4f46e5",
  exam: "#dc2626",
  deadline: "#d97706",
  holiday: "#059669",
  other: "#6b7280",
};

export function CalendarPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [myClasses, setMyClasses] = useState<ClassOffering[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState<EventType>("class");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [scope, setScope] = useState<"global" | number>("global");
  const [submitting, setSubmitting] = useState(false);

  const canCreate = user?.role === "admin" || user?.role === "lecturer";

  const load = () => {
    setLoading(true);
    setError(null);
    const requests: Promise<any>[] = [calendarApi.myCalendar()];
    if (canCreate) {
      requests.push(academicApi.listClasses(), academicApi.listCourses());
    }
    Promise.all(requests)
      .then(([ev, classes, cs]) => {
        setEvents(ev);
        if (classes) {
          setMyClasses(user?.role === "admin" ? classes : classes.filter((c: ClassOffering) => c.lecturer_id === user?.id));
        }
        if (cs) setCourses(cs);
      })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const payload = {
        title,
        description,
        event_type: eventType,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
      };
      const event =
        scope === "global"
          ? await calendarApi.createGlobalEvent(payload)
          : await calendarApi.createClassEvent(scope, payload);
      setEvents((prev) => [...prev, event].sort((a, b) => a.start_time.localeCompare(b.start_time)));
      setTitle("");
      setDescription("");
      setStartTime("");
      setEndTime("");
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState label="Loading your calendar…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const courseLabel = (classId: number | null) => {
    if (!classId) return null;
    const klass = myClasses.find((c) => c.id === classId);
    if (!klass) return `Class ${classId}`;
    const course = courses.find((c) => c.id === klass.course_id);
    return course ? `${course.code}` : `Class ${classId}`;
  };

  return (
    <div>
      <h2>Calendar</h2>
      {formError && <ErrorState message={formError} />}

      {canCreate && (
        <Card title="Create Event">
          <form onSubmit={handleCreate}>
            <div style={{ display: "flex", gap: "0.6rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
              <input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{ flex: 1, padding: "0.5rem", minWidth: 160 }}
              />
              <select value={eventType} onChange={(e) => setEventType(e.target.value as EventType)} style={{ padding: "0.5rem" }}>
                <option value="class">Class Session</option>
                <option value="exam">Exam</option>
                <option value="deadline">Deadline</option>
                <option value="holiday">Holiday</option>
                <option value="other">Other</option>
              </select>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value === "global" ? "global" : Number(e.target.value))}
                style={{ padding: "0.5rem" }}
              >
                {user?.role === "admin" && <option value="global">School-wide</option>}
                {myClasses.map((c) => {
                  const course = courses.find((co) => co.id === c.course_id);
                  return (
                    <option key={c.id} value={c.id}>
                      {course ? course.code : `Class ${c.id}`}
                    </option>
                  );
                })}
              </select>
            </div>
            <div style={{ display: "flex", gap: "0.6rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
              <div>
                <label style={{ fontSize: "0.8rem", display: "block", marginBottom: 4 }}>Start</label>
                <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required style={{ padding: "0.5rem" }} />
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", display: "block", marginBottom: 4 }}>End</label>
                <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} required style={{ padding: "0.5rem" }} />
              </div>
            </div>
            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              style={{ width: "100%", padding: "0.5rem", marginBottom: "0.75rem" }}
            />
            <button type="submit" disabled={submitting}>{submitting ? "Creating…" : "Create Event"}</button>
          </form>
        </Card>
      )}

      <Card title="Upcoming">
        {events.length === 0 ? (
          <p style={{ color: "var(--color-muted)" }}>No events on your calendar.</p>
        ) : (
          events.map((ev) => (
            <div
              key={ev.id}
              style={{
                display: "flex", alignItems: "flex-start", gap: "0.75rem",
                padding: "0.75rem 0", borderBottom: "1px solid var(--color-border)",
              }}
            >
              <div style={{ width: 4, alignSelf: "stretch", borderRadius: 2, background: EVENT_TYPE_COLORS[ev.event_type] }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>
                  {ev.title}
                  {courseLabel(ev.class_id) && (
                    <span style={{ color: "var(--color-muted)", fontWeight: 400 }}> · {courseLabel(ev.class_id)}</span>
                  )}
                </div>
                {ev.description && <div style={{ fontSize: "0.85rem", color: "var(--color-muted)" }}>{ev.description}</div>}
                <div style={{ fontSize: "0.78rem", color: "var(--color-muted)", marginTop: 2 }}>
                  {new Date(ev.start_time).toLocaleString()} — {new Date(ev.end_time).toLocaleString()}
                </div>
              </div>
              <span
                style={{
                  fontSize: "0.72rem", textTransform: "uppercase", color: EVENT_TYPE_COLORS[ev.event_type],
                  fontWeight: 700, letterSpacing: "0.03em",
                }}
              >
                {ev.event_type}
              </span>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
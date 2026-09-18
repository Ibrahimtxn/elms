type Tone = "success" | "warning" | "danger" | "neutral" | "primary";

const STATUS_TONE: Record<string, Tone> = {
  active: "success",
  completed: "success",
  graded: "success",
  submitted: "primary",
  late: "warning",
  pending: "warning",
  dropped: "danger",
  returned: "neutral",
};

export function StatusBadge({ status }: { status: string }) {
  const tone = STATUS_TONE[status.toLowerCase()] ?? "neutral";
  return <span className={`pill pill-${tone}`}>{status.replace(/_/g, " ")}</span>;
}
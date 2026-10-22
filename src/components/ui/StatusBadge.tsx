type StatusBadgeProps = {
  status: "healthy" | "error";
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`status status-${status}`}>{status}</span>;
}
interface StatusPillProps {
  status: "approved" | "pending" | "rejected" | "active" | "inactive";
  size?: "sm" | "md";
}

const sizeStyles: Record<string, string> = {
  sm: "text-[10px] px-2 py-0.5",
  md: "text-[11px] px-2.5 py-1",
};

export default function StatusPill({ status, size = "md" }: StatusPillProps) {
  const classMap: Record<string, string> = {
    approved: "status-approved",
    pending: "status-pending",
    rejected: "status-rejected",
    active: "status-active",
    inactive: "status-inactive",
  };

  return (
    <span className={`status-pill ${classMap[status]} ${sizeStyles[size]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

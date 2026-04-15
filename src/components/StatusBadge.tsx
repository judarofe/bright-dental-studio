import { AppointmentStatus } from "@/data/store";
import { cn } from "@/lib/utils";

const config: Record<AppointmentStatus, { label: string; dot: string; bg: string }> = {
  pending: { label: "Pendiente", dot: "bg-warning", bg: "bg-warning/10 text-warning" },
  confirmed: { label: "Confirmada", dot: "bg-primary", bg: "bg-primary/10 text-primary" },
  completed: { label: "Completada", dot: "bg-success", bg: "bg-success/10 text-success" },
  noshow: { label: "No asistió", dot: "bg-destructive", bg: "bg-destructive/10 text-destructive" },
};

interface Props {
  status: AppointmentStatus;
  variant?: "dot" | "pill";
  className?: string;
}

export function StatusBadge({ status, variant = "dot", className }: Props) {
  const c = config[status];

  if (variant === "pill") {
    return (
      <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", c.bg, className)}>
        <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} />
        {c.label}
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground", className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} />
      {c.label}
    </span>
  );
}

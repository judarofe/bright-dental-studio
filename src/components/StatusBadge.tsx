import { AppointmentStatus } from "@/data/store";
import { cn } from "@/lib/utils";

const config: Record<AppointmentStatus, { label: string; dot: string }> = {
  pending: { label: "Pendiente", dot: "bg-warning" },
  confirmed: { label: "Confirmada", dot: "bg-primary" },
  completed: { label: "Completada", dot: "bg-success" },
  noshow: { label: "No asistió", dot: "bg-destructive" },
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const c = config[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} />
      {c.label}
    </span>
  );
}

import { Badge } from "@/components/ui/badge";
import { AppointmentStatus } from "@/data/store";
import { cn } from "@/lib/utils";

const config: Record<AppointmentStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-status-pending/15 text-status-pending border-status-pending/30" },
  confirmed: { label: "Confirmed", className: "bg-status-confirmed/15 text-status-confirmed border-status-confirmed/30" },
  completed: { label: "Completed", className: "bg-status-completed/15 text-status-completed border-status-completed/30" },
  noshow: { label: "No-show", className: "bg-status-noshow/15 text-status-noshow border-status-noshow/30" },
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const c = config[status];
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", c.className)}>
      {c.label}
    </Badge>
  );
}

import { cn } from "@/lib/utils";

export type ClinicalRecordStatus = "draft" | "in_progress" | "closed" | "voided";

const config: Record<ClinicalRecordStatus, { label: string; dot: string; bg: string }> = {
  draft: {
    label: "Borrador",
    dot: "bg-clinical-draft",
    bg: "bg-clinical-draft/10 text-clinical-draft",
  },
  in_progress: {
    label: "En progreso",
    dot: "bg-clinical-in-progress",
    bg: "bg-clinical-in-progress/10 text-clinical-in-progress",
  },
  closed: {
    label: "Cerrada",
    dot: "bg-clinical-closed",
    bg: "bg-clinical-closed/10 text-clinical-closed",
  },
  voided: {
    label: "Anulada",
    dot: "bg-clinical-voided",
    bg: "bg-clinical-voided/10 text-clinical-voided",
  },
};

interface Props {
  status: ClinicalRecordStatus;
  variant?: "dot" | "pill";
  className?: string;
}

export function ClinicalStatusBadge({ status, variant = "dot", className }: Props) {
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

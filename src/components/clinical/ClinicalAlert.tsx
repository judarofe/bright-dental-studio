import { AlertTriangle, Info, ShieldAlert, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertType = "risk" | "admin" | "info";

interface Props {
  type: AlertType;
  title: string;
  description?: string;
  icon?: LucideIcon;
  className?: string;
}

const config: Record<AlertType, { icon: LucideIcon; bg: string; border: string; text: string; iconColor: string }> = {
  risk: {
    icon: ShieldAlert,
    bg: "bg-alert-risk/8",
    border: "border-alert-risk/20",
    text: "text-alert-risk",
    iconColor: "text-alert-risk",
  },
  admin: {
    icon: AlertTriangle,
    bg: "bg-alert-admin/10",
    border: "border-alert-admin/25",
    text: "text-alert-admin",
    iconColor: "text-alert-admin",
  },
  info: {
    icon: Info,
    bg: "bg-alert-info/8",
    border: "border-alert-info/20",
    text: "text-alert-info",
    iconColor: "text-alert-info",
  },
};

export function ClinicalAlert({ type, title, description, icon, className }: Props) {
  const c = config[type];
  const Icon = icon || c.icon;

  return (
    <div className={cn("flex items-start gap-3 rounded-lg border p-3.5", c.bg, c.border, className)}>
      <div className={cn("mt-0.5 shrink-0", c.iconColor)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className={cn("text-sm font-medium", c.text)}>{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
    </div>
  );
}

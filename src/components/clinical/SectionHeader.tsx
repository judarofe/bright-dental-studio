import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function SectionHeader({ title, subtitle, icon: Icon, action, size = "default", className }: Props) {
  const titleSize = {
    sm: "text-sm font-medium",
    default: "text-base font-semibold",
    lg: "text-xl font-semibold",
  };

  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <div className="flex items-center gap-2.5 min-w-0">
        {Icon && (
          <div className="h-8 w-8 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        )}
        <div className="min-w-0">
          <h3 className={cn("text-foreground tracking-tight", titleSize[size])}>{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

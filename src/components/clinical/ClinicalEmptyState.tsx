import { LucideIcon, FileX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  icon?: LucideIcon;
  title: string;
  description: string;
  hint?: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: "default" | "inline";
  className?: string;
}

export function ClinicalEmptyState({
  icon: Icon = FileX,
  title,
  description,
  hint,
  actionLabel,
  onAction,
  variant = "default",
  className,
}: Props) {
  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-3 rounded-lg border border-dashed p-4 text-left", className)}>
        <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
        {actionLabel && onAction && (
          <Button onClick={onAction} variant="outline" size="sm" className="shrink-0 ml-auto">
            {actionLabel}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("py-16 text-center", className)}>
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-4">
        <Icon className="h-7 w-7 text-muted-foreground" />
      </div>
      <p className="text-base font-medium text-foreground mb-1">{title}</p>
      <p className="text-sm text-muted-foreground mb-1.5 max-w-xs mx-auto">{description}</p>
      {hint && (
        <p className="text-xs text-muted-foreground/70 mb-4 max-w-xs mx-auto italic">{hint}</p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="rounded-xl gap-1.5">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

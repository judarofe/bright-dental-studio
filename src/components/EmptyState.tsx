import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: Props) {
  return (
    <div className="py-16 text-center">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-4">
        <Icon className="h-7 w-7 text-muted-foreground" />
      </div>
      <p className="text-base font-medium text-foreground mb-1">{title}</p>
      <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="rounded-xl gap-1.5">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

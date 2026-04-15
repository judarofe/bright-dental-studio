import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckItem {
  label: string;
  completed: boolean;
  required?: boolean;
}

interface Props {
  title?: string;
  items: CheckItem[];
  className?: string;
}

export function ValidationChecklist({ title, items, className }: Props) {
  const completedCount = items.filter((i) => i.completed).length;
  const total = items.length;
  const allDone = completedCount === total;
  const progress = total > 0 ? (completedCount / total) * 100 : 0;

  return (
    <div className={cn("rounded-lg border p-4 space-y-3", className)}>
      {title && (
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <span className={cn("text-xs font-medium", allDone ? "text-success" : "text-muted-foreground")}>
            {completedCount}/{total}
          </span>
        </div>
      )}

      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-300", allDone ? "bg-success" : "bg-primary")}
          style={{ width: `${progress}%` }}
        />
      </div>

      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2.5">
            {item.completed ? (
              <div className="h-5 w-5 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                <Check className="h-3 w-3 text-success" />
              </div>
            ) : (
              <div className="h-5 w-5 rounded-full border border-border flex items-center justify-center shrink-0">
                <Circle className="h-2.5 w-2.5 text-muted-foreground/40" />
              </div>
            )}
            <span className={cn(
              "text-sm",
              item.completed ? "text-muted-foreground line-through" : "text-foreground"
            )}>
              {item.label}
              {item.required && !item.completed && (
                <span className="text-destructive ml-1 text-xs">*</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

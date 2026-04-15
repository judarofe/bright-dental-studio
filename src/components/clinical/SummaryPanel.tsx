import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SummaryItem {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  accent?: "primary" | "success" | "warning" | "destructive" | "muted";
}

interface Props {
  title?: string;
  items: SummaryItem[];
  className?: string;
}

const accentColors: Record<string, string> = {
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
  muted: "text-muted-foreground",
};

export function SummaryPanel({ title, items, className }: Props) {
  return (
    <Card className={cn("border-0 shadow-sm", className)}>
      {title && (
        <div className="px-5 pt-4 pb-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
        </div>
      )}
      <CardContent className={cn("grid gap-4 p-5", items.length <= 4 ? `grid-cols-${items.length}` : "grid-cols-2 sm:grid-cols-4")}>
        {items.map((item) => (
          <div key={item.label} className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              {item.icon && <item.icon className="h-3.5 w-3.5 text-muted-foreground" />}
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
            <span className={cn("text-xl font-bold tracking-tight", accentColors[item.accent || "primary"])}>
              {item.value}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "primary" | "success" | "warning" | "destructive";
  className?: string;
}

const accentMap = {
  primary: "bg-primary/8 text-primary",
  success: "bg-success/8 text-success",
  warning: "bg-warning/8 text-warning",
  destructive: "bg-destructive/8 text-destructive",
};

export function StatCard({ title, value, icon: Icon, accent = "primary", className }: Props) {
  return (
    <Card className={cn("border-0 shadow-sm", className)}>
      <CardContent className="p-5 flex items-center gap-4">
        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", accentMap[accent])}>
          <Icon className="h-[18px] w-[18px]" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold mt-0.5 tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

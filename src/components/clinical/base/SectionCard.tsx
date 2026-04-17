import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/clinical/SectionHeader";
import type { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}

export function SectionCard({ title, icon, children }: Props) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5 space-y-3">
        <SectionHeader title={title} icon={icon} size="sm" />
        {children}
      </CardContent>
    </Card>
  );
}

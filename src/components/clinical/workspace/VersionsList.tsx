import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/clinical/SectionHeader";
import { History } from "lucide-react";
import type { VersionHistoria } from "@/data/clinicalTypes";

interface Props {
  versiones: VersionHistoria[];
}

export function VersionsList({ versiones }: Props) {
  if (versiones.length === 0) return null;
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5 space-y-3">
        <SectionHeader title="Historial de versiones" icon={History} size="sm" />
        <div className="space-y-1.5">
          {versiones.map((v) => (
            <div key={v.id} className="flex items-center gap-3 text-xs py-1.5">
              <span className="font-mono text-muted-foreground w-8">v{v.version}</span>
              <span className="text-muted-foreground w-20">
                {new Date(v.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
              </span>
              <span className="flex-1">{v.resumenCambios}</span>
              <span className="text-muted-foreground">{v.autor}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

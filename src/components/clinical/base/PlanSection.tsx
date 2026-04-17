import { Textarea } from "@/components/ui/textarea";
import { SectionCard } from "./SectionCard";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import type { HistoriaOdontologica } from "@/data/clinicalTypes";

interface Props {
  historia: HistoriaOdontologica;
  isLocked: boolean;
}

export function PlanSection({ historia, isLocked }: Props) {
  return (
    <SectionCard title="Plan de tratamiento" icon={CheckCircle2}>
      <Textarea
        defaultValue={historia.detalle.planTratamiento}
        placeholder="Defina el plan de tratamiento: fases, procedimientos, prioridades…"
        rows={6}
        className="rounded-xl resize-none text-sm"
        readOnly={isLocked}
      />
      {!historia.detalle.planTratamiento && (
        <p className="text-xs text-destructive flex items-center gap-1.5 mt-1">
          <AlertTriangle className="h-3 w-3" /> Se recomienda definir el plan antes de cerrar la historia.
        </p>
      )}
    </SectionCard>
  );
}

import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/EmptyState";
import { SpecialtyBanner } from "@/components/clinical/workspace/SpecialtyBanner";
import { OdontologicIndicators } from "@/components/clinical/specialties/OdontologySections";
import { ListChecks } from "lucide-react";
import type { SpecialtyMeta } from "@/lib/clinical/sections";
import type { HistoriaOdontologica } from "@/data/clinicalTypes";

interface Props {
  historia: HistoriaOdontologica;
  meta: SpecialtyMeta;
}

export function IndicadoresOdontoSection({ historia, meta }: Props) {
  if (!historia.detalle.examenFisico) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <EmptyState
            icon={ListChecks}
            title="Sin indicadores odontológicos"
            description="Complete primero el examen físico general."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <SpecialtyBanner meta={meta} />
      <OdontologicIndicators examen={historia.detalle.examenFisico} />
    </div>
  );
}

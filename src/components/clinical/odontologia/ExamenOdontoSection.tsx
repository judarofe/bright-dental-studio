import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/EmptyState";
import { SpecialtyBanner } from "@/components/clinical/workspace/SpecialtyBanner";
import { ClinicalTextField } from "@/components/clinical/base/ClinicalTextField";
import { Stethoscope } from "lucide-react";
import type { SpecialtyMeta } from "@/lib/clinical/sections";
import type { HistoriaOdontologica } from "@/data/clinicalTypes";

interface Props {
  historia: HistoriaOdontologica;
  meta: SpecialtyMeta;
}

export function ExamenOdontoSection({ historia, meta }: Props) {
  if (!historia.detalle.examenFisico) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <EmptyState
            icon={Stethoscope}
            title="Sin exploración odontológica"
            description="Complete primero el examen físico general."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <SpecialtyBanner meta={meta} />
      <ClinicalTextField
        title="Exploración odontológica (cabeza y cuello)"
        icon={Stethoscope}
        value={historia.detalle.examenFisico.especifico}
        placeholder="ATM, apertura bucal, mucosa oral, piso de boca, lengua, paladar, orofaringe…"
        rows={4}
        required
        templates={[
          "ATM sin chasquidos ni crepitaciones. Apertura bucal adecuada (>40mm). Mucosa oral sin lesiones. Encías rosadas y firmes. Piso de boca y lengua sin alteraciones. Paladar duro y blando normales. Orofaringe sin hallazgos.",
          "ATM con [chasquido/crepitación] en [lado]. Apertura bucal [limitada/normal] ([mm]mm). Mucosa [hallazgo]. Encías [hallazgo]. [Otros hallazgos].",
        ]}
      />
    </div>
  );
}

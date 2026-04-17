import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/EmptyState";
import { ClinicalTextField } from "./ClinicalTextField";
import { VitalsSection } from "@/components/clinical/specialties/OdontologySections";
import { Activity, User } from "lucide-react";
import { toast } from "sonner";
import type { HistoriaOdontologica } from "@/data/clinicalTypes";

interface Props {
  historia: HistoriaOdontologica;
}

export function ExamenGeneralSection({ historia }: Props) {
  if (!historia.detalle.examenFisico) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <EmptyState
            icon={Activity}
            title="Sin examen físico registrado"
            description="Registre los signos vitales e indicadores clínicos del paciente."
            actionLabel="Registrar examen"
            onAction={() => toast.info("Registro de examen — en desarrollo")}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <ClinicalTextField
        title="Examen físico general"
        icon={User}
        value={historia.detalle.examenFisico.general}
        placeholder="Estado general, aspecto, marcha, orientación, piel, mucosas, ganglios…"
        rows={3}
        required
        templates={[
          "Paciente en buen estado general, orientado en tiempo, lugar y persona. Piel y mucosas normocoloreadas e hidratadas. Sin adenopatías cervicales palpables. Marcha normal.",
          "Paciente en regular estado general. Se observa [hallazgo]. Adenopatías [palpables/no palpables] en [región].",
        ]}
      />
      {/* Shared vitals — common to all specialties */}
      <VitalsSection examen={historia.detalle.examenFisico} />
    </div>
  );
}

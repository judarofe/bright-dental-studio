import { SpecialtyBanner } from "@/components/clinical/workspace/SpecialtyBanner";
import { ClinicalTextField } from "@/components/clinical/base/ClinicalTextField";
import { Stethoscope } from "lucide-react";
import type { SpecialtyMeta } from "@/lib/clinical/sections";
import type { HistoriaOdontologica } from "@/data/clinicalTypes";

interface Props {
  historia: HistoriaOdontologica;
  meta: SpecialtyMeta;
}

export function AntecedentesOdontoSection({ historia, meta }: Props) {
  return (
    <div className="space-y-4">
      <SpecialtyBanner meta={meta} />
      <ClinicalTextField
        title="Antecedentes odontológicos"
        icon={Stethoscope}
        value={historia.detalle.antecedentesOdontologicos}
        placeholder="Historial de tratamientos dentales previos, experiencias con anestesia, complicaciones…"
        rows={4}
        templates={[
          "Sin tratamientos odontológicos previos significativos. Niega complicaciones con anestesia local.",
          "Antecedentes de [endodoncia/exodoncia/restauraciones] en piezas [números]. Última visita odontológica hace [tiempo].",
        ]}
      />
    </div>
  );
}

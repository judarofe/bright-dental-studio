import { SpecialtyBanner } from "@/components/clinical/workspace/SpecialtyBanner";
import { ClinicalTextField } from "@/components/clinical/base/ClinicalTextField";
import { Cigarette } from "lucide-react";
import type { SpecialtyMeta } from "@/lib/clinical/sections";
import type { HistoriaOdontologica } from "@/data/clinicalTypes";

interface Props {
  historia: HistoriaOdontologica;
  meta: SpecialtyMeta;
}

export function HabitosOralesSection({ historia, meta }: Props) {
  return (
    <div className="space-y-4">
      <SpecialtyBanner meta={meta} />
      <ClinicalTextField
        title="Hábitos orales"
        icon={Cigarette}
        value={historia.detalle.habitos}
        placeholder="Bruxismo, onicofagia, respiración oral, dieta cariogénica, tabaquismo…"
        rows={4}
        templates={[
          "Niega hábitos parafuncionales. Sin bruxismo. Dieta balanceada, baja en azúcares. Higiene oral 2-3 veces/día.",
          "Bruxismo [diurno/nocturno]. [Usa/No usa] placa oclusal. Tabaquismo: [cigarrillos/día]. Consumo de [café/bebidas azucaradas]: [frecuencia].",
        ]}
      />
    </div>
  );
}

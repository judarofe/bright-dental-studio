import { SpecialtyBanner } from "@/components/clinical/workspace/SpecialtyBanner";
import { DiagnosticosSection } from "@/components/clinical/DiagnosticosSection";
import type { SpecialtyMeta } from "@/lib/clinical/sections";
import type { DiagnosticoOdontologico } from "@/data/clinicalTypes";

interface Props {
  diagnosticos: DiagnosticoOdontologico[];
  historiaId: string;
  meta: SpecialtyMeta;
}

export function DiagnosticosOdontoSection({ diagnosticos, historiaId, meta }: Props) {
  return (
    <div className="space-y-4">
      <SpecialtyBanner meta={meta} />
      <DiagnosticosSection diagnosticos={diagnosticos} historiaId={historiaId} />
    </div>
  );
}

import { SpecialtyBanner } from "@/components/clinical/workspace/SpecialtyBanner";
import { ConductaCierreSection } from "@/components/clinical/ConductaCierreSection";
import type { SpecialtyMeta } from "@/lib/clinical/sections";
import type { HistoriaOdontologica, DiagnosticoOdontologico } from "@/data/clinicalTypes";

interface ChecklistItem {
  label: string;
  completed: boolean;
  required?: true;
}

interface Props {
  historia: HistoriaOdontologica;
  diagnosticos: DiagnosticoOdontologico[];
  checklistItems: ChecklistItem[];
  onUpdateHistoria: (id: string, data: Partial<HistoriaOdontologica>) => void;
  meta: SpecialtyMeta;
}

export function ConductaOdontoSection({ historia, diagnosticos, checklistItems, onUpdateHistoria, meta }: Props) {
  return (
    <div className="space-y-4">
      <SpecialtyBanner meta={meta} />
      <ConductaCierreSection
        historia={historia}
        diagnosticos={diagnosticos}
        checklistItems={checklistItems}
        onUpdateHistoria={onUpdateHistoria}
      />
    </div>
  );
}

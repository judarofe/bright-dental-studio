import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { SectionHeader } from "@/components/clinical/SectionHeader";
import { ClinicalTextField } from "./ClinicalTextField";
import { ListChecks, Heart, Users, Brain } from "lucide-react";
import type { HistoriaOdontologica } from "@/data/clinicalTypes";

interface Props {
  historia: HistoriaOdontologica;
}

export function AntecedentesSection({ historia }: Props) {
  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5 space-y-3">
          <SectionHeader title="Clasificación clínica" size="sm" icon={ListChecks} />
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">ASA</Label>
              <p className="font-medium">{historia.clasificacion.asa.replace("_", " ")}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Alergias</Label>
              <p className="font-medium">{historia.clasificacion.alergias.length > 0 ? historia.clasificacion.alergias.join(", ") : "Ninguna"}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Enfermedades crónicas</Label>
              <p className="font-medium">{historia.clasificacion.enfermedadesCronicas.length > 0 ? historia.clasificacion.enfermedadesCronicas.join(", ") : "Ninguna"}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Medicamentos</Label>
              <p className="font-medium">{historia.clasificacion.medicamentosActuales.length > 0 ? historia.clasificacion.medicamentosActuales.join(", ") : "Ninguno"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ClinicalTextField
        title="Antecedentes médicos personales"
        icon={Heart}
        value={historia.detalle.antecedentesMedicos}
        placeholder="Enfermedades previas, cirugías, hospitalizaciones, alergias medicamentosas…"
        rows={4}
        required
        templates={[
          "Sin antecedentes médicos relevantes. Niega alergias medicamentosas. Niega cirugías previas. Niega hospitalizaciones.",
          "Paciente con antecedente de [enfermedad] diagnosticada en [año]. En tratamiento con [medicamento]. Alergia a [sustancia].",
        ]}
      />

      <ClinicalTextField
        title="Antecedentes familiares"
        icon={Users}
        value={historia.detalle.antecedentesFamiliares}
        placeholder="Enfermedades hereditarias, condiciones familiares relevantes…"
        rows={3}
        templates={[
          "Sin antecedentes familiares relevantes.",
          "Antecedentes familiares de [diabetes/hipertensión/cáncer] en [parentesco].",
        ]}
      />

      <ClinicalTextField
        title="Revisión por sistemas"
        icon={Brain}
        value={historia.detalle.revisionSistemas}
        placeholder="Cardiovascular, respiratorio, endocrino, digestivo, neurológico, musculoesquelético…"
        rows={4}
        templates={[
          "Cardiovascular: normal. Respiratorio: normal. Endocrino: normal. Digestivo: normal. Neurológico: normal. Musculoesquelético: normal. Genitourinario: normal.",
          "Cardiovascular: [hallazgo]. Respiratorio: [hallazgo]. Endocrino: [hallazgo]. Sin otros hallazgos relevantes.",
        ]}
      />
    </div>
  );
}

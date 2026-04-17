import { ClipboardList, Clipboard } from "lucide-react";
import { ClinicalTextField } from "./ClinicalTextField";
import type { HistoriaOdontologica } from "@/data/clinicalTypes";

interface Props {
  historia: HistoriaOdontologica;
}

export function MotivoSection({ historia }: Props) {
  return (
    <div className="space-y-4">
      <ClinicalTextField
        title="Motivo de consulta"
        icon={ClipboardList}
        value={historia.detalle.motivoConsulta}
        placeholder="¿Por qué acude el paciente hoy?"
        rows={3}
        required
        templates={[
          "Control periódico y profilaxis",
          "Dolor dental agudo",
          "Valoración para tratamiento restaurador",
          "Consulta de urgencia",
        ]}
      />
      <ClinicalTextField
        title="Anamnesis"
        icon={Clipboard}
        value={historia.detalle.anamnesis}
        placeholder="Describa la historia de la enfermedad actual: inicio, evolución, síntomas, factores agravantes o atenuantes…"
        rows={5}
        required
        templates={[
          "Paciente refiere dolor de tipo [pulsátil/sordo/agudo] en [zona] desde hace [tiempo]. [Aumenta/disminuye] con [estímulo]. Sin/con irradiación.",
          "Acude para control de rutina. Sin sintomatología actual. Última visita hace [tiempo].",
        ]}
      />
    </div>
  );
}

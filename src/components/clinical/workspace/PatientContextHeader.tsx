import { Card, CardContent } from "@/components/ui/card";
import { ClinicalAlert } from "@/components/clinical/ClinicalAlert";
import { ClinicalStatusBadge, type ClinicalRecordStatus } from "@/components/clinical/ClinicalStatusBadge";
import { Phone } from "lucide-react";
import type { Patient } from "@/data/store";
import type { HistoriaOdontologica } from "@/data/clinicalTypes";
import type { SpecialtyMeta } from "@/lib/clinical/sections";

interface Props {
  patient: Patient;
  historia: HistoriaOdontologica;
  meta: SpecialtyMeta;
  badgeStatus?: ClinicalRecordStatus;
}

/** Patient context card shown above section navigation. */
export function PatientContextHeader({ patient, historia, meta, badgeStatus }: Props) {
  const initials = patient.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-primary font-bold text-lg">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-foreground">{patient.name}</h1>
              {badgeStatus && <ClinicalStatusBadge status={badgeStatus} variant="pill" />}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Historia clínica · Especialidad: {meta.label}
            </p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
              <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {patient.phone}</span>
              {patient.cedula && <span>Cédula: {patient.cedula}</span>}
            </div>
          </div>
          <div className="text-right text-xs text-muted-foreground shrink-0">
            <p>Creada: {new Date(historia.creadoEn).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}</p>
            <p>Actualizada: {new Date(historia.actualizadoEn).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}</p>
          </div>
        </div>

        {historia.clasificacion.alergias.length > 0 && (
          <div className="mt-3">
            <ClinicalAlert
              type="risk"
              title="Alergias"
              description={historia.clasificacion.alergias.join(", ")}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { FileText, Stethoscope, Pill, ClipboardList, Users, CalendarCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  ClinicalAlert,
  ClinicalStatusBadge,
  SummaryPanel,
  SectionHeader,
  ClinicalEmptyState,
  ValidationChecklist,
} from "@/components/clinical";

const modules = [
  { icon: ClipboardList, title: "Consultas", desc: "Registro de cada visita y exploración clínica" },
  { icon: Stethoscope, title: "Diagnósticos", desc: "Hallazgos clínicos y plan de tratamiento" },
  { icon: FileText, title: "Procedimientos", desc: "Historial de intervenciones y odontograma" },
  { icon: Pill, title: "Prescripciones", desc: "Medicamentos recetados por consulta" },
];

export default function ClinicalHistory() {
  return (
    <div className="page-container space-y-8">
      <div>
        <h1 className="page-title">Historia Odontológica</h1>
        <p className="page-subtitle">Registro clínico centralizado de todos los pacientes</p>
      </div>

      {/* Alerts demo */}
      <div className="space-y-2.5">
        <ClinicalAlert
          type="info"
          title="Módulo en desarrollo"
          description="Las historias clínicas estarán disponibles próximamente. Los componentes del sistema ya están preparados."
        />
      </div>

      {/* Summary panel */}
      <SummaryPanel
        title="Resumen general"
        items={[
          { label: "Historias activas", value: 0, icon: Users, accent: "primary" },
          { label: "Consultas hoy", value: 0, icon: CalendarCheck, accent: "success" },
          { label: "Pendientes", value: 0, accent: "warning" },
          { label: "Cerradas", value: 0, accent: "muted" },
        ]}
      />

      {/* Status badges preview */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5 space-y-3">
          <SectionHeader title="Estados de historia clínica" size="sm" />
          <div className="flex flex-wrap gap-3">
            <ClinicalStatusBadge status="draft" variant="pill" />
            <ClinicalStatusBadge status="in_progress" variant="pill" />
            <ClinicalStatusBadge status="closed" variant="pill" />
            <ClinicalStatusBadge status="voided" variant="pill" />
          </div>
        </CardContent>
      </Card>

      {/* Modules */}
      <div>
        <SectionHeader title="Módulos clínicos" subtitle="Secciones disponibles en cada historia" className="mb-4" />
        <div className="grid gap-3 sm:grid-cols-2">
          {modules.map((m) => (
            <ClinicalEmptyState
              key={m.title}
              icon={m.icon}
              title={m.title}
              description={m.desc}
              variant="inline"
            />
          ))}
        </div>
      </div>

      {/* Validation checklist */}
      <ValidationChecklist
        title="Requisitos para historia completa"
        items={[
          { label: "Datos personales del paciente", completed: true, required: true },
          { label: "Antecedentes médicos registrados", completed: false, required: true },
          { label: "Exploración clínica inicial", completed: false, required: true },
          { label: "Diagnóstico principal", completed: false },
          { label: "Plan de tratamiento definido", completed: false },
        ]}
      />
    </div>
  );
}

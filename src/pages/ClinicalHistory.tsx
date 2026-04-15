import { FileText, Stethoscope, Pill, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const modules = [
  { icon: ClipboardList, title: "Consultas", desc: "Registro de cada visita y exploración clínica" },
  { icon: Stethoscope, title: "Diagnósticos", desc: "Hallazgos clínicos y plan de tratamiento" },
  { icon: FileText, title: "Procedimientos", desc: "Historial de intervenciones y odontograma" },
  { icon: Pill, title: "Prescripciones", desc: "Medicamentos recetados por consulta" },
];

export default function ClinicalHistory() {
  return (
    <div className="page-container">
      <div>
        <h1 className="page-title">Historia Odontológica</h1>
        <p className="page-subtitle">Registro clínico centralizado de todos los pacientes</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {modules.map((m) => (
          <Card key={m.title} className="border-dashed opacity-70">
            <CardHeader className="flex-row items-center gap-3 space-y-0 pb-2">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <m.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm">{m.title}</CardTitle>
                <CardDescription className="text-xs">{m.desc}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Próximamente</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

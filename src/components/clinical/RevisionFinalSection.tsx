import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { SectionHeader } from "./SectionHeader";
import { ClinicalAlert } from "./ClinicalAlert";
import { ClinicalStatusBadge } from "./ClinicalStatusBadge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { HistoriaOdontologica, DiagnosticoOdontologico, Odontograma, NotaCortaOdontologica } from "@/data/clinicalTypes";
import {
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Lock,
  Save,
  Printer,
  FileDown,
  Edit3,
  Stethoscope,
  Activity,
  Heart,
  Pill,
  StickyNote,
  FileText,
  ListChecks,
  ShieldAlert,
  ArrowRight,
  Eye,
} from "lucide-react";

/* ── Types ─────────────────────────────────────── */

interface CheckItem {
  label: string;
  completed: boolean;
  required?: boolean;
}

interface Props {
  historia: HistoriaOdontologica;
  patient: { name: string; phone: string; cedula?: string };
  diagnosticos: DiagnosticoOdontologico[];
  odontograma: Odontograma | null;
  notas: NotaCortaOdontologica[];
  checklistItems: CheckItem[];
  onNavigateSection: (section: string) => void;
  onClose: () => void;
  onSaveDraft: () => void;
  onPrint: () => void;
}

/* ── Section review card ─────────────────────── */

type SectionStatus = "complete" | "partial" | "empty" | "warning";

interface SectionReview {
  id: string;
  label: string;
  status: SectionStatus;
  summary: string;
  navigateTo: string;
}

const statusConfig: Record<SectionStatus, { icon: typeof CheckCircle2; color: string; bg: string }> = {
  complete: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  partial: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
  empty: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
  warning: { icon: ShieldAlert, color: "text-alert-risk", bg: "bg-alert-risk/10" },
};

/* ── Component ───────────────────────────────── */

export function RevisionFinalSection({
  historia,
  patient,
  diagnosticos,
  odontograma,
  notas,
  checklistItems,
  onNavigateSection,
  onClose,
  onSaveDraft,
  onPrint,
}: Props) {
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const det = historia.detalle;
  const cls = historia.clasificacion;
  const ind = historia.indicadores;

  // ── Build section reviews ───────────────────
  const sections: SectionReview[] = [
    {
      id: "motivo",
      label: "Motivo y anamnesis",
      navigateTo: "motivo",
      status: det.motivoConsulta && det.anamnesis ? "complete" : det.motivoConsulta || det.anamnesis ? "partial" : "empty",
      summary: det.motivoConsulta
        ? det.motivoConsulta.length > 80 ? det.motivoConsulta.slice(0, 80) + "…" : det.motivoConsulta
        : "Sin motivo de consulta registrado",
    },
    {
      id: "antecedentes",
      label: "Antecedentes",
      navigateTo: "antecedentes",
      status: det.antecedentesMedicos && det.antecedentesOdontologicos ? "complete" : det.antecedentesMedicos || det.antecedentesOdontologicos ? "partial" : "empty",
      summary: [
        cls.alergias.length > 0 ? `Alergias: ${cls.alergias.join(", ")}` : null,
        cls.enfermedadesCronicas.length > 0 ? `Crónicas: ${cls.enfermedadesCronicas.join(", ")}` : null,
        `ASA ${cls.asa.replace("_", " ")}`,
      ].filter(Boolean).join(" · ") || "Sin antecedentes registrados",
    },
    {
      id: "examen",
      label: "Examen físico",
      navigateTo: "examen",
      status: det.examenFisico ? "complete" : "empty",
      summary: det.examenFisico
        ? `PA ${det.examenFisico.signosVitales.presionArterial} · FC ${det.examenFisico.signosVitales.frecuenciaCardiaca} lpm · IMC ${det.examenFisico.signosVitales.imc}`
        : "No se registró examen físico",
    },
    {
      id: "exploracion",
      label: "Exploración clínica",
      navigateTo: "exploracion",
      status: det.exploracionClinica ? "complete" : "empty",
      summary: det.exploracionClinica
        ? det.exploracionClinica.length > 80 ? det.exploracionClinica.slice(0, 80) + "…" : det.exploracionClinica
        : "Sin exploración registrada",
    },
    {
      id: "diagnosticos",
      label: "Diagnósticos",
      navigateTo: "diagnosticos",
      status: diagnosticos.length > 0 ? "complete" : "empty",
      summary: diagnosticos.length > 0
        ? diagnosticos.map((d) => `${d.codigo} ${d.descripcion}`).join("; ").slice(0, 100)
        : "Sin diagnósticos registrados",
    },
    {
      id: "odontograma",
      label: "Odontograma",
      navigateTo: "odontograma",
      status: odontograma && odontograma.piezas.some((p) => p.condicion !== "sano") ? "complete" : odontograma ? "partial" : "empty",
      summary: odontograma
        ? `${odontograma.piezas.length} piezas registradas · ${odontograma.eventos.length} eventos`
        : "Odontograma no disponible",
    },
    {
      id: "plan",
      label: "Plan de tratamiento",
      navigateTo: "plan",
      status: det.planTratamiento ? "complete" : "empty",
      summary: det.planTratamiento
        ? det.planTratamiento.split("\n").slice(0, 2).join("; ").slice(0, 100)
        : "Sin plan de tratamiento definido",
    },
    {
      id: "notas",
      label: "Notas clínicas",
      navigateTo: "notas",
      status: notas.length > 0 ? "complete" : "partial",
      summary: notas.length > 0
        ? `${notas.length} nota(s) registrada(s) — última: ${new Date(notas[0].fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}`
        : "Sin notas clínicas",
    },
  ];

  const completedSections = sections.filter((s) => s.status === "complete").length;
  const totalSections = sections.length;
  const completionPercent = Math.round((completedSections / totalSections) * 100);

  const requiredIncomplete = checklistItems.filter((i) => i.required && !i.completed);
  const allRequiredDone = requiredIncomplete.length === 0;

  // ── Warnings & alerts ───────────────────────
  const warnings: { type: "risk" | "warning" | "error" | "info"; title: string; description?: string }[] = [];

  if (cls.alergias.length > 0) {
    warnings.push({ type: "risk", title: "Paciente con alergias conocidas", description: cls.alergias.join(", ") });
  }
  if (ind.riesgoGeneral === "alto") {
    warnings.push({ type: "warning", title: "Riesgo general alto", description: "Verificar que las precauciones clínicas estén documentadas." });
  }
  if (!det.planTratamiento) {
    warnings.push({ type: "error", title: "Plan de tratamiento vacío", description: "Se recomienda definir el plan antes de cerrar la historia." });
  }
  if (diagnosticos.length === 0) {
    warnings.push({ type: "error", title: "Sin diagnósticos", description: "No se ha registrado ningún diagnóstico en esta historia." });
  }
  if (requiredIncomplete.length > 0) {
    warnings.push({ type: "warning", title: `${requiredIncomplete.length} campo(s) obligatorio(s) pendiente(s)`, description: requiredIncomplete.map((i) => i.label).join(", ") });
  }

  const handleCloseConfirm = () => {
    setShowCloseConfirm(false);
    onClose();
  };

  const isLocked = historia.estado === "cerrada" || historia.estado === "anulada";

  return (
    <div className="space-y-4">
      {/* ── Header ───────────────────────────────── */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-primary/20" />
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <ClipboardCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground tracking-tight">Revisión final</h2>
                <p className="text-xs text-muted-foreground">Verifique toda la información antes de cerrar o exportar</p>
              </div>
            </div>
            {isLocked && (
              <Badge className="bg-muted text-muted-foreground border-0 gap-1">
                <Lock className="h-3 w-3" /> Historia bloqueada
              </Badge>
            )}
          </div>

          {/* Completion overview */}
          <div className="rounded-xl border border-border/50 p-4 space-y-3 bg-muted/20">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Completitud general</span>
              <span className={cn(
                "text-sm font-bold tabular-nums",
                completionPercent === 100 ? "text-success" : completionPercent >= 60 ? "text-warning" : "text-destructive"
              )}>
                {completionPercent}%
              </span>
            </div>
            <Progress value={completionPercent} className="h-2" />
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-success" /> {completedSections} completas</span>
              <span className="flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-warning" /> {sections.filter((s) => s.status === "partial").length} parciales</span>
              <span className="flex items-center gap-1"><XCircle className="h-3 w-3 text-destructive" /> {sections.filter((s) => s.status === "empty").length} vacías</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Warnings ─────────────────────────────── */}
      {warnings.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5 space-y-3">
            <SectionHeader title="Advertencias y errores" icon={AlertTriangle} size="sm" />
            <div className="space-y-2">
              {warnings.map((w, i) => (
                <ClinicalAlert key={i} type={w.type} title={w.title} description={w.description} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Section-by-section review ─────────── */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5 space-y-3">
          <SectionHeader title="Revisión por secciones" icon={ListChecks} size="sm" />
          <div className="space-y-1.5">
            {sections.map((sec) => {
              const cfg = statusConfig[sec.status];
              const Icon = cfg.icon;
              return (
                <div key={sec.id} className="flex items-center gap-3 rounded-xl p-3 hover:bg-muted/40 transition-colors group">
                  <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center shrink-0", cfg.bg)}>
                    <Icon className={cn("h-3.5 w-3.5", cfg.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{sec.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{sec.summary}</p>
                  </div>
                  {!isLocked && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity gap-1 h-7 text-xs text-primary"
                      onClick={() => onNavigateSection(sec.navigateTo)}
                    >
                      <Edit3 className="h-3 w-3" /> Editar
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Clinical summary ─────────────────── */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5 space-y-4">
          <SectionHeader title="Resumen clínico" icon={Eye} size="sm" />

          {/* Patient + classification */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SummaryCell label="Paciente" value={patient.name} />
            <SummaryCell label="Cédula" value={patient.cedula || "—"} />
            <SummaryCell label="Clasificación ASA" value={cls.asa.replace("_", " ")} />
            <SummaryCell label="Riesgo general" value={ind.riesgoGeneral.charAt(0).toUpperCase() + ind.riesgoGeneral.slice(1)} accent={ind.riesgoGeneral === "alto" ? "destructive" : ind.riesgoGeneral === "medio" ? "warning" : "success"} />
          </div>

          <Separator />

          {/* Diagnósticos summary */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Diagnósticos ({diagnosticos.length})</p>
            {diagnosticos.length > 0 ? (
              <div className="space-y-1.5">
                {diagnosticos.map((dx) => (
                  <div key={dx.id} className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-muted/30">
                    <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-mono shrink-0">{dx.codigo}</Badge>
                    <span className="text-xs text-foreground flex-1 truncate">{dx.descripcion}</span>
                    <Badge variant="outline" className={cn(
                      "text-[10px] h-5 px-1.5 border-0 font-medium",
                      dx.severidad === "severo" ? "bg-destructive/10 text-destructive" :
                      dx.severidad === "moderado" ? "bg-warning/10 text-warning" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {dx.severidad}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">Sin diagnósticos</p>
            )}
          </div>

          <Separator />

          {/* Odontograma summary */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Odontograma</p>
            {odontograma ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <SummaryCell label="Piezas registradas" value={String(odontograma.piezas.length)} />
                <SummaryCell label="Con hallazgos" value={String(odontograma.piezas.filter((p) => p.condicion !== "sano").length)} />
                <SummaryCell label="Eventos" value={String(odontograma.eventos.length)} />
                <SummaryCell label="Última actualización" value={new Date(odontograma.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })} />
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">Odontograma no disponible</p>
            )}
          </div>

          <Separator />

          {/* Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SummaryCell label="Piezas tratadas" value={String(ind.piezasTratadas)} />
            <SummaryCell label="Procedimientos pendientes" value={String(ind.procedimientosPendientes)} accent={ind.procedimientosPendientes > 0 ? "warning" : undefined} />
            <SummaryCell label="Última visita" value={new Date(ind.ultimaVisita).toLocaleDateString("es-ES", { day: "numeric", month: "short" })} />
            <SummaryCell label="Próxima cita" value={new Date(ind.proximaCita).toLocaleDateString("es-ES", { day: "numeric", month: "short" })} />
          </div>
        </CardContent>
      </Card>

      {/* ── Action bar ───────────────────────────── */}
      <Card className={cn("border-0 shadow-sm", !isLocked && "border-t-2 border-t-primary/20")}>
        <CardContent className="p-5">
          {isLocked ? (
            <div className="flex items-center justify-center gap-3 py-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Esta historia está <strong>{historia.estado === "cerrada" ? "cerrada" : "anulada"}</strong> y no puede modificarse.</p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button variant="outline" className="rounded-xl gap-1.5 text-sm flex-1 sm:flex-none" onClick={onSaveDraft}>
                <Save className="h-4 w-4" /> Guardar borrador
              </Button>
              <Button variant="outline" className="rounded-xl gap-1.5 text-sm flex-1 sm:flex-none" onClick={onPrint}>
                <Printer className="h-4 w-4" /> Imprimir
              </Button>
              <Button variant="outline" className="rounded-xl gap-1.5 text-sm flex-1 sm:flex-none" onClick={() => toast.info("Exportación PDF — en desarrollo")}>
                <FileDown className="h-4 w-4" /> Exportar PDF
              </Button>
              <div className="flex-1 hidden sm:block" />
              <Button
                className="rounded-xl gap-1.5 text-sm"
                disabled={!allRequiredDone}
                onClick={() => setShowCloseConfirm(true)}
              >
                <Lock className="h-4 w-4" /> Cerrar historia
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
          {!isLocked && !allRequiredDone && (
            <p className="text-xs text-destructive mt-3 flex items-center gap-1.5">
              <AlertTriangle className="h-3 w-3" />
              Complete los campos obligatorios antes de cerrar ({requiredIncomplete.length} pendiente{requiredIncomplete.length > 1 ? "s" : ""})
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Close confirm ────────────────────────── */}
      <ConfirmDialog
        open={showCloseConfirm}
        onConfirm={handleCloseConfirm}
        onCancel={() => setShowCloseConfirm(false)}
        title="¿Cerrar esta historia clínica?"
        description={`Se cerrará la historia de ${patient.name}. Una vez cerrada, no podrá editarse sin autorización administrativa. Asegúrese de que toda la información sea correcta.`}
        confirmLabel="Cerrar historia"
        variant="destructive"
      />
    </div>
  );
}

/* ── Summary cell helper ─────────────────────── */

function SummaryCell({ label, value, accent }: { label: string; value: string; accent?: "destructive" | "warning" | "success" }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={cn(
        "text-sm font-semibold tabular-nums",
        accent === "destructive" ? "text-destructive" :
        accent === "warning" ? "text-warning" :
        accent === "success" ? "text-success" :
        "text-foreground"
      )}>
        {value}
      </p>
    </div>
  );
}

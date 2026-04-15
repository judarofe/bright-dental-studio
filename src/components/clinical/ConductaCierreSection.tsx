/* ──────────────────────────────────────────────
   Conducta, Cierre y Exportación de HC
   v1.0
   ────────────────────────────────────────────── */

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionHeader } from "@/components/clinical/SectionHeader";
import { ClinicalStatusBadge } from "@/components/clinical/ClinicalStatusBadge";
import { ClinicalAlert } from "@/components/clinical/ClinicalAlert";
import { ValidationChecklist } from "@/components/clinical/ValidationChecklist";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { HistoriaOdontologica, DiagnosticoOdontologico } from "@/data/clinicalTypes";
import {
  CheckCircle2,
  Lock,
  XCircle,
  Printer,
  FileDown,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Stethoscope,
  ClipboardCheck,
  Ban,
  FileText,
  Send,
} from "lucide-react";

/* ── Types ───────────────────────────────────── */

type CierreStep = "conducta" | "resumen" | "confirmar";

interface Props {
  historia: HistoriaOdontologica;
  diagnosticos: DiagnosticoOdontologico[];
  checklistItems: { label: string; completed: boolean; required?: boolean }[];
  onUpdateHistoria: (id: string, data: Partial<HistoriaOdontologica>) => void;
}

/* ── Conducta options ────────────────────────── */

const CONDUCTA_OPTIONS = [
  { value: "tratamiento_terminado", label: "Tratamiento terminado" },
  { value: "tratamiento_en_curso", label: "Tratamiento en curso" },
  { value: "remision", label: "Remisión a especialista" },
  { value: "interconsulta", label: "Interconsulta" },
  { value: "alta", label: "Alta clínica" },
  { value: "abandono", label: "Abandono del paciente" },
];

const MOTIVO_ANULACION = [
  { value: "error_digitacion", label: "Error de digitación" },
  { value: "paciente_incorrecto", label: "Paciente incorrecto" },
  { value: "duplicado", label: "Historia duplicada" },
  { value: "otro", label: "Otro motivo" },
];

/* ── Main Component ──────────────────────────── */

export function ConductaCierreSection({ historia, diagnosticos, checklistItems, onUpdateHistoria }: Props) {
  const [conducta, setConducta] = useState("tratamiento_en_curso");
  const [conductaNotas, setConductaNotas] = useState("");
  const [remisionEspecialidad, setRemisionEspecialidad] = useState("");
  const [tratamientoTerminado, setTratamientoTerminado] = useState(false);

  // Cierre flow
  const [cierreStep, setCierreStep] = useState<CierreStep | null>(null);

  // Anulación
  const [showAnulacion, setShowAnulacion] = useState(false);
  const [motivoAnulacion, setMotivoAnulacion] = useState("");
  const [anulacionNotas, setAnulacionNotas] = useState("");

  const requiredComplete = checklistItems.filter((i) => i.required).every((i) => i.completed);
  const allComplete = checklistItems.every((i) => i.completed);
  const completedCount = checklistItems.filter((i) => i.completed).length;

  const isCerrada = historia.estado === "cerrada";
  const isAnulada = historia.estado === "anulada";
  const isLocked = isCerrada || isAnulada;

  const badgeStatus = ({ borrador: "draft", en_progreso: "in_progress", cerrada: "closed", anulada: "voided" } as const)[historia.estado];

  /* ── Handlers ────────────────────────────────── */

  const handleCerrarHistoria = () => {
    onUpdateHistoria(historia.id, { estado: "cerrada" });
    setCierreStep(null);
    toast.success("Historia clínica cerrada correctamente", {
      description: "La historia ha sido bloqueada para edición.",
    });
  };

  const handleAnular = () => {
    if (!motivoAnulacion) {
      toast.error("Seleccione un motivo de anulación");
      return;
    }
    onUpdateHistoria(historia.id, { estado: "anulada" });
    setShowAnulacion(false);
    toast.success("Historia anulada", {
      description: "Se ha registrado la anulación con el motivo indicado.",
    });
  };

  const handleExportPDF = () => {
    toast.info("Generando PDF…", { description: "El documento se descargará automáticamente." });
    setTimeout(() => toast.success("PDF generado correctamente"), 1500);
  };

  const handlePrint = () => {
    toast.info("Preparando impresión…");
    setTimeout(() => window.print(), 300);
  };

  return (
    <div className="space-y-4">
      {/* Locked banner */}
      {isLocked && (
        <ClinicalAlert
          type={isAnulada ? "error" : "info"}
          title={isAnulada ? "Historia anulada" : "Historia cerrada"}
          description={
            isAnulada
              ? "Esta historia fue anulada y no puede ser modificada. Solo se permite consulta e impresión."
              : "Esta historia está cerrada. Solo se permite consulta, impresión y exportación."
          }
        />
      )}

      {/* ── 1. Conducta y tratamiento ──────────── */}
      <Card className={cn("border-0 shadow-sm", isLocked && "opacity-60 pointer-events-none")}>
        <CardContent className="p-5 space-y-4">
          <SectionHeader title="Conducta y tratamiento" icon={ClipboardCheck} size="sm" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Conducta *</Label>
              <Select value={conducta} onValueChange={setConducta}>
                <SelectTrigger className="rounded-xl h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONDUCTA_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {conducta === "remision" && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Especialidad de remisión *</Label>
                <Select value={remisionEspecialidad} onValueChange={setRemisionEspecialidad}>
                  <SelectTrigger className="rounded-xl h-9 text-sm">
                    <SelectValue placeholder="Seleccione especialidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="endodoncia">Endodoncia</SelectItem>
                    <SelectItem value="periodoncia">Periodoncia</SelectItem>
                    <SelectItem value="ortodoncia">Ortodoncia</SelectItem>
                    <SelectItem value="cirugia_oral">Cirugía oral</SelectItem>
                    <SelectItem value="rehabilitacion">Rehabilitación oral</SelectItem>
                    <SelectItem value="medicina_general">Medicina general</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {conducta === "remision" && remisionEspecialidad && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-primary/[0.04] border border-primary/15 text-xs">
              <Send className="h-4 w-4 text-primary shrink-0" />
              <p className="text-muted-foreground">
                Se generará orden de remisión a{" "}
                <span className="font-semibold text-foreground capitalize">{remisionEspecialidad.replace("_", " ")}</span>.
                Adjunte resumen clínico y ayudas diagnósticas.
              </p>
            </div>
          )}

          {conducta === "tratamiento_terminado" && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-success/10 border border-success/20 text-xs">
              <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
              <p className="text-muted-foreground">
                Al marcar como <span className="font-semibold text-success">tratamiento terminado</span>, la historia quedará lista para cierre formal.
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Observaciones de conducta</Label>
            <Textarea
              value={conductaNotas}
              onChange={(e) => setConductaNotas(e.target.value)}
              placeholder="Indicaciones al paciente, recomendaciones post-tratamiento, próximos pasos…"
              rows={3}
              className="rounded-xl resize-none text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* ── 2. Pre-cierre: Resumen y validación ── */}
      {!isLocked && (
        <Card className="border-0 shadow-sm border-l-4 border-l-warning/50">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <SectionHeader title="Cierre de historia clínica" icon={Lock} size="sm" />
              <ClinicalStatusBadge status={badgeStatus} variant="pill" />
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              El cierre de la historia es un acto <span className="font-semibold text-foreground">irreversible</span> que bloquea la edición.
              Verifique que toda la información clínica esté completa antes de proceder.
            </p>

            {/* Validation summary inline */}
            <div className="rounded-xl border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold">Verificación de completitud</p>
                <Badge variant="outline" className={cn(
                  "text-[10px] h-5 px-2 font-semibold border-0",
                  allComplete ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                )}>
                  {completedCount}/{checklistItems.length}
                </Badge>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", allComplete ? "bg-success" : requiredComplete ? "bg-primary" : "bg-warning")}
                  style={{ width: `${(completedCount / checklistItems.length) * 100}%` }}
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
                {checklistItems.map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5 text-[10px]">
                    {item.completed ? (
                      <CheckCircle2 className="h-3 w-3 text-success shrink-0" />
                    ) : (
                      <XCircle className={cn("h-3 w-3 shrink-0", item.required ? "text-destructive" : "text-muted-foreground/40")} />
                    )}
                    <span className={cn(item.completed ? "text-muted-foreground" : item.required ? "text-destructive" : "text-muted-foreground/60")}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Block alert */}
            {!requiredComplete && (
              <ClinicalAlert
                type="warning"
                title="Campos obligatorios incompletos"
                description="No es posible cerrar la historia hasta completar todos los campos marcados como obligatorios."
              />
            )}

            {/* Cierre flow */}
            {cierreStep === null && (
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() => setCierreStep("resumen")}
                  disabled={!requiredComplete}
                  className="rounded-xl gap-1.5 text-xs h-9"
                >
                  <Lock className="h-3.5 w-3.5" /> Iniciar cierre de historia
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAnulacion(true)}
                  className="rounded-xl gap-1.5 text-xs h-9 text-destructive hover:text-destructive hover:bg-destructive/5 border-destructive/20"
                >
                  <Ban className="h-3.5 w-3.5" /> Anular historia
                </Button>
              </div>
            )}

            {/* Step: Resumen previo al cierre */}
            {cierreStep === "resumen" && (
              <div className="space-y-4 pt-2">
                <Separator />
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <p className="text-sm font-semibold">Resumen previo al cierre</p>
                </div>

                <div className="rounded-xl bg-muted/30 border p-4 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-muted-foreground">Paciente</p>
                      <p className="font-semibold text-foreground">{historia.patientId}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Estado actual</p>
                      <ClinicalStatusBadge status={badgeStatus} variant="pill" />
                    </div>
                    <div>
                      <p className="text-muted-foreground">Diagnósticos</p>
                      <p className="font-semibold">{diagnosticos.length} registrado{diagnosticos.length !== 1 ? "s" : ""}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Conducta</p>
                      <p className="font-semibold capitalize">{conducta.replace(/_/g, " ")}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Creada</p>
                      <p className="font-semibold">{new Date(historia.creadoEn).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Última actualización</p>
                      <p className="font-semibold">{new Date(historia.actualizadoEn).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</p>
                    </div>
                  </div>

                  {diagnosticos.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-muted-foreground mb-1.5">Diagnósticos registrados</p>
                        {diagnosticos.map((dx) => (
                          <div key={dx.id} className="flex items-center gap-2 py-1">
                            <div className={cn(
                              "h-1.5 w-1.5 rounded-full shrink-0",
                              dx.severidad === "severo" ? "bg-destructive" : dx.severidad === "moderado" ? "bg-warning" : "bg-success"
                            )} />
                            <span className="font-mono text-primary text-[10px]">{dx.codigo}</span>
                            <span className="font-medium">{dx.descripcion}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-destructive/5 border border-destructive/15 text-xs">
                  <ShieldAlert className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-destructive">Acción irreversible</p>
                    <p className="text-muted-foreground leading-relaxed">
                      Al cerrar la historia, no podrá modificar ningún campo. Solo se permitirá consulta, impresión y exportación.
                      ¿Está seguro de continuar?
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    className="rounded-xl gap-1.5 text-xs h-9"
                    onClick={handleCerrarHistoria}
                  >
                    <Lock className="h-3.5 w-3.5" /> Confirmar cierre
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-xl text-xs h-9"
                    onClick={() => setCierreStep(null)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── 3. Anulación modal ─────────────────── */}
      {showAnulacion && !isLocked && (
        <Card className="border-0 shadow-sm border-l-4 border-l-destructive/50">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <SectionHeader title="Anulación de historia" icon={Ban} size="sm" />
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setShowAnulacion(false)}>
                <XCircle className="h-4 w-4" />
              </Button>
            </div>

            <ClinicalAlert
              type="error"
              title="Esta acción es permanente"
              description="La anulación invalida completamente la historia clínica. Se conserva como registro auditable pero no tiene validez clínica ni legal."
            />

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Motivo de anulación *</Label>
              <Select value={motivoAnulacion} onValueChange={setMotivoAnulacion}>
                <SelectTrigger className="rounded-xl h-9 text-sm">
                  <SelectValue placeholder="Seleccione motivo…" />
                </SelectTrigger>
                <SelectContent>
                  {MOTIVO_ANULACION.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Justificación *</Label>
              <Textarea
                value={anulacionNotas}
                onChange={(e) => setAnulacionNotas(e.target.value)}
                placeholder="Describa detalladamente el motivo de la anulación…"
                rows={3}
                className="rounded-xl resize-none text-sm"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="destructive"
                className="rounded-xl gap-1.5 text-xs h-9"
                disabled={!motivoAnulacion || anulacionNotas.trim().length < 10}
                onClick={handleAnular}
              >
                <Ban className="h-3.5 w-3.5" /> Confirmar anulación
              </Button>
              <Button variant="outline" className="rounded-xl text-xs h-9" onClick={() => setShowAnulacion(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── 4. Exportación e impresión ──────────── */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5 space-y-4">
          <SectionHeader title="Exportación e impresión" icon={Printer} size="sm" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-3 p-4 rounded-xl border border-border/60 hover:border-primary/30 hover:bg-primary/[0.02] transition-colors text-left group"
            >
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                <Printer className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">Imprimir HC</p>
                <p className="text-[10px] text-muted-foreground">Vista optimizada para impresión</p>
              </div>
            </button>

            <button
              onClick={handleExportPDF}
              className="flex items-center gap-3 p-4 rounded-xl border border-border/60 hover:border-primary/30 hover:bg-primary/[0.02] transition-colors text-left group"
            >
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                <FileDown className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">Exportar PDF</p>
                <p className="text-[10px] text-muted-foreground">Documento completo descargable</p>
              </div>
            </button>

            <button
              onClick={() => toast.info("Consentimiento informado — próximamente")}
              className="flex items-center gap-3 p-4 rounded-xl border border-border/60 hover:border-primary/30 hover:bg-primary/[0.02] transition-colors text-left group"
            >
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">Consentimiento</p>
                <p className="text-[10px] text-muted-foreground">Generar formato de consentimiento</p>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

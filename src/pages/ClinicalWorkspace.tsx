import { useMemo, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "@/data/StoreContext";
import { ClinicalStatusBadge, ClinicalAlert, SectionHeader, ValidationChecklist } from "@/components/clinical";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  Lock,
  Printer,
  History,
  ClipboardList,
  Stethoscope,
  Activity,
  Pill,
  StickyNote,
  FileText,
  AlertTriangle,
  Phone,
  User,
  Mic,
  Sparkles,
  ChevronDown,
  ListChecks,
  Heart,
  Brain,
  Cigarette,
  Clipboard,
  FileQuestion,
  Users,
} from "lucide-react";

type SectionId = "motivo" | "antecedentes" | "exploracion" | "diagnosticos" | "odontograma" | "plan" | "prescripciones" | "notas";

const SECTIONS: { id: SectionId; label: string; icon: typeof ClipboardList }[] = [
  { id: "motivo", label: "Motivo y anamnesis", icon: ClipboardList },
  { id: "antecedentes", label: "Antecedentes", icon: FileText },
  { id: "exploracion", label: "Exploración", icon: Stethoscope },
  { id: "diagnosticos", label: "Diagnósticos", icon: AlertTriangle },
  { id: "odontograma", label: "Odontograma", icon: Activity },
  { id: "plan", label: "Plan de tratamiento", icon: CheckCircle2 },
  { id: "prescripciones", label: "Prescripciones", icon: Pill },
  { id: "notas", label: "Notas", icon: StickyNote },
];

export default function ClinicalWorkspace() {
  const { patientId, historiaId } = useParams<{ patientId: string; historiaId: string }>();
  const navigate = useNavigate();
  const store = useAppStore();
  const { clinical } = store;

  const patient = store.patients.find((p) => p.id === patientId);
  const historia = historiaId ? clinical.getHistoria(historiaId) : undefined;
  const diagnosticos = historia ? clinical.getDiagnosticosByHistoria(historia.id) : [];
  const notas = historia ? clinical.getNotasByHistoria(historia.id) : [];
  const odontograma = historia ? clinical.getOdontograma(historia.odontogramaId) : null;
  const versiones = historia ? clinical.getVersionesByHistoria(historia.id) : [];

  const [activeSection, setActiveSection] = useState<SectionId>("motivo");

  // Map estado → badge status
  const badgeStatus = historia
    ? ({ borrador: "draft", en_progreso: "in_progress", cerrada: "closed", anulada: "voided" } as const)[historia.estado]
    : undefined;

  if (!patient || !historia) {
    return (
      <div className="page-container max-w-4xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1.5 text-muted-foreground -ml-2">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center space-y-3">
            <div className="h-14 w-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertTriangle className="h-7 w-7 text-destructive" />
            </div>
            <h3 className="text-base font-semibold">Historia no encontrada</h3>
            <p className="text-sm text-muted-foreground">No se pudo cargar la historia clínica solicitada.</p>
            <Button variant="outline" className="rounded-xl" onClick={() => navigate(`/patients/${patientId}`)}>
              Volver al paciente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const initials = patient.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const handleSaveDraft = () => {
    clinical.updateHistoria(historia.id, { estado: "borrador" });
    toast.success("Borrador guardado");
  };

  const handleValidate = () => {
    toast.info("Validación completada — ver checklist abajo");
  };

  const handleClose = () => {
    clinical.updateHistoria(historia.id, { estado: "cerrada" });
    toast.success("Historia cerrada correctamente");
  };

  const handlePrint = () => {
    toast.info("Preparando impresión…");
    setTimeout(() => window.print(), 300);
  };

  // Checklist items derived from historia
  const checklistItems = [
    { label: "Motivo de consulta registrado", completed: !!historia.detalle.motivoConsulta, required: true as const },
    { label: "Anamnesis completada", completed: !!historia.detalle.anamnesis, required: true as const },
    { label: "Antecedentes médicos completos", completed: !!historia.detalle.antecedentesMedicos, required: true as const },
    { label: "Hábitos registrados", completed: !!historia.detalle.habitos },
    { label: "Revisión por sistemas", completed: !!historia.detalle.revisionSistemas },
    { label: "Exploración clínica realizada", completed: !!historia.detalle.exploracionClinica, required: true as const },
    { label: "Diagnóstico principal", completed: diagnosticos.length > 0 },
    { label: "Plan de tratamiento definido", completed: !!historia.detalle.planTratamiento },
    { label: "Odontograma actualizado", completed: !!odontograma && odontograma.piezas.some((p) => p.condicion !== "sano") },
  ];

  return (
    <div className="page-container max-w-5xl space-y-4">
      {/* Top bar — back + persistent actions */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/patients/${patientId}`)} className="gap-1.5 text-muted-foreground -ml-2">
          <ArrowLeft className="h-4 w-4" /> {patient.name}
        </Button>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="rounded-xl gap-1.5 h-8 text-xs" onClick={handleSaveDraft}>
            <Save className="h-3.5 w-3.5" /> Guardar borrador
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl gap-1.5 h-8 text-xs" onClick={handleValidate}>
            <CheckCircle2 className="h-3.5 w-3.5" /> Validar
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl gap-1.5 h-8 text-xs" onClick={handlePrint}>
            <Printer className="h-3.5 w-3.5" /> Imprimir
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl gap-1.5 h-8 text-xs" onClick={() => toast.info("Historial de versiones disponible abajo")}>
            <History className="h-3.5 w-3.5" /> Historial
          </Button>
          <Button size="sm" variant="destructive" className="rounded-xl gap-1.5 h-8 text-xs" onClick={handleClose}>
            <Lock className="h-3.5 w-3.5" /> Cerrar historia
          </Button>
        </div>
      </div>

      {/* Patient context header */}
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

          {/* Alerts inline */}
          {historia.clasificacion.alergias.length > 0 && (
            <div className="mt-3">
              <ClinicalAlert type="risk" title="Alergias" description={historia.clasificacion.alergias.join(", ")} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main layout: sidebar nav + content */}
      <div className="flex gap-4 items-start">
        {/* Section nav */}
        <Card className="border-0 shadow-sm shrink-0 hidden md:block w-52">
          <CardContent className="p-2">
            <nav className="space-y-0.5">
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left",
                    activeSection === s.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <s.icon className="h-3.5 w-3.5 shrink-0" />
                  {s.label}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Mobile section selector */}
        <div className="md:hidden w-full mb-2">
          <div className="flex overflow-x-auto gap-1.5 pb-2 -mx-1 px-1">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-colors",
                  activeSection === s.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/60 text-muted-foreground"
                )}
              >
                <s.icon className="h-3 w-3" />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 min-w-0 space-y-4">
          {activeSection === "motivo" && (
            <SectionCard title="Motivo de consulta" icon={ClipboardList}>
              <Textarea
                defaultValue={historia.detalle.motivoConsulta}
                placeholder="Describa el motivo de consulta del paciente…"
                rows={4}
                className="rounded-xl resize-none text-sm"
              />
            </SectionCard>
          )}

          {activeSection === "antecedentes" && (
            <div className="space-y-4">
              <SectionCard title="Antecedentes médicos" icon={FileText}>
                <Textarea
                  defaultValue={historia.detalle.antecedentesMedicos}
                  placeholder="Enfermedades previas, cirugías, alergias…"
                  rows={4}
                  className="rounded-xl resize-none text-sm"
                />
              </SectionCard>
              <SectionCard title="Antecedentes odontológicos" icon={FileText}>
                <Textarea
                  defaultValue={historia.detalle.antecedentesOdontologicos}
                  placeholder="Historial de tratamientos dentales previos…"
                  rows={3}
                  className="rounded-xl resize-none text-sm"
                />
              </SectionCard>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-5 space-y-3">
                  <SectionHeader title="Clasificación clínica" size="sm" />
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
            </div>
          )}

          {activeSection === "exploracion" && (
            <SectionCard title="Exploración clínica" icon={Stethoscope}>
              <Textarea
                defaultValue={historia.detalle.exploracionClinica}
                placeholder="Hallazgos de la exploración clínica…"
                rows={6}
                className="rounded-xl resize-none text-sm"
              />
            </SectionCard>
          )}

          {activeSection === "diagnosticos" && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <SectionHeader title="Diagnósticos" icon={AlertTriangle} size="sm" />
                  <Button variant="outline" size="sm" className="rounded-xl gap-1.5 h-8 text-xs" onClick={() => toast.info("Agregar diagnóstico — en desarrollo")}>
                    <Stethoscope className="h-3.5 w-3.5" /> Agregar
                  </Button>
                </div>
                {diagnosticos.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No hay diagnósticos registrados aún.</p>
                ) : (
                  <div className="space-y-2">
                    {diagnosticos.map((dx) => (
                      <div key={dx.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/40">
                        <div className={cn(
                          "h-2 w-2 rounded-full mt-1.5 shrink-0",
                          dx.severidad === "severo" ? "bg-destructive" :
                          dx.severidad === "moderado" ? "bg-warning" : "bg-success"
                        )} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{dx.descripcion}</p>
                            <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{dx.codigo}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{dx.notas}</p>
                          {dx.piezas.length > 0 && (
                            <p className="text-[10px] text-muted-foreground mt-1">Piezas: {dx.piezas.join(", ")}</p>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {new Date(dx.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeSection === "odontograma" && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5 space-y-3">
                <SectionHeader title="Odontograma" icon={Activity} size="sm" />
                {odontograma ? (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {odontograma.piezas.map((p) => (
                        <div key={p.numero} className={cn(
                          "flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-lg text-xs border",
                          p.condicion === "sano" ? "border-border/40 bg-muted/30" :
                          p.condicion === "caries" ? "border-destructive/30 bg-destructive/5" :
                          "border-primary/30 bg-primary/5"
                        )}>
                          <span className="font-mono font-bold text-sm">{p.numero}</span>
                          <span className={cn(
                            "capitalize text-[10px]",
                            p.condicion === "caries" ? "text-destructive" :
                            p.condicion === "ausente" ? "text-muted-foreground" :
                            p.condicion === "sano" ? "text-muted-foreground" : "text-foreground"
                          )}>
                            {p.condicion}
                          </span>
                        </div>
                      ))}
                    </div>
                    {odontograma.eventos.length > 0 && (
                      <>
                        <Separator />
                        <SectionHeader title="Eventos registrados" size="sm" />
                        <div className="space-y-1.5">
                          {odontograma.eventos.map((e) => (
                            <div key={e.id} className="flex items-center gap-3 text-xs py-1.5 px-3 rounded-lg bg-muted/30">
                              <span className="font-mono font-bold w-8">{e.piezaNumero}</span>
                              <span className="text-muted-foreground w-16">
                                {new Date(e.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                              </span>
                              <span className="flex-1">{e.descripcion}</span>
                              <span className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded-full capitalize",
                                e.tipo === "procedimiento" ? "bg-primary/10 text-primary" :
                                e.tipo === "hallazgo" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"
                              )}>
                                {e.tipo}
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground py-4 text-center">No hay odontograma registrado.</p>
                )}
              </CardContent>
            </Card>
          )}

          {activeSection === "plan" && (
            <SectionCard title="Plan de tratamiento" icon={CheckCircle2}>
              <Textarea
                defaultValue={historia.detalle.planTratamiento}
                placeholder="Defina el plan de tratamiento…"
                rows={6}
                className="rounded-xl resize-none text-sm"
              />
            </SectionCard>
          )}

          {activeSection === "prescripciones" && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <SectionHeader title="Prescripciones" icon={Pill} size="sm" />
                  <Button variant="outline" size="sm" className="rounded-xl gap-1.5 h-8 text-xs" onClick={() => toast.info("Agregar prescripción — en desarrollo")}>
                    <Pill className="h-3.5 w-3.5" /> Agregar
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground py-4 text-center">Las prescripciones se mostrarán aquí cuando se registren.</p>
              </CardContent>
            </Card>
          )}

          {activeSection === "notas" && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <SectionHeader title="Notas clínicas" icon={StickyNote} size="sm" />
                  <Button variant="outline" size="sm" className="rounded-xl gap-1.5 h-8 text-xs" onClick={() => toast.info("Nueva nota — en desarrollo")}>
                    <StickyNote className="h-3.5 w-3.5" /> Nueva nota
                  </Button>
                </div>
                {notas.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">Sin notas registradas.</p>
                ) : (
                  <div className="space-y-2">
                    {notas.map((n) => (
                      <div key={n.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/40">
                        {n.tipo === "voz" ? (
                          <Mic className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        ) : (
                          <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">{n.contenido}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-muted-foreground">{n.creadoPor}</span>
                            <span className="text-[10px] text-muted-foreground">•</span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(n.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                            </span>
                            {n.tipo === "voz" && n.duracionSegundos && (
                              <>
                                <span className="text-[10px] text-muted-foreground">•</span>
                                <span className="text-[10px] text-primary font-medium">{n.duracionSegundos}s audio</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Voice placeholder */}
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-primary/5 to-accent/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="flex items-center gap-3 relative">
                    <button disabled className="h-10 w-10 rounded-xl bg-primary/10 border border-dashed border-primary/25 flex items-center justify-center shrink-0 cursor-not-allowed">
                      <Mic className="h-4 w-4 text-primary" />
                    </button>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-semibold">Dictado por voz</p>
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                          <Sparkles className="h-2.5 w-2.5" /> AI
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">Próximamente: dicta notas que se transcriben automáticamente.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Validation checklist — always visible */}
          <ValidationChecklist
            title="Estado de completitud"
            items={checklistItems}
          />

          {/* Version history */}
          {versiones.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5 space-y-3">
                <SectionHeader title="Historial de versiones" icon={History} size="sm" />
                <div className="space-y-1.5">
                  {versiones.map((v) => (
                    <div key={v.id} className="flex items-center gap-3 text-xs py-1.5">
                      <span className="font-mono text-muted-foreground w-8">v{v.version}</span>
                      <span className="text-muted-foreground w-20">
                        {new Date(v.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                      </span>
                      <span className="flex-1">{v.resumenCambios}</span>
                      <span className="text-muted-foreground">{v.autor}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Helper component ────────────────────────── */

function SectionCard({ title, icon: Icon, children }: { title: string; icon: typeof ClipboardList; children: React.ReactNode }) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5 space-y-3">
        <SectionHeader title={title} icon={Icon} size="sm" />
        {children}
      </CardContent>
    </Card>
  );
}

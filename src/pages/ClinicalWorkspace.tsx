import { useMemo, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "@/data/StoreContext";
import { useAuth } from "@/contexts/AuthContext";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { ClinicalStatusBadge, ClinicalAlert, SectionHeader, ValidationChecklist } from "@/components/clinical";
import { OdontogramEditor } from "@/components/clinical/OdontogramEditor";
import { DiagnosticosSection } from "@/components/clinical/DiagnosticosSection";
import { ConductaCierreSection } from "@/components/clinical/ConductaCierreSection";
import { RevisionFinalSection } from "@/components/clinical/RevisionFinalSection";
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
import type { ExamenFisico } from "@/data/clinicalTypes";
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  Lock,
  Printer,
  History,
  ClipboardList,
  ClipboardCheck,
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
  Thermometer,
  Weight,
  Ruler,
  Droplets,
} from "lucide-react";

type SectionId = "motivo" | "antecedentes" | "examen" | "exploracion" | "diagnosticos" | "odontograma" | "plan" | "prescripciones" | "notas" | "cierre" | "revision";

interface SectionDef {
  id: SectionId;
  label: string;
  icon: typeof ClipboardList;
  group: "base" | "odontologia";
}

const SECTIONS: SectionDef[] = [
  // Base clinical sections — shared across all specialties
  { id: "motivo", label: "Motivo y anamnesis", icon: ClipboardList, group: "base" },
  { id: "antecedentes", label: "Antecedentes", icon: FileText, group: "base" },
  { id: "examen", label: "Examen físico", icon: Activity, group: "base" },
  { id: "exploracion", label: "Exploración", icon: Stethoscope, group: "base" },
  { id: "diagnosticos", label: "Diagnósticos", icon: AlertTriangle, group: "base" },
  { id: "plan", label: "Plan de tratamiento", icon: CheckCircle2, group: "base" },
  { id: "prescripciones", label: "Prescripciones", icon: Pill, group: "base" },
  { id: "notas", label: "Notas", icon: StickyNote, group: "base" },
  { id: "cierre", label: "Cierre y conducta", icon: Lock, group: "base" },
  { id: "revision", label: "Revisión final", icon: ClipboardCheck, group: "base" },
  // Odontología — specialty-specific
  { id: "odontograma", label: "Odontograma", icon: Activity, group: "odontologia" },
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
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

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
    toast.success("Historia cerrada correctamente", { description: `${patient.name} — Historia bloqueada` });
    setShowCloseConfirm(false);
  };

  const isLocked = historia.estado === "cerrada" || historia.estado === "anulada";

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
      {/* Breadcrumb + persistent actions */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-sm">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/patients/${patientId}`)} className="gap-1.5 text-muted-foreground -ml-2 h-7 px-2">
            <ArrowLeft className="h-3.5 w-3.5" /> {patient.name}
          </Button>
          <span className="text-muted-foreground/40">/</span>
          <span className="text-xs text-muted-foreground">Atención Clínica</span>
          <span className="text-muted-foreground/40">/</span>
          <Badge variant="outline" className="gap-1 text-[10px] h-5 rounded-full border-primary/30 text-primary">
            <Activity className="h-3 w-3" /> Odontología
          </Badge>
        </div>
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
          {!isLocked && (
            <Button size="sm" variant="destructive" className="rounded-xl gap-1.5 h-8 text-xs" onClick={() => setShowCloseConfirm(true)}>
              <Lock className="h-3.5 w-3.5" /> Cerrar historia
            </Button>
          )}
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
              <p className="text-xs text-muted-foreground mt-0.5">
                Historia clínica · Especialidad: Odontología
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

          {/* Alerts inline */}
          {historia.clasificacion.alergias.length > 0 && (
            <div className="mt-3">
              <ClinicalAlert type="risk" title="Alergias" description={historia.clasificacion.alergias.join(", ")} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Locked banner */}
      {isLocked && (
        <ClinicalAlert
          type={historia.estado === "anulada" ? "error" : "admin"}
          title={historia.estado === "anulada" ? "Historia anulada — solo lectura" : "Historia cerrada — solo lectura"}
          description="No se pueden realizar modificaciones sin autorización administrativa."
        />
      )}

      {/* Main layout: sidebar nav + content */}
      <div className="flex gap-4 items-start">
        {/* Section nav */}
        <Card className="border-0 shadow-sm shrink-0 hidden md:block w-52">
          <CardContent className="p-2">
            <nav className="space-y-0.5">
              {/* Base clinical sections */}
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground/60 px-3 pt-2 pb-1 font-semibold">Historia clínica base</p>
              {SECTIONS.filter(s => s.group === "base").map((s) => (
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

              {/* Specialty sections */}
              <Separator className="my-2" />
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground/60 px-3 pt-1 pb-1 font-semibold flex items-center gap-1.5">
                <Activity className="h-3 w-3" /> Odontología
              </p>
              {SECTIONS.filter(s => s.group === "odontologia").map((s) => (
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
            {SECTIONS.filter(s => s.group === "base").map((s) => (
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
            <Separator orientation="vertical" className="h-6 self-center mx-1" />
            {SECTIONS.filter(s => s.group === "odontologia").map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-colors",
                  activeSection === s.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/10 text-primary"
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
          )}

          {activeSection === "antecedentes" && (
            <div className="space-y-4">
              {/* Clasificación clínica — always visible */}
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
                title="Antecedentes odontológicos"
                icon={Stethoscope}
                value={historia.detalle.antecedentesOdontologicos}
                placeholder="Historial de tratamientos dentales previos, experiencias con anestesia, complicaciones…"
                rows={3}
                templates={[
                  "Sin tratamientos odontológicos previos significativos. Niega complicaciones con anestesia local.",
                  "Antecedentes de [endodoncia/exodoncia/restauraciones] en piezas [números]. Última visita odontológica hace [tiempo].",
                ]}
              />

              <ClinicalTextField
                title="Antecedentes familiares"
                icon={Users}
                value={historia.detalle.antecedentesFamiliares}
                placeholder="Enfermedades hereditarias, condiciones familiares relevantes…"
                rows={3}
                templates={[
                  "Sin antecedentes familiares relevantes para la salud oral.",
                  "Antecedentes familiares de [diabetes/hipertensión/enfermedad periodontal/cáncer oral] en [parentesco].",
                ]}
              />

              <ClinicalTextField
                title="Hábitos"
                icon={Cigarette}
                value={historia.detalle.habitos}
                placeholder="Tabaquismo, bruxismo, onicofagia, respiración oral, dieta cariogénica…"
                rows={3}
                templates={[
                  "Niega tabaquismo, alcoholismo y consumo de sustancias. Sin hábitos parafuncionales. Dieta balanceada.",
                  "Bruxismo [diurno/nocturno]. [Usa/No usa] placa oclusal. Tabaquismo: [cigarrillos/día]. Consumo de [café/bebidas azucaradas]: [frecuencia].",
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
                  "Cardiovascular: [hallazgo]. Respiratorio: [hallazgo]. Endocrino: [hallazgo]. Digestivo: [hallazgo]. Sin otros hallazgos relevantes.",
                ]}
              />
            </div>
          )}

          {activeSection === "examen" && (
            historia.detalle.examenFisico ? (
              <ExamenFisicoSection examen={historia.detalle.examenFisico} />
            ) : (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                  <EmptyState
                    icon={Activity}
                    title="Sin examen físico registrado"
                    description="Registre los signos vitales e indicadores clínicos del paciente."
                    actionLabel="Registrar examen"
                    onAction={() => toast.info("Registro de examen — en desarrollo")}
                  />
                </CardContent>
              </Card>
            )
          )}

          {activeSection === "exploracion" && (
            <SectionCard title="Exploración clínica" icon={Stethoscope}>
              <Textarea
                defaultValue={historia.detalle.exploracionClinica}
                placeholder="Hallazgos de la exploración clínica…"
                rows={6}
                className="rounded-xl resize-none text-sm"
                readOnly={isLocked}
              />
            </SectionCard>
          )}

          {activeSection === "diagnosticos" && (
            <DiagnosticosSection diagnosticos={diagnosticos} historiaId={historia.id} />
          )}

          {activeSection === "odontograma" && (
            <OdontogramEditor odontograma={odontograma} eventos={odontograma?.eventos ?? []} />
          )}

          {activeSection === "plan" && (
            <SectionCard title="Plan de tratamiento" icon={CheckCircle2}>
              <Textarea
                defaultValue={historia.detalle.planTratamiento}
                placeholder="Defina el plan de tratamiento: fases, procedimientos por pieza, prioridades…"
                rows={6}
                className="rounded-xl resize-none text-sm"
                readOnly={isLocked}
              />
              {!historia.detalle.planTratamiento && (
                <p className="text-xs text-destructive flex items-center gap-1.5 mt-1">
                  <AlertTriangle className="h-3 w-3" /> Se recomienda definir el plan antes de cerrar la historia.
                </p>
              )}
            </SectionCard>
          )}

          {activeSection === "prescripciones" && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-0">
                <div className="flex items-center justify-between px-5 pt-5">
                  <SectionHeader title="Prescripciones" icon={Pill} size="sm" />
                  {!isLocked && (
                    <Button variant="outline" size="sm" className="rounded-xl gap-1.5 h-8 text-xs" onClick={() => toast.info("Agregar prescripción — en desarrollo")}>
                      <Pill className="h-3.5 w-3.5" /> Agregar
                    </Button>
                  )}
                </div>
                <EmptyState
                  icon={Pill}
                  title="Sin prescripciones registradas"
                  description="Las prescripciones farmacológicas del paciente aparecerán aquí."
                />
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
                  <EmptyState
                    icon={StickyNote}
                    title="Sin notas clínicas"
                    description="Agrega notas para registrar observaciones durante la consulta."
                  />
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

          {activeSection === "cierre" && (
            <ConductaCierreSection
              historia={historia}
              diagnosticos={diagnosticos}
              checklistItems={checklistItems}
              onUpdateHistoria={(id, data) => clinical.updateHistoria(id, data)}
            />
          )}

          {activeSection === "revision" && (
            <RevisionFinalSection
              historia={historia}
              patient={{ name: patient.name, phone: patient.phone, cedula: patient.cedula }}
              diagnosticos={diagnosticos}
              odontograma={odontograma}
              notas={notas}
              checklistItems={checklistItems}
              onNavigateSection={(s) => setActiveSection(s as SectionId)}
              onClose={handleClose}
              onSaveDraft={handleSaveDraft}
              onPrint={handlePrint}
            />
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

      {/* Confirm close dialog */}
      <ConfirmDialog
        open={showCloseConfirm}
        onConfirm={handleClose}
        onCancel={() => setShowCloseConfirm(false)}
        title="¿Cerrar esta historia clínica?"
        description={`Se cerrará la historia de ${patient.name}. Una vez cerrada, no podrá editarse sin autorización administrativa.`}
        confirmLabel="Cerrar historia"
        variant="destructive"
      />
    </div>
  );
}

/* ── Helper components ───────────────────────── */

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

interface ClinicalTextFieldProps {
  title: string;
  icon: typeof ClipboardList;
  value: string;
  placeholder: string;
  rows?: number;
  required?: boolean;
  templates?: string[];
  readOnly?: boolean;
}

function ClinicalTextField({ title, icon: Icon, value, placeholder, rows = 4, required, templates, readOnly }: ClinicalTextFieldProps) {
  const [showTemplates, setShowTemplates] = useState(false);
  const [text, setText] = useState(value);
  const [saved, setSaved] = useState(true);
  const filled = text.trim().length > 0;

  const applyTemplate = (tpl: string) => {
    setText(tpl);
    setShowTemplates(false);
    setSaved(false);
    toast.success("Plantilla aplicada");
  };

  const handleBlur = () => {
    if (text !== value && !readOnly) {
      setSaved(true);
      toast.success("Guardado automáticamente", { description: title });
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground tracking-tight">{title}</h3>
              {required && (
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-destructive/30 text-destructive font-normal">
                  Obligatorio
                </Badge>
              )}
              {filled && (
                <div className="h-5 w-5 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="h-3 w-3 text-success" />
                </div>
              )}
            </div>
          </div>
          {templates && templates.length > 0 && !readOnly && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 h-7 text-[11px] text-muted-foreground hover:text-foreground"
              onClick={() => setShowTemplates(!showTemplates)}
            >
              <FileQuestion className="h-3.5 w-3.5" />
              Plantillas
              <ChevronDown className={cn("h-3 w-3 transition-transform", showTemplates && "rotate-180")} />
            </Button>
          )}
        </div>

        {/* Templates panel */}
        {showTemplates && templates && (
          <div className="rounded-xl border border-dashed border-primary/20 bg-primary/[0.02] p-3 space-y-2">
            <p className="text-[11px] font-medium text-muted-foreground">Seleccione una plantilla para autocompletar:</p>
            {templates.map((tpl, i) => (
              <button
                key={i}
                onClick={() => applyTemplate(tpl)}
                className="w-full text-left p-2.5 rounded-lg bg-background border border-border/50 hover:border-primary/30 hover:bg-primary/[0.03] transition-colors text-xs text-foreground leading-relaxed"
              >
                {tpl}
              </button>
            ))}
          </div>
        )}

        <Textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setSaved(false); }}
          onBlur={handleBlur}
          placeholder={placeholder}
          rows={rows}
          readOnly={readOnly}
          className={cn(
            "rounded-xl resize-none text-sm transition-colors",
            !filled && required && "border-destructive/30 focus-visible:ring-destructive/30",
            readOnly && "opacity-70 cursor-not-allowed"
          )}
        />

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">
            {text.length > 0 ? `${text.length} caracteres` : "Sin contenido"}
          </span>
          {text !== value && !saved && (
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal bg-warning/10 text-warning border-0">
              Sin guardar
            </Badge>
          )}
          {text !== value && saved && (
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal bg-success/10 text-success border-0">
              ✓ Guardado
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Vital sign card ─────────────────────────── */

function VitalCard({ label, value, unit, icon: Icon, status }: {
  label: string;
  value: string | number;
  unit: string;
  icon: typeof Heart;
  status?: "normal" | "warning" | "danger";
}) {
  const statusColor = status === "danger"
    ? "border-destructive/30 bg-destructive/5"
    : status === "warning"
    ? "border-warning/30 bg-warning/5"
    : "border-border/50 bg-muted/20";

  const valueColor = status === "danger"
    ? "text-destructive"
    : status === "warning"
    ? "text-warning"
    : "text-foreground";

  return (
    <div className={cn("rounded-xl border p-3 space-y-1.5 transition-colors", statusColor)}>
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={cn("text-lg font-bold tabular-nums tracking-tight", valueColor)}>{value}</span>
        <span className="text-[10px] text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}

/* ── Odontologic indicator row ───────────────── */

function IndicatorRow({ label, value, total, unit, highlight }: {
  label: string;
  value: number;
  total?: number;
  unit?: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className={cn(
          "text-sm font-semibold tabular-nums",
          highlight ? "text-primary" : "text-foreground"
        )}>
          {value}
        </span>
        {total !== undefined && (
          <span className="text-[10px] text-muted-foreground">/ {total}</span>
        )}
        {unit && <span className="text-[10px] text-muted-foreground">{unit}</span>}
      </div>
    </div>
  );
}

/* ── Examen Físico section ───────────────────── */

function ExamenFisicoSection({ examen }: { examen: ExamenFisico }) {
  const sv = examen.signosVitales;
  const ind = examen.indicadoresOdontologicos;

  const fluorosisLabels: Record<string, string> = {
    normal: "Normal",
    cuestionable: "Cuestionable",
    muy_leve: "Muy leve",
    leve: "Leve",
    moderada: "Moderada",
    severa: "Severa",
  };

  const olearyStatus = ind.indiceOLeary > 40 ? "danger" : ind.indiceOLeary > 20 ? "warning" : "normal";

  // Parse BP to check if abnormal
  const [sys, dia] = sv.presionArterial.split("/").map(Number);
  const bpStatus = sys > 140 || dia > 90 ? "danger" : sys > 130 || dia > 85 ? "warning" : "normal";
  const hrStatus = sv.frecuenciaCardiaca > 100 || sv.frecuenciaCardiaca < 50 ? "warning" : "normal";

  return (
    <div className="space-y-4">
      {/* Examen físico general */}
      <ClinicalTextField
        title="Examen físico general"
        icon={User}
        value={examen.general}
        placeholder="Estado general, aspecto, marcha, orientación, piel, mucosas, ganglios…"
        rows={3}
        required
        templates={[
          "Paciente en buen estado general, orientado en tiempo, lugar y persona. Piel y mucosas normocoloreadas e hidratadas. Sin adenopatías cervicales palpables. Marcha normal.",
          "Paciente en regular estado general. Se observa [hallazgo]. Adenopatías [palpables/no palpables] en [región].",
        ]}
      />

      {/* Examen físico específico */}
      <ClinicalTextField
        title="Examen físico específico (cabeza y cuello)"
        icon={Stethoscope}
        value={examen.especifico}
        placeholder="ATM, apertura bucal, mucosa oral, piso de boca, lengua, paladar, orofaringe…"
        rows={4}
        required
        templates={[
          "ATM sin chasquidos ni crepitaciones. Apertura bucal adecuada (>40mm). Mucosa oral sin lesiones. Encías rosadas y firmes. Piso de boca y lengua sin alteraciones. Paladar duro y blando normales. Orofaringe sin hallazgos.",
          "ATM con [chasquido/crepitación] en [lado]. Apertura bucal [limitada/normal] ([mm]mm). Mucosa [hallazgo]. Encías [hallazgo]. [Otros hallazgos].",
        ]}
      />

      {/* Signos Vitales */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5 space-y-4">
          <SectionHeader title="Signos vitales" icon={Heart} size="sm" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <VitalCard label="Presión arterial" value={sv.presionArterial} unit="mmHg" icon={Heart} status={bpStatus} />
            <VitalCard label="Frec. cardiaca" value={sv.frecuenciaCardiaca} unit="lpm" icon={Activity} status={hrStatus} />
            <VitalCard label="Frec. respiratoria" value={sv.frecuenciaRespiratoria} unit="rpm" icon={Droplets} />
            <VitalCard label="Temperatura" value={sv.temperatura} unit="°C" icon={Thermometer} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <VitalCard label="Peso" value={sv.peso} unit="kg" icon={Weight} />
            <VitalCard label="Talla" value={sv.talla} unit="cm" icon={Ruler} />
            <VitalCard label="IMC" value={sv.imc} unit="kg/m²" icon={Activity}
              status={sv.imc > 30 ? "danger" : sv.imc > 25 ? "warning" : "normal"} />
            {sv.saturacionO2 !== undefined && (
              <VitalCard label="SpO₂" value={sv.saturacionO2} unit="%" icon={Droplets}
                status={sv.saturacionO2 < 90 ? "danger" : sv.saturacionO2 < 95 ? "warning" : "normal"} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Indicadores Odontológicos — specialty-specific */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <SectionHeader title="Indicadores odontológicos" icon={ListChecks} size="sm" />
            <Badge variant="outline" className="text-[9px] h-4 rounded-full border-primary/30 text-primary">Odontología</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Índices de higiene */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Índices de higiene</p>
              <div className="rounded-xl border border-border/50 p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Índice de O'Leary</span>
                  <Badge variant="outline" className={cn(
                    "text-[10px] h-5 px-1.5 font-semibold border-0",
                    olearyStatus === "danger" ? "bg-destructive/10 text-destructive" :
                    olearyStatus === "warning" ? "bg-warning/10 text-warning" :
                    "bg-success/10 text-success"
                  )}>
                    {ind.indiceOLeary}%
                  </Badge>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      olearyStatus === "danger" ? "bg-destructive" :
                      olearyStatus === "warning" ? "bg-warning" :
                      "bg-success"
                    )}
                    style={{ width: `${Math.min(ind.indiceOLeary, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {olearyStatus === "normal" ? "Higiene aceptable" : olearyStatus === "warning" ? "Requiere refuerzo de higiene" : "Higiene deficiente — intervención necesaria"}
                </p>
              </div>

              <div className="rounded-xl border border-border/50 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Fluorosis</span>
                  <Badge variant="outline" className={cn(
                    "text-[10px] h-5 px-1.5 font-medium border-0",
                    ind.fluorosis === "severa" || ind.fluorosis === "moderada" ? "bg-destructive/10 text-destructive" :
                    ind.fluorosis === "leve" || ind.fluorosis === "muy_leve" ? "bg-warning/10 text-warning" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {fluorosisLabels[ind.fluorosis]}
                  </Badge>
                </div>
              </div>
            </div>

            {/* COP e indicadores cuantitativos */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">COP-D y cuantitativos</p>
              <div className="rounded-xl border border-border/50 p-3 space-y-0.5">
                <IndicatorRow label="Dientes examinados" value={ind.dientesExaminados} />
                <IndicatorRow label="Superficies examinadas" value={ind.superficiesExaminadas} />
                <IndicatorRow label="Superficies marcadas" value={ind.superficiesMarcadas} total={ind.superficiesExaminadas} />
                <Separator className="my-1.5" />
                <IndicatorRow label="Cariados (C)" value={ind.copC} highlight />
                <IndicatorRow label="Obturados (O)" value={ind.copO} />
                <IndicatorRow label="Perdidos (P)" value={ind.copP} />
                <div className="flex items-center justify-between py-2 border-t border-primary/20 mt-1">
                  <span className="text-xs font-semibold text-foreground">COP Total</span>
                  <span className="text-base font-bold text-primary tabular-nums">{ind.copTotal}</span>
                </div>
                {ind.copd !== undefined && (
                  <IndicatorRow label="COP-D (deciduos)" value={ind.copd} />
                )}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-muted-foreground">Apto COP</span>
                  <Badge variant="outline" className={cn(
                    "text-[10px] h-5 px-2 font-semibold border-0",
                    ind.aptoCop ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                  )}>
                    {ind.aptoCop ? "Sí" : "No"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

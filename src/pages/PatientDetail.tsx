import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "@/data/StoreContext";
import { AppointmentModal } from "@/components/AppointmentModal";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { ClinicalStatusBadge, ClinicalAlert, SectionHeader } from "@/components/clinical";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Appointment } from "@/data/store";
import {
  ArrowLeft,
  Phone,
  CalendarDays,
  FileText,
  CreditCard,
  ClipboardList,
  Plus,
  User,
  Save,
  Mic,
  Sparkles,
  ShieldAlert,
  Stethoscope,
  History,
  StickyNote,
  Activity,
  AlertTriangle,
  Pill,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const store = useAppStore();

  const patient = store.patients.find((p) => p.id === id);
  const history = useMemo(
    () => (id ? store.getAppointmentsForPatient(id) : []),
    [id, store]
  );

  const [apptModalOpen, setApptModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);

  const [editNotes, setEditNotes] = useState(patient?.notes || "");
  const [editPhone, setEditPhone] = useState(patient?.phone || "");
  const [editEmail, setEditEmail] = useState(patient?.email || "");
  const [editCedula, setEditCedula] = useState(patient?.cedula || "");
  const [editAddress, setEditAddress] = useState(patient?.address || "");

  const stats = useMemo(() => {
    const total = history.length;
    const completed = history.filter((a) => a.status === "completed").length;
    const totalPaid = history.filter((a) => a.paid).reduce((s, a) => s + a.amount, 0);
    const totalOwed = history.filter((a) => !a.paid).reduce((s, a) => s + a.amount, 0);
    const lastVisit = history.find((a) => a.status === "completed");
    return { total, completed, totalPaid, totalOwed, lastVisit };
  }, [history]);

  if (!patient) {
    return (
      <div className="page-container max-w-3xl">
        <Button variant="ghost" size="sm" onClick={() => navigate("/patients")} className="gap-1.5 text-muted-foreground -ml-2">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <EmptyState
              icon={User}
              title="Paciente no encontrado"
              description="Este paciente no existe o fue eliminado."
              actionLabel="Ver pacientes"
              onAction={() => navigate("/patients")}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  const initials = patient.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const saveField = (field: string, value: string) => {
    store.updatePatient(patient.id, { [field]: value });
    toast.success("Datos guardados");
  };

  const saveNotes = () => {
    store.updatePatient(patient.id, { notes: editNotes });
    toast.success("Notas guardadas");
  };

  const openNewAppt = () => {
    setSelectedAppt(null);
    setApptModalOpen(true);
  };

  return (
    <div className="page-container max-w-3xl">
      {/* Back */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/patients")}
        className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2"
      >
        <ArrowLeft className="h-4 w-4" /> Pacientes
      </Button>

      {/* Patient header card */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-primary font-bold text-xl">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-foreground">{patient.name}</h1>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                <Phone className="h-3.5 w-3.5" />
                {patient.phone || "Sin teléfono"}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Paciente desde {new Date(patient.createdAt).toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
              </p>
            </div>
            <Button onClick={openNewAppt} size="sm" className="rounded-xl gap-1.5 shrink-0">
              <Plus className="h-4 w-4" /> Cita
            </Button>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-4 gap-3 mt-5">
            <div className="rounded-xl bg-muted/50 px-3 py-2.5 text-center">
              <p className="text-lg font-bold">{stats.total}</p>
              <p className="text-[10px] text-muted-foreground">Visitas</p>
            </div>
            <div className="rounded-xl bg-muted/50 px-3 py-2.5 text-center">
              <p className="text-lg font-bold text-success">{stats.completed}</p>
              <p className="text-[10px] text-muted-foreground">Completadas</p>
            </div>
            <div className="rounded-xl bg-muted/50 px-3 py-2.5 text-center">
              <p className="text-lg font-bold">€{stats.totalPaid}</p>
              <p className="text-[10px] text-muted-foreground">Pagado</p>
            </div>
            <div className="rounded-xl bg-muted/50 px-3 py-2.5 text-center">
              <p className={cn("text-lg font-bold", stats.totalOwed > 0 ? "text-warning" : "text-muted-foreground")}>
                €{stats.totalOwed}
              </p>
              <p className="text-[10px] text-muted-foreground">Pendiente</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted/60 p-1 rounded-xl h-auto flex-wrap">
          <TabsTrigger value="overview" className="rounded-lg gap-1.5 text-xs data-[state=active]:shadow-sm">
            <User className="h-3.5 w-3.5" /> General
          </TabsTrigger>
          <TabsTrigger value="appointments" className="rounded-lg gap-1.5 text-xs data-[state=active]:shadow-sm">
            <CalendarDays className="h-3.5 w-3.5" /> Citas
          </TabsTrigger>
          <TabsTrigger value="notes" className="rounded-lg gap-1.5 text-xs data-[state=active]:shadow-sm">
            <FileText className="h-3.5 w-3.5" /> Notas
          </TabsTrigger>
          <TabsTrigger value="payments" className="rounded-lg gap-1.5 text-xs data-[state=active]:shadow-sm">
            <CreditCard className="h-3.5 w-3.5" /> Pagos
          </TabsTrigger>
          <TabsTrigger value="clinical" className="rounded-lg gap-1.5 text-xs data-[state=active]:shadow-sm">
            <ClipboardList className="h-3.5 w-3.5" /> Historial Clínico
          </TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 space-y-4">
              <p className="text-sm font-semibold">Información de contacto</p>
              <p className="text-[11px] text-muted-foreground -mt-2">Los cambios se guardan automáticamente al salir del campo.</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Nombre</Label>
                  <p className="text-sm font-medium">{patient.name}</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Teléfono</Label>
                  <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="h-9 rounded-lg text-sm" onBlur={() => saveField("phone", editPhone)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Correo electrónico</Label>
                  <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="h-9 rounded-lg text-sm" onBlur={() => saveField("email", editEmail)} placeholder="correo@ejemplo.com" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Cédula</Label>
                  <Input value={editCedula} onChange={(e) => setEditCedula(e.target.value)} className="h-9 rounded-lg text-sm" onBlur={() => saveField("cedula", editCedula)} placeholder="Número de cédula" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Dirección</Label>
                  <Input value={editAddress} onChange={(e) => setEditAddress(e.target.value)} className="h-9 rounded-lg text-sm" onBlur={() => saveField("address", editAddress)} placeholder="Dirección del paciente" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Last visit */}
          {stats.lastVisit && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <p className="text-sm font-semibold mb-3">Última visita</p>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {new Date(stats.lastVisit.date).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  <span className="text-sm">{stats.lastVisit.notes || "—"}</span>
                  <span className="text-sm font-semibold ml-auto">€{stats.lastVisit.amount}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Appointments */}
        <TabsContent value="appointments">
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              {history.length === 0 ? (
                <EmptyState
                  icon={CalendarDays}
                  title="Sin citas registradas"
                  description="Este paciente aún no tiene citas. Agenda la primera."
                  actionLabel="+ Agendar cita"
                  onAction={openNewAppt}
                />
              ) : (
                <div className="divide-y divide-border/60">
                  {history.map((a) => {
                    const isDone = a.status === "completed" || a.status === "noshow";
                    return (
                      <button
                        key={a.id}
                        onClick={() => { setSelectedAppt(a); setApptModalOpen(true); }}
                        className={cn(
                          "w-full flex items-center gap-4 px-5 py-3.5 hover:bg-accent/40 transition-colors text-left",
                          isDone && "opacity-60"
                        )}
                      >
                        <span className="text-sm font-medium text-muted-foreground w-24 shrink-0">
                          {new Date(a.date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                        </span>
                        <span className="text-xs font-mono text-muted-foreground w-12">{a.time}</span>
                        <span className="flex-1 text-sm truncate">{a.notes || "—"}</span>
                        <StatusBadge status={a.status} />
                        <span className="text-sm font-semibold w-16 text-right">€{a.amount}</span>
                        <span className={cn("text-[10px] w-14 text-right font-medium", a.paid ? "text-success" : "text-muted-foreground")}>
                          {a.paid ? "Pagado" : "Sin pagar"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes */}
        <TabsContent value="notes">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Notas del paciente</p>
                <Button size="sm" variant="outline" onClick={saveNotes} className="rounded-lg gap-1.5 h-8 text-xs">
                  <Save className="h-3.5 w-3.5" /> Guardar
                </Button>
              </div>
              <Textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Escribe notas sobre el paciente: alergias, condiciones, preferencias..."
                rows={6}
                className="rounded-xl resize-none text-sm"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments */}
        <TabsContent value="payments">
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              {history.length === 0 ? (
                <EmptyState
                  icon={CreditCard}
                  title="Sin registros de pago"
                  description="Los pagos aparecerán aquí cuando se registren citas."
                />
              ) : (
                <>
                  <div className="flex items-center justify-between px-5 py-3 bg-muted/40 border-b border-border/60">
                    <div className="flex gap-6">
                      <span className="text-xs text-muted-foreground">
                        Total cobrado: <span className="font-semibold text-success">€{stats.totalPaid}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Pendiente: <span className={cn("font-semibold", stats.totalOwed > 0 ? "text-warning" : "text-muted-foreground")}>€{stats.totalOwed}</span>
                      </span>
                    </div>
                  </div>
                  <div className="divide-y divide-border/60">
                    {history.map((a) => (
                      <div key={a.id} className="flex items-center gap-4 px-5 py-3.5 text-sm">
                        <span className="text-muted-foreground w-24 shrink-0">
                          {new Date(a.date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                        </span>
                        <span className="flex-1 truncate text-muted-foreground">{a.notes || "—"}</span>
                        <span className="font-semibold w-16 text-right">€{a.amount}</span>
                        <span className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full w-16 text-center",
                          a.paid ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
                        )}>
                          {a.paid ? "Pagado" : "Pendiente"}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clinical Record — Patient Clinical Hub */}
        <TabsContent value="clinical" className="space-y-4">
          <ClinicalHubTab patientId={patient.id} />
        </TabsContent>
      </Tabs>

      <AppointmentModal
        open={apptModalOpen}
        onClose={() => setApptModalOpen(false)}
        appointment={selectedAppt}
        defaultDate={new Date().toISOString().split("T")[0]}
        defaultTime="09:00"
      />
    </div>
  );
}

/* ──────────────────────────────────────────────
   Clinical Hub Tab — inline component
   ────────────────────────────────────────────── */

function ClinicalHubTab({ patientId }: { patientId: string }) {
  const { clinical } = useAppStore();

  const historia = clinical.getHistoriaByPatient(patientId);
  const diagnosticos = historia ? clinical.getDiagnosticosByHistoria(historia.id) : [];
  const notas = historia ? clinical.getNotasByHistoria(historia.id) : [];
  const versiones = historia ? clinical.getVersionesByHistoria(historia.id) : [];
  const odontograma = historia ? clinical.getOdontograma(historia.odontogramaId) : null;

  const hasHistoria = !!historia;

  // Map HistoriaEstado → ClinicalStatusBadge status
  const badgeStatus = historia
    ? ({ borrador: "draft", en_progreso: "in_progress", cerrada: "closed", anulada: "voided" } as const)[historia.estado]
    : undefined;

  return (
    <div className="space-y-4">
      {/* Clinical context panel */}
      {hasHistoria ? (
        <>
          {/* Alerts */}
          {historia.clasificacion.alergias.length > 0 && (
            <ClinicalAlert
              type="risk"
              title="Alergias registradas"
              description={historia.clasificacion.alergias.join(", ")}
            />
          )}
          {historia.indicadores.riesgoGeneral === "alto" && (
            <ClinicalAlert
              type="risk"
              title="Paciente de alto riesgo"
              description="Este paciente requiere protocolo especial de atención."
            />
          )}

          {/* Context summary card */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <SectionHeader title="Contexto clínico" icon={ShieldAlert} size="sm" />
                {badgeStatus && <ClinicalStatusBadge status={badgeStatus} variant="pill" />}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl bg-muted/50 px-3 py-2.5 text-center">
                  <p className="text-lg font-bold">{historia.indicadores.piezasTratadas}</p>
                  <p className="text-[10px] text-muted-foreground">Piezas tratadas</p>
                </div>
                <div className="rounded-xl bg-muted/50 px-3 py-2.5 text-center">
                  <p className={cn("text-lg font-bold", historia.indicadores.procedimientosPendientes > 0 ? "text-warning" : "text-success")}>
                    {historia.indicadores.procedimientosPendientes}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Pendientes</p>
                </div>
                <div className="rounded-xl bg-muted/50 px-3 py-2.5 text-center">
                  <p className="text-lg font-bold">
                    {new Date(historia.indicadores.ultimaVisita).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Última visita</p>
                </div>
                <div className="rounded-xl bg-muted/50 px-3 py-2.5 text-center">
                  <p className={cn(
                    "text-lg font-bold",
                    historia.indicadores.riesgoGeneral === "alto" ? "text-destructive" :
                    historia.indicadores.riesgoGeneral === "medio" ? "text-warning" : "text-success"
                  )}>
                    {historia.indicadores.riesgoGeneral.charAt(0).toUpperCase() + historia.indicadores.riesgoGeneral.slice(1)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Riesgo</p>
                </div>
              </div>

              <Separator className="my-1" />

              {/* Detail rows */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div>
                  <p className="text-[11px] text-muted-foreground">Clasificación ASA</p>
                  <p className="font-medium">{historia.clasificacion.asa.replace("_", " ")}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Alergias</p>
                  <p className="font-medium">
                    {historia.clasificacion.alergias.length > 0
                      ? historia.clasificacion.alergias.join(", ")
                      : "Ninguna registrada"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Enfermedades crónicas</p>
                  <p className="font-medium">
                    {historia.clasificacion.enfermedadesCronicas.length > 0
                      ? historia.clasificacion.enfermedadesCronicas.join(", ")
                      : "Ninguna"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Medicamentos actuales</p>
                  <p className="font-medium">
                    {historia.clasificacion.medicamentosActuales.length > 0
                      ? historia.clasificacion.medicamentosActuales.join(", ")
                      : "Ninguno"}
                  </p>
                </div>
              </div>

              <Separator className="my-1" />

              <div className="text-sm space-y-2">
                <div>
                  <p className="text-[11px] text-muted-foreground">Motivo de consulta</p>
                  <p className="font-medium">{historia.detalle.motivoConsulta}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Exploración clínica</p>
                  <p className="text-muted-foreground">{historia.detalle.exploracionClinica}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Button variant="outline" size="sm" className="rounded-xl gap-1.5 h-9 text-xs justify-start" onClick={() => toast.info("Módulo de historia en desarrollo")}>
                  <ClipboardList className="h-3.5 w-3.5 text-primary" /> Ver historia completa
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl gap-1.5 h-9 text-xs justify-start" onClick={() => toast.info("Módulo de notas en desarrollo")}>
                  <StickyNote className="h-3.5 w-3.5 text-primary" /> Nueva nota corta
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl gap-1.5 h-9 text-xs justify-start" onClick={() => toast.info("Módulo de versiones en desarrollo")}>
                  <History className="h-3.5 w-3.5 text-primary" /> Historial de cambios
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl gap-1.5 h-9 text-xs justify-start" onClick={() => toast.info("Odontograma en desarrollo")}>
                  <Activity className="h-3.5 w-3.5 text-primary" /> Odontogramas
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Diagnostics */}
          {diagnosticos.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5 space-y-3">
                <SectionHeader title="Diagnósticos activos" icon={Stethoscope} size="sm" />
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
              </CardContent>
            </Card>
          )}

          {/* Recent notes */}
          {notas.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5 space-y-3">
                <SectionHeader title="Notas clínicas recientes" icon={StickyNote} size="sm" />
                <div className="space-y-2">
                  {notas.slice(0, 3).map((n) => (
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
              </CardContent>
            </Card>
          )}

          {/* Odontogram summary */}
          {odontograma && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5 space-y-3">
                <SectionHeader title="Odontograma" icon={Activity} size="sm" />
                <div className="flex flex-wrap gap-2">
                  {odontograma.piezas
                    .filter((p) => p.condicion !== "sano")
                    .map((p) => (
                      <div key={p.numero} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted/50 text-xs">
                        <span className="font-mono font-bold">{p.numero}</span>
                        <span className={cn(
                          "capitalize",
                          p.condicion === "caries" ? "text-destructive" :
                          p.condicion === "ausente" ? "text-muted-foreground" : "text-foreground"
                        )}>
                          {p.condicion}
                        </span>
                      </div>
                    ))}
                </div>
                {odontograma.eventos.length > 0 && (
                  <>
                    <Separator />
                    <p className="text-[11px] text-muted-foreground">
                      {odontograma.eventos.length} evento{odontograma.eventos.length !== 1 ? "s" : ""} registrado{odontograma.eventos.length !== 1 ? "s" : ""} • Último:{" "}
                      {new Date(odontograma.eventos[odontograma.eventos.length - 1].fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          )}

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

          {/* Voice input placeholder */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-accent/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <CardContent className="p-5 relative">
              <div className="flex items-start gap-4">
                <button disabled className="h-12 w-12 rounded-2xl bg-primary/10 border-2 border-dashed border-primary/25 flex items-center justify-center shrink-0 cursor-not-allowed">
                  <Mic className="h-5 w-5 text-primary" />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold">Notas por voz</p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      <Sparkles className="h-3 w-3" /> AI
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Dicta notas clínicas durante la consulta y se transcribirán automáticamente.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3 ml-16 opacity-40">
                {[3, 5, 8, 4, 7, 10, 6, 3, 8, 5, 9, 4, 7, 3, 6, 8, 5, 4, 7, 9, 5, 3, 6, 4].map((h, i) => (
                  <div key={i} className="w-1 rounded-full bg-primary" style={{ height: `${h * 2}px` }} />
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        /* No clinical history yet */
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <ClipboardList className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Sin historia clínica</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                Este paciente aún no tiene una historia odontológica. Crea una para comenzar a registrar consultas, diagnósticos y tratamientos.
              </p>
            </div>
            <Button className="rounded-xl gap-1.5" onClick={() => toast.info("Creación de historia en desarrollo")}>
              <Plus className="h-4 w-4" /> Nueva historia odontológica
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

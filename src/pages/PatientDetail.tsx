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

        {/* Clinical Record - Future-ready placeholder */}
        <TabsContent value="clinical" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <ClipboardList className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">Historial Clínico</h3>
                    <p className="text-xs text-muted-foreground">Registro dental completo del paciente</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  Próximamente
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Voice input — premium placeholder */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-accent/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <CardContent className="p-5 relative">
              <div className="flex items-start gap-4">
                <button
                  disabled
                  className="h-12 w-12 rounded-2xl bg-primary/10 border-2 border-dashed border-primary/25 flex items-center justify-center shrink-0 cursor-not-allowed group"
                  title="Disponible próximamente"
                >
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
                    Dicta notas clínicas durante la consulta y se transcribirán automáticamente usando inteligencia artificial.
                  </p>
                </div>
              </div>
              {/* Mock waveform */}
              <div className="flex items-center gap-1 mt-3 ml-16 opacity-40">
                {[3, 5, 8, 4, 7, 10, 6, 3, 8, 5, 9, 4, 7, 3, 6, 8, 5, 4, 7, 9, 5, 3, 6, 4].map((h, i) => (
                  <div key={i} className="w-1 rounded-full bg-primary" style={{ height: `${h * 2}px` }} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Future module cards */}
          {[
            { icon: FileText, title: "Notas de consulta", desc: "Registra observaciones de cada visita con opción de entrada por voz." },
            { icon: ClipboardList, title: "Diagnósticos", desc: "Historial de diagnósticos dentales y condiciones del paciente." },
            { title: "Procedimientos", desc: "Tratamientos realizados, odontograma y planes de trabajo.", icon: CalendarDays },
            { title: "Prescripciones", desc: "Medicamentos y recetas emitidas para el paciente.", icon: CreditCard },
          ].map((mod) => (
            <Card key={mod.title} className="border-0 shadow-sm opacity-60">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <mod.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{mod.title}</p>
                  <p className="text-xs text-muted-foreground">{mod.desc}</p>
                </div>
                <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">Pendiente</span>
              </CardContent>
            </Card>
          ))}
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

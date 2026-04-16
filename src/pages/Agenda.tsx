import { useState, useMemo } from "react";
import { NewCareDialog } from "@/components/clinical/NewCareDialog";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/data/StoreContext";
import { AppointmentModal } from "@/components/AppointmentModal";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  CircleDollarSign,
  UserX,
  Calendar as CalendarIcon,
  Clock,
  Pencil,
  FilePlus,
  StickyNote,
  FolderOpen,
  Phone,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { Appointment, AppointmentStatus } from "@/data/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { HistoriaEstado } from "@/data/clinicalTypes";
import type { ClinicalRecordStatus } from "@/components/clinical";
import { ClinicalStatusBadge } from "@/components/clinical";

const estadoMap: Record<HistoriaEstado, ClinicalRecordStatus> = {
  borrador: "draft",
  en_progreso: "in_progress",
  cerrada: "closed",
  anulada: "voided",
};

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8);

function fmt(d: Date) {
  return d.toISOString().split("T")[0];
}

const STATUS_STYLES: Record<AppointmentStatus, { border: string; bg: string; dot: string; label: string }> = {
  pending: { border: "border-l-warning", bg: "bg-warning/5", dot: "bg-warning", label: "Pendiente" },
  confirmed: { border: "border-l-primary", bg: "bg-primary/5", dot: "bg-primary", label: "Confirmada" },
  completed: { border: "border-l-success", bg: "bg-success/5", dot: "bg-success", label: "Completada" },
  noshow: { border: "border-l-destructive", bg: "bg-destructive/5", dot: "bg-destructive", label: "No asistió" },
};

export default function Agenda() {
  const store = useAppStore();
  const nav = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [defaultDate, setDefaultDate] = useState("");
  const [defaultTime, setDefaultTime] = useState("");

  const today = fmt(new Date());
  const dateStr = fmt(currentDate);
  const appts = store.getAppointmentsForDate(dateStr);
  const isToday = dateStr === today;

  const stats = useMemo(() => {
    const total = appts.length;
    const completed = appts.filter((a) => a.status === "completed").length;
    const pending = appts.filter((a) => a.status === "pending" || a.status === "confirmed").length;
    const revenue = appts.filter((a) => a.paid).reduce((s, a) => s + a.amount, 0);
    const expected = appts.reduce((s, a) => s + a.amount, 0);
    return { total, completed, pending, revenue, expected };
  }, [appts]);

  const navigate = (dir: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + dir);
    setCurrentDate(d);
  };

  const openNew = (time?: string) => {
    setSelectedAppt(null);
    setDefaultDate(dateStr);
    setDefaultTime(time || "09:00");
    setModalOpen(true);
  };

  const openEdit = (a: Appointment) => {
    setSelectedAppt(a);
    setModalOpen(true);
  };

  const updateStatus = (e: React.MouseEvent, a: Appointment, status: AppointmentStatus) => {
    e.stopPropagation();
    store.updateAppointment(a.id, { status });
    const patient = store.getPatient(a.patientId)?.name;
    if (status === "completed") toast.success("Cita completada", { description: patient });
    if (status === "noshow") toast("No asistió", { description: patient });
  };

  const markPaid = (e: React.MouseEvent, a: Appointment) => {
    e.stopPropagation();
    store.updateAppointment(a.id, { paid: true });
    toast.success("Pago registrado", { description: `€${a.amount}` });
  };

  // Week day chips
  const weekDays = useMemo(() => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay() + 1);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [currentDate]);

  return (
    <div className="page-container max-w-3xl">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Agenda</h1>
          <p className="page-subtitle">
            {currentDate.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <Button onClick={() => openNew()} className="gap-1.5 rounded-xl h-10 text-sm px-4">
          <Plus className="h-4 w-4" /> Nueva Cita
        </Button>
      </div>

      {/* Week strip */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={() => navigate(-7)} className="h-8 w-8 rounded-lg shrink-0">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-1 gap-1">
          {weekDays.map((d) => {
            const ds = fmt(d);
            const isSelected = ds === dateStr;
            const isTodayChip = ds === today;
            const dayAppts = store.getAppointmentsForDate(ds);
            const hasAppts = dayAppts.length > 0;
            return (
              <button
                key={ds}
                onClick={() => setCurrentDate(d)}
                className={cn(
                  "flex-1 flex flex-col items-center py-2 rounded-xl text-xs font-medium transition-all relative",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : isTodayChip
                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                      : "hover:bg-accent text-muted-foreground"
                )}
              >
                <span className="text-[10px] uppercase opacity-70">
                  {d.toLocaleDateString("es-ES", { weekday: "short" }).slice(0, 2)}
                </span>
                <span className="text-sm font-semibold mt-0.5">{d.getDate()}</span>
                {hasAppts && !isSelected && (
                  <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
        <Button variant="ghost" size="icon" onClick={() => navigate(7)} className="h-8 w-8 rounded-lg shrink-0">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Today button */}
      {!isToday && (
        <div className="flex justify-center -mt-3">
          <button
            onClick={() => setCurrentDate(new Date())}
            className="text-xs text-primary font-medium hover:underline"
          >
            Ir a hoy
          </button>
        </div>
      )}

      {/* Day summary */}
      {appts.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          <div className="rounded-xl bg-card border border-border/60 px-4 py-3 text-center">
            <p className="text-lg font-bold text-foreground">{stats.total}</p>
            <p className="text-[11px] text-muted-foreground">Citas</p>
          </div>
          <div className="rounded-xl bg-card border border-border/60 px-4 py-3 text-center">
            <p className="text-lg font-bold text-success">{stats.completed}</p>
            <p className="text-[11px] text-muted-foreground">Completadas</p>
          </div>
          <div className="rounded-xl bg-card border border-border/60 px-4 py-3 text-center">
            <p className="text-lg font-bold text-warning">{stats.pending}</p>
            <p className="text-[11px] text-muted-foreground">Pendientes</p>
          </div>
          <div className="rounded-xl bg-card border border-border/60 px-4 py-3 text-center">
            <p className="text-lg font-bold text-foreground">€{stats.revenue}<span className="text-xs font-normal text-muted-foreground">/{stats.expected}</span></p>
            <p className="text-[11px] text-muted-foreground">Cobrado</p>
          </div>
        </div>
      )}

      {/* Appointment list */}
      {appts.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <EmptyState
              icon={CalendarIcon}
              title="Sin citas programadas"
              description={isToday ? "No tienes citas para hoy. ¡Aprovecha para organizar tu agenda!" : "No hay citas para este día."}
              actionLabel="+ Agendar cita"
              onAction={() => openNew()}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {appts.map((a) => {
            const patient = store.getPatient(a.patientId);
            const style = STATUS_STYLES[a.status];
            const isDone = a.status === "completed" || a.status === "noshow";
            const historia = store.clinical.getHistoriaByPatient(a.patientId);
            const hasAlert = patient?.notes?.toLowerCase().includes("sensi") || patient?.notes?.toLowerCase().includes("alergi");

            return (
              <Card
                key={a.id}
                onClick={() => openEdit(a)}
                className={cn(
                  "border-0 shadow-sm cursor-pointer hover:shadow-md transition-all group overflow-hidden border-l-[3px]",
                  style.border,
                  isDone && "opacity-60"
                )}
              >
                <CardContent className="p-0">
                  <div className="flex items-stretch">
                    {/* Time column */}
                    <div className={cn("flex flex-col items-center justify-center px-5 py-4 min-w-[80px]", style.bg)}>
                      <Clock className="h-3.5 w-3.5 text-muted-foreground mb-1" />
                      <span className="text-base font-bold text-foreground">{a.time}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex items-center gap-4 px-4 py-4 min-w-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <p className={cn("text-sm font-semibold", isDone && "line-through text-muted-foreground")}>
                            {patient?.name || "Paciente"}
                          </p>
                          <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full",
                            a.status === "pending" && "bg-warning/15 text-warning",
                            a.status === "confirmed" && "bg-primary/15 text-primary",
                            a.status === "completed" && "bg-success/15 text-success",
                            a.status === "noshow" && "bg-destructive/15 text-destructive",
                          )}>
                            <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
                            {style.label}
                          </span>
                          {historia && (
                            <ClinicalStatusBadge status={estadoMap[historia.estado]} variant="pill" />
                          )}
                          {!historia && (
                            <span className="text-[10px] text-muted-foreground/50 italic">Sin HC</span>
                          )}
                          {hasAlert && (
                            <AlertTriangle className="h-3 w-3 text-warning" />
                          )}
                        </div>
                        {a.notes && (
                          <p className="text-xs text-muted-foreground truncate">{a.notes}</p>
                        )}
                      </div>

                      {/* Payment info */}
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold">€{a.amount}</p>
                        <p className={cn("text-[10px] font-medium", a.paid ? "text-success" : "text-muted-foreground")}>
                          {a.paid ? "✓ Pagado" : "Sin pagar"}
                        </p>
                      </div>

                      {/* Quick actions */}
                      <div
                        className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Clinical actions */}
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              className="h-8 w-8 rounded-lg bg-accent hover:bg-accent/80 flex items-center justify-center transition-colors"
                              title="Contexto clínico"
                            >
                              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-64 p-0" align="end" onClick={(e) => e.stopPropagation()}>
                            {/* Patient quick context */}
                            <div className="px-4 py-3 border-b border-border/60">
                              <p className="text-sm font-semibold">{patient?.name}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                {patient?.phone && (
                                  <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{patient.phone}</span>
                                )}
                              </div>
                              {patient?.notes && (
                                <p className="text-[11px] text-muted-foreground/70 mt-1 line-clamp-2">{patient.notes}</p>
                              )}
                              {hasAlert && (
                                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-warning font-medium">
                                  <AlertTriangle className="h-3 w-3" />
                                  Alerta clínica registrada
                                </div>
                              )}
                            </div>
                            <div className="p-2 space-y-0.5">
                              {historia ? (
                                <button
                                  onClick={() => nav(`/patients/${a.patientId}/historia/${historia.id}`)}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg hover:bg-accent transition-colors text-left"
                                >
                                  <FolderOpen className="h-3.5 w-3.5 text-primary" />
                                  Abrir historia clínica
                                </button>
                              ) : (
                                <button
                                  onClick={() => toast.info("Funcionalidad próxima", { description: "Crear nueva historia" })}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg hover:bg-accent transition-colors text-left"
                                >
                                  <FilePlus className="h-3.5 w-3.5 text-primary" />
                                  Iniciar historia clínica
                                </button>
                              )}
                              <button
                                onClick={() => nav(`/notes?patient=${a.patientId}&appointment=${a.id}`)}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg hover:bg-accent transition-colors text-left"
                              >
                                <StickyNote className="h-3.5 w-3.5 text-muted-foreground" />
                                Nueva nota corta
                              </button>
                              <button
                                onClick={() => nav(`/patients/${a.patientId}`)}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg hover:bg-accent transition-colors text-left"
                              >
                                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                Ver perfil completo
                              </button>
                            </div>
                          </PopoverContent>
                        </Popover>

                        {!isDone && (
                          <>
                            <button
                              onClick={(e) => updateStatus(e, a, "completed")}
                              className="h-8 w-8 rounded-lg bg-success/10 hover:bg-success/20 flex items-center justify-center transition-colors"
                              title="Completar"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                            </button>
                            <button
                              onClick={(e) => updateStatus(e, a, "noshow")}
                              className="h-8 w-8 rounded-lg bg-destructive/10 hover:bg-destructive/20 flex items-center justify-center transition-colors"
                              title="No asistió"
                            >
                              <UserX className="h-3.5 w-3.5 text-destructive" />
                            </button>
                          </>
                        )}
                        {!a.paid && (
                          <button
                            onClick={(e) => markPaid(e, a)}
                            className="h-8 w-8 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                            title="Marcar pagado"
                          >
                            <CircleDollarSign className="h-3.5 w-3.5 text-primary" />
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); openEdit(a); }}
                          className="h-8 w-8 rounded-lg bg-accent hover:bg-accent/80 flex items-center justify-center transition-colors"
                          title="Editar"
                        >
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick schedule slots */}
      <div>
        <p className="section-title mb-2">Agendar rápido</p>
        <div className="flex flex-wrap gap-1.5">
          {HOURS.map((h) => {
            const timeStr = `${String(h).padStart(2, "0")}:00`;
            const hasAppt = appts.some((a) => a.time.startsWith(String(h).padStart(2, "0")));
            return (
              <button
                key={h}
                onClick={() => openNew(timeStr)}
                disabled={hasAppt}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-xs font-medium transition-colors",
                  hasAppt
                    ? "bg-muted text-muted-foreground/30 cursor-not-allowed line-through"
                    : "bg-card border border-border/60 hover:border-primary/40 hover:text-primary hover:bg-primary/5 shadow-sm"
                )}
              >
                {timeStr}
              </button>
            );
          })}
        </div>
      </div>

      <AppointmentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        appointment={selectedAppt}
        defaultDate={defaultDate}
        defaultTime={defaultTime}
      />
    </div>
  );
}

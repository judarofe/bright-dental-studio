import { useState } from "react";
import { useAppStore } from "@/data/StoreContext";
import { useAuth } from "@/contexts/AuthContext";
import { StatCard } from "@/components/StatCard";
import { AppointmentModal } from "@/components/AppointmentModal";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SPECIALTY_META, type SpecialtyCode } from "@/lib/clinicalSections";
import { Users, CalendarDays, DollarSign, Plus, CheckCircle2, Ban, CircleDollarSign, Stethoscope } from "lucide-react";
import { Appointment } from "@/data/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ALL_SPEC_CODES: SpecialtyCode[] = ["odontologia", "medicina", "psicologia", "enfermeria"];

export default function Dashboard() {
  const store = useAppStore();
  const today = new Date().toISOString().split("T")[0];
  const todayAppts = store.getAppointmentsForDate(today);
  const todayRevenue = todayAppts.filter((a) => a.paid).reduce((s, a) => s + a.amount, 0);
  const pending = todayAppts.filter((a) => a.status === "pending" || a.status === "confirmed");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);

  const openNew = () => { setSelectedAppt(null); setModalOpen(true); };
  const openEdit = (a: Appointment) => { setSelectedAppt(a); setModalOpen(true); };

  const markDone = (e: React.MouseEvent, a: Appointment) => {
    e.stopPropagation();
    store.updateAppointment(a.id, { status: "completed" });
    toast.success("Cita completada", { description: store.getPatient(a.patientId)?.name });
  };
  const markPaid = (e: React.MouseEvent, a: Appointment) => {
    e.stopPropagation();
    store.updateAppointment(a.id, { paid: true });
    toast.success("Pago registrado", { description: `€${a.amount}` });
  };
  const markNoShow = (e: React.MouseEvent, a: Appointment) => {
    e.stopPropagation();
    store.updateAppointment(a.id, { status: "noshow" });
    toast("No asistió", { description: store.getPatient(a.patientId)?.name });
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title text-2xl">Buenos días, Dr. Rivera</h1>
          <p className="page-subtitle">
            {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <Button onClick={openNew} className="gap-2 rounded-xl shadow-sm h-10 px-5">
          <Plus className="h-4 w-4" /> Nueva Cita
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard title="Pacientes" value={store.patients.length} icon={Users} />
        <StatCard title="Citas hoy" value={todayAppts.length} icon={CalendarDays} accent="warning" />
        <StatCard title="Ingresos" value={`€${todayRevenue}`} icon={DollarSign} accent="success" />
      </div>

      {/* Next appointment highlight */}
      {pending.length > 0 && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="section-title text-xs mb-1">Siguiente cita</p>
              <p className="text-base font-semibold">{store.getPatient(pending[0].patientId)?.name} — {pending[0].time}</p>
              {pending[0].notes && <p className="text-sm text-muted-foreground truncate mt-0.5">{pending[0].notes}</p>}
            </div>
            <div className="flex gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={(e) => markDone(e, pending[0])}
                className="h-9 px-3 rounded-lg bg-success/10 hover:bg-success/15 flex items-center gap-1.5 text-sm font-medium text-success transition-colors"
              >
                <CheckCircle2 className="h-4 w-4" /> Hecha
              </button>
              {!pending[0].paid && (
                <button
                  onClick={(e) => markPaid(e, pending[0])}
                  className="h-9 px-3 rounded-lg bg-primary/10 hover:bg-primary/15 flex items-center gap-1.5 text-sm font-medium text-primary transition-colors"
                >
                  <CircleDollarSign className="h-4 w-4" /> Cobrar
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's schedule */}
      <div>
        <p className="section-title mb-3">Agenda de hoy</p>
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {todayAppts.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="Sin citas para hoy"
                description="Tu día está libre. Agenda una cita para comenzar."
                actionLabel="+ Agregar cita"
                onAction={openNew}
              />
            ) : (
              <div className="divide-y divide-border/60">
                {todayAppts.map((a) => {
                  const patient = store.getPatient(a.patientId);
                  const isDone = a.status === "completed" || a.status === "noshow";
                  return (
                    <div
                      key={a.id}
                      onClick={() => openEdit(a)}
                      className={cn(
                        "flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-accent/40 transition-colors group",
                        isDone && "opacity-50"
                      )}
                    >
                      <span className="text-sm font-mono font-semibold text-muted-foreground w-12 shrink-0">{a.time}</span>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium", isDone && "line-through")}>{patient?.name || "—"}</p>
                        {a.notes && <p className="text-xs text-muted-foreground truncate mt-0.5">{a.notes}</p>}
                      </div>
                      <StatusBadge status={a.status} />
                      <div className="text-right shrink-0 w-16">
                        <p className="text-sm font-semibold">€{a.amount}</p>
                        {a.paid && <p className="text-[10px] font-medium text-success">Pagado</p>}
                      </div>
                      {!isDone && (
                        <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <button onClick={(e) => markDone(e, a)} className="h-8 w-8 rounded-lg bg-success/10 hover:bg-success/20 flex items-center justify-center" title="Hecha">
                            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                          </button>
                          <button onClick={(e) => markNoShow(e, a)} className="h-8 w-8 rounded-lg bg-destructive/10 hover:bg-destructive/20 flex items-center justify-center" title="No asistió">
                            <Ban className="h-3.5 w-3.5 text-destructive" />
                          </button>
                          {!a.paid && (
                            <button onClick={(e) => markPaid(e, a)} className="h-8 w-8 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center" title="Cobrar">
                              <CircleDollarSign className="h-3.5 w-3.5 text-primary" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AppointmentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        appointment={selectedAppt}
      />
    </div>
  );
}

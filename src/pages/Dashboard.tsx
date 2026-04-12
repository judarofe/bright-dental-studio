import { useState } from "react";
import { useAppStore } from "@/data/StoreContext";
import { StatCard } from "@/components/StatCard";
import { AppointmentModal } from "@/components/AppointmentModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, CalendarDays, DollarSign, Plus, CheckCircle2, Ban, CircleDollarSign } from "lucide-react";
import { Appointment } from "@/data/store";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  pending: "border-l-status-pending",
  confirmed: "border-l-status-confirmed",
  completed: "border-l-status-completed",
  noshow: "border-l-status-noshow",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  completed: "Completada",
  noshow: "No asistió",
};

export default function Dashboard() {
  const store = useAppStore();
  const today = new Date().toISOString().split("T")[0];
  const todayAppts = store.getAppointmentsForDate(today);
  const todayRevenue = todayAppts.filter((a) => a.paid).reduce((s, a) => s + a.amount, 0);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);

  const openNew = () => { setSelectedAppt(null); setModalOpen(true); };
  const openEdit = (a: Appointment) => { setSelectedAppt(a); setModalOpen(true); };

  const markDone = (e: React.MouseEvent, a: Appointment) => {
    e.stopPropagation();
    store.updateAppointment(a.id, { status: "completed" });
  };
  const markPaid = (e: React.MouseEvent, a: Appointment) => {
    e.stopPropagation();
    store.updateAppointment(a.id, { paid: true });
  };
  const markNoShow = (e: React.MouseEvent, a: Appointment) => {
    e.stopPropagation();
    store.updateAppointment(a.id, { status: "noshow" });
  };

  const nextAppt = todayAppts.find((a) => a.status === "confirmed" || a.status === "pending");

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Hola, Dr. Rivera 👋</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {new Date().toLocaleDateString("es-ES", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <Button onClick={openNew} size="lg" className="gap-2 text-base px-6 rounded-xl shadow-sm">
          <Plus className="h-5 w-5" /> Nueva Cita
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Pacientes" value={store.patients.length} icon={Users} />
        <StatCard title="Hoy" value={`${todayAppts.length} citas`} icon={CalendarDays} />
        <StatCard title="Ingresos" value={`€${todayRevenue}`} icon={DollarSign} />
      </div>

      {nextAppt && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-primary uppercase tracking-wide">Siguiente</p>
              <p className="text-lg font-semibold mt-0.5">{store.getPatient(nextAppt.patientId)?.name} — {nextAppt.time}</p>
              <p className="text-sm text-muted-foreground">{nextAppt.notes}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="rounded-lg gap-1.5" onClick={(e) => markDone(e, nextAppt)}>
                <CheckCircle2 className="h-4 w-4 text-success" /> Hecha
              </Button>
              {!nextAppt.paid && (
                <Button size="sm" variant="outline" className="rounded-lg gap-1.5" onClick={(e) => markPaid(e, nextAppt)}>
                  <CircleDollarSign className="h-4 w-4 text-primary" /> Pagada
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Agenda de Hoy</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          {todayAppts.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">No hay citas hoy — ¡disfruta tu día libre! 🎉</p>
          ) : (
            <div className="space-y-1">
              {todayAppts.map((a) => {
                const patient = store.getPatient(a.patientId);
                const isDone = a.status === "completed";
                const isNoShow = a.status === "noshow";
                return (
                  <div
                    key={a.id}
                    onClick={() => openEdit(a)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border-l-4 p-4 cursor-pointer hover:bg-accent/40 transition-all",
                      STATUS_COLORS[a.status],
                      (isDone || isNoShow) && "opacity-60"
                    )}
                  >
                    <div className="text-lg font-semibold w-16 shrink-0">{a.time}</div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("font-medium", isDone && "line-through")}>{patient?.name || "Desconocido"}</p>
                      <p className="text-sm text-muted-foreground truncate">{a.notes}</p>
                    </div>
                    <div className="text-right shrink-0 mr-1">
                      <p className="font-semibold">€{a.amount}</p>
                      {a.paid && <p className="text-xs text-success">✓ Pagado</p>}
                    </div>
                    {!isDone && !isNoShow && (
                      <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => markDone(e, a)}
                          className="h-9 w-9 rounded-lg bg-success/10 hover:bg-success/20 flex items-center justify-center transition-colors"
                          title="Marcar como hecha"
                        >
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        </button>
                        <button
                          onClick={(e) => markNoShow(e, a)}
                          className="h-9 w-9 rounded-lg bg-destructive/10 hover:bg-destructive/20 flex items-center justify-center transition-colors"
                          title="No asistió"
                        >
                          <Ban className="h-4 w-4 text-destructive" />
                        </button>
                        {!a.paid && (
                          <button
                            onClick={(e) => markPaid(e, a)}
                            className="h-9 w-9 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                            title="Marcar como pagado"
                          >
                            <CircleDollarSign className="h-4 w-4 text-primary" />
                          </button>
                        )}
                      </div>
                    )}
                    {(isDone || isNoShow) && (
                      <span className="text-xs font-medium text-muted-foreground shrink-0">{STATUS_LABELS[a.status]}</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AppointmentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        appointment={selectedAppt}
      />
    </div>
  );
}

import { useState } from "react";
import { useAppStore } from "@/data/StoreContext";
import { AppointmentModal } from "@/components/AppointmentModal";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Plus, CheckCircle2, CircleDollarSign } from "lucide-react";
import { Appointment } from "@/data/store";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8);

function fmt(d: Date) {
  return d.toISOString().split("T")[0];
}

export default function Agenda() {
  const store = useAppStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [defaultDate, setDefaultDate] = useState("");
  const [defaultTime, setDefaultTime] = useState("");

  const today = fmt(new Date());
  const dateStr = fmt(currentDate);
  const appts = store.getAppointmentsForDate(dateStr);
  const isToday = dateStr === today;

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

  const markDone = (e: React.MouseEvent, a: Appointment) => {
    e.stopPropagation();
    store.updateAppointment(a.id, { status: "completed" });
  };

  const markPaid = (e: React.MouseEvent, a: Appointment) => {
    e.stopPropagation();
    store.updateAppointment(a.id, { paid: true });
  };

  return (
    <div className="page-container max-w-3xl">
      {/* Navigation */}
      <div className="page-header">
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-9 w-9 rounded-lg">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="rounded-lg text-xs h-8 px-3">
            Hoy
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate(1)} className="h-9 w-9 rounded-lg">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h2 className="text-base font-semibold ml-2">
            {isToday && <span className="text-primary">Hoy · </span>}
            {currentDate.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "short" })}
          </h2>
        </div>

        <Button onClick={() => openNew()} className="gap-1.5 rounded-xl h-9 text-sm">
          <Plus className="h-4 w-4" /> Nueva
        </Button>
      </div>

      {/* Appointment list */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {appts.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-muted-foreground text-sm">Sin citas este día</p>
              <Button variant="link" onClick={() => openNew()} className="mt-1 text-sm">+ Agregar una</Button>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {appts.map((a) => {
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
                    <span className="text-lg font-mono font-bold text-muted-foreground w-14 shrink-0">{a.time}</span>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-medium", isDone && "line-through")}>{patient?.name}</p>
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
                        {!a.paid && (
                          <button onClick={(e) => markPaid(e, a)} className="h-8 w-8 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center" title="Pagada">
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

      {/* Quick schedule slots */}
      <div>
        <p className="section-title mb-2">Horarios disponibles</p>
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
                  "px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                  hasAppt
                    ? "bg-muted text-muted-foreground/30 cursor-not-allowed"
                    : "bg-card border border-border/60 hover:border-primary/40 hover:text-primary shadow-sm"
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

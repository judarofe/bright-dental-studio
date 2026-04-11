import { useState, useMemo } from "react";
import { useAppStore } from "@/data/StoreContext";
import { AppointmentModal } from "@/components/AppointmentModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Plus, CheckCircle2, CircleDollarSign } from "lucide-react";
import { Appointment } from "@/data/store";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // 8:00–18:00

function fmt(d: Date) {
  return d.toISOString().split("T")[0];
}

const STATUS_BG: Record<string, string> = {
  pending: "border-l-status-pending bg-status-pending/8",
  confirmed: "border-l-status-confirmed bg-status-confirmed/8",
  completed: "border-l-status-completed bg-status-completed/8",
  noshow: "border-l-status-noshow bg-status-noshow/8",
};

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
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Date navigation — simple day-by-day */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="rounded-xl">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="rounded-xl">
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={() => navigate(1)} className="rounded-xl">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <h2 className="text-lg font-semibold">
          {isToday && <span className="text-primary mr-1">Today ·</span>}
          {currentDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
        </h2>

        <Button onClick={() => openNew()} className="gap-1.5 rounded-xl" size="sm">
          <Plus className="h-4 w-4" /> New
        </Button>
      </div>

      {/* Day view — simple list instead of complex grid */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {appts.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-muted-foreground">No appointments this day</p>
              <Button variant="link" onClick={() => openNew()} className="mt-2">+ Add one</Button>
            </div>
          ) : (
            <div className="divide-y">
              {appts.map((a) => {
                const patient = store.getPatient(a.patientId);
                const isDone = a.status === "completed" || a.status === "noshow";
                return (
                  <div
                    key={a.id}
                    onClick={() => openEdit(a)}
                    className={cn(
                      "flex items-center gap-4 p-4 cursor-pointer hover:bg-accent/30 transition-colors border-l-4",
                      STATUS_BG[a.status],
                      isDone && "opacity-50"
                    )}
                  >
                    <div className="text-xl font-bold w-16 shrink-0 text-center">{a.time}</div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("font-medium text-base", isDone && "line-through")}>{patient?.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{a.notes}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold">€{a.amount}</p>
                      {a.paid && <p className="text-xs text-success">✓ Paid</p>}
                    </div>
                    {!isDone && (
                      <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button onClick={(e) => markDone(e, a)} className="h-10 w-10 rounded-xl bg-success/10 hover:bg-success/20 flex items-center justify-center" title="Done">
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        </button>
                        {!a.paid && (
                          <button onClick={(e) => markPaid(e, a)} className="h-10 w-10 rounded-xl bg-primary/10 hover:bg-primary/20 flex items-center justify-center" title="Paid">
                            <CircleDollarSign className="h-5 w-5 text-primary" />
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

      {/* Quick hour slots to tap and create */}
      <Card>
        <CardContent className="p-3">
          <p className="text-xs text-muted-foreground mb-2 font-medium">Tap a time slot to book:</p>
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
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    hasAppt
                      ? "bg-muted text-muted-foreground/40 cursor-not-allowed"
                      : "bg-accent hover:bg-primary/10 hover:text-primary"
                  )}
                >
                  {timeStr}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

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

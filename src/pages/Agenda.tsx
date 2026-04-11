import { useState, useMemo } from "react";
import { useAppStore } from "@/data/StoreContext";
import { AppointmentModal } from "@/components/AppointmentModal";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Appointment } from "@/data/store";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8:00–19:00

function getWeekDays(date: Date): Date[] {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function fmt(d: Date) {
  return d.toISOString().split("T")[0];
}

export default function Agenda() {
  const store = useAppStore();
  const [view, setView] = useState<"week" | "day">("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [defaultDate, setDefaultDate] = useState<string>("");
  const [defaultTime, setDefaultTime] = useState<string>("");

  const today = fmt(new Date());
  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

  const navigate = (dir: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + (view === "week" ? dir * 7 : dir));
    setCurrentDate(d);
  };

  const openNew = (date?: string, time?: string) => {
    setSelectedAppt(null);
    setDefaultDate(date || fmt(currentDate));
    setDefaultTime(time || "09:00");
    setModalOpen(true);
  };

  const openEdit = (a: Appointment) => {
    setSelectedAppt(a);
    setModalOpen(true);
  };

  const renderDayColumn = (date: Date) => {
    const dateStr = fmt(date);
    const appts = store.getAppointmentsForDate(dateStr);
    const isToday = dateStr === today;

    return (
      <div key={dateStr} className="flex-1 min-w-0">
        <div className={cn(
          "text-center py-2 text-sm border-b sticky top-0 bg-card z-10",
          isToday && "text-primary font-semibold"
        )}>
          <div className="text-xs text-muted-foreground">{date.toLocaleDateString("en-US", { weekday: "short" })}</div>
          <div className={cn("text-lg", isToday && "bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto")}>
            {date.getDate()}
          </div>
        </div>

        <div className="relative">
          {HOURS.map((h) => (
            <div
              key={h}
              className="h-16 border-b border-dashed cursor-pointer hover:bg-accent/30 transition-colors"
              onClick={() => openNew(dateStr, `${String(h).padStart(2, "0")}:00`)}
            />
          ))}

          {appts.map((a) => {
            const [hh, mm] = a.time.split(":").map(Number);
            const top = (hh - 8) * 64 + (mm / 60) * 64;
            const height = Math.max((a.duration / 60) * 64, 24);
            const statusColor = {
              pending: "border-l-status-pending bg-status-pending/10",
              confirmed: "border-l-status-confirmed bg-status-confirmed/10",
              completed: "border-l-status-completed bg-status-completed/10",
              noshow: "border-l-status-noshow bg-status-noshow/10",
            }[a.status];

            const patient = store.getPatient(a.patientId);
            return (
              <button
                key={a.id}
                onClick={(e) => { e.stopPropagation(); openEdit(a); }}
                className={cn(
                  "absolute left-0.5 right-0.5 rounded-md border-l-[3px] px-1.5 py-1 text-left overflow-hidden hover:shadow-md transition-shadow",
                  statusColor
                )}
                style={{ top: `${top}px`, height: `${height}px` }}
              >
                <p className="text-[11px] font-medium truncate">{patient?.name}</p>
                {height > 32 && <p className="text-[10px] text-muted-foreground truncate">{a.time} · {a.notes}</p>}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 max-w-7xl">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>Today</Button>
          <Button variant="outline" size="icon" onClick={() => navigate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold ml-2">
            {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setView("day")}
              className={cn("px-3 py-1.5 text-sm transition-colors", view === "day" ? "bg-primary text-primary-foreground" : "hover:bg-accent")}
            >Day</button>
            <button
              onClick={() => setView("week")}
              className={cn("px-3 py-1.5 text-sm transition-colors", view === "week" ? "bg-primary text-primary-foreground" : "hover:bg-accent")}
            >Week</button>
          </div>
          <Button onClick={() => openNew()} className="gap-1.5">
            <Plus className="h-4 w-4" /> New
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <Card>
        <CardContent className="p-0 overflow-auto">
          <div className="flex min-w-[600px]">
            {/* Time labels */}
            <div className="w-14 shrink-0 border-r">
              <div className="h-[52px] border-b" />
              {HOURS.map((h) => (
                <div key={h} className="h-16 border-b border-dashed px-2 text-xs text-muted-foreground flex items-start pt-0.5">
                  {String(h).padStart(2, "0")}:00
                </div>
              ))}
            </div>

            {/* Day columns */}
            {view === "week"
              ? weekDays.map((d) => renderDayColumn(d))
              : renderDayColumn(currentDate)
            }
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

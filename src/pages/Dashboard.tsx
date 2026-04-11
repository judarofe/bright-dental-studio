import { useState } from "react";
import { useAppStore } from "@/data/StoreContext";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { AppointmentModal } from "@/components/AppointmentModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, CalendarDays, DollarSign, Plus, Clock } from "lucide-react";
import { Appointment } from "@/data/store";

export default function Dashboard() {
  const store = useAppStore();
  const today = new Date().toISOString().split("T")[0];
  const todayAppts = store.getAppointmentsForDate(today);
  const todayRevenue = todayAppts.filter((a) => a.paid).reduce((s, a) => s + a.amount, 0);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);

  const openNew = () => { setSelectedAppt(null); setModalOpen(true); };
  const openEdit = (a: Appointment) => { setSelectedAppt(a); setModalOpen(true); };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Good morning, Dr. Rivera</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <Button onClick={openNew} className="gap-1.5">
          <Plus className="h-4 w-4" /> New Appointment
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Patients" value={store.patients.length} icon={Users} />
        <StatCard title="Today's Appointments" value={todayAppts.length} icon={CalendarDays} />
        <StatCard title="Today's Revenue" value={`€${todayRevenue}`} icon={DollarSign} />
      </div>

      {/* Today's appointments */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Today's Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {todayAppts.length === 0 ? (
            <p className="text-muted-foreground text-sm py-6 text-center">No appointments today</p>
          ) : (
            <div className="space-y-2">
              {todayAppts.map((a) => {
                const patient = store.getPatient(a.patientId);
                return (
                  <button
                    key={a.id}
                    onClick={() => openEdit(a)}
                    className="w-full flex items-center gap-4 rounded-lg border p-3 hover:bg-accent/40 transition-colors text-left"
                  >
                    <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground w-16 shrink-0">
                      <Clock className="h-3.5 w-3.5" />
                      {a.time}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{patient?.name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground truncate">{a.notes}</p>
                    </div>
                    <StatusBadge status={a.status} />
                    <span className="text-sm font-medium">€{a.amount}</span>
                  </button>
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

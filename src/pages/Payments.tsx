import { useState, useMemo } from "react";
import { useAppStore } from "@/data/StoreContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { DollarSign } from "lucide-react";
import { StatCard } from "@/components/StatCard";

export default function Payments() {
  const store = useAppStore();
  const [dateFilter, setDateFilter] = useState("");
  const paid = store.getPaidAppointments();

  const filtered = useMemo(() => {
    if (!dateFilter) return paid;
    return paid.filter((a) => a.date === dateFilter);
  }, [paid, dateFilter]);

  const total = filtered.reduce((s, a) => s + a.amount, 0);

  return (
    <div className="space-y-4 max-w-4xl">
      <h1 className="text-2xl font-semibold">Pagos</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard title="Total Cobrado" value={`€${total}`} icon={DollarSign} />
        <div className="flex items-end">
          <div className="space-y-1.5 w-full">
            <label className="text-sm text-muted-foreground">Filtrar por fecha</label>
            <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Citas Pagadas</CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-6">No se encontraron pagos</p>
          ) : (
            <div className="space-y-2">
              {filtered.map((a) => {
                const patient = store.getPatient(a.patientId);
                return (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <span className="text-sm w-24 shrink-0 text-muted-foreground">{a.date}</span>
                    <span className="text-sm w-14 text-muted-foreground">{a.time}</span>
                    <span className="flex-1 text-sm font-medium truncate">{patient?.name || "Desconocido"}</span>
                    <StatusBadge status={a.status} />
                    <span className="text-sm font-semibold">€{a.amount}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

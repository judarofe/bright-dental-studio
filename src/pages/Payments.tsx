import { useState, useMemo } from "react";
import { useAppStore } from "@/data/StoreContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { DollarSign, Receipt } from "lucide-react";
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
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Pagos</h1>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">Filtrar:</label>
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-9 w-40 rounded-lg text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard title="Total cobrado" value={`€${total}`} icon={DollarSign} accent="success" />
        <StatCard title="Transacciones" value={filtered.length} icon={Receipt} />
      </div>

      <div>
        <p className="section-title mb-3">Historial de pagos</p>
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-12">No se encontraron pagos</p>
            ) : (
              <div className="divide-y divide-border/60">
                {filtered.map((a) => {
                  const patient = store.getPatient(a.patientId);
                  return (
                    <div key={a.id} className="flex items-center gap-4 px-5 py-3.5">
                      <span className="text-sm text-muted-foreground w-20 shrink-0">{a.date}</span>
                      <span className="text-xs font-mono text-muted-foreground w-12">{a.time}</span>
                      <span className="flex-1 text-sm font-medium truncate">{patient?.name || "—"}</span>
                      <StatusBadge status={a.status} />
                      <span className="text-sm font-semibold w-14 text-right">€{a.amount}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState, useMemo } from "react";
import { useAppStore } from "@/data/StoreContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { DollarSign, Receipt, X } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { cn } from "@/lib/utils";

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
          <Label className="text-xs text-muted-foreground shrink-0">Filtrar por fecha:</Label>
          <div className="relative">
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-9 w-40 rounded-xl text-sm pr-8"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
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
              <EmptyState
                icon={Receipt}
                title={dateFilter ? "Sin pagos en esta fecha" : "Sin pagos registrados"}
                description={dateFilter ? "No se encontraron pagos para el día seleccionado." : "Los pagos aparecerán aquí cuando se registren citas completadas."}
                actionLabel={dateFilter ? "Ver todos los pagos" : undefined}
                onAction={dateFilter ? () => setDateFilter("") : undefined}
              />
            ) : (
              <div className="divide-y divide-border/60">
                {/* Table header */}
                <div className="flex items-center gap-4 px-5 py-2.5 bg-muted/40 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                  <span className="w-24 shrink-0">Fecha</span>
                  <span className="w-12">Hora</span>
                  <span className="flex-1">Paciente</span>
                  <span className="w-20 text-center">Estado</span>
                  <span className="w-16 text-right">Monto</span>
                </div>
                {filtered.map((a) => {
                  const patient = store.getPatient(a.patientId);
                  return (
                    <div key={a.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-accent/20 transition-colors">
                      <span className="text-sm text-muted-foreground w-24 shrink-0">
                        {new Date(a.date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground w-12">{a.time}</span>
                      <span className="flex-1 text-sm font-medium truncate">{patient?.name || "—"}</span>
                      <span className="w-20 flex justify-center"><StatusBadge status={a.status} /></span>
                      <span className="text-sm font-semibold w-16 text-right text-success">€{a.amount}</span>
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

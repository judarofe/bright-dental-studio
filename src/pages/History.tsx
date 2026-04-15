import { Clock } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function History() {
  return (
    <div className="page-container">
      <div>
        <h1 className="page-title">Históricos</h1>
        <p className="page-subtitle">Registro histórico de actividad del consultorio</p>
      </div>
      <EmptyState
        icon={Clock}
        title="Sin registros históricos"
        description="Aquí encontrarás el historial completo de citas, pagos y cambios realizados en el sistema."
      />
    </div>
  );
}

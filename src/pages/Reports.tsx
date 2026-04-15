import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function Reports() {
  return (
    <div className="page-container">
      <div>
        <h1 className="page-title">Reportes</h1>
        <p className="page-subtitle">Métricas e informes del consultorio</p>
      </div>
      <EmptyState
        icon={BarChart3}
        title="Sin reportes disponibles"
        description="Próximamente podrás generar reportes de ingresos, citas y rendimiento del consultorio."
      />
    </div>
  );
}

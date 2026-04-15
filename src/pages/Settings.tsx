import { Settings as SettingsIcon } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function Settings() {
  return (
    <div className="page-container">
      <div>
        <h1 className="page-title">Configuración Clínica</h1>
        <p className="page-subtitle">Preferencias y ajustes del consultorio</p>
      </div>
      <EmptyState
        icon={SettingsIcon}
        title="Configuración pendiente"
        description="Aquí podrás personalizar horarios, tipos de procedimiento, tarifas y datos del consultorio."
      />
    </div>
  );
}

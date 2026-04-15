import { StickyNote } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export default function QuickNotes() {
  return (
    <div className="page-container">
      <div>
        <h1 className="page-title">Notas Cortas</h1>
        <p className="page-subtitle">Anotaciones rápidas sobre pacientes o consultas</p>
      </div>
      <EmptyState
        icon={StickyNote}
        title="Sin notas todavía"
        description="Las notas cortas te permiten capturar ideas o recordatorios rápidos durante la consulta."
      />
    </div>
  );
}

import { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAppStore } from "@/data/StoreContext";
import { BASE_SECTIONS, SPECIALTY_SECTIONS, SPECIALTY_META } from "@/lib/clinical/sections";
import { ACTIVE_SPECIALTY } from "@/lib/clinical/constants";

type BadgeStatus = "draft" | "in_progress" | "closed" | "voided";

const STATUS_TO_BADGE: Record<string, BadgeStatus> = {
  borrador: "draft",
  en_progreso: "in_progress",
  cerrada: "closed",
  anulada: "voided",
};

/**
 * Hook centralizing workspace state, derived data and clinical handlers.
 * Keeps the page/orchestrator component focused on layout composition.
 */
export function useClinicalWorkspace(patientId?: string, historiaId?: string) {
  const navigate = useNavigate();
  const store = useAppStore();
  const { clinical } = store;

  const patient = store.patients.find((p) => p.id === patientId);
  const historia = historiaId ? clinical.getHistoria(historiaId) : undefined;
  const diagnosticos = historia ? clinical.getDiagnosticosByHistoria(historia.id) : [];
  const notas = historia ? clinical.getNotasByHistoria(historia.id) : [];
  const odontograma = historia ? clinical.getOdontograma(historia.odontogramaId) : null;
  const versiones = historia ? clinical.getVersionesByHistoria(historia.id) : [];

  const [activeSection, setActiveSection] = useState("motivo");
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const baseSections = BASE_SECTIONS;
  const specialtySections = SPECIALTY_SECTIONS[ACTIVE_SPECIALTY] ?? [];
  const specialtyMeta = SPECIALTY_META[ACTIVE_SPECIALTY];
  const allSections = useMemo(
    () => [...baseSections, ...specialtySections],
    [baseSections, specialtySections]
  );

  const badgeStatus: BadgeStatus | undefined = historia ? STATUS_TO_BADGE[historia.estado] : undefined;
  const isLocked = historia?.estado === "cerrada" || historia?.estado === "anulada";

  const checklistItems = useMemo(() => {
    if (!historia) return [];
    return [
      { label: "Motivo de consulta registrado", completed: !!historia.detalle.motivoConsulta, required: true as const },
      { label: "Anamnesis completada", completed: !!historia.detalle.anamnesis, required: true as const },
      { label: "Antecedentes médicos completos", completed: !!historia.detalle.antecedentesMedicos, required: true as const },
      { label: "Hábitos registrados", completed: !!historia.detalle.habitos },
      { label: "Revisión por sistemas", completed: !!historia.detalle.revisionSistemas },
      { label: "Exploración clínica realizada", completed: !!historia.detalle.exploracionClinica, required: true as const },
      { label: "Diagnóstico principal", completed: diagnosticos.length > 0 },
      { label: "Plan de tratamiento definido", completed: !!historia.detalle.planTratamiento },
      { label: "Odontograma actualizado", completed: !!odontograma && odontograma.piezas.some((p) => p.condicion !== "sano") },
    ];
  }, [historia, diagnosticos, odontograma]);

  const handleSaveDraft = useCallback(() => {
    if (!historia) return;
    clinical.updateHistoria(historia.id, { estado: "borrador" });
    toast.success("Borrador guardado");
  }, [clinical, historia]);

  const handleValidate = useCallback(() => {
    toast.info("Validación completada — ver checklist abajo");
  }, []);

  const handleClose = useCallback(() => {
    if (!historia || !patient) return;
    clinical.updateHistoria(historia.id, { estado: "cerrada" });
    toast.success("Historia cerrada correctamente", { description: `${patient.name} — Historia bloqueada` });
    setShowCloseConfirm(false);
  }, [clinical, historia, patient]);

  const handlePrint = useCallback(() => {
    toast.info("Preparando impresión…");
    setTimeout(() => window.print(), 300);
  }, []);

  return {
    // entities
    store,
    clinical,
    patient,
    historia,
    diagnosticos,
    notas,
    odontograma,
    versiones,
    // state
    activeSection,
    setActiveSection,
    showCloseConfirm,
    setShowCloseConfirm,
    // sections
    baseSections,
    specialtySections,
    specialtyMeta,
    allSections,
    activeSpecialty: ACTIVE_SPECIALTY,
    // derived
    badgeStatus,
    isLocked,
    checklistItems,
    // handlers
    navigate,
    handleSaveDraft,
    handleValidate,
    handleClose,
    handlePrint,
  };
}

export type ClinicalWorkspaceCtx = ReturnType<typeof useClinicalWorkspace>;

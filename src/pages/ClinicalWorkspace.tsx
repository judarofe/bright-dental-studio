/**
 * ClinicalWorkspace — orchestrator.
 *
 * Composes the workspace shell from modular pieces:
 *  - hooks/clinical/useClinicalWorkspace ............ state + handlers
 *  - components/clinical/workspace/* ................ layout, header, nav
 *  - components/clinical/base/* ..................... sections common to all specialties
 *  - components/clinical/odontologia/* .............. odontology-specific sections
 *  - components/clinical/{Conducta,RevisionFinal,...} shared closing/review pieces
 *
 * Adding a new specialty:
 *   1. Add entries to `SPECIALTY_SECTIONS` + `SPECIALTY_META` in `lib/clinicalSections.ts`.
 *   2. Create a new folder `components/clinical/<specialty>/` with section components.
 *   3. Branch on `activeSpecialty` in the section renderer below.
 */
import { useParams } from "react-router-dom";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ClinicalAlert, ValidationChecklist } from "@/components/clinical";
import { RevisionFinalSection } from "@/components/clinical/RevisionFinalSection";
import { ConductaCierreSection } from "@/components/clinical/ConductaCierreSection";
import { DiagnosticosSection } from "@/components/clinical/DiagnosticosSection";

import {
  WorkspaceHeader,
  PatientContextHeader,
  SectionNav,
  VersionsList,
  NotFoundCard,
} from "@/components/clinical/workspace";

import {
  MotivoSection,
  AntecedentesSection,
  ExamenGeneralSection,
  PlanSection,
  PrescripcionesSection,
  NotasSection,
} from "@/components/clinical/base";

import {
  AntecedentesOdontoSection,
  HabitosOralesSection,
  ExamenOdontoSection,
  IndicadoresOdontoSection,
  OdontogramaSection,
  DiagnosticosOdontoSection,
  ConductaOdontoSection,
} from "@/components/clinical/odontologia";

import { useClinicalWorkspace } from "@/hooks/clinical/useClinicalWorkspace";

export default function ClinicalWorkspace() {
  const { patientId, historiaId } = useParams<{ patientId: string; historiaId: string }>();
  const ctx = useClinicalWorkspace(patientId, historiaId);

  const {
    patient,
    historia,
    diagnosticos,
    notas,
    odontograma,
    versiones,
    activeSection,
    setActiveSection,
    showCloseConfirm,
    setShowCloseConfirm,
    baseSections,
    specialtySections,
    specialtyMeta,
    activeSpecialty,
    badgeStatus,
    isLocked,
    checklistItems,
    navigate,
    clinical,
    handleSaveDraft,
    handleValidate,
    handleClose,
    handlePrint,
  } = ctx;

  if (!patient || !historia) {
    return <NotFoundCard patientId={patientId} />;
  }

  return (
    <div className="page-container max-w-5xl space-y-4">
      <WorkspaceHeader
        patientId={patient.id}
        patientName={patient.name}
        meta={specialtyMeta}
        isLocked={isLocked}
        onBack={() => navigate(`/patients/${patient.id}`)}
        onSaveDraft={handleSaveDraft}
        onValidate={handleValidate}
        onPrint={handlePrint}
        onCloseRequest={() => setShowCloseConfirm(true)}
      />

      <PatientContextHeader
        patient={patient}
        historia={historia}
        meta={specialtyMeta}
        badgeStatus={badgeStatus}
      />

      {isLocked && (
        <ClinicalAlert
          type={historia.estado === "anulada" ? "error" : "admin"}
          title={historia.estado === "anulada" ? "Historia anulada — solo lectura" : "Historia cerrada — solo lectura"}
          description="No se pueden realizar modificaciones sin autorización administrativa."
        />
      )}

      <div className="flex gap-4 items-start">
        <SectionNav
          baseSections={baseSections}
          specialtySections={specialtySections}
          meta={specialtyMeta}
          activeSection={activeSection}
          onSelect={setActiveSection}
        />

        <div className="flex-1 min-w-0 space-y-4">
          {/* ── Base sections (common to all specialties) ── */}
          {activeSection === "motivo" && <MotivoSection historia={historia} />}
          {activeSection === "antecedentes" && <AntecedentesSection historia={historia} />}
          {activeSection === "examen" && <ExamenGeneralSection historia={historia} />}
          {activeSection === "diagnosticos" && (
            <DiagnosticosSection diagnosticos={diagnosticos} historiaId={historia.id} />
          )}
          {activeSection === "plan" && <PlanSection historia={historia} isLocked={isLocked} />}
          {activeSection === "prescripciones" && <PrescripcionesSection isLocked={isLocked} />}
          {activeSection === "notas" && <NotasSection notas={notas} />}
          {activeSection === "cierre" && (
            <ConductaCierreSection
              historia={historia}
              diagnosticos={diagnosticos}
              checklistItems={checklistItems}
              onUpdateHistoria={(id, data) => clinical.updateHistoria(id, data)}
            />
          )}
          {activeSection === "revision" && (
            <RevisionFinalSection
              historia={historia}
              patient={{ name: patient.name, phone: patient.phone, cedula: patient.cedula }}
              diagnosticos={diagnosticos}
              odontograma={odontograma}
              notas={notas}
              checklistItems={checklistItems}
              onNavigateSection={(s) => setActiveSection(s)}
              onClose={handleClose}
              onSaveDraft={handleSaveDraft}
              onPrint={handlePrint}
            />
          )}

          {/* ── Odontología-specific sections ── */}
          {activeSpecialty === "odontologia" && (
            <>
              {activeSection === "antecedentes_odonto" && (
                <AntecedentesOdontoSection historia={historia} meta={specialtyMeta} />
              )}
              {activeSection === "habitos_orales" && (
                <HabitosOralesSection historia={historia} meta={specialtyMeta} />
              )}
              {activeSection === "examen_odonto" && (
                <ExamenOdontoSection historia={historia} meta={specialtyMeta} />
              )}
              {activeSection === "indicadores_odonto" && (
                <IndicadoresOdontoSection historia={historia} meta={specialtyMeta} />
              )}
              {activeSection === "odontograma" && (
                <OdontogramaSection odontograma={odontograma} meta={specialtyMeta} />
              )}
              {activeSection === "diagnosticos_odonto" && (
                <DiagnosticosOdontoSection
                  diagnosticos={diagnosticos}
                  historiaId={historia.id}
                  meta={specialtyMeta}
                />
              )}
              {activeSection === "conducta_odonto" && (
                <ConductaOdontoSection
                  historia={historia}
                  diagnosticos={diagnosticos}
                  checklistItems={checklistItems}
                  onUpdateHistoria={(id, data) => clinical.updateHistoria(id, data)}
                  meta={specialtyMeta}
                />
              )}
            </>
          )}

          {/* Future: branch on activeSpecialty === "medicina" / "psicologia" / etc. */}

          {/* ── Always visible ── */}
          <ValidationChecklist title="Estado de completitud" items={checklistItems} />
          <VersionsList versiones={versiones} />
        </div>
      </div>

      <ConfirmDialog
        open={showCloseConfirm}
        onConfirm={handleClose}
        onCancel={() => setShowCloseConfirm(false)}
        title="¿Cerrar esta historia clínica?"
        description={`Se cerrará la historia de ${patient.name}. Una vez cerrada, no podrá editarse sin autorización administrativa.`}
        confirmLabel="Cerrar historia"
        variant="destructive"
      />
    </div>
  );
}

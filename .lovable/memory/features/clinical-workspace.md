---
name: Clinical workspace architecture
description: Modular workspace shell with specialty section registry and extracted components
type: feature
---
**Registry**
- `src/lib/clinicalSections.ts` (re-exported via `src/lib/clinical/sections.ts`) — single registry of BASE_SECTIONS, SPECIALTY_SECTIONS, SPECIALTY_META
- `src/lib/clinical/constants.ts` — `ACTIVE_SPECIALTY` (phase 1: "odontologia")
- BASE_SECTIONS = motivo, antecedentes médicos, examen físico general, diagnósticos, plan, prescripciones, notas, cierre, revisión final
- SPECIALTY_SECTIONS.odontologia = 7 sections (antecedentes_odonto, habitos_orales, examen_odonto, indicadores_odonto, odontograma, diagnosticos_odonto, conducta_odonto)

**Workspace orchestrator**
- `src/pages/ClinicalWorkspace.tsx` — slim composition only; no business logic
- `src/hooks/clinical/useClinicalWorkspace.ts` — derived data, checklist, handlers (save/validate/close/print)

**Component folders**
- `src/components/clinical/workspace/` — shell: WorkspaceHeader, PatientContextHeader, SectionNav (desktop+mobile), SpecialtyBanner, VersionsList, NotFoundCard
- `src/components/clinical/base/` — sections common to all specialties: MotivoSection, AntecedentesSection, ExamenGeneralSection, PlanSection, PrescripcionesSection, NotasSection + reusable ClinicalTextField & SectionCard
- `src/components/clinical/odontologia/` — odontology-specific section wrappers (each renders a SpecialtyBanner)
- `src/components/clinical/specialties/OdontologySections.tsx` — VitalsSection (shared) + OdontologicIndicators (specialty-gated primitives)

**Adding a new specialty**
1. Add entries to SPECIALTY_SECTIONS + SPECIALTY_META in `lib/clinicalSections.ts`
2. Create `components/clinical/<specialty>/` with section components (wrap with `<SpecialtyBanner>`)
3. Branch on `activeSpecialty === "<code>"` in the section renderer in ClinicalWorkspace.tsx

---
name: Clinical workspace architecture
description: Modular workspace shell with specialty section registry and extracted components
type: feature
---
- `src/lib/clinicalSections.ts` — single registry of BASE_SECTIONS, SPECIALTY_SECTIONS, and SPECIALTY_META
- BASE_SECTIONS = common to ALL specialties: motivo, antecedentes médicos, examen físico general, diagnósticos generales, plan, prescripciones, notas, cierre/auditoría, revisión final
- SPECIALTY_SECTIONS.odontologia = 7 sections: antecedentes odontológicos, hábitos orales, exploración odontológica, indicadores odontológicos, odontograma, diagnósticos odontológicos, conducta odontológica
- ClinicalWorkspace uses `ACTIVE_SPECIALTY` constant (phase 1: "odontologia")
- Sidebar nav renders two clearly labeled groups: "Historia clínica base" and specialty name with "Activa" badge
- Mobile nav mirrors the same two-group structure with labeled chip rows
- Specialty sections display a `SpecialtyBanner` component at top to visually signal specialty context
- Odontología-specific renderers in `src/components/clinical/specialties/OdontologySections.tsx`
- VitalsSection is shared (common examen); OdontologicIndicators is specialty-gated
- To add a new specialty: add entries to SPECIALTY_SECTIONS + SPECIALTY_META + add section renderers in workspace

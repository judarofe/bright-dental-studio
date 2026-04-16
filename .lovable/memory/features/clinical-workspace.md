---
name: Clinical workspace architecture
description: Modular workspace shell with specialty section registry and extracted components
type: feature
---
- `src/lib/clinicalSections.ts` — single registry of BASE_SECTIONS, SPECIALTY_SECTIONS, and SPECIALTY_META
- ClinicalWorkspace uses `ACTIVE_SPECIALTY` constant (phase 1: "odontologia")
- Sidebar nav and mobile nav render from registry arrays dynamically
- Odontología-specific renderers extracted to `src/components/clinical/specialties/OdontologySections.tsx`
- VitalsSection is shared; OdontologicIndicators is specialty-gated
- To add a new specialty: add entries to SPECIALTY_SECTIONS + SPECIALTY_META + create renderer in specialties/
- ClinicalHubTab also consumes SPECIALTY_META for consistent visual config

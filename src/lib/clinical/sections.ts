/**
 * Re-exports from the section registry, scoped under the clinical module.
 * Prefer importing from `@/lib/clinical/sections` inside the clinical module.
 */
export {
  BASE_SECTIONS,
  SPECIALTY_SECTIONS,
  SPECIALTY_META,
  getAllSections,
  getSpecialtyMeta,
} from "@/lib/clinicalSections";

export type {
  SpecialtyCode,
  ClinicalSectionDef,
  SpecialtyMeta,
} from "@/lib/clinicalSections";

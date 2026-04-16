/**
 * Clinical section registry — defines the sections available per specialty.
 *
 * The workspace renders sections from two sources:
 *  1. `BASE_SECTIONS` — shared across ALL specialties (core clinical record).
 *  2. `SPECIALTY_SECTIONS[code]` — specific to each specialty.
 *
 * To add a new specialty, add entries to SPECIALTY_SECTIONS and provide
 * a renderer component in `src/components/clinical/specialties/<code>/`.
 */

import type { LucideIcon } from "lucide-react";
import {
  ClipboardList,
  ClipboardCheck,
  Stethoscope,
  Activity,
  Pill,
  StickyNote,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Heart,
  Brain,
  Syringe,
} from "lucide-react";

/* ── Types ───────────────────────────────────── */

export type SpecialtyCode = "odontologia" | "medicina" | "psicologia" | "enfermeria";

export interface ClinicalSectionDef {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface SpecialtyMeta {
  code: SpecialtyCode;
  label: string;
  icon: LucideIcon;
  color: string;       // tailwind token
  textColor: string;   // tailwind token
  borderColor: string; // tailwind token
  active: boolean;     // is the specialty implemented?
}

/* ── Base sections (all specialties) ─────────── */

export const BASE_SECTIONS: ClinicalSectionDef[] = [
  { id: "motivo", label: "Motivo y anamnesis", icon: ClipboardList },
  { id: "antecedentes", label: "Antecedentes", icon: FileText },
  { id: "examen", label: "Examen físico", icon: Activity },
  { id: "exploracion", label: "Exploración", icon: Stethoscope },
  { id: "diagnosticos", label: "Diagnósticos", icon: AlertTriangle },
  { id: "plan", label: "Plan de tratamiento", icon: CheckCircle2 },
  { id: "prescripciones", label: "Prescripciones", icon: Pill },
  { id: "notas", label: "Notas", icon: StickyNote },
  { id: "cierre", label: "Cierre y conducta", icon: Lock },
  { id: "revision", label: "Revisión final", icon: ClipboardCheck },
];

/* ── Specialty-specific sections ─────────────── */

export const SPECIALTY_SECTIONS: Record<SpecialtyCode, ClinicalSectionDef[]> = {
  odontologia: [
    { id: "odontograma", label: "Odontograma", icon: Activity },
  ],
  medicina: [
    // Future: { id: "laboratorios", label: "Laboratorios", icon: FlaskConical },
  ],
  psicologia: [
    // Future: { id: "sesion", label: "Sesión terapéutica", icon: Brain },
  ],
  enfermeria: [
    // Future: { id: "cuidados", label: "Plan de cuidados", icon: Heart },
  ],
};

/* ── Specialty metadata ──────────────────────── */

export const SPECIALTY_META: Record<SpecialtyCode, SpecialtyMeta> = {
  odontologia: {
    code: "odontologia",
    label: "Odontología",
    icon: Activity,
    color: "bg-primary/10",
    textColor: "text-primary",
    borderColor: "border-primary/30",
    active: true,
  },
  medicina: {
    code: "medicina",
    label: "Medicina General",
    icon: Heart,
    color: "bg-rose-500/10",
    textColor: "text-rose-500",
    borderColor: "border-rose-500/30",
    active: false,
  },
  psicologia: {
    code: "psicologia",
    label: "Psicología",
    icon: Brain,
    color: "bg-violet-500/10",
    textColor: "text-violet-500",
    borderColor: "border-violet-500/30",
    active: false,
  },
  enfermeria: {
    code: "enfermeria",
    label: "Enfermería",
    icon: Syringe,
    color: "bg-emerald-500/10",
    textColor: "text-emerald-500",
    borderColor: "border-emerald-500/30",
    active: false,
  },
};

/* ── Helpers ─────────────────────────────────── */

/** Get all sections for a given specialty (base + specialty-specific). */
export function getAllSections(specialty: SpecialtyCode): ClinicalSectionDef[] {
  return [...BASE_SECTIONS, ...(SPECIALTY_SECTIONS[specialty] ?? [])];
}

/** Get the specialty meta or a fallback. */
export function getSpecialtyMeta(code: string): SpecialtyMeta | undefined {
  return SPECIALTY_META[code as SpecialtyCode];
}

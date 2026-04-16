/**
 * Specialty system for multi-specialty clinical platform.
 * Phase 1: Odontología only.
 */

import type { AppModule } from "./permissions";

export interface Specialty {
  id: string;
  code: string;
  name: string;
  description: string | null;
  icon: string;
  active: boolean;
  sort_order: number;
}

export interface UserSpecialty {
  id: string;
  user_id: string;
  specialty_id: string;
  specialty?: Specialty;
}

/**
 * Maps specialty codes to the clinical modules they unlock.
 * Core modules (dashboard, agenda, patients, payments, notes) are always available
 * based on role — specialties only gate clinical/specialty-specific modules.
 */
const SPECIALTY_MODULES: Record<string, AppModule[]> = {
  odontologia: ["clinical"],
  // Future: medicina: ["clinical_med"], psicologia: ["clinical_psi"], etc.
};

/**
 * Returns clinical modules unlocked by the user's active specialties.
 */
export function getSpecialtyModules(specialtyCodes: string[]): AppModule[] {
  const modules = new Set<AppModule>();
  for (const code of specialtyCodes) {
    const mods = SPECIALTY_MODULES[code];
    if (mods) mods.forEach((m) => modules.add(m));
  }
  return Array.from(modules);
}

/**
 * Check if user has a specific specialty enabled.
 */
export function hasSpecialty(specialtyCodes: string[], code: string): boolean {
  return specialtyCodes.includes(code);
}

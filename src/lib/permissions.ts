/**
 * Unified permission system for DentFlow.
 *
 * Access = f(roleCategory, specialties)
 *
 * Model:
 *   AppRole        → DB enum value (admin, odontologo, asistente)
 *   RoleCategory   → semantic grouping (administrativo, clinico, operativo)
 *   Specialty      → clinical sub-domain (odontologia, medicina, …)
 *
 * Rules:
 *   1. Role maps to a category.
 *   2. Category grants base module access + action permissions.
 *   3. Clinical modules additionally require an active specialty.
 *   4. Specialty alone is not enough — the role category must include "clinical".
 *
 * This decouples "what you can do" from specific role names, enabling future
 * roles like "medico" or "psicologo" to share the "clinico" category.
 */

/* ── Types ───────────────────────────────────── */

export type AppRole = "admin" | "odontologo" | "asistente";

export type RoleCategory = "administrativo" | "clinico" | "operativo";

/** Modules gated by role category alone */
export type CoreModule =
  | "dashboard"
  | "agenda"
  | "patients"
  | "payments"
  | "notes"
  | "history"
  | "reports"
  | "settings";

/** Clinical modules gated by role category + specialty */
export type ClinicalModule = "clinical";

export type AppModule = CoreModule | ClinicalModule;

export type AppAction =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "void"
  | "close_history"
  | "print"
  | "manage_users";

/* ── Role → Category mapping ─────────────────── */

export const ROLE_CATEGORY: Record<AppRole, RoleCategory> = {
  admin: "administrativo",
  odontologo: "clinico",
  asistente: "operativo",
  // Future: medico: "clinico", psicologo: "clinico", recepcionista: "operativo"
};

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: "Administrador",
  odontologo: "Odontólogo",
  asistente: "Asistente",
};

export const CATEGORY_LABELS: Record<RoleCategory, string> = {
  administrativo: "Administrativo",
  clinico: "Clínico",
  operativo: "Operativo",
};

/* ── Category → base access ──────────────────── */

const CATEGORY_MODULE_ACCESS: Record<RoleCategory, AppModule[]> = {
  administrativo: ["dashboard", "agenda", "patients", "payments", "clinical", "notes", "history", "reports", "settings"],
  clinico: ["dashboard", "agenda", "patients", "clinical", "notes", "history", "reports"],
  operativo: ["dashboard", "agenda", "patients", "payments"],
};

const CATEGORY_ACTION_ACCESS: Record<RoleCategory, AppAction[]> = {
  administrativo: ["view", "create", "edit", "delete", "void", "close_history", "print", "manage_users"],
  clinico: ["view", "create", "edit", "void", "close_history", "print"],
  operativo: ["view", "create", "print"],
};

/** Modules that require at least one active specialty to access */
const SPECIALTY_GATED_MODULES: AppModule[] = ["clinical", "notes", "history"];

/* ── Specialty → clinical sub-modules ────────── */

export const SPECIALTY_CLINICAL_MODULES: Record<string, string[]> = {
  odontologia: ["odontograma", "dx_odonto", "plan_odonto"],
  // Future: medicina: ["consulta_med", "receta"],
  // Future: psicologia: ["sesion_psi", "test_psi"],
  // Future: enfermeria: ["triaje", "curaciones"],
};

/* ── Route → module mapping ──────────────────── */

const ROUTE_MODULE_MAP: Record<string, AppModule> = {
  "/": "dashboard",
  "/agenda": "agenda",
  "/patients": "patients",
  "/payments": "payments",
  "/clinical": "clinical",
  "/notes": "notes",
  "/history": "history",
  "/reports": "reports",
  "/settings": "settings",
};

const ROUTE_SPECIALTY_MAP: Record<string, string> = {
  "/specialty/odontologia": "odontologia",
};

/* ── Helpers ─────────────────────────────────── */

function getCategory(role: AppRole | null | undefined): RoleCategory | null {
  if (!role) return null;
  return ROLE_CATEGORY[role] ?? null;
}

/* ── Access Context ──────────────────────────── */

export interface AccessContext {
  role: AppRole | null | undefined;
  specialtyCodes: string[];
}

/* ── Public API ──────────────────────────────── */

/** Get the semantic category for a role */
export function getRoleCategory(role: AppRole | null | undefined): RoleCategory | null {
  return getCategory(role);
}

/** Check if a role's category grants access to a module */
export function canAccessModule(role: AppRole | null | undefined, module: AppModule): boolean {
  const cat = getCategory(role);
  if (!cat) return false;
  return CATEGORY_MODULE_ACCESS[cat]?.includes(module) ?? false;
}

/**
 * Check if a role + specialties grant effective access to a module.
 * For specialty-gated modules (clinical, notes, history), the user
 * must also have at least one active specialty — unless they're admin.
 */
export function canEffectivelyAccessModule(
  role: AppRole | null | undefined,
  module: AppModule,
  specialtyCodes: string[] = []
): boolean {
  const cat = getCategory(role);
  if (!cat) return false;
  // Admin bypasses specialty gate
  if (cat === "administrativo") return CATEGORY_MODULE_ACCESS[cat].includes(module);
  // Base category check
  if (!CATEGORY_MODULE_ACCESS[cat].includes(module)) return false;
  // Specialty gate
  if (SPECIALTY_GATED_MODULES.includes(module)) {
    return specialtyCodes.length > 0;
  }
  return true;
}

/** Check if role + specialties grant access to a clinical specialty */
export function canAccessSpecialty(ctx: AccessContext, specialtyCode: string): boolean {
  if (!ctx.role) return false;
  const cat = getCategory(ctx.role);
  if (!cat) return false;
  if (cat === "administrativo") return true;
  if (!canAccessModule(ctx.role, "clinical")) return false;
  return ctx.specialtyCodes.includes(specialtyCode);
}

/** Full route access check */
export function canAccessRoute(role: AppRole | null | undefined, path: string, specialtyCodes: string[] = []): boolean {
  if (!role) return false;
  const cat = getCategory(role);
  if (cat === "administrativo") return true;

  const normalized = path === "/" ? "/" : path.replace(/\/$/, "");

  // Check specialty-gated routes first
  for (const [route, specCode] of Object.entries(ROUTE_SPECIALTY_MAP)) {
    if (normalized.startsWith(route)) {
      return canAccessSpecialty({ role, specialtyCodes }, specCode);
    }
  }

  // Direct match
  const module = ROUTE_MODULE_MAP[normalized];
  if (module) return canEffectivelyAccessModule(role, module, specialtyCodes);

  // Prefix match for nested routes like /patients/:id
  for (const [route, mod] of Object.entries(ROUTE_MODULE_MAP)) {
    if (route !== "/" && normalized.startsWith(route)) {
      return canEffectivelyAccessModule(role, mod, specialtyCodes);
    }
  }

  return false;
}

export function canPerformAction(role: AppRole | null | undefined, action: AppAction): boolean {
  const cat = getCategory(role);
  if (!cat) return false;
  return CATEGORY_ACTION_ACCESS[cat]?.includes(action) ?? false;
}

export function getAccessibleModules(role: AppRole | null | undefined): AppModule[] {
  const cat = getCategory(role);
  if (!cat) return [];
  return CATEGORY_MODULE_ACCESS[cat] ?? [];
}

/** Get specialty codes that a user can clinically access */
export function getAccessibleSpecialties(ctx: AccessContext): string[] {
  if (!ctx.role) return [];
  const cat = getCategory(ctx.role);
  if (cat === "administrativo") return Object.keys(SPECIALTY_CLINICAL_MODULES);
  if (!canAccessModule(ctx.role, "clinical")) return [];
  return ctx.specialtyCodes.filter((code) => code in SPECIALTY_CLINICAL_MODULES);
}

export function hasRole(userRole: AppRole | null | undefined, requiredRole: AppRole): boolean {
  return userRole === requiredRole;
}

/** Check if the role belongs to a given category */
export function isRoleCategory(role: AppRole | null | undefined, category: RoleCategory): boolean {
  return getCategory(role) === category;
}

export function isProfileComplete(profile: { display_name?: string | null; role?: string | null } | null): boolean {
  if (!profile) return false;
  return Boolean(profile.display_name?.trim());
}

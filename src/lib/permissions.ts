/**
 * Unified role + specialty permission system for DentFlow.
 *
 * Access = f(role, specialties)
 *   • Role  → base module access + action permissions
 *   • Specialty → unlocks clinical sub-modules (odontologia, medicina, etc.)
 *
 * Core modules (dashboard, agenda, patients, payments, notes) are role-gated only.
 * Clinical modules require both the role permission AND an active specialty.
 */

/* ── Types ───────────────────────────────────── */

export type AppRole = "admin" | "odontologo" | "asistente";

/** Modules gated by role alone */
export type CoreModule =
  | "dashboard"
  | "agenda"
  | "patients"
  | "payments"
  | "notes"
  | "history"
  | "reports"
  | "settings";

/** Clinical modules gated by role + specialty */
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

/* ── Role → base access ─────────────────────── */

const MODULE_ACCESS: Record<AppRole, AppModule[]> = {
  admin: ["dashboard", "agenda", "patients", "payments", "clinical", "notes", "history", "reports", "settings"],
  odontologo: ["dashboard", "agenda", "patients", "clinical", "notes", "history", "reports"],
  asistente: ["dashboard", "agenda", "patients", "payments"],
};

const ACTION_ACCESS: Record<AppRole, AppAction[]> = {
  admin: ["view", "create", "edit", "delete", "void", "close_history", "print", "manage_users"],
  odontologo: ["view", "create", "edit", "void", "close_history", "print"],
  asistente: ["view", "create", "print"],
};

/* ── Specialty → clinical sub-modules ────────── */

/**
 * Maps specialty codes to the clinical sub-modules they unlock.
 * When a user has a specialty, they gain access to its clinical tools
 * (provided their role already grants "clinical" access).
 */
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

/** Routes that additionally require a specific specialty */
const ROUTE_SPECIALTY_MAP: Record<string, string> = {
  "/specialty/odontologia": "odontologia",
  // Future: "/specialty/medicina": "medicina",
};

/* ── Access helpers ──────────────────────────── */

export interface AccessContext {
  role: AppRole | null | undefined;
  specialtyCodes: string[];
}

/** Check if role grants access to a module */
export function canAccessModule(role: AppRole | null | undefined, module: AppModule): boolean {
  if (!role) return false;
  return MODULE_ACCESS[role]?.includes(module) ?? false;
}

/** Check if role + specialties grant access to a clinical specialty */
export function canAccessSpecialty(ctx: AccessContext, specialtyCode: string): boolean {
  if (!ctx.role) return false;
  // Admin always has access
  if (ctx.role === "admin") return true;
  // Must have clinical module access via role
  if (!canAccessModule(ctx.role, "clinical")) return false;
  // Must have the specialty assigned
  return ctx.specialtyCodes.includes(specialtyCode);
}

/** Full route access check: role + specialty if needed */
export function canAccessRoute(role: AppRole | null | undefined, path: string, specialtyCodes: string[] = []): boolean {
  if (!role) return false;
  if (role === "admin") return true;

  const normalized = path === "/" ? "/" : path.replace(/\/$/, "");

  // Check specialty-gated routes first
  for (const [route, specCode] of Object.entries(ROUTE_SPECIALTY_MAP)) {
    if (normalized.startsWith(route)) {
      return canAccessSpecialty({ role, specialtyCodes }, specCode);
    }
  }

  // Direct match
  const module = ROUTE_MODULE_MAP[normalized];
  if (module) return canAccessModule(role, module);

  // Prefix match for nested routes like /patients/:id
  for (const [route, mod] of Object.entries(ROUTE_MODULE_MAP)) {
    if (route !== "/" && normalized.startsWith(route)) {
      return canAccessModule(role, mod);
    }
  }

  return false;
}

export function canPerformAction(role: AppRole | null | undefined, action: AppAction): boolean {
  if (!role) return false;
  return ACTION_ACCESS[role]?.includes(action) ?? false;
}

export function getAccessibleModules(role: AppRole | null | undefined): AppModule[] {
  if (!role) return [];
  return MODULE_ACCESS[role] ?? [];
}

/** Get specialty codes that a user can clinically access */
export function getAccessibleSpecialties(ctx: AccessContext): string[] {
  if (!ctx.role) return [];
  if (ctx.role === "admin") return Object.keys(SPECIALTY_CLINICAL_MODULES);
  if (!canAccessModule(ctx.role, "clinical")) return [];
  return ctx.specialtyCodes.filter((code) => code in SPECIALTY_CLINICAL_MODULES);
}

export function hasRole(userRole: AppRole | null | undefined, requiredRole: AppRole): boolean {
  return userRole === requiredRole;
}

export function isProfileComplete(profile: { display_name?: string | null; role?: string | null } | null): boolean {
  if (!profile) return false;
  return Boolean(profile.display_name?.trim());
}

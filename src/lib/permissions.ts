/**
 * Role-based permissions system for DentFlow.
 * Roles: admin, odontologo, asistente
 */

export type AppRole = "admin" | "odontologo" | "asistente";

export type AppModule =
  | "dashboard"
  | "agenda"
  | "patients"
  | "payments"
  | "clinical"
  | "notes"
  | "history"
  | "reports"
  | "settings";

export type AppAction =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "void"          // anular
  | "close_history"  // cerrar historia
  | "print"
  | "manage_users";

// Which modules each role can access
const MODULE_ACCESS: Record<AppRole, AppModule[]> = {
  admin: ["dashboard", "agenda", "patients", "payments", "clinical", "notes", "history", "reports", "settings"],
  odontologo: ["dashboard", "agenda", "patients", "clinical", "notes", "history", "reports"],
  asistente: ["dashboard", "agenda", "patients", "payments"],
};

// Which actions each role can perform (global)
const ACTION_ACCESS: Record<AppRole, AppAction[]> = {
  admin: ["view", "create", "edit", "delete", "void", "close_history", "print", "manage_users"],
  odontologo: ["view", "create", "edit", "void", "close_history", "print"],
  asistente: ["view", "create", "print"],
};

// Route → module mapping
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

export function hasRole(userRole: AppRole | null | undefined, requiredRole: AppRole): boolean {
  return userRole === requiredRole;
}

export function canAccessModule(userRole: AppRole | null | undefined, module: AppModule): boolean {
  if (!userRole) return false;
  return MODULE_ACCESS[userRole]?.includes(module) ?? false;
}

export function canPerformAction(userRole: AppRole | null | undefined, action: AppAction): boolean {
  if (!userRole) return false;
  return ACTION_ACCESS[userRole]?.includes(action) ?? false;
}

export function canAccessRoute(userRole: AppRole | null | undefined, path: string): boolean {
  if (!userRole) return false;
  if (userRole === "admin") return true;

  // Normalize: strip trailing slash, match prefix for dynamic routes
  const normalized = path === "/" ? "/" : path.replace(/\/$/, "");

  // Direct match
  const module = ROUTE_MODULE_MAP[normalized];
  if (module) return canAccessModule(userRole, module);

  // Prefix match for nested routes like /patients/:id
  for (const [route, mod] of Object.entries(ROUTE_MODULE_MAP)) {
    if (route !== "/" && normalized.startsWith(route)) {
      return canAccessModule(userRole, mod);
    }
  }

  return false;
}

export function getAccessibleModules(userRole: AppRole | null | undefined): AppModule[] {
  if (!userRole) return [];
  return MODULE_ACCESS[userRole] ?? [];
}

export function isProfileComplete(profile: { display_name?: string | null; role?: string | null } | null): boolean {
  if (!profile) return false;
  return Boolean(profile.display_name?.trim());
}

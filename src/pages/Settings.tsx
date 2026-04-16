import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { SectionHeader } from "@/components/clinical";
import { SPECIALTY_META, type SpecialtyCode } from "@/lib/clinicalSections";
import { cn } from "@/lib/utils";
import {
  Settings as SettingsIcon,
  Stethoscope,
  Shield,
  LayoutGrid,
  FileText,
  Users,
  Lock,
  CheckCircle2,
  Clock,
  XCircle,
  Ban,
  Activity,
  Heart,
  Brain,
  Syringe,
} from "lucide-react";

/* ── Static config data ──────────────────────── */

const ROLES_CONFIG = [
  { code: "admin", label: "Administrador", description: "Acceso total al sistema, gestión de usuarios y configuración", icon: Shield, color: "bg-warning/10 text-warning" },
  { code: "odontologo", label: "Odontólogo", description: "Acceso clínico completo, historias, diagnósticos y tratamientos", icon: Stethoscope, color: "bg-primary/10 text-primary" },
  { code: "asistente", label: "Asistente", description: "Agenda, pacientes y pagos. Sin acceso clínico", icon: Users, color: "bg-muted text-muted-foreground" },
];

const MODULES_CONFIG = [
  { code: "dashboard", label: "Dashboard", description: "Resumen diario y métricas", icon: LayoutGrid, roles: ["admin", "odontologo", "asistente"] },
  { code: "agenda", label: "Agenda", description: "Gestión de citas y calendario", icon: Clock, roles: ["admin", "odontologo", "asistente"] },
  { code: "patients", label: "Pacientes", description: "Directorio y fichas de pacientes", icon: Users, roles: ["admin", "odontologo", "asistente"] },
  { code: "payments", label: "Pagos", description: "Control de cobros y facturación", icon: FileText, roles: ["admin", "asistente"] },
  { code: "clinical", label: "Atención clínica", description: "Historias clínicas por especialidad", icon: Stethoscope, roles: ["admin", "odontologo"] },
  { code: "notes", label: "Notas clínicas", description: "Anotaciones rápidas vinculadas", icon: FileText, roles: ["admin", "odontologo"] },
  { code: "history", label: "Historial clínico", description: "Consulta de historias por especialidad", icon: FileText, roles: ["admin", "odontologo"] },
  { code: "reports", label: "Reportes", description: "Estadísticas y análisis", icon: LayoutGrid, roles: ["admin", "odontologo"] },
  { code: "settings", label: "Configuración", description: "Ajustes del sistema", icon: SettingsIcon, roles: ["admin"] },
];

const HISTORIA_STATES = [
  { code: "borrador", label: "Borrador", description: "Historia iniciada, en edición", icon: FileText, color: "bg-muted text-muted-foreground" },
  { code: "en_progreso", label: "En progreso", description: "Atención activa, datos parciales", icon: Clock, color: "bg-warning/10 text-warning" },
  { code: "cerrada", label: "Cerrada", description: "Historia completa, bloqueada para edición", icon: CheckCircle2, color: "bg-success/10 text-success" },
  { code: "anulada", label: "Anulada", description: "Cancelada, visible solo para auditoría", icon: Ban, color: "bg-destructive/10 text-destructive" },
];

const ALL_SPEC_CODES: SpecialtyCode[] = ["odontologia", "medicina", "psicologia", "enfermeria"];

export default function Settings() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";

  return (
    <div className="page-container space-y-6 max-w-4xl">
      <div>
        <h1 className="page-title">Configuración Clínica</h1>
        <p className="page-subtitle">Arquitectura de la plataforma: especialidades, roles, módulos y estados</p>
      </div>

      {/* ── Especialidades ────────────────────── */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5 space-y-4">
          <SectionHeader
            title="Especialidades del sistema"
            subtitle="Áreas clínicas disponibles en la plataforma"
            icon={Stethoscope}
            size="sm"
          />

          <div className="grid gap-3 sm:grid-cols-2">
            {ALL_SPEC_CODES.map((code) => {
              const meta = SPECIALTY_META[code];
              const Icon = meta.icon;
              return (
                <div
                  key={code}
                  className={cn(
                    "rounded-xl border p-4 space-y-2 transition-colors",
                    meta.active
                      ? cn("border-primary/20 bg-primary/[0.02]")
                      : "border-border/40 bg-muted/10 opacity-60"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", meta.color)}>
                        <Icon className={cn("h-4 w-4", meta.textColor)} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{meta.label}</p>
                        <p className="text-[10px] text-muted-foreground">
                          Código: {code}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {meta.active ? (
                        <Badge className="text-[10px] h-5 px-2 bg-success/10 text-success border-0 font-medium">
                          Activa
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] h-5 px-2 border-muted-foreground/20 text-muted-foreground/50 font-medium">
                          Próximamente
                        </Badge>
                      )}
                      <Switch checked={meta.active} disabled className="scale-75" />
                    </div>
                  </div>
                  {meta.active && (
                    <p className="text-[11px] text-muted-foreground">
                      Módulos: odontograma, indicadores, diagnósticos, conducta odontológica
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Roles y permisos ─────────────────── */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5 space-y-4">
          <SectionHeader
            title="Roles y permisos"
            subtitle="Niveles de acceso definidos en el sistema"
            icon={Shield}
            size="sm"
          />

          <div className="space-y-2">
            {ROLES_CONFIG.map((role) => {
              const Icon = role.icon;
              const isCurrent = profile?.role === role.code;
              return (
                <div
                  key={role.code}
                  className={cn(
                    "flex items-center gap-4 rounded-xl border p-3.5 transition-colors",
                    isCurrent ? "border-primary/20 bg-primary/[0.02]" : "border-border/40"
                  )}
                >
                  <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0", role.color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{role.label}</p>
                      {isCurrent && (
                        <Badge className="text-[9px] h-4 px-1.5 bg-primary/10 text-primary border-0">Tu rol</Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">{role.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Permissions matrix */}
          <div className="rounded-xl border border-border/40 overflow-hidden">
            <div className="grid grid-cols-4 gap-0 text-[10px] font-medium bg-muted/30">
              <div className="px-3 py-2 text-muted-foreground">Acción</div>
              {ROLES_CONFIG.map((r) => (
                <div key={r.code} className="px-3 py-2 text-center text-muted-foreground">{r.label}</div>
              ))}
            </div>
            {[
              { action: "Ver datos", admin: true, odontologo: true, asistente: true },
              { action: "Crear registros", admin: true, odontologo: true, asistente: true },
              { action: "Editar registros", admin: true, odontologo: true, asistente: false },
              { action: "Eliminar registros", admin: true, odontologo: false, asistente: false },
              { action: "Anular historias", admin: true, odontologo: true, asistente: false },
              { action: "Cerrar historias", admin: true, odontologo: true, asistente: false },
              { action: "Gestionar usuarios", admin: true, odontologo: false, asistente: false },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-4 gap-0 text-xs border-t border-border/30">
                <div className="px-3 py-2 text-muted-foreground">{row.action}</div>
                {(["admin", "odontologo", "asistente"] as const).map((role) => (
                  <div key={role} className="px-3 py-2 text-center">
                    {row[role] ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-success mx-auto" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-muted-foreground/30 mx-auto" />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Módulos clínicos ─────────────────── */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5 space-y-4">
          <SectionHeader
            title="Módulos del sistema"
            subtitle="Funcionalidades disponibles según rol"
            icon={LayoutGrid}
            size="sm"
          />

          <div className="grid gap-2 sm:grid-cols-2">
            {MODULES_CONFIG.map((mod) => {
              const Icon = mod.icon;
              const userHasAccess = profile?.role && mod.roles.includes(profile.role);
              return (
                <div
                  key={mod.code}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-3 transition-colors",
                    userHasAccess ? "border-border/40" : "border-border/20 opacity-40"
                  )}
                >
                  <div className="h-8 w-8 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold">{mod.label}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{mod.description}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {mod.roles.map((r) => (
                      <span key={r} className="text-[8px] bg-muted/60 text-muted-foreground px-1 py-0.5 rounded">
                        {r.slice(0, 3).toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Estados de historia ───────────────── */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5 space-y-4">
          <SectionHeader
            title="Estados de historia clínica"
            subtitle="Ciclo de vida de las historias en el sistema"
            icon={FileText}
            size="sm"
          />

          <div className="flex flex-wrap gap-2">
            {HISTORIA_STATES.map((state, i) => {
              const Icon = state.icon;
              return (
                <div key={state.code} className="flex items-center gap-3">
                  <div className={cn("flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border/40", state.color)}>
                    <Icon className="h-3.5 w-3.5" />
                    <div>
                      <p className="text-xs font-semibold">{state.label}</p>
                      <p className="text-[10px] opacity-70">{state.description}</p>
                    </div>
                  </div>
                  {i < HISTORIA_STATES.length - 1 && (
                    <span className="text-muted-foreground/30 text-lg">→</span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Info footer ──────────────────────── */}
      <div className="text-center py-4">
        <p className="text-[11px] text-muted-foreground/50">
          La gestión avanzada de especialidades, roles y permisos estará disponible en futuras actualizaciones.
        </p>
      </div>
    </div>
  );
}

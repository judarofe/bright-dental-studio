import {
  LayoutDashboard,
  CalendarDays,
  Users,
  CreditCard,
  HeartPulse,
  StickyNote,
  Clock,
  BarChart3,
  Settings,
  ClipboardList,
  Stethoscope,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { canAccessModule, type AppModule } from "@/lib/permissions";
import { hasSpecialty } from "@/lib/specialties";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  module: AppModule;
  requiresSpecialty?: string;
  badge?: string; // small label like "Fase 1"
}

/* ── Núcleo ─────────────────────────────────── */
const coreItems: NavItem[] = [
  { title: "Inicio", url: "/", icon: LayoutDashboard, module: "dashboard" },
  { title: "Agenda", url: "/agenda", icon: CalendarDays, module: "agenda" },
  { title: "Pacientes", url: "/patients", icon: Users, module: "patients" },
  { title: "Pagos", url: "/payments", icon: CreditCard, module: "payments" },
];

/* ── Atención Clínica ───────────────────────── */
const clinicalItems: NavItem[] = [
  { title: "Historias Clínicas", url: "/clinical", icon: ClipboardList, module: "clinical" },
  { title: "Notas Rápidas", url: "/notes", icon: StickyNote, module: "notes" },
];

/* ── Especialidades ─────────────────────────── */
const specialtyItems: NavItem[] = [
  { title: "Odontología", url: "/specialty/odontologia", icon: HeartPulse, module: "clinical", requiresSpecialty: "odontologia", badge: "Activo" },
  // Future: { title: "Medicina General", url: "/specialty/medicina", icon: Stethoscope, module: "clinical", requiresSpecialty: "medicina" },
  // Future: { title: "Psicología", url: "/specialty/psicologia", icon: Brain, module: "clinical", requiresSpecialty: "psicologia" },
];

/* ── Administración ─────────────────────────── */
const adminItems: NavItem[] = [
  { title: "Históricos", url: "/history", icon: Clock, module: "history" },
  { title: "Reportes", url: "/reports", icon: BarChart3, module: "reports" },
  { title: "Configuración", url: "/settings", icon: Settings, module: "settings" },
];

function NavGroup({
  label,
  items,
  collapsed,
}: {
  label: string;
  items: NavItem[];
  collapsed: boolean;
}) {
  const { profile, specialtyCodes } = useAuth();

  const filtered = items.filter((item) => {
    if (!canAccessModule(profile?.role, item.module)) return false;
    if (item.requiresSpecialty && profile?.role !== "admin") {
      if (!specialtyCodes.includes(item.requiresSpecialty)) return false;
    }
    return true;
  });

  if (filtered.length === 0) return null;

  return (
    <SidebarGroup>
      {!collapsed && (
        <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-3 mb-1">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu className="space-y-0.5 px-2">
          {filtered.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.url}
                  end={item.url === "/"}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                  activeClassName="bg-primary/10 text-primary"
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                  {!collapsed && (
                    <span className="flex-1 flex items-center justify-between">
                      <span>{item.title}</span>
                      {item.badge && (
                        <span className="text-[9px] font-semibold uppercase tracking-wide bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </span>
                  )}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="px-4 py-5">
          {!collapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">D+</span>
              </div>
              <span className="font-semibold text-foreground tracking-tight">DentFlow</span>
            </div>
          ) : (
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center mx-auto">
              <span className="text-primary-foreground font-bold text-xs">D+</span>
            </div>
          )}
        </div>

        <NavGroup label="Núcleo" items={coreItems} collapsed={collapsed} />
        <NavGroup label="Atención Clínica" items={clinicalItems} collapsed={collapsed} />
        <NavGroup label="Especialidades" items={specialtyItems} collapsed={collapsed} />
        <NavGroup label="Administración" items={adminItems} collapsed={collapsed} />
      </SidebarContent>
    </Sidebar>
  );
}

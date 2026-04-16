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
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { canAccessModule, type AppModule } from "@/lib/permissions";
import { getSpecialtyModules } from "@/lib/specialties";
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
  requiresSpecialty?: string; // specialty code required to show this item
}

const mainItems: NavItem[] = [
  { title: "Inicio", url: "/", icon: LayoutDashboard, module: "dashboard" },
  { title: "Agenda", url: "/agenda", icon: CalendarDays, module: "agenda" },
  { title: "Pacientes", url: "/patients", icon: Users, module: "patients" },
  { title: "Pagos", url: "/payments", icon: CreditCard, module: "payments" },
];

const clinicalItems: NavItem[] = [
  { title: "Historia Odontológica", url: "/clinical", icon: HeartPulse, module: "clinical", requiresSpecialty: "odontologia" },
  { title: "Notas Cortas", url: "/notes", icon: StickyNote, module: "notes" },
];

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
  const specialtyModules = getSpecialtyModules(specialtyCodes);
  
  const filtered = items.filter((item) => {
    // Check role-based access
    if (!canAccessModule(profile?.role, item.module)) return false;
    // Check specialty requirement — admins bypass specialty check
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
                  {!collapsed && <span>{item.title}</span>}
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

        <NavGroup label="Principal" items={mainItems} collapsed={collapsed} />
        <NavGroup label="Clínica" items={clinicalItems} collapsed={collapsed} />
        <NavGroup label="Administración" items={adminItems} collapsed={collapsed} />
      </SidebarContent>
    </Sidebar>
  );
}

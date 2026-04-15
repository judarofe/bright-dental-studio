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

const mainItems = [
  { title: "Inicio", url: "/", icon: LayoutDashboard },
  { title: "Agenda", url: "/agenda", icon: CalendarDays },
  { title: "Pacientes", url: "/patients", icon: Users },
  { title: "Pagos", url: "/payments", icon: CreditCard },
];

const clinicalItems = [
  { title: "Historia Odontológica", url: "/clinical", icon: HeartPulse },
  { title: "Notas Cortas", url: "/notes", icon: StickyNote },
];

const adminItems = [
  { title: "Históricos", url: "/history", icon: Clock },
  { title: "Reportes", url: "/reports", icon: BarChart3 },
  { title: "Configuración", url: "/settings", icon: Settings },
];

function NavGroup({
  label,
  items,
  collapsed,
}: {
  label: string;
  items: typeof mainItems;
  collapsed: boolean;
}) {
  return (
    <SidebarGroup>
      {!collapsed && (
        <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-3 mb-1">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu className="space-y-0.5 px-2">
          {items.map((item) => (
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

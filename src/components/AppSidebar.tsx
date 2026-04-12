import { LayoutDashboard, CalendarDays, Users, CreditCard } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Inicio", url: "/", icon: LayoutDashboard },
  { title: "Agenda", url: "/agenda", icon: CalendarDays },
  { title: "Pacientes", url: "/patients", icon: Users },
  { title: "Pagos", url: "/payments", icon: CreditCard },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="px-4 py-5">
          {!collapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">D+</span>
              </div>
              <span className="font-semibold text-foreground text-lg tracking-tight">DentFlow</span>
            </div>
          ) : (
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center mx-auto">
              <span className="text-primary-foreground font-bold text-sm">D+</span>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-accent/60 transition-colors rounded-xl py-3 text-base"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

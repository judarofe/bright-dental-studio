import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, User, ChevronDown } from "lucide-react";
import { toast } from "sonner";

export function TopBar() {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();

  const displayName = profile?.display_name || user?.email || "Usuario";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const roleLabels: Record<string, string> = {
    admin: "Administrador",
    odontologo: "Odontólogo",
    asistente: "Asistente",
  };

  const handleLogout = async () => {
    await signOut();
    toast.success("Sesión cerrada");
    navigate("/login", { replace: true });
  };

  return (
    <header className="h-14 border-b border-border/60 bg-card/80 backdrop-blur-sm flex items-center justify-between px-4 shrink-0 sticky top-0 z-30">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-2.5 hover:bg-accent/50 rounded-xl px-2 py-1.5 transition-colors">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium hidden sm:block">{displayName}</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-0" align="end">
          <div className="px-4 py-3 border-b border-border/60">
            <p className="text-sm font-semibold truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            {profile?.role && (
              <p className="text-[10px] text-primary font-medium mt-1">
                {roleLabels[profile.role] || profile.role}
              </p>
            )}
          </div>
          <div className="p-1.5">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg hover:bg-destructive/10 text-destructive transition-colors text-left"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </header>
  );
}

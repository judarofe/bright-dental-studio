import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, UserCog, ChevronDown } from "lucide-react";
import { toast } from "sonner";

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  odontologo: "Odontólogo",
  asistente: "Asistente",
};

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
        <PopoverContent className="w-60 p-0" align="end">
          <div className="px-4 py-3">
            <p className="text-sm font-semibold truncate">{displayName}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              {profile?.role && (
                <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {roleLabels[profile.role] || profile.role}
                </span>
              )}
              {profile?.especialidad && (
                <span className="text-[10px] text-muted-foreground">{profile.especialidad}</span>
              )}
            </div>
          </div>
          <Separator />
          <div className="p-1.5 space-y-0.5">
            <button
              onClick={() => navigate("/complete-profile")}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent transition-colors text-left"
            >
              <UserCog className="h-4 w-4 text-muted-foreground" />
              Mi perfil
            </button>
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

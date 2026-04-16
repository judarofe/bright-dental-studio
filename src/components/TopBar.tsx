import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { SPECIALTY_META, type SpecialtyCode } from "@/lib/clinicalSections";
import { LogOut, UserCog, ChevronDown, Shield, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  odontologo: "Odontólogo",
  asistente: "Asistente",
};

const roleBadgeStyles: Record<string, string> = {
  admin: "bg-warning/10 text-warning",
  odontologo: "bg-primary/10 text-primary",
  asistente: "bg-muted text-muted-foreground",
};

export function TopBar() {
  const { profile, user, specialties, signOut } = useAuth();
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
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="text-sm font-medium">{displayName}</span>
              {specialties.length > 0 && (
                <Badge variant="outline" className="text-[9px] h-4 px-1 rounded-full border-primary/30 text-primary">
                  {specialties.length === 1 ? specialties[0].name : `${specialties.length} esp.`}
                </Badge>
              )}
            </div>
            <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" align="end">
          {/* Profile header */}
          <div className="px-4 py-3.5 space-y-2.5">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{displayName}</p>
                <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>

            {/* Role & status */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {profile?.role && (
                <span className={cn(
                  "inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full",
                  roleBadgeStyles[profile.role] || "bg-muted text-muted-foreground"
                )}>
                  <Shield className="h-2.5 w-2.5" />
                  {roleLabels[profile.role] || profile.role}
                </span>
              )}
              {profile?.activo !== undefined && (
                <span className={cn(
                  "text-[10px] font-medium px-2 py-0.5 rounded-full",
                  profile.activo ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                )}>
                  {profile.activo ? "Activo" : "Inactivo"}
                </span>
              )}
            </div>

            {/* Specialties */}
            {specialties.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground/60 font-semibold flex items-center gap-1">
                  <Stethoscope className="h-3 w-3" />
                  Especialidades habilitadas
                </p>
                <div className="flex flex-wrap gap-1">
                  {specialties.map((spec) => {
                    const meta = SPECIALTY_META[spec.code as SpecialtyCode];
                    const Icon = meta?.icon;
                    return (
                      <span
                        key={spec.id}
                        className={cn(
                          "inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full",
                          meta ? cn(meta.color, meta.textColor) : "bg-muted text-muted-foreground"
                        )}
                      >
                        {Icon && <Icon className="h-2.5 w-2.5" />}
                        {spec.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {specialties.length === 0 && profile?.role !== "asistente" && (
              <p className="text-[10px] text-muted-foreground/60 italic">
                Sin especialidades asignadas — configura tu perfil.
              </p>
            )}
          </div>

          <Separator />
          <div className="p-1.5 space-y-0.5">
            <button
              onClick={() => navigate("/complete-profile")}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent transition-colors text-left"
            >
              <UserCog className="h-4 w-4 text-muted-foreground" />
              Mi perfil clínico
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

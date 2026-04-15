import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertCircle, Stethoscope, UserCog } from "lucide-react";
import { toast } from "sonner";

const ROLES_INFO: Record<string, string> = {
  odontologo: "Odontólogo",
  asistente: "Asistente",
};

const SPECIALTIES = [
  "Odontología General",
  "Ortodoncia",
  "Endodoncia",
  "Periodoncia",
  "Cirugía Oral",
  "Odontopediatría",
  "Prostodoncia",
  "Implantología",
  "Estética Dental",
  "Otra",
];

export default function CompleteProfile() {
  const { profile, user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const isAdmin = profile?.role === "admin";
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [role, setRole] = useState<string>(profile?.role || "odontologo");
  const [especialidad, setEspecialidad] = useState(profile?.especialidad || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!displayName.trim()) {
      setError("Ingrese su nombre completo.");
      return;
    }

    setLoading(true);

    const baseUpdate = {
      display_name: displayName.trim(),
      especialidad: (isAdmin || role === "odontologo") ? especialidad || null : null,
    };

    const updatePayload = isAdmin
      ? baseUpdate
      : { ...baseUpdate, role: role as "odontologo" | "asistente" };

    const { error: err } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("user_id", user!.id);

    if (err) {
      setError("Error al guardar perfil. Intente nuevamente.");
      setLoading(false);
      return;
    }

    await refreshProfile();
    toast.success("Perfil completado exitosamente");
    navigate("/", { replace: true });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-[460px] space-y-8">
        <div className="flex items-center gap-3 justify-center">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Stethoscope className="h-5 w-5 text-primary" />
          </div>
          <span className="text-lg font-bold text-foreground">DentFlow</span>
        </div>

        <div className="space-y-2 text-center">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <UserCog className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Complete su perfil clínico</h2>
          <p className="text-sm text-muted-foreground">
            Para acceder al sistema, necesitamos algunos datos sobre su rol profesional.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 p-3.5">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Correo electrónico</Label>
            <Input value={user?.email || ""} disabled className="h-11 rounded-xl text-sm bg-muted" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Nombre completo *</Label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Dr. Juan Pérez"
              className="h-11 rounded-xl text-sm"
              autoFocus
            />
          </div>

          {isAdmin ? (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Rol</Label>
              <Input value="Administrador" disabled className="h-11 rounded-xl text-sm bg-muted" />
              <p className="text-[11px] text-muted-foreground/70">El rol de administrador no puede cambiarse desde aquí.</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Rol *</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="h-11 rounded-xl text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLES_INFO).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground/70">El rol de administrador solo puede ser asignado internamente.</p>
            </div>
          )}

          {role === "odontologo" && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Especialidad</Label>
              <Select value={especialidad} onValueChange={setEspecialidad}>
                <SelectTrigger className="h-11 rounded-xl text-sm">
                  <SelectValue placeholder="Seleccione especialidad" />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALTIES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl text-sm font-semibold mt-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar y continuar"}
          </Button>
        </form>
      </div>
    </div>
  );
}

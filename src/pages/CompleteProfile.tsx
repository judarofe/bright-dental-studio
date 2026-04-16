import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, AlertCircle, Stethoscope, UserCog } from "lucide-react";
import { toast } from "sonner";
import type { Specialty } from "@/lib/specialties";

const ROLES_INFO: Record<string, string> = {
  odontologo: "Odontólogo",
  asistente: "Asistente",
};

export default function CompleteProfile() {
  const { profile, user, refreshProfile, specialtyCodes } = useAuth();
  const navigate = useNavigate();

  const isAdmin = profile?.role === "admin";
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [role, setRole] = useState<string>(profile?.role || "odontologo");
  const [especialidad, setEspecialidad] = useState(profile?.especialidad || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Available specialties from catalog
  const [availableSpecialties, setAvailableSpecialties] = useState<Specialty[]>([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);

  useEffect(() => {
    supabase
      .from("specialties")
      .select("*")
      .eq("active", true)
      .order("sort_order")
      .then(({ data }) => {
        if (data) setAvailableSpecialties(data as Specialty[]);
      });
  }, []);

  // Initialize selected specialties from current user data
  useEffect(() => {
    if (specialtyCodes.length > 0) {
      setSelectedSpecialties(specialtyCodes);
    }
  }, [specialtyCodes]);

  const toggleSpecialty = (code: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!displayName.trim()) {
      setError("Ingrese su nombre completo.");
      return;
    }

    if ((role === "odontologo" || isAdmin) && selectedSpecialties.length === 0) {
      setError("Seleccione al menos una especialidad.");
      return;
    }

    setLoading(true);

    // 1. Update profile
    const baseUpdate = {
      display_name: displayName.trim(),
      especialidad: especialidad || null,
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

    // 2. Sync specialties: delete existing, insert selected
    await supabase.from("user_specialties").delete().eq("user_id", user!.id);

    if (selectedSpecialties.length > 0) {
      const specIds = availableSpecialties
        .filter((s) => selectedSpecialties.includes(s.code))
        .map((s) => ({ user_id: user!.id, specialty_id: s.id }));

      if (specIds.length > 0) {
        await supabase.from("user_specialties").insert(specIds);
      }
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
            </div>
          )}

          {/* Specialty selection */}
          {(role === "odontologo" || isAdmin) && availableSpecialties.length > 0 && (
            <div className="space-y-2.5">
              <Label className="text-xs font-medium text-muted-foreground">Especialidades habilitadas *</Label>
              <div className="space-y-2 rounded-xl border border-border/60 p-3">
                {availableSpecialties.map((spec) => (
                  <label
                    key={spec.id}
                    className="flex items-center gap-3 cursor-pointer hover:bg-accent/50 rounded-lg p-2 transition-colors"
                  >
                    <Checkbox
                      checked={selectedSpecialties.includes(spec.code)}
                      onCheckedChange={() => toggleSpecialty(spec.code)}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium">{spec.name}</span>
                      {spec.description && (
                        <p className="text-[11px] text-muted-foreground truncate">{spec.description}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground/70">
                Las especialidades determinan los módulos clínicos disponibles.
              </p>
            </div>
          )}

          {role === "odontologo" && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Sub-especialidad (opcional)</Label>
              <Input
                value={especialidad}
                onChange={(e) => setEspecialidad(e.target.value)}
                placeholder="Ej: Ortodoncia, Endodoncia..."
                className="h-11 rounded-xl text-sm"
              />
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

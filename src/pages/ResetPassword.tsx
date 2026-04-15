import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, Stethoscope } from "lucide-react";

type Status = "loading" | "ready" | "submitting" | "success" | "error";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("loading");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check for recovery event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setStatus("ready");
      }
    });

    // Also check hash for type=recovery
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setStatus("ready");
    } else {
      // Give a moment for the auth event
      const timer = setTimeout(() => {
        setStatus((prev) => (prev === "loading" ? "error" : prev));
      }, 3000);
      return () => {
        clearTimeout(timer);
        subscription.unsubscribe();
      };
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setStatus("submitting");
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) {
      setError("Error al actualizar la contraseña. Intente nuevamente.");
      setStatus("ready");
    } else {
      setStatus("success");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-[420px] space-y-8">
        <div className="flex items-center gap-3 justify-center">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Stethoscope className="h-5 w-5 text-primary" />
          </div>
          <span className="text-lg font-bold text-foreground">DentFlow</span>
        </div>

        {status === "loading" && (
          <div className="text-center space-y-3 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Verificando enlace de recuperación…</p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center space-y-4 py-8">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-foreground">Enlace inválido o expirado</h2>
              <p className="text-sm text-muted-foreground">Solicite un nuevo enlace de recuperación desde la página de inicio de sesión.</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/login")} className="rounded-xl">
              Volver al inicio de sesión
            </Button>
          </div>
        )}

        {status === "success" && (
          <div className="text-center space-y-4 py-8">
            <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-foreground">Contraseña actualizada</h2>
              <p className="text-sm text-muted-foreground">Su contraseña ha sido actualizada exitosamente.</p>
            </div>
            <Button onClick={() => navigate("/")} className="rounded-xl">
              Ir al inicio
            </Button>
          </div>
        )}

        {(status === "ready" || status === "submitting") && (
          <>
            <div className="space-y-2 text-center">
              <h2 className="text-xl font-bold text-foreground">Restablecer contraseña</h2>
              <p className="text-sm text-muted-foreground">Ingrese su nueva contraseña.</p>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 p-3.5">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Nueva contraseña</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-11 rounded-xl text-sm pr-10"
                    autoComplete="new-password"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Confirmar contraseña</Label>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 rounded-xl text-sm"
                  autoComplete="new-password"
                />
              </div>

              <Button type="submit" disabled={status === "submitting"} className="w-full h-11 rounded-xl text-sm font-semibold">
                {status === "submitting" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Actualizar contraseña"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Loader2, AlertCircle, Stethoscope } from "lucide-react";

export default function Login() {
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // If already logged in, redirect
  if (user) {
    navigate("/", { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim() || !password.trim()) {
      setError("Complete todos los campos obligatorios.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);

    if (mode === "login") {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error);
      } else {
        navigate("/", { replace: true });
      }
    } else {
      if (!displayName.trim()) {
        setError("Ingrese su nombre completo.");
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, displayName.trim());
      if (error) {
        setError(error);
      } else {
        setSuccess("Cuenta creada. Revise su correo para confirmar el registro.");
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-primary/8 via-primary/4 to-background items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)", backgroundSize: "24px 24px" }} />
        <div className="relative z-10 max-w-md space-y-8">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Stethoscope className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-foreground tracking-tight leading-tight">
              Sistema de Historia Clínica Odontológica
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              Gestione historias clínicas, diagnósticos, odontogramas y tratamientos de manera segura y eficiente.
            </p>
          </div>
          <div className="space-y-3 pt-4">
            <FeatureItem text="Historias clínicas digitales completas" />
            <FeatureItem text="Odontograma interactivo con trazabilidad" />
            <FeatureItem text="Gestión de citas, pagos y notas clínicas" />
            <FeatureItem text="Auditoría y versionamiento de registros" />
          </div>
          <p className="text-xs text-muted-foreground/60 pt-8">
            DentFlow · Sistema Clínico Odontológico
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[400px] space-y-8">
          {/* Mobile branding */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Stethoscope className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg font-bold text-foreground">DentFlow</span>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-xl font-bold text-foreground">
              {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {mode === "login"
                ? "Ingrese sus credenciales para acceder al sistema."
                : "Complete los datos para registrarse en el sistema."}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 p-3.5">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="flex items-start gap-2.5 rounded-xl border border-success/20 bg-success/5 p-3.5">
              <p className="text-sm text-success">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Nombre completo</Label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Dr. Juan Pérez"
                  className="h-11 rounded-xl text-sm"
                  autoComplete="name"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Correo electrónico</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="doctor@clinica.com"
                className="h-11 rounded-xl text-sm"
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Contraseña</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••"
                  className="h-11 rounded-xl text-sm pr-10"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
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

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl text-sm font-semibold"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : mode === "login" ? (
                "Iniciar sesión"
              ) : (
                "Crear cuenta"
              )}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); setSuccess(""); }}
              className="text-sm text-primary font-medium hover:underline"
            >
              {mode === "login" ? "¿No tiene cuenta? Regístrese" : "¿Ya tiene cuenta? Inicie sesión"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 w-1.5 rounded-full bg-primary/50 shrink-0" />
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  );
}

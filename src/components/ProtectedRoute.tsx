import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { canAccessRoute } from "@/lib/permissions";
import { Loader2 } from "lucide-react";
import AccessDenied from "@/pages/AccessDenied";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, profileComplete } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando sesión…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Inactive user
  if (profile && !profile.activo) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3 max-w-sm">
          <h2 className="text-lg font-bold text-foreground">Cuenta desactivada</h2>
          <p className="text-sm text-muted-foreground">
            Su cuenta ha sido desactivada. Contacte al administrador del sistema.
          </p>
        </div>
      </div>
    );
  }

  // Incomplete profile → redirect to complete (unless already there)
  if (!profileComplete && location.pathname !== "/complete-profile") {
    return <Navigate to="/complete-profile" replace />;
  }

  // Role-based route check
  if (profile && !canAccessRoute(profile.role, location.pathname)) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}

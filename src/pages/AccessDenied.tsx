import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldX } from "lucide-react";

export default function AccessDenied() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center space-y-4 max-w-sm">
        <div className="h-14 w-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
          <ShieldX className="h-7 w-7 text-destructive" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Acceso denegado</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          No tiene permisos suficientes para acceder a este módulo. Contacte al administrador si considera que esto es un error.
        </p>
        <Button variant="outline" onClick={() => navigate("/")} className="rounded-xl">
          Volver al inicio
        </Button>
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/EmptyState";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  patientId?: string;
}

/** Shown when the patient or historia cannot be resolved. */
export function NotFoundCard({ patientId }: Props) {
  const navigate = useNavigate();
  return (
    <div className="page-container max-w-4xl">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        className="gap-1.5 text-muted-foreground -ml-2"
      >
        <ArrowLeft className="h-4 w-4" /> Volver
      </Button>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-8 text-center space-y-3">
          <div className="h-14 w-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertTriangle className="h-7 w-7 text-destructive" />
          </div>
          <h3 className="text-base font-semibold">Historia no encontrada</h3>
          <p className="text-sm text-muted-foreground">
            No se pudo cargar la historia clínica solicitada.
          </p>
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => navigate(`/patients/${patientId}`)}
          >
            Volver al paciente
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

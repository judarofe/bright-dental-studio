import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { SectionHeader } from "@/components/clinical/SectionHeader";
import { Pill } from "lucide-react";
import { toast } from "sonner";

interface Props {
  isLocked: boolean;
}

export function PrescripcionesSection({ isLocked }: Props) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-0">
        <div className="flex items-center justify-between px-5 pt-5">
          <SectionHeader title="Prescripciones" icon={Pill} size="sm" />
          {!isLocked && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl gap-1.5 h-8 text-xs"
              onClick={() => toast.info("Agregar prescripción — en desarrollo")}
            >
              <Pill className="h-3.5 w-3.5" /> Agregar
            </Button>
          )}
        </div>
        <EmptyState
          icon={Pill}
          title="Sin prescripciones registradas"
          description="Las prescripciones farmacológicas del paciente aparecerán aquí."
        />
      </CardContent>
    </Card>
  );
}

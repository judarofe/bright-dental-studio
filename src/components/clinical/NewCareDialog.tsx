import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Heart,
  Brain,
  Syringe,
  Stethoscope,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/* ── Specialty visual config ─────────────────── */

interface SpecVisual {
  code: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  textColor: string;
  borderColor: string;
}

const SPEC_VISUALS: SpecVisual[] = [
  {
    code: "odontologia",
    label: "Odontología",
    description: "Odontograma, diagnósticos dentales, plan de tratamiento",
    icon: Activity,
    color: "bg-primary/10",
    textColor: "text-primary",
    borderColor: "border-primary/30",
  },
  {
    code: "medicina",
    label: "Medicina General",
    description: "Examen físico, laboratorios, prescripciones",
    icon: Heart,
    color: "bg-rose-500/10",
    textColor: "text-rose-500",
    borderColor: "border-rose-500/30",
  },
  {
    code: "psicologia",
    label: "Psicología",
    description: "Evaluación psicológica, sesiones, seguimiento",
    icon: Brain,
    color: "bg-violet-500/10",
    textColor: "text-violet-500",
    borderColor: "border-violet-500/30",
  },
  {
    code: "enfermeria",
    label: "Enfermería",
    description: "Signos vitales, procedimientos, cuidados",
    icon: Syringe,
    color: "bg-emerald-500/10",
    textColor: "text-emerald-500",
    borderColor: "border-emerald-500/30",
  },
];

/* ── Component ───────────────────────────────── */

interface Props {
  open: boolean;
  onClose: () => void;
  patientId: string;
  patientName?: string;
}

export function NewCareDialog({ open, onClose, patientId, patientName }: Props) {
  const { accessibleSpecialties } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);

  // Active specialties the user can start care for
  const activeSpecs = SPEC_VISUALS.filter((s) =>
    accessibleSpecialties.includes(s.code)
  );
  const inactiveSpecs = SPEC_VISUALS.filter(
    (s) => !accessibleSpecialties.includes(s.code)
  );

  // Auto-select if user has exactly one specialty
  useEffect(() => {
    if (open) {
      setSelected(activeSpecs.length === 1 ? activeSpecs[0].code : null);
    }
  }, [open, activeSpecs.length]);

  const handleStart = () => {
    if (!selected) return;

    if (selected === "odontologia") {
      // Navigate to clinical workspace for this patient
      navigate(`/patients/${patientId}/historia/new`);
      onClose();
    } else {
      toast.info(`${SPEC_VISUALS.find((s) => s.code === selected)?.label} — próximamente`, {
        description: "Esta especialidad estará disponible en una futura actualización.",
      });
    }
  };

  // If only one specialty, skip selection — go directly
  const handleOpenChange = (v: boolean) => {
    if (!v) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[440px] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border/60">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-base flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-primary" />
              Nueva atención clínica
            </DialogTitle>
            <DialogDescription className="text-xs">
              {patientName
                ? `Selecciona la especialidad para ${patientName}`
                : "Selecciona la especialidad para iniciar la atención"}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-3 max-h-[60vh] overflow-y-auto">
          {/* Active specialties */}
          {activeSpecs.map((spec) => {
            const Icon = spec.icon;
            const isSelected = selected === spec.code;
            return (
              <button
                key={spec.code}
                onClick={() => setSelected(spec.code)}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left group",
                  isSelected
                    ? `${spec.borderColor} ${spec.color}`
                    : "border-border/60 hover:border-border hover:bg-muted/30"
                )}
              >
                <div
                  className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                    isSelected ? spec.color : "bg-muted/60"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-colors",
                      isSelected ? spec.textColor : "text-muted-foreground"
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{spec.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {spec.description}
                  </p>
                </div>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isSelected ? spec.textColor : "text-muted-foreground/40"
                  )}
                />
              </button>
            );
          })}

          {/* Inactive / future specialties */}
          {inactiveSpecs.length > 0 && (
            <div className="pt-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">
                Próximamente
              </p>
              <div className="flex flex-wrap gap-2">
                {inactiveSpecs.map((spec) => {
                  const Icon = spec.icon;
                  return (
                    <div
                      key={spec.code}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-muted/30 text-muted-foreground/50 text-xs"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {spec.label}
                      <Badge
                        variant="outline"
                        className="text-[8px] h-3.5 px-1 border-muted-foreground/20 text-muted-foreground/40"
                      >
                        Próx.
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* No specialties warning */}
          {activeSpecs.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">Sin especialidades asignadas</p>
              <p className="text-xs mt-1">
                Contacta al administrador para habilitar especialidades en tu perfil.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/60 bg-muted/20 flex items-center gap-2">
          <div className="flex-1" />
          <Button
            variant="outline"
            onClick={onClose}
            className="h-9 rounded-xl text-sm px-4"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleStart}
            disabled={!selected}
            className="h-9 rounded-xl text-sm px-5 font-medium gap-1.5"
          >
            <Stethoscope className="h-3.5 w-3.5" />
            Iniciar atención
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

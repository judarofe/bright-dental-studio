import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowLeft, Save, CheckCircle2, Printer, History, Lock } from "lucide-react";
import type { SpecialtyMeta } from "@/lib/clinical/sections";
import { toast } from "sonner";

interface Props {
  patientId: string;
  patientName: string;
  meta: SpecialtyMeta;
  isLocked: boolean;
  onBack: () => void;
  onSaveDraft: () => void;
  onValidate: () => void;
  onPrint: () => void;
  onCloseRequest: () => void;
}

/**
 * Workspace top bar: breadcrumb (patient → atención → especialidad)
 * + global workspace actions.
 */
export function WorkspaceHeader({
  patientId,
  patientName,
  meta,
  isLocked,
  onBack,
  onSaveDraft,
  onValidate,
  onPrint,
  onCloseRequest,
}: Props) {
  const SpecIcon = meta.icon;

  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-1.5 text-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-1.5 text-muted-foreground -ml-2 h-7 px-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> {patientName}
        </Button>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-xs text-muted-foreground">Atención Clínica</span>
        <span className="text-muted-foreground/40">/</span>
        <Badge
          variant="outline"
          className={cn("gap-1 text-[10px] h-5 rounded-full", meta.borderColor, meta.textColor)}
        >
          <SpecIcon className="h-3 w-3" /> {meta.label}
        </Badge>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="outline" size="sm" className="rounded-xl gap-1.5 h-8 text-xs" onClick={onSaveDraft}>
          <Save className="h-3.5 w-3.5" /> Guardar borrador
        </Button>
        <Button variant="outline" size="sm" className="rounded-xl gap-1.5 h-8 text-xs" onClick={onValidate}>
          <CheckCircle2 className="h-3.5 w-3.5" /> Validar
        </Button>
        <Button variant="outline" size="sm" className="rounded-xl gap-1.5 h-8 text-xs" onClick={onPrint}>
          <Printer className="h-3.5 w-3.5" /> Imprimir
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl gap-1.5 h-8 text-xs"
          onClick={() => toast.info("Historial de versiones disponible abajo")}
        >
          <History className="h-3.5 w-3.5" /> Historial
        </Button>
        {!isLocked && (
          <Button
            size="sm"
            variant="destructive"
            className="rounded-xl gap-1.5 h-8 text-xs"
            onClick={onCloseRequest}
          >
            <Lock className="h-3.5 w-3.5" /> Cerrar historia
          </Button>
        )}
      </div>
    </div>
  );
}

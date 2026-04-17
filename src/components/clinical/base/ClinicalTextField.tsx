import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CheckCircle2, ChevronDown, FileQuestion, type LucideIcon } from "lucide-react";

export interface ClinicalTextFieldProps {
  title: string;
  icon: LucideIcon;
  value: string;
  placeholder: string;
  rows?: number;
  required?: boolean;
  templates?: string[];
  readOnly?: boolean;
}

/**
 * Reusable clinical text input with templates, autosave indicator and required state.
 * Used across all base + specialty sections.
 */
export function ClinicalTextField({
  title,
  icon: Icon,
  value,
  placeholder,
  rows = 4,
  required,
  templates,
  readOnly,
}: ClinicalTextFieldProps) {
  const [showTemplates, setShowTemplates] = useState(false);
  const [text, setText] = useState(value);
  const [saved, setSaved] = useState(true);
  const filled = text.trim().length > 0;

  const applyTemplate = (tpl: string) => {
    setText(tpl);
    setShowTemplates(false);
    setSaved(false);
    toast.success("Plantilla aplicada");
  };

  const handleBlur = () => {
    if (text !== value && !readOnly) {
      setSaved(true);
      toast.success("Guardado automáticamente", { description: title });
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground tracking-tight">{title}</h3>
              {required && (
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-destructive/30 text-destructive font-normal">
                  Obligatorio
                </Badge>
              )}
              {filled && (
                <div className="h-5 w-5 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="h-3 w-3 text-success" />
                </div>
              )}
            </div>
          </div>
          {templates && templates.length > 0 && !readOnly && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 h-7 text-[11px] text-muted-foreground hover:text-foreground"
              onClick={() => setShowTemplates(!showTemplates)}
            >
              <FileQuestion className="h-3.5 w-3.5" />
              Plantillas
              <ChevronDown className={cn("h-3 w-3 transition-transform", showTemplates && "rotate-180")} />
            </Button>
          )}
        </div>

        {showTemplates && templates && (
          <div className="rounded-xl border border-dashed border-primary/20 bg-primary/[0.02] p-3 space-y-2">
            <p className="text-[11px] font-medium text-muted-foreground">Seleccione una plantilla para autocompletar:</p>
            {templates.map((tpl, i) => (
              <button
                key={i}
                onClick={() => applyTemplate(tpl)}
                className="w-full text-left p-2.5 rounded-lg bg-background border border-border/50 hover:border-primary/30 hover:bg-primary/[0.03] transition-colors text-xs text-foreground leading-relaxed"
              >
                {tpl}
              </button>
            ))}
          </div>
        )}

        <Textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setSaved(false); }}
          onBlur={handleBlur}
          placeholder={placeholder}
          rows={rows}
          readOnly={readOnly}
          className={cn(
            "rounded-xl resize-none text-sm transition-colors",
            !filled && required && "border-destructive/30 focus-visible:ring-destructive/30",
            readOnly && "opacity-70 cursor-not-allowed"
          )}
        />

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">
            {text.length > 0 ? `${text.length} caracteres` : "Sin contenido"}
          </span>
          {text !== value && !saved && (
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal bg-warning/10 text-warning border-0">
              Sin guardar
            </Badge>
          )}
          {text !== value && saved && (
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal bg-success/10 text-success border-0">
              ✓ Guardado
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

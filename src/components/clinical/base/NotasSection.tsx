import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { SectionHeader } from "@/components/clinical/SectionHeader";
import { StickyNote, Mic, FileText, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { NotaCortaOdontologica } from "@/data/clinicalTypes";

interface Props {
  notas: NotaCortaOdontologica[];
}

export function NotasSection({ notas }: Props) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <SectionHeader title="Notas clínicas" icon={StickyNote} size="sm" />
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl gap-1.5 h-8 text-xs"
            onClick={() => toast.info("Nueva nota — en desarrollo")}
          >
            <StickyNote className="h-3.5 w-3.5" /> Nueva nota
          </Button>
        </div>
        {notas.length === 0 ? (
          <EmptyState
            icon={StickyNote}
            title="Sin notas clínicas"
            description="Agrega notas para registrar observaciones durante la consulta."
          />
        ) : (
          <div className="space-y-2">
            {notas.map((n) => (
              <div key={n.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/40">
                {n.tipo === "voz" ? (
                  <Mic className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                ) : (
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{n.contenido}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground">{n.creadoPor}</span>
                    <span className="text-[10px] text-muted-foreground">•</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(n.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                    </span>
                    {n.tipo === "voz" && n.duracionSegundos && (
                      <>
                        <span className="text-[10px] text-muted-foreground">•</span>
                        <span className="text-[10px] text-primary font-medium">{n.duracionSegundos}s audio</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Voice placeholder */}
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-primary/5 to-accent/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="flex items-center gap-3 relative">
            <button
              disabled
              className="h-10 w-10 rounded-xl bg-primary/10 border border-dashed border-primary/25 flex items-center justify-center shrink-0 cursor-not-allowed"
            >
              <Mic className="h-4 w-4 text-primary" />
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold">Dictado por voz</p>
                <span className="inline-flex items-center gap-0.5 text-[9px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                  <Sparkles className="h-2.5 w-2.5" /> AI
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Próximamente: dicta notas que se transcriben automáticamente.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

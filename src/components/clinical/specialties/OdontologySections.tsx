/**
 * Odontología-specific section renderers.
 * These components are only used when the active specialty is "odontologia".
 */

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SectionHeader } from "@/components/clinical/SectionHeader";
import { cn } from "@/lib/utils";
import type { ExamenFisico } from "@/data/clinicalTypes";
import {
  Heart,
  Activity,
  Droplets,
  Thermometer,
  Weight,
  Ruler,
  ListChecks,
  Stethoscope,
  User,
} from "lucide-react";

/* ── Vital sign card ─────────────────────────── */

function VitalCard({ label, value, unit, icon: Icon, status }: {
  label: string;
  value: string | number;
  unit: string;
  icon: typeof Heart;
  status?: "normal" | "warning" | "danger";
}) {
  const statusColor = status === "danger"
    ? "border-destructive/30 bg-destructive/5"
    : status === "warning"
    ? "border-warning/30 bg-warning/5"
    : "border-border/50 bg-muted/20";

  const valueColor = status === "danger"
    ? "text-destructive"
    : status === "warning"
    ? "text-warning"
    : "text-foreground";

  return (
    <div className={cn("rounded-xl border p-3 space-y-1.5 transition-colors", statusColor)}>
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={cn("text-lg font-bold tabular-nums tracking-tight", valueColor)}>{value}</span>
        <span className="text-[10px] text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}

/* ── Indicator row ───────────────────────────── */

function IndicatorRow({ label, value, total, unit, highlight }: {
  label: string;
  value: number;
  total?: number;
  unit?: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className={cn(
          "text-sm font-semibold tabular-nums",
          highlight ? "text-primary" : "text-foreground"
        )}>
          {value}
        </span>
        {total !== undefined && (
          <span className="text-[10px] text-muted-foreground">/ {total}</span>
        )}
        {unit && <span className="text-[10px] text-muted-foreground">{unit}</span>}
      </div>
    </div>
  );
}

/* ── Odontologic indicators panel ─────────────── */

export function OdontologicIndicators({ examen }: { examen: ExamenFisico }) {
  const ind = examen.indicadoresOdontologicos;

  const fluorosisLabels: Record<string, string> = {
    normal: "Normal",
    cuestionable: "Cuestionable",
    muy_leve: "Muy leve",
    leve: "Leve",
    moderada: "Moderada",
    severa: "Severa",
  };

  const olearyStatus = ind.indiceOLeary > 40 ? "danger" : ind.indiceOLeary > 20 ? "warning" : "normal";

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <SectionHeader title="Indicadores odontológicos" icon={ListChecks} size="sm" />
          <Badge variant="outline" className="text-[9px] h-4 rounded-full border-primary/30 text-primary">Odontología</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Índices de higiene */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Índices de higiene</p>
            <div className="rounded-xl border border-border/50 p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Índice de O'Leary</span>
                <Badge variant="outline" className={cn(
                  "text-[10px] h-5 px-1.5 font-semibold border-0",
                  olearyStatus === "danger" ? "bg-destructive/10 text-destructive" :
                  olearyStatus === "warning" ? "bg-warning/10 text-warning" :
                  "bg-success/10 text-success"
                )}>
                  {ind.indiceOLeary}%
                </Badge>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    olearyStatus === "danger" ? "bg-destructive" :
                    olearyStatus === "warning" ? "bg-warning" :
                    "bg-success"
                  )}
                  style={{ width: `${Math.min(ind.indiceOLeary, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                {olearyStatus === "normal" ? "Higiene aceptable" : olearyStatus === "warning" ? "Requiere refuerzo de higiene" : "Higiene deficiente — intervención necesaria"}
              </p>
            </div>

            <div className="rounded-xl border border-border/50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Fluorosis</span>
                <Badge variant="outline" className={cn(
                  "text-[10px] h-5 px-1.5 font-medium border-0",
                  ind.fluorosis === "severa" || ind.fluorosis === "moderada" ? "bg-destructive/10 text-destructive" :
                  ind.fluorosis === "leve" || ind.fluorosis === "muy_leve" ? "bg-warning/10 text-warning" :
                  "bg-muted text-muted-foreground"
                )}>
                  {fluorosisLabels[ind.fluorosis]}
                </Badge>
              </div>
            </div>
          </div>

          {/* COP e indicadores cuantitativos */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">COP-D y cuantitativos</p>
            <div className="rounded-xl border border-border/50 p-3 space-y-0.5">
              <IndicatorRow label="Dientes examinados" value={ind.dientesExaminados} />
              <IndicatorRow label="Superficies examinadas" value={ind.superficiesExaminadas} />
              <IndicatorRow label="Superficies marcadas" value={ind.superficiesMarcadas} total={ind.superficiesExaminadas} />
              <Separator className="my-1.5" />
              <IndicatorRow label="Cariados (C)" value={ind.copC} highlight />
              <IndicatorRow label="Obturados (O)" value={ind.copO} />
              <IndicatorRow label="Perdidos (P)" value={ind.copP} />
              <div className="flex items-center justify-between py-2 border-t border-primary/20 mt-1">
                <span className="text-xs font-semibold text-foreground">COP Total</span>
                <span className="text-base font-bold text-primary tabular-nums">{ind.copTotal}</span>
              </div>
              {ind.copd !== undefined && (
                <IndicatorRow label="COP-D (deciduos)" value={ind.copd} />
              )}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground">Apto COP</span>
                <Badge variant="outline" className={cn(
                  "text-[10px] h-5 px-2 font-semibold border-0",
                  ind.aptoCop ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                )}>
                  {ind.aptoCop ? "Sí" : "No"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Vitals section (shared but used here) ───── */

export function VitalsSection({ examen }: { examen: ExamenFisico }) {
  const sv = examen.signosVitales;

  const [sys, dia] = sv.presionArterial.split("/").map(Number);
  const bpStatus = sys > 140 || dia > 90 ? "danger" as const : sys > 130 || dia > 85 ? "warning" as const : "normal" as const;
  const hrStatus = sv.frecuenciaCardiaca > 100 || sv.frecuenciaCardiaca < 50 ? "warning" as const : "normal" as const;

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5 space-y-4">
        <SectionHeader title="Signos vitales" icon={Heart} size="sm" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <VitalCard label="Presión arterial" value={sv.presionArterial} unit="mmHg" icon={Heart} status={bpStatus} />
          <VitalCard label="Frec. cardiaca" value={sv.frecuenciaCardiaca} unit="lpm" icon={Activity} status={hrStatus} />
          <VitalCard label="Frec. respiratoria" value={sv.frecuenciaRespiratoria} unit="rpm" icon={Droplets} />
          <VitalCard label="Temperatura" value={sv.temperatura} unit="°C" icon={Thermometer} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <VitalCard label="Peso" value={sv.peso} unit="kg" icon={Weight} />
          <VitalCard label="Talla" value={sv.talla} unit="cm" icon={Ruler} />
          <VitalCard label="IMC" value={sv.imc} unit="kg/m²" icon={Activity}
            status={sv.imc > 30 ? "danger" : sv.imc > 25 ? "warning" : "normal"} />
          {sv.saturacionO2 !== undefined && (
            <VitalCard label="SpO₂" value={sv.saturacionO2} unit="%" icon={Droplets}
              status={sv.saturacionO2 < 90 ? "danger" : sv.saturacionO2 < 95 ? "warning" : "normal"} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

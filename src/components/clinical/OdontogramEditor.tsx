/* ──────────────────────────────────────────────
   Odontogram Editor — Interactive dental chart
   v1.0
   ────────────────────────────────────────────── */

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionHeader } from "@/components/clinical/SectionHeader";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Odontograma, OdontogramaPieza, OdontogramaEvento, ToothCondition, ToothFace } from "@/data/clinicalTypes";
import {
  Activity,
  Clock,
  ListChecks,
  RotateCcw,
  Info,
} from "lucide-react";

/* ── Constants ───────────────────────────────── */

// FDI notation — permanent dentition
const UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
const UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_LEFT = [31, 32, 33, 34, 35, 36, 37, 38];
const LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];

// Deciduous
const UPPER_RIGHT_D = [55, 54, 53, 52, 51];
const UPPER_LEFT_D = [61, 62, 63, 64, 65];
const LOWER_LEFT_D = [71, 72, 73, 74, 75];
const LOWER_RIGHT_D = [85, 84, 83, 82, 81];

type DentitionType = "permanente" | "decidua" | "mixta";

const CONDITION_CONFIG: Record<ToothCondition, { label: string; color: string; bg: string; border: string }> = {
  sano: { label: "Sano", color: "text-success", bg: "bg-success/10", border: "border-success/30" },
  caries: { label: "Caries", color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30" },
  obturado: { label: "Obturado", color: "text-primary", bg: "bg-primary/10", border: "border-primary/30" },
  ausente: { label: "Ausente", color: "text-muted-foreground", bg: "bg-muted", border: "border-border" },
  corona: { label: "Corona", color: "text-warning", bg: "bg-warning/10", border: "border-warning/30" },
  endodoncia: { label: "Endodoncia", color: "text-purple-600", bg: "bg-purple-500/10", border: "border-purple-500/30" },
  implante: { label: "Implante", color: "text-cyan-600", bg: "bg-cyan-500/10", border: "border-cyan-500/30" },
  protesis: { label: "Prótesis", color: "text-orange-600", bg: "bg-orange-500/10", border: "border-orange-500/30" },
};

const FACES: { id: ToothFace; label: string }[] = [
  { id: "vestibular", label: "V" },
  { id: "lingual", label: "L" },
  { id: "mesial", label: "M" },
  { id: "distal", label: "D" },
  { id: "oclusal", label: "O" },
  { id: "palatino", label: "P" },
];

/* ── Tooth SVG (5-surface diagram) ───────────── */

function ToothDiagram({
  pieza,
  isSelected,
  activeTool,
  onClickTooth,
  onClickFace,
}: {
  pieza: OdontogramaPieza;
  isSelected: boolean;
  activeTool: ToothCondition;
  onClickTooth: () => void;
  onClickFace: (face: ToothFace) => void;
}) {
  const size = 44;
  const c = size / 2;
  const innerR = 10;
  const outerR = 19;

  const getFaceColor = (face: ToothFace) => {
    const cond = pieza.caras[face];
    if (!cond || cond === "sano") return "hsl(var(--muted))";
    return CONDITION_CONFIG[cond]?.bg.includes("destructive")
      ? "hsl(var(--destructive) / 0.35)"
      : CONDITION_CONFIG[cond]?.bg.includes("primary")
      ? "hsl(var(--primary) / 0.35)"
      : CONDITION_CONFIG[cond]?.bg.includes("warning")
      ? "hsl(var(--warning) / 0.35)"
      : CONDITION_CONFIG[cond]?.bg.includes("purple")
      ? "hsl(270 60% 55% / 0.35)"
      : CONDITION_CONFIG[cond]?.bg.includes("cyan")
      ? "hsl(190 60% 50% / 0.35)"
      : CONDITION_CONFIG[cond]?.bg.includes("orange")
      ? "hsl(25 80% 55% / 0.35)"
      : "hsl(var(--muted))";
  };

  const getCondColor = () => {
    if (pieza.condicion === "sano") return "hsl(var(--border))";
    return CONDITION_CONFIG[pieza.condicion]?.color.includes("destructive")
      ? "hsl(var(--destructive))"
      : CONDITION_CONFIG[pieza.condicion]?.color.includes("primary")
      ? "hsl(var(--primary))"
      : CONDITION_CONFIG[pieza.condicion]?.color.includes("warning")
      ? "hsl(var(--warning))"
      : CONDITION_CONFIG[pieza.condicion]?.color.includes("muted")
      ? "hsl(var(--muted-foreground) / 0.4)"
      : "hsl(var(--border))";
  };

  if (pieza.condicion === "ausente") {
    return (
      <div className="flex flex-col items-center gap-1 group cursor-pointer" onClick={onClickTooth}>
        <span className={cn("text-[10px] font-mono font-bold tabular-nums", isSelected ? "text-primary" : "text-muted-foreground/60")}>
          {pieza.numero}
        </span>
        <div className="relative">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <line x1={4} y1={4} x2={size - 4} y2={size - 4} stroke="hsl(var(--muted-foreground) / 0.3)" strokeWidth={1.5} />
            <line x1={size - 4} y1={4} x2={4} y2={size - 4} stroke="hsl(var(--muted-foreground) / 0.3)" strokeWidth={1.5} />
            <rect x={2} y={2} width={size - 4} height={size - 4} rx={4} fill="none" stroke="hsl(var(--border))" strokeWidth={1} strokeDasharray="3 2" />
          </svg>
        </div>
      </div>
    );
  }

  // 5-surface polygon paths
  const facePaths: Record<string, string> = {
    oclusal: `M ${c - innerR} ${c - innerR} L ${c + innerR} ${c - innerR} L ${c + innerR} ${c + innerR} L ${c - innerR} ${c + innerR} Z`,
    vestibular: `M ${c - outerR} ${c - outerR} L ${c + outerR} ${c - outerR} L ${c + innerR} ${c - innerR} L ${c - innerR} ${c - innerR} Z`,
    lingual: `M ${c - innerR} ${c + innerR} L ${c + innerR} ${c + innerR} L ${c + outerR} ${c + outerR} L ${c - outerR} ${c + outerR} Z`,
    mesial: `M ${c - outerR} ${c - outerR} L ${c - innerR} ${c - innerR} L ${c - innerR} ${c + innerR} L ${c - outerR} ${c + outerR} Z`,
    distal: `M ${c + innerR} ${c - innerR} L ${c + outerR} ${c - outerR} L ${c + outerR} ${c + outerR} L ${c + innerR} ${c + innerR} Z`,
  };

  return (
    <div className="flex flex-col items-center gap-1 group" >
      <span className={cn("text-[10px] font-mono font-bold tabular-nums transition-colors", isSelected ? "text-primary" : "text-muted-foreground group-hover:text-foreground")}>
        {pieza.numero}
      </span>
      <div className="relative cursor-pointer" onClick={onClickTooth}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={cn(
          "rounded-md transition-shadow",
          isSelected && "ring-2 ring-primary/40 ring-offset-1 ring-offset-background rounded-lg"
        )}>
          {/* Outer border */}
          <rect x={c - outerR} y={c - outerR} width={outerR * 2} height={outerR * 2} rx={3}
            fill="hsl(var(--card))" stroke={getCondColor()} strokeWidth={1.5} />
          {/* Face polygons */}
          {Object.entries(facePaths).map(([face, d]) => (
            <path
              key={face}
              d={d}
              fill={getFaceColor(face as ToothFace)}
              stroke="hsl(var(--border))"
              strokeWidth={0.5}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={(e) => { e.stopPropagation(); onClickFace(face as ToothFace); }}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

/* ── Main Editor ─────────────────────────────── */

interface Props {
  odontograma: Odontograma | null;
  eventos: OdontogramaEvento[];
}

export function OdontogramEditor({ odontograma, eventos }: Props) {
  const [dentition, setDentition] = useState<DentitionType>("permanente");
  const [activeTool, setActiveTool] = useState<ToothCondition>("caries");
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);

  // Build pieces map
  const piezasMap = useMemo(() => {
    const map = new Map<number, OdontogramaPieza>();
    odontograma?.piezas.forEach((p) => map.set(p.numero, p));
    return map;
  }, [odontograma]);

  const getPieza = (num: number): OdontogramaPieza =>
    piezasMap.get(num) ?? { numero: num, condicion: "sano", caras: {}, notas: "" };

  const selectedPieza = selectedTooth != null ? getPieza(selectedTooth) : null;

  const getArcade = (nums: number[]) => nums.map((n) => getPieza(n));

  const upperTeeth = dentition === "decidua"
    ? [...UPPER_RIGHT_D, ...UPPER_LEFT_D]
    : dentition === "mixta"
    ? [...UPPER_RIGHT, ...UPPER_LEFT]
    : [...UPPER_RIGHT, ...UPPER_LEFT];

  const lowerTeeth = dentition === "decidua"
    ? [...LOWER_LEFT_D, ...LOWER_RIGHT_D]
    : dentition === "mixta"
    ? [...LOWER_LEFT, ...LOWER_RIGHT]
    : [...LOWER_LEFT, ...LOWER_RIGHT];

  const handleClickTooth = (num: number) => {
    setSelectedTooth(selectedTooth === num ? null : num);
  };

  const handleClickFace = (num: number, face: ToothFace) => {
    setSelectedTooth(num);
    toast.info(`Pieza ${num} cara ${face} → ${activeTool}`, { duration: 1500 });
  };

  // Stats
  const stats = useMemo(() => {
    const all = odontograma?.piezas ?? [];
    return {
      total: all.length,
      sanos: all.filter((p) => p.condicion === "sano").length,
      caries: all.filter((p) => p.condicion === "caries").length,
      obturados: all.filter((p) => p.condicion === "obturado").length,
      ausentes: all.filter((p) => p.condicion === "ausente").length,
      otros: all.filter((p) => !["sano", "caries", "obturado", "ausente"].includes(p.condicion)).length,
    };
  }, [odontograma]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <SectionHeader title="Odontograma" icon={Activity} size="sm" />
              {odontograma && (
                <Badge variant="outline" className="text-[10px] h-5 px-2 font-normal text-muted-foreground">
                  {new Date(odontograma.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Tabs value={dentition} onValueChange={(v) => setDentition(v as DentitionType)}>
                <TabsList className="h-8">
                  <TabsTrigger value="permanente" className="text-[11px] h-6 px-2.5">Permanente</TabsTrigger>
                  <TabsTrigger value="decidua" className="text-[11px] h-6 px-2.5">Decidua</TabsTrigger>
                  <TabsTrigger value="mixta" className="text-[11px] h-6 px-2.5">Mixta</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setSelectedTooth(null)}>
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tool palette + Chart */}
      <div className="flex gap-4 items-start">
        {/* Tool palette — left */}
        <Card className="border-0 shadow-sm shrink-0 hidden md:block w-40">
          <CardContent className="p-3 space-y-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Herramienta</p>
            {(Object.entries(CONDITION_CONFIG) as [ToothCondition, typeof CONDITION_CONFIG[ToothCondition]][]).map(
              ([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setActiveTool(key)}
                  className={cn(
                    "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-left",
                    activeTool === key
                      ? cn("ring-1 ring-offset-1 ring-offset-background", cfg.bg, cfg.border, cfg.color, "ring-current")
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <div className={cn("h-3 w-3 rounded-sm shrink-0", cfg.bg, "border", cfg.border)} />
                  {cfg.label}
                </button>
              )
            )}
          </CardContent>
        </Card>

        {/* Chart area */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Mobile tool selector */}
          <div className="md:hidden flex overflow-x-auto gap-1.5 pb-2 -mx-1 px-1">
            {(Object.entries(CONDITION_CONFIG) as [ToothCondition, typeof CONDITION_CONFIG[ToothCondition]][]).map(
              ([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setActiveTool(key)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap shrink-0 transition-colors",
                    activeTool === key
                      ? cn(cfg.bg, cfg.color)
                      : "bg-muted/60 text-muted-foreground"
                  )}
                >
                  <div className={cn("h-2 w-2 rounded-full shrink-0 border", cfg.border, cfg.bg)} />
                  {cfg.label}
                </button>
              )
            )}
          </div>

          {/* Dental chart */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 space-y-5">
              {/* Upper arcade */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Arcada superior</p>
                  <p className="text-[10px] text-muted-foreground">Derecha del paciente ← → Izquierda</p>
                </div>
                <div className="flex justify-center gap-0.5 flex-wrap">
                  {getArcade(upperTeeth.slice(0, upperTeeth.length / 2)).map((p) => (
                    <ToothDiagram
                      key={p.numero}
                      pieza={p}
                      isSelected={selectedTooth === p.numero}
                      activeTool={activeTool}
                      onClickTooth={() => handleClickTooth(p.numero)}
                      onClickFace={(face) => handleClickFace(p.numero, face)}
                    />
                  ))}
                  <div className="w-px bg-border mx-1 self-stretch" />
                  {getArcade(upperTeeth.slice(upperTeeth.length / 2)).map((p) => (
                    <ToothDiagram
                      key={p.numero}
                      pieza={p}
                      isSelected={selectedTooth === p.numero}
                      activeTool={activeTool}
                      onClickTooth={() => handleClickTooth(p.numero)}
                      onClickFace={(face) => handleClickFace(p.numero, face)}
                    />
                  ))}
                </div>
              </div>

              <Separator />

              {/* Lower arcade */}
              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Arcada inferior</p>
                <div className="flex justify-center gap-0.5 flex-wrap">
                  {getArcade(lowerTeeth.slice(0, lowerTeeth.length / 2)).map((p) => (
                    <ToothDiagram
                      key={p.numero}
                      pieza={p}
                      isSelected={selectedTooth === p.numero}
                      activeTool={activeTool}
                      onClickTooth={() => handleClickTooth(p.numero)}
                      onClickFace={(face) => handleClickFace(p.numero, face)}
                    />
                  ))}
                  <div className="w-px bg-border mx-1 self-stretch" />
                  {getArcade(lowerTeeth.slice(lowerTeeth.length / 2)).map((p) => (
                    <ToothDiagram
                      key={p.numero}
                      pieza={p}
                      isSelected={selectedTooth === p.numero}
                      activeTool={activeTool}
                      onClickTooth={() => handleClickTooth(p.numero)}
                      onClickFace={(face) => handleClickFace(p.numero, face)}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected tooth detail */}
          {selectedPieza && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-mono font-bold text-sm">{selectedPieza.numero}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Pieza {selectedPieza.numero}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Cuadrante {Math.floor(selectedPieza.numero / 10)} · {selectedPieza.numero > 50 ? "Deciduo" : "Permanente"}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={cn(
                    "text-[10px] h-5 px-2 font-medium border-0 capitalize",
                    CONDITION_CONFIG[selectedPieza.condicion].bg,
                    CONDITION_CONFIG[selectedPieza.condicion].color
                  )}>
                    {CONDITION_CONFIG[selectedPieza.condicion].label}
                  </Badge>
                </div>

                {/* Face detail */}
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {FACES.map((f) => {
                    const cond = selectedPieza.caras[f.id];
                    const cfg = cond ? CONDITION_CONFIG[cond] : null;
                    return (
                      <button
                        key={f.id}
                        onClick={() => handleClickFace(selectedPieza.numero, f.id)}
                        className={cn(
                          "flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors",
                          cfg && cond !== "sano"
                            ? cn(cfg.bg, cfg.border)
                            : "border-border/50 bg-muted/20 hover:bg-muted/40"
                        )}
                      >
                        <span className="text-[10px] font-semibold text-muted-foreground">{f.label}</span>
                        <span className={cn("text-[9px] capitalize", cfg ? cfg.color : "text-muted-foreground/60")}>
                          {cond ?? "sano"}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {selectedPieza.notas && (
                  <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg p-2.5 leading-relaxed">
                    {selectedPieza.notas}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Bottom panels: Legend + Stats + Events */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Legend */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 space-y-2.5">
            <div className="flex items-center gap-2">
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Convenciones</p>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
              {(Object.entries(CONDITION_CONFIG) as [ToothCondition, typeof CONDITION_CONFIG[ToothCondition]][]).map(
                ([key, cfg]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div className={cn("h-2.5 w-2.5 rounded-sm border shrink-0", cfg.bg, cfg.border)} />
                    <span className="text-[11px] text-muted-foreground">{cfg.label}</span>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats summary */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 space-y-2.5">
            <div className="flex items-center gap-2">
              <ListChecks className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Resumen</p>
            </div>
            <div className="space-y-1.5">
              {[
                { label: "Registradas", value: stats.total, color: "text-foreground" },
                { label: "Sanas", value: stats.sanos, color: "text-success" },
                { label: "Caries", value: stats.caries, color: "text-destructive" },
                { label: "Obturadas", value: stats.obturados, color: "text-primary" },
                { label: "Ausentes", value: stats.ausentes, color: "text-muted-foreground" },
                { label: "Otros", value: stats.otros, color: "text-foreground" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">{s.label}</span>
                  <span className={cn("text-xs font-semibold tabular-nums", s.color)}>{s.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent events */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 space-y-2.5">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Eventos</p>
            </div>
            {eventos.length === 0 ? (
              <p className="text-[11px] text-muted-foreground py-2">Sin eventos registrados.</p>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {eventos.slice(0, 6).map((e) => (
                  <div key={e.id} className="flex items-start gap-2 text-[11px]">
                    <span className="font-mono font-bold text-muted-foreground w-6 shrink-0">{e.piezaNumero}</span>
                    <span className="flex-1 text-foreground leading-tight">{e.descripcion}</span>
                    <Badge variant="outline" className={cn(
                      "text-[9px] h-4 px-1.5 font-normal border-0 shrink-0 capitalize",
                      e.tipo === "procedimiento" ? "bg-primary/10 text-primary" :
                      e.tipo === "hallazgo" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"
                    )}>
                      {e.tipo}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Historic comparison placeholder */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary/8 flex items-center justify-center">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">Comparación histórica</p>
                <p className="text-[10px] text-muted-foreground">Compare el odontograma actual con registros anteriores</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl h-8 text-xs gap-1.5"
              onClick={() => toast.info("Comparación histórica — próximamente")}>
              <Clock className="h-3.5 w-3.5" /> Comparar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

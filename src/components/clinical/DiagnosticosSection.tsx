/* ──────────────────────────────────────────────
   Diagnósticos y Clasificación Clínica
   ────────────────────────────────────────────── */

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionHeader } from "@/components/clinical/SectionHeader";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { DiagnosticoOdontologico } from "@/data/clinicalTypes";
import {
  Search,
  Plus,
  AlertTriangle,
  Stethoscope,
  Info,
  CheckCircle2,
  X,
  Star,
  Clock,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  FileText,
} from "lucide-react";

/* ── CIE-10 quick catalog ────────────────────── */

const CIE10_CATALOG = [
  { codigo: "K02.0", descripcion: "Caries limitada al esmalte", grupo: "Caries" },
  { codigo: "K02.1", descripcion: "Caries de la dentina", grupo: "Caries" },
  { codigo: "K02.2", descripcion: "Caries del cemento", grupo: "Caries" },
  { codigo: "K02.9", descripcion: "Caries dental, no especificada", grupo: "Caries" },
  { codigo: "K04.0", descripcion: "Pulpitis", grupo: "Pulpa y periapical" },
  { codigo: "K04.1", descripcion: "Necrosis de la pulpa", grupo: "Pulpa y periapical" },
  { codigo: "K04.7", descripcion: "Absceso periapical sin fístula", grupo: "Pulpa y periapical" },
  { codigo: "K05.0", descripcion: "Gingivitis aguda", grupo: "Periodontal" },
  { codigo: "K05.1", descripcion: "Gingivitis crónica", grupo: "Periodontal" },
  { codigo: "K05.3", descripcion: "Periodontitis crónica", grupo: "Periodontal" },
  { codigo: "K05.4", descripcion: "Periodontosis", grupo: "Periodontal" },
  { codigo: "K07.3", descripcion: "Anomalías de posición dental", grupo: "Ortodoncia" },
  { codigo: "K07.4", descripcion: "Maloclusión no especificada", grupo: "Ortodoncia" },
  { codigo: "K08.1", descripcion: "Pérdida de dientes por accidente o extracción", grupo: "Otras" },
  { codigo: "K12.0", descripcion: "Estomatitis aftosa recurrente", grupo: "Mucosa oral" },
  { codigo: "K13.0", descripcion: "Enfermedades de los labios", grupo: "Mucosa oral" },
  { codigo: "S02.5", descripcion: "Fractura de diente", grupo: "Traumatismo" },
];

/* ── Classification options ──────────────────── */

const TIPO_ACTIVIDAD = [
  { value: "tratamiento", label: "Tratamiento" },
  { value: "deteccion_temprana", label: "Detección temprana" },
  { value: "proteccion_especifica", label: "Protección específica" },
  { value: "promocion", label: "Promoción y prevención" },
];

const TIPO_CONSULTA = [
  { value: "primera_vez", label: "Primera vez" },
  { value: "control", label: "Control" },
  { value: "urgencia", label: "Urgencia" },
  { value: "interconsulta", label: "Interconsulta" },
];

const FINALIDAD = [
  { value: "diagnostico", label: "Diagnóstico" },
  { value: "terapeutico", label: "Terapéutico" },
  { value: "rehabilitacion", label: "Rehabilitación" },
  { value: "preventivo", label: "Preventivo" },
  { value: "paliativo", label: "Paliativo" },
];

const CAUSA_EXTERNA = [
  { value: "enfermedad_general", label: "Enfermedad general" },
  { value: "accidente_trabajo", label: "Accidente de trabajo" },
  { value: "accidente_transito", label: "Accidente de tránsito" },
  { value: "violencia", label: "Violencia" },
  { value: "autolesion", label: "Autolesión" },
  { value: "otro", label: "Otro" },
];

const TIPO_DIAGNOSTICO = [
  { value: "impresion_diagnostica", label: "Impresión diagnóstica" },
  { value: "confirmado_nuevo", label: "Confirmado nuevo" },
  { value: "confirmado_repetido", label: "Confirmado repetido" },
];

const ESPECIALIDAD_REMISION = [
  { value: "ninguna", label: "Sin remisión" },
  { value: "endodoncia", label: "Endodoncia" },
  { value: "periodoncia", label: "Periodoncia" },
  { value: "ortodoncia", label: "Ortodoncia" },
  { value: "cirugia_oral", label: "Cirugía oral y maxilofacial" },
  { value: "odontopediatria", label: "Odontopediatría" },
  { value: "rehabilitacion_oral", label: "Rehabilitación oral" },
  { value: "radiologia", label: "Radiología oral" },
  { value: "patologia_oral", label: "Patología oral" },
  { value: "medicina_general", label: "Medicina general" },
];

/* ── Age/sex restriction rules ───────────────── */

const RESTRICTIONS: Record<string, { note: string; type: "info" | "warning" }> = {
  "K07.3": { note: "Frecuente en dentición mixta (6-12 años). Evaluar estadio de desarrollo.", type: "info" },
  "K07.4": { note: "Requiere clasificación de Angle. Verificar edad del paciente para decidir tratamiento.", type: "info" },
  "K05.3": { note: "Poco frecuente en menores de 18 años. Si el paciente es menor, considerar periodontitis agresiva.", type: "warning" },
  "K05.4": { note: "Diagnóstico raro en menores de 30 años. Documentar justificación clínica.", type: "warning" },
  "S02.5": { note: "Requiere clasificación de Ellis. En menores de 12 años, evaluar si la pieza es decidua o permanente.", type: "info" },
};

/* ── Component ───────────────────────────────── */

interface Props {
  diagnosticos: DiagnosticoOdontologico[];
  historiaId: string;
}

export function DiagnosticosSection({ diagnosticos, historiaId }: Props) {
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCatalog, setSelectedCatalog] = useState<typeof CIE10_CATALOG[0] | null>(null);

  // Classification state
  const [tipoActividad, setTipoActividad] = useState("tratamiento");
  const [tipoConsulta, setTipoConsulta] = useState("primera_vez");
  const [finalidad, setFinalidad] = useState("diagnostico");
  const [causaExterna, setCausaExterna] = useState("enfermedad_general");
  const [tipoDiagnostico, setTipoDiagnostico] = useState("impresion_diagnostica");
  const [especialidadRemision, setEspecialidadRemision] = useState("ninguna");

  const principal = diagnosticos.length > 0 ? diagnosticos[0] : null;
  const relacionados = diagnosticos.slice(1);

  // Search filter
  const filtered = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return CIE10_CATALOG.filter(
      (c) => c.codigo.toLowerCase().includes(q) || c.descripcion.toLowerCase().includes(q) || c.grupo.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [search]);

  const handleSelectCatalog = (item: typeof CIE10_CATALOG[0]) => {
    setSelectedCatalog(item);
    setSearch("");
    setShowAddForm(true);
  };

  const handleAddDiagnostico = () => {
    toast.success("Diagnóstico agregado correctamente");
    setShowAddForm(false);
    setSelectedCatalog(null);
  };

  const restriction = selectedCatalog ? RESTRICTIONS[selectedCatalog.codigo] : null;

  return (
    <div className="space-y-4">
      {/* Diagnóstico principal */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <SectionHeader title="Diagnóstico principal" icon={Star} size="sm" />
            {!principal && (
              <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-destructive/30 text-destructive font-normal">
                Obligatorio
              </Badge>
            )}
          </div>

          {principal ? (
            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-primary/20 bg-primary/[0.03]">
              <div className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                principal.severidad === "severo" ? "bg-destructive/10" :
                principal.severidad === "moderado" ? "bg-warning/10" : "bg-success/10"
              )}>
                <AlertTriangle className={cn(
                  "h-4 w-4",
                  principal.severidad === "severo" ? "text-destructive" :
                  principal.severidad === "moderado" ? "text-warning" : "text-success"
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold">{principal.descripcion}</p>
                  <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded font-semibold">
                    {principal.codigo}
                  </span>
                  <Badge variant="outline" className={cn(
                    "text-[10px] h-5 px-1.5 border-0 capitalize font-medium",
                    principal.severidad === "severo" ? "bg-destructive/10 text-destructive" :
                    principal.severidad === "moderado" ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
                  )}>
                    {principal.severidad}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{principal.notas}</p>
                {principal.piezas.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[10px] text-muted-foreground">Piezas:</span>
                    {principal.piezas.map((p) => (
                      <span key={p} className="text-[10px] font-mono font-bold bg-muted px-1.5 py-0.5 rounded">{p}</span>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">
                {new Date(principal.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
              </span>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Stethoscope className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Sin diagnóstico principal asignado</p>
              <p className="text-xs mt-1">Busque un código CIE-10 para agregar</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diagnósticos relacionados */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <SectionHeader title="Diagnósticos relacionados" icon={FileText} size="sm" />
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">
              {relacionados.length} registrado{relacionados.length !== 1 ? "s" : ""}
            </Badge>
          </div>

          {relacionados.length > 0 ? (
            <div className="space-y-2">
              {relacionados.map((dx) => (
                <div key={dx.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/40 group">
                  <div className={cn(
                    "h-2 w-2 rounded-full mt-1.5 shrink-0",
                    dx.severidad === "severo" ? "bg-destructive" :
                    dx.severidad === "moderado" ? "bg-warning" : "bg-success"
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium">{dx.descripcion}</p>
                      <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{dx.codigo}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{dx.notas}</p>
                    {dx.piezas.length > 0 && (
                      <p className="text-[10px] text-muted-foreground mt-1">Piezas: {dx.piezas.join(", ")}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {new Date(dx.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-2 text-center">No hay diagnósticos secundarios.</p>
          )}
        </CardContent>
      </Card>

      {/* Search & Add */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5 space-y-4">
          <SectionHeader title="Buscar diagnóstico CIE-10" icon={Search} size="sm" />

          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por código, nombre o grupo… (ej. K02, caries, periodontal)"
              className="pl-10 rounded-xl text-sm h-10"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>

          {/* Results */}
          {filtered.length > 0 && (
            <div className="rounded-xl border border-border/60 divide-y divide-border/40 overflow-hidden">
              {filtered.map((item) => (
                <button
                  key={item.codigo}
                  onClick={() => handleSelectCatalog(item)}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 text-left hover:bg-muted/50 transition-colors"
                >
                  <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded shrink-0">
                    {item.codigo}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{item.descripcion}</p>
                  </div>
                  <Badge variant="secondary" className="text-[9px] h-4 px-1.5 font-normal shrink-0">
                    {item.grupo}
                  </Badge>
                  <Plus className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          )}

          {search.length >= 2 && filtered.length === 0 && (
            <div className="text-center py-4">
              <HelpCircle className="h-6 w-6 mx-auto mb-1.5 text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground">No se encontraron resultados para "{search}"</p>
            </div>
          )}

          {/* Add form */}
          {showAddForm && selectedCatalog && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                      {selectedCatalog.codigo}
                    </span>
                    <span className="text-sm font-semibold">{selectedCatalog.descripcion}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setShowAddForm(false); setSelectedCatalog(null); }}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Restriction alert */}
                {restriction && (
                  <div className={cn(
                    "flex items-start gap-2.5 p-3 rounded-xl text-xs",
                    restriction.type === "warning"
                      ? "bg-warning/10 border border-warning/20"
                      : "bg-primary/[0.04] border border-primary/15"
                  )}>
                    <ShieldAlert className={cn(
                      "h-4 w-4 mt-0.5 shrink-0",
                      restriction.type === "warning" ? "text-warning" : "text-primary"
                    )} />
                    <div>
                      <p className={cn(
                        "font-semibold mb-0.5",
                        restriction.type === "warning" ? "text-warning" : "text-primary"
                      )}>
                        {restriction.type === "warning" ? "Restricción normativa" : "Nota clínica"}
                      </p>
                      <p className="text-muted-foreground leading-relaxed">{restriction.note}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Severidad *</Label>
                    <Select defaultValue="moderado">
                      <SelectTrigger className="rounded-xl h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="leve">Leve</SelectItem>
                        <SelectItem value="moderado">Moderado</SelectItem>
                        <SelectItem value="severo">Severo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Piezas afectadas</Label>
                    <Input placeholder="Ej: 22, 36" className="rounded-xl h-9 text-sm" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Notas clínicas</Label>
                  <Textarea placeholder="Observaciones adicionales del diagnóstico…" rows={2} className="rounded-xl resize-none text-sm" />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" className="rounded-xl h-8 text-xs" onClick={() => { setShowAddForm(false); setSelectedCatalog(null); }}>
                    Cancelar
                  </Button>
                  <Button size="sm" className="rounded-xl h-8 text-xs gap-1.5" onClick={handleAddDiagnostico}>
                    <Plus className="h-3.5 w-3.5" /> Agregar diagnóstico
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Clasificación clínica */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5 space-y-4">
          <SectionHeader title="Clasificación de la consulta" icon={Stethoscope} size="sm" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ClassificationField
              label="Tipo de actividad"
              value={tipoActividad}
              onChange={setTipoActividad}
              options={TIPO_ACTIVIDAD}
              required
              help="Clasifique la actividad realizada según la normativa vigente"
            />
            <ClassificationField
              label="Tipo de consulta"
              value={tipoConsulta}
              onChange={setTipoConsulta}
              options={TIPO_CONSULTA}
              required
              help="Indique si es primera vez o seguimiento"
            />
            <ClassificationField
              label="Finalidad"
              value={finalidad}
              onChange={setFinalidad}
              options={FINALIDAD}
              required
            />
            <ClassificationField
              label="Causa externa"
              value={causaExterna}
              onChange={setCausaExterna}
              options={CAUSA_EXTERNA}
              required
            />
            <ClassificationField
              label="Tipo de diagnóstico"
              value={tipoDiagnostico}
              onChange={setTipoDiagnostico}
              options={TIPO_DIAGNOSTICO}
              required
              help="Seleccione el nivel de certeza del diagnóstico"
            />
            <ClassificationField
              label="Especialidad de remisión"
              value={especialidadRemision}
              onChange={setEspecialidadRemision}
              options={ESPECIALIDAD_REMISION}
            />
          </div>

          {especialidadRemision !== "ninguna" && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-primary/[0.04] border border-primary/15 text-xs">
              <ArrowRight className="h-4 w-4 text-primary shrink-0" />
              <div>
                <p className="font-semibold text-primary">Remisión activa</p>
                <p className="text-muted-foreground">
                  El paciente será remitido a{" "}
                  <span className="font-medium text-foreground">
                    {ESPECIALIDAD_REMISION.find((e) => e.value === especialidadRemision)?.label}
                  </span>
                  . Recuerde adjuntar historia clínica resumida y ayudas diagnósticas.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validation summary */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <ValidationPill ok={!!principal} label="Dx principal" />
            <ValidationPill ok={tipoActividad !== ""} label="Tipo actividad" />
            <ValidationPill ok={tipoConsulta !== ""} label="Tipo consulta" />
            <ValidationPill ok={finalidad !== ""} label="Finalidad" />
            <ValidationPill ok={causaExterna !== ""} label="Causa externa" />
            <ValidationPill ok={tipoDiagnostico !== ""} label="Tipo Dx" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Helpers ──────────────────────────────────── */

function ClassificationField({
  label,
  value,
  onChange,
  options,
  required,
  help,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  help?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        {required && <span className="text-destructive text-[10px]">*</span>}
        {help && (
          <div className="group relative">
            <HelpCircle className="h-3 w-3 text-muted-foreground/50 cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-10 w-48 p-2 rounded-lg bg-popover border border-border shadow-md text-[10px] text-muted-foreground leading-relaxed">
              {help}
            </div>
          </div>
        )}
      </div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="rounded-xl h-9 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ValidationPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className={cn(
      "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors",
      ok ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
    )}>
      {ok ? <CheckCircle2 className="h-3 w-3" /> : <X className="h-3 w-3" />}
      {label}
    </div>
  );
}

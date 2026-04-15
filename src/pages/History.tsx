import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/data/StoreContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ClinicalStatusBadge, SummaryPanel, SectionHeader } from "@/components/clinical";
import type { ClinicalRecordStatus } from "@/components/clinical";
import type { HistoriaEstado, HistoriaOdontologica, VersionHistoria } from "@/data/clinicalTypes";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Search,
  Clock,
  FileText,
  FolderOpen,
  CalendarDays,
  ShieldCheck,
  Ban,
  History as HistoryIcon,
  ChevronRight,
  GitCompareArrows,
  Eye,
  Printer,
  Download,
  Filter,
  User,
  Activity,
  Stethoscope,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
} from "lucide-react";

type StatusFilter = "all" | "en_progreso" | "cerrada" | "anulada" | "borrador";
type SortBy = "updated" | "created" | "patient";

const estadoToStatus: Record<HistoriaEstado, ClinicalRecordStatus> = {
  borrador: "draft",
  en_progreso: "in_progress",
  cerrada: "closed",
  anulada: "voided",
};

const estadoLabel: Record<HistoriaEstado, string> = {
  borrador: "Borrador",
  en_progreso: "En progreso",
  cerrada: "Cerrada",
  anulada: "Anulada",
};

export default function History() {
  const store = useAppStore();
  const navigate = useNavigate();
  const { clinical } = store;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("updated");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);

  // Enrich historias with patient data
  const enriched = useMemo(() => {
    return clinical.historias.map((h) => {
      const patient = store.patients.find((p) => p.id === h.patientId);
      const diagnosticos = clinical.getDiagnosticosByHistoria(h.id);
      const versiones = clinical.getVersionesByHistoria(h.id);
      const odontograma = clinical.getOdontograma(h.odontogramaId);
      const notas = clinical.getNotasByHistoria(h.id);
      return { historia: h, patient, diagnosticos, versiones, odontograma, notas };
    });
  }, [clinical, store.patients]);

  // Filter & sort
  const filtered = useMemo(() => {
    let list = enriched;

    if (statusFilter !== "all") {
      list = list.filter((e) => e.historia.estado === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.patient?.name.toLowerCase().includes(q) ||
          e.patient?.cedula?.toLowerCase().includes(q) ||
          e.historia.id.toLowerCase().includes(q) ||
          e.historia.detalle.motivoConsulta.toLowerCase().includes(q) ||
          e.diagnosticos.some((d) => d.descripcion.toLowerCase().includes(q) || d.codigo.toLowerCase().includes(q))
      );
    }

    if (dateFrom) {
      list = list.filter((e) => e.historia.actualizadoEn >= dateFrom);
    }
    if (dateTo) {
      list = list.filter((e) => e.historia.actualizadoEn <= dateTo);
    }

    // Sort
    list = [...list].sort((a, b) => {
      if (sortBy === "updated") return b.historia.actualizadoEn.localeCompare(a.historia.actualizadoEn);
      if (sortBy === "created") return b.historia.creadoEn.localeCompare(a.historia.creadoEn);
      return (a.patient?.name || "").localeCompare(b.patient?.name || "");
    });

    return list;
  }, [enriched, statusFilter, search, dateFrom, dateTo, sortBy]);

  // Stats
  const stats = useMemo(() => {
    const total = clinical.historias.length;
    const enProgreso = clinical.historias.filter((h) => h.estado === "en_progreso").length;
    const cerradas = clinical.historias.filter((h) => h.estado === "cerrada").length;
    const anuladas = clinical.historias.filter((h) => h.estado === "anulada").length;
    return { total, enProgreso, cerradas, anuladas };
  }, [clinical.historias]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
    setCompareMode(false);
    setSelectedVersions([]);
  };

  const toggleVersionSelect = (vId: string) => {
    setSelectedVersions((prev) =>
      prev.includes(vId)
        ? prev.filter((v) => v !== vId)
        : prev.length < 2
        ? [...prev, vId]
        : [prev[1], vId]
    );
  };

  return (
    <div className="page-container space-y-5">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Histórico y Versiones</h1>
          <p className="page-subtitle">Auditoría clínica — todas las historias odontológicas del consultorio</p>
        </div>
      </div>

      {/* Summary */}
      <SummaryPanel
        items={[
          { label: "Total historias", value: stats.total, icon: FileText, accent: "primary" },
          { label: "En progreso", value: stats.enProgreso, icon: Activity, accent: "warning" },
          { label: "Cerradas", value: stats.cerradas, icon: ShieldCheck, accent: "success" },
          { label: "Anuladas", value: stats.anuladas, icon: Ban, accent: "destructive" },
        ]}
      />

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por paciente, cédula, diagnóstico, motivo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 rounded-xl border-border/60"
              />
            </div>
            <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
              <TabsList className="h-10 rounded-xl">
                <TabsTrigger value="all" className="rounded-lg text-xs px-3">Todas</TabsTrigger>
                <TabsTrigger value="en_progreso" className="rounded-lg text-xs px-3">En progreso</TabsTrigger>
                <TabsTrigger value="cerrada" className="rounded-lg text-xs px-3">Cerradas</TabsTrigger>
                <TabsTrigger value="anulada" className="rounded-lg text-xs px-3">Anuladas</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Date range & sort */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Desde</span>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-8 w-36 rounded-lg text-xs"
              />
              <span className="text-xs text-muted-foreground">hasta</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-8 w-36 rounded-lg text-xs"
              />
            </div>
            <div className="flex items-center gap-1.5 ml-auto">
              <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="h-8 rounded-lg border border-input bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="updated">Última actualización</option>
                <option value="created">Fecha de creación</option>
                <option value="patient">Paciente (A-Z)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {filtered.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-14 text-center">
            <Search className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-1">
              {search ? `Sin resultados para "${search}"` : "No hay historias con estos filtros"}
            </p>
            {(search || statusFilter !== "all" || dateFrom || dateTo) && (
              <button
                onClick={() => { setSearch(""); setStatusFilter("all"); setDateFrom(""); setDateTo(""); }}
                className="text-xs text-primary font-medium hover:underline"
              >
                Limpiar filtros
              </button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">{filtered.length} historia{filtered.length !== 1 ? "s" : ""} encontrada{filtered.length !== 1 ? "s" : ""}</p>

          {filtered.map(({ historia, patient, diagnosticos, versiones, odontograma, notas }) => {
            const isExpanded = expandedId === historia.id;
            const treatedTeeth = odontograma?.piezas.filter((p) => p.condicion !== "sano") || [];

            return (
              <Card key={historia.id} className={cn("border-0 shadow-sm transition-shadow", isExpanded && "shadow-md ring-1 ring-primary/10")}>
                <CardContent className="p-0">
                  {/* Row header */}
                  <button
                    onClick={() => toggleExpand(historia.id)}
                    className="w-full flex items-start gap-4 px-5 py-4 hover:bg-accent/30 transition-colors text-left"
                  >
                    {/* Avatar */}
                    <div className="h-10 w-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-primary font-semibold text-xs">
                        {patient?.name.split(" ").map((n) => n[0]).join("").slice(0, 2) || "??"}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold">{patient?.name || "Paciente desconocido"}</span>
                        <ClinicalStatusBadge status={estadoToStatus[historia.estado]} variant="pill" />
                        {historia.estado === "anulada" && (
                          <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-destructive/30 text-destructive font-normal">
                            Anulada
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        {patient?.cedula && <span>Céd: {patient.cedula}</span>}
                        <span>HC: {historia.id}</span>
                        <span>Creada: {new Date(historia.creadoEn).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}</span>
                        <span>Actualizada: {new Date(historia.actualizadoEn).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>
                      <p className="text-xs text-muted-foreground/80 truncate">
                        {historia.detalle.motivoConsulta}
                      </p>
                    </div>

                    {/* Quick stats */}
                    <div className="hidden sm:flex items-center gap-4 shrink-0 text-xs text-muted-foreground">
                      <div className="text-center">
                        <p className="font-semibold text-foreground">{diagnosticos.length}</p>
                        <p className="text-[10px]">Dx</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-foreground">{versiones.length}</p>
                        <p className="text-[10px]">Versiones</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-foreground">{treatedTeeth.length}</p>
                        <p className="text-[10px]">Piezas</p>
                      </div>
                      <ChevronRight className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-90")} />
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t border-border/60 px-5 py-4 space-y-4 bg-muted/10">
                      {/* Action bar */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          variant="default"
                          size="sm"
                          className="rounded-xl gap-1.5 h-8 text-xs"
                          onClick={() => navigate(`/patients/${historia.patientId}/historia/${historia.id}`)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          {historia.estado === "cerrada" || historia.estado === "anulada" ? "Ver (solo lectura)" : "Abrir workspace"}
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-xl gap-1.5 h-8 text-xs" onClick={() => toast.info("Exportación en desarrollo")}>
                          <Download className="h-3.5 w-3.5" /> Exportar PDF
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-xl gap-1.5 h-8 text-xs" onClick={() => { window.print(); }}>
                          <Printer className="h-3.5 w-3.5" /> Imprimir
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-xl gap-1.5 h-8 text-xs"
                          onClick={() => navigate(`/patients/${historia.patientId}`)}
                        >
                          <User className="h-3.5 w-3.5" /> Ver paciente
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Clinical summary */}
                        <div className="space-y-3">
                          <SectionHeader title="Resumen clínico" icon={Stethoscope} size="sm" />

                          <div className="rounded-xl bg-background border border-border/50 p-3 space-y-2 text-sm">
                            <div>
                              <p className="text-[11px] text-muted-foreground">Motivo de consulta</p>
                              <p className="text-xs font-medium">{historia.detalle.motivoConsulta}</p>
                            </div>
                            <Separator className="my-1" />
                            <div>
                              <p className="text-[11px] text-muted-foreground">Plan de tratamiento</p>
                              <p className="text-xs whitespace-pre-line">{historia.detalle.planTratamiento || "No definido"}</p>
                            </div>
                            <Separator className="my-1" />
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-[11px] text-muted-foreground">ASA</p>
                                <p className="text-xs font-medium">{historia.clasificacion.asa.replace("_", " ")}</p>
                              </div>
                              <div>
                                <p className="text-[11px] text-muted-foreground">Riesgo</p>
                                <p className={cn("text-xs font-medium",
                                  historia.indicadores.riesgoGeneral === "alto" ? "text-destructive" :
                                  historia.indicadores.riesgoGeneral === "medio" ? "text-warning" : "text-success"
                                )}>
                                  {historia.indicadores.riesgoGeneral.charAt(0).toUpperCase() + historia.indicadores.riesgoGeneral.slice(1)}
                                </p>
                              </div>
                              <div>
                                <p className="text-[11px] text-muted-foreground">Alergias</p>
                                <p className="text-xs">{historia.clasificacion.alergias.length > 0 ? historia.clasificacion.alergias.join(", ") : "Ninguna"}</p>
                              </div>
                              <div>
                                <p className="text-[11px] text-muted-foreground">Piezas tratadas</p>
                                <p className="text-xs font-medium">{historia.indicadores.piezasTratadas}</p>
                              </div>
                            </div>
                          </div>

                          {/* Diagnostics */}
                          {diagnosticos.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs font-semibold text-muted-foreground">Diagnósticos ({diagnosticos.length})</p>
                              <div className="space-y-1.5">
                                {diagnosticos.map((dx) => (
                                  <div key={dx.id} className="flex items-start gap-2 p-2 rounded-lg bg-background border border-border/40 text-xs">
                                    <div className={cn(
                                      "h-1.5 w-1.5 rounded-full mt-1.5 shrink-0",
                                      dx.severidad === "severo" ? "bg-destructive" :
                                      dx.severidad === "moderado" ? "bg-warning" : "bg-success"
                                    )} />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-medium">{dx.descripcion}</span>
                                        <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1 rounded">{dx.codigo}</span>
                                      </div>
                                      {dx.piezas.length > 0 && (
                                        <p className="text-[10px] text-muted-foreground mt-0.5">Piezas: {dx.piezas.join(", ")}</p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Odontogram summary */}
                          {treatedTeeth.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs font-semibold text-muted-foreground">Odontograma — piezas con hallazgos</p>
                              <div className="flex flex-wrap gap-1.5">
                                {treatedTeeth.map((p) => (
                                  <div key={p.numero} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-background border border-border/40 text-[11px]">
                                    <span className="font-mono font-bold">{p.numero}</span>
                                    <span className={cn(
                                      "capitalize",
                                      p.condicion === "caries" ? "text-destructive" :
                                      p.condicion === "ausente" ? "text-muted-foreground" : "text-foreground"
                                    )}>{p.condicion}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Version history */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <SectionHeader title="Historial de versiones" icon={HistoryIcon} size="sm" />
                            {versiones.length >= 2 && (
                              <Button
                                variant={compareMode ? "default" : "outline"}
                                size="sm"
                                className="rounded-xl gap-1.5 h-7 text-[11px]"
                                onClick={() => { setCompareMode(!compareMode); setSelectedVersions([]); }}
                              >
                                <GitCompareArrows className="h-3 w-3" />
                                {compareMode ? "Cancelar" : "Comparar"}
                              </Button>
                            )}
                          </div>

                          {compareMode && (
                            <p className="text-[11px] text-primary font-medium">
                              Seleccione 2 versiones para comparar ({selectedVersions.length}/2)
                            </p>
                          )}

                          <div className="relative">
                            {/* Timeline line */}
                            <div className="absolute left-[15px] top-3 bottom-3 w-px bg-border" />

                            <div className="space-y-0">
                              {versiones.map((v, idx) => {
                                const isSelected = selectedVersions.includes(v.id);
                                return (
                                  <div
                                    key={v.id}
                                    className={cn(
                                      "relative flex items-start gap-3 py-2.5 pl-1 pr-2 rounded-lg transition-colors",
                                      compareMode && "cursor-pointer hover:bg-primary/5",
                                      isSelected && "bg-primary/8"
                                    )}
                                    onClick={() => compareMode && toggleVersionSelect(v.id)}
                                  >
                                    {/* Timeline dot */}
                                    <div className={cn(
                                      "relative z-10 h-[30px] w-[30px] rounded-full border-2 flex items-center justify-center shrink-0 text-[10px] font-bold",
                                      idx === 0
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-border bg-background text-muted-foreground",
                                      isSelected && "border-primary bg-primary text-primary-foreground"
                                    )}>
                                      {compareMode && isSelected ? "✓" : `v${v.version}`}
                                    </div>

                                    <div className="flex-1 min-w-0 pt-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs font-semibold">{v.resumenCambios}</span>
                                      </div>
                                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                                        <span>{v.autor}</span>
                                        <span>•</span>
                                        <span>{new Date(v.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Comparison panel */}
                          {compareMode && selectedVersions.length === 2 && (
                            <VersionComparison
                              versions={versiones}
                              selectedIds={selectedVersions}
                              historia={historia}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Version Comparison Panel ───────────────── */

function VersionComparison({
  versions,
  selectedIds,
  historia,
}: {
  versions: VersionHistoria[];
  selectedIds: string[];
  historia: HistoriaOdontologica;
}) {
  const v1 = versions.find((v) => v.id === selectedIds[0]);
  const v2 = versions.find((v) => v.id === selectedIds[1]);

  if (!v1 || !v2) return null;

  const [older, newer] = v1.version < v2.version ? [v1, v2] : [v2, v1];

  // Simulated diff based on version metadata
  const diffItems = [
    {
      section: "Cambios en versión " + newer.version,
      detail: newer.resumenCambios,
      type: "modified" as const,
    },
    ...(older.version === 1
      ? [{ section: "Creación inicial", detail: older.resumenCambios, type: "added" as const }]
      : [{ section: "Estado previo (v" + older.version + ")", detail: older.resumenCambios, type: "context" as const }]
    ),
  ];

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/[0.02] p-4 space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-primary">
        <GitCompareArrows className="h-4 w-4" />
        Comparación: v{older.version} → v{newer.version}
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg bg-background border border-border/50 p-3">
          <p className="text-[10px] text-muted-foreground font-medium mb-1">Versión {older.version}</p>
          <p className="font-medium">{older.resumenCambios}</p>
          <p className="text-[10px] text-muted-foreground mt-1">{older.autor} • {new Date(older.fecha).toLocaleDateString("es-ES")}</p>
        </div>
        <div className="rounded-lg bg-background border border-primary/20 p-3">
          <p className="text-[10px] text-primary font-medium mb-1">Versión {newer.version} (nueva)</p>
          <p className="font-medium">{newer.resumenCambios}</p>
          <p className="text-[10px] text-muted-foreground mt-1">{newer.autor} • {new Date(newer.fecha).toLocaleDateString("es-ES")}</p>
        </div>
      </div>

      <div className="space-y-1.5">
        {diffItems.map((d, i) => (
          <div key={i} className={cn(
            "flex items-start gap-2 p-2 rounded-lg text-xs",
            d.type === "added" ? "bg-success/5 border border-success/20" :
            d.type === "modified" ? "bg-warning/5 border border-warning/20" :
            "bg-muted/40 border border-border/40"
          )}>
            {d.type === "added" ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
            ) : d.type === "modified" ? (
              <Activity className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
            ) : (
              <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-medium">{d.section}</p>
              <p className="text-muted-foreground mt-0.5">{d.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground italic">
        La comparación detallada campo a campo estará disponible cuando se conecte a Lovable Cloud.
      </p>
    </div>
  );
}

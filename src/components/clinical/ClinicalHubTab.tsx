import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/data/StoreContext";
import { useAuth } from "@/contexts/AuthContext";
import { ClinicalStatusBadge, ClinicalAlert, SectionHeader } from "@/components/clinical";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardList,
  Plus,
  FileText,
  Mic,
  Sparkles,
  ShieldAlert,
  Stethoscope,
  History,
  StickyNote,
  Activity,
  Layers,
  Brain,
  Heart,
  Syringe,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/* ── Specialty config ──────────────────────────── */

interface SpecialtyConfig {
  code: string;
  label: string;
  icon: React.ElementType;
  color: string;       // tailwind bg class token
  textColor: string;   // tailwind text class token
  active: boolean;
}

const ALL_SPECIALTIES: SpecialtyConfig[] = [
  { code: "odontologia", label: "Odontología", icon: Activity, color: "bg-primary/10", textColor: "text-primary", active: true },
  { code: "medicina", label: "Medicina General", icon: Heart, color: "bg-rose-500/10", textColor: "text-rose-500", active: false },
  { code: "psicologia", label: "Psicología", icon: Brain, color: "bg-violet-500/10", textColor: "text-violet-500", active: false },
  { code: "enfermeria", label: "Enfermería", icon: Syringe, color: "bg-emerald-500/10", textColor: "text-emerald-500", active: false },
];

/* ── Main component ────────────────────────────── */

interface Props {
  patientId: string;
}

export function ClinicalHubTab({ patientId }: Props) {
  const { clinical } = useAppStore();
  const { accessibleSpecialties } = useAuth();
  const navigate = useNavigate();

  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);

  const historia = clinical.getHistoriaByPatient(patientId);
  const diagnosticos = historia ? clinical.getDiagnosticosByHistoria(historia.id) : [];
  const notas = historia ? clinical.getNotasByHistoria(historia.id) : [];
  const versiones = historia ? clinical.getVersionesByHistoria(historia.id) : [];
  const odontograma = historia ? clinical.getOdontograma(historia.odontogramaId) : null;

  const hasHistoria = !!historia;

  const badgeStatus = historia
    ? ({ borrador: "draft", en_progreso: "in_progress", cerrada: "closed", anulada: "voided" } as const)[historia.estado]
    : undefined;

  // Show specialties that are active OR that the user has access to
  const visibleSpecialties = ALL_SPECIALTIES.filter(
    (s) => s.active || accessibleSpecialties.includes(s.code)
  );

  // Currently only odontologia has data — this simulates per-specialty history lookup
  const specialtyHistories: Record<string, { count: number; lastDate?: string }> = {};
  if (hasHistoria) {
    specialtyHistories["odontologia"] = {
      count: 1,
      lastDate: historia.actualizadoEn,
    };
  }

  const filteredView = selectedSpecialty === null || selectedSpecialty === "odontologia";

  return (
    <div className="space-y-4">
      {/* ── Specialty selector ──────────────────── */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <SectionHeader title="Especialidades" icon={Layers} size="sm" />
            <Button
              size="sm"
              className="rounded-xl gap-1.5 h-8 text-xs"
              onClick={() => toast.info("Iniciar nueva atención — en desarrollo")}
            >
              <Plus className="h-3.5 w-3.5" /> Nueva atención
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* All / global view */}
            <button
              onClick={() => setSelectedSpecialty(null)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                selectedSpecialty === null
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
              )}
            >
              <ClipboardList className="h-3.5 w-3.5" />
              Todo
            </button>

            {visibleSpecialties.map((spec) => {
              const Icon = spec.icon;
              const isSelected = selectedSpecialty === spec.code;
              const historyData = specialtyHistories[spec.code];
              return (
                <button
                  key={spec.code}
                  onClick={() => spec.active ? setSelectedSpecialty(spec.code) : toast.info(`${spec.label} — próximamente`)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border relative",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary"
                      : spec.active
                        ? "bg-muted/50 text-foreground border-transparent hover:bg-muted"
                        : "bg-muted/30 text-muted-foreground border-transparent opacity-60 cursor-default"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {spec.label}
                  {historyData && (
                    <span className={cn(
                      "ml-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                      isSelected ? "bg-white/20" : "bg-primary/10 text-primary"
                    )}>
                      {historyData.count}
                    </span>
                  )}
                  {!spec.active && (
                    <span className="text-[9px] ml-0.5 opacity-70">Próx.</span>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Clinical content ──────────────────── */}
      {hasHistoria && filteredView ? (
        <>
          {/* Alerts */}
          {historia.clasificacion.alergias.length > 0 && (
            <ClinicalAlert
              type="risk"
              title="Alergias registradas"
              description={historia.clasificacion.alergias.join(", ")}
            />
          )}
          {historia.indicadores.riesgoGeneral === "alto" && (
            <ClinicalAlert
              type="risk"
              title="Paciente de alto riesgo"
              description="Este paciente requiere protocolo especial de atención."
            />
          )}

          {/* Active history card with specialty badge */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SectionHeader title="Historia clínica" icon={ShieldAlert} size="sm" />
                  <Badge variant="outline" className="gap-1 text-[10px] h-5 rounded-full border-primary/30 text-primary">
                    <Activity className="h-3 w-3" /> Odontología
                  </Badge>
                </div>
                {badgeStatus && <ClinicalStatusBadge status={badgeStatus} variant="pill" />}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl bg-muted/50 px-3 py-2.5 text-center">
                  <p className="text-lg font-bold">{historia.indicadores.piezasTratadas}</p>
                  <p className="text-[10px] text-muted-foreground">Piezas tratadas</p>
                </div>
                <div className="rounded-xl bg-muted/50 px-3 py-2.5 text-center">
                  <p className={cn("text-lg font-bold", historia.indicadores.procedimientosPendientes > 0 ? "text-warning" : "text-success")}>
                    {historia.indicadores.procedimientosPendientes}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Pendientes</p>
                </div>
                <div className="rounded-xl bg-muted/50 px-3 py-2.5 text-center">
                  <p className="text-lg font-bold">
                    {new Date(historia.indicadores.ultimaVisita).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Última visita</p>
                </div>
                <div className="rounded-xl bg-muted/50 px-3 py-2.5 text-center">
                  <p className={cn(
                    "text-lg font-bold",
                    historia.indicadores.riesgoGeneral === "alto" ? "text-destructive" :
                    historia.indicadores.riesgoGeneral === "medio" ? "text-warning" : "text-success"
                  )}>
                    {historia.indicadores.riesgoGeneral.charAt(0).toUpperCase() + historia.indicadores.riesgoGeneral.slice(1)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Riesgo</p>
                </div>
              </div>

              <Separator className="my-1" />

              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div>
                  <p className="text-[11px] text-muted-foreground">Clasificación ASA</p>
                  <p className="font-medium">{historia.clasificacion.asa.replace("_", " ")}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Alergias</p>
                  <p className="font-medium">
                    {historia.clasificacion.alergias.length > 0
                      ? historia.clasificacion.alergias.join(", ")
                      : "Ninguna registrada"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Enfermedades crónicas</p>
                  <p className="font-medium">
                    {historia.clasificacion.enfermedadesCronicas.length > 0
                      ? historia.clasificacion.enfermedadesCronicas.join(", ")
                      : "Ninguna"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Medicamentos actuales</p>
                  <p className="font-medium">
                    {historia.clasificacion.medicamentosActuales.length > 0
                      ? historia.clasificacion.medicamentosActuales.join(", ")
                      : "Ninguno"}
                  </p>
                </div>
              </div>

              <Separator className="my-1" />

              <div className="text-sm space-y-2">
                <div>
                  <p className="text-[11px] text-muted-foreground">Motivo de consulta</p>
                  <p className="font-medium">{historia.detalle.motivoConsulta}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Exploración clínica</p>
                  <p className="text-muted-foreground">{historia.detalle.exploracionClinica}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Button variant="outline" size="sm" className="rounded-xl gap-1.5 h-9 text-xs justify-start" onClick={() => navigate(`/patients/${patientId}/historia/${historia.id}`)}>
                  <ClipboardList className="h-3.5 w-3.5 text-primary" /> Ver historia completa
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl gap-1.5 h-9 text-xs justify-start" onClick={() => navigate(`/notes?patient=${patientId}`)}>
                  <StickyNote className="h-3.5 w-3.5 text-primary" /> Nueva nota corta
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl gap-1.5 h-9 text-xs justify-start" onClick={() => navigate("/history")}>
                  <History className="h-3.5 w-3.5 text-primary" /> Histórico y versiones
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl gap-1.5 h-9 text-xs justify-start" onClick={() => navigate(`/patients/${patientId}/historia/${historia.id}`)}>
                  <Activity className="h-3.5 w-3.5 text-primary" /> Odontograma
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Diagnostics */}
          {diagnosticos.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5 space-y-3">
                <SectionHeader title="Diagnósticos activos" icon={Stethoscope} size="sm" />
                <div className="space-y-2">
                  {diagnosticos.map((dx) => (
                    <div key={dx.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/40">
                      <div className={cn(
                        "h-2 w-2 rounded-full mt-1.5 shrink-0",
                        dx.severidad === "severo" ? "bg-destructive" :
                        dx.severidad === "moderado" ? "bg-warning" : "bg-success"
                      )} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
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
              </CardContent>
            </Card>
          )}

          {/* Recent notes */}
          {notas.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5 space-y-3">
                <SectionHeader title="Notas clínicas recientes" icon={StickyNote} size="sm" />
                <div className="space-y-2">
                  {notas.slice(0, 3).map((n) => (
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
              </CardContent>
            </Card>
          )}

          {/* Odontogram summary */}
          {odontograma && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <SectionHeader title="Odontograma" icon={Activity} size="sm" />
                  <Badge variant="outline" className="text-[9px] h-4 rounded-full border-primary/30 text-primary">Odontología</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {odontograma.piezas
                    .filter((p) => p.condicion !== "sano")
                    .map((p) => (
                      <div key={p.numero} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted/50 text-xs">
                        <span className="font-mono font-bold">{p.numero}</span>
                        <span className={cn(
                          "capitalize",
                          p.condicion === "caries" ? "text-destructive" :
                          p.condicion === "ausente" ? "text-muted-foreground" : "text-foreground"
                        )}>
                          {p.condicion}
                        </span>
                      </div>
                    ))}
                </div>
                {odontograma.eventos.length > 0 && (
                  <>
                    <Separator />
                    <p className="text-[11px] text-muted-foreground">
                      {odontograma.eventos.length} evento{odontograma.eventos.length !== 1 ? "s" : ""} registrado{odontograma.eventos.length !== 1 ? "s" : ""} • Último:{" "}
                      {new Date(odontograma.eventos[odontograma.eventos.length - 1].fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Version history */}
          {versiones.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5 space-y-3">
                <SectionHeader title="Historial de versiones" icon={History} size="sm" />
                <div className="space-y-1.5">
                  {versiones.map((v) => (
                    <div key={v.id} className="flex items-center gap-3 text-xs py-1.5">
                      <span className="font-mono text-muted-foreground w-8">v{v.version}</span>
                      <span className="text-muted-foreground w-20">
                        {new Date(v.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                      </span>
                      <span className="flex-1">{v.resumenCambios}</span>
                      <span className="text-muted-foreground">{v.autor}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Voice input placeholder */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-accent/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <CardContent className="p-5 relative">
              <div className="flex items-start gap-4">
                <button disabled className="h-12 w-12 rounded-2xl bg-primary/10 border-2 border-dashed border-primary/25 flex items-center justify-center shrink-0 cursor-not-allowed">
                  <Mic className="h-5 w-5 text-primary" />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold">Notas por voz</p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      <Sparkles className="h-3 w-3" /> AI
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Dicta notas clínicas durante la consulta y se transcribirán automáticamente.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3 ml-16 opacity-40">
                {[3, 5, 8, 4, 7, 10, 6, 3, 8, 5, 9, 4, 7, 3, 6, 8, 5, 4, 7, 9, 5, 3, 6, 4].map((h, i) => (
                  <div key={i} className="w-1 rounded-full bg-primary" style={{ height: `${h * 2}px` }} />
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : selectedSpecialty && selectedSpecialty !== "odontologia" ? (
        /* Specialty placeholder — future */
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto">
              {(() => {
                const spec = ALL_SPECIALTIES.find((s) => s.code === selectedSpecialty);
                const Icon = spec?.icon || Stethoscope;
                return <Icon className="h-7 w-7 text-muted-foreground" />;
              })()}
            </div>
            <div>
              <h3 className="text-base font-semibold">
                {ALL_SPECIALTIES.find((s) => s.code === selectedSpecialty)?.label || "Especialidad"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                Este módulo clínico estará disponible próximamente. La plataforma está preparada para integrarlo.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* No clinical history yet */
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <ClipboardList className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Sin historias clínicas</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                Este paciente aún no tiene historias clínicas registradas. Inicia una nueva atención para comenzar.
              </p>
            </div>
            <Button className="rounded-xl gap-1.5" onClick={() => toast.info("Iniciar atención — en desarrollo")}>
              <Plus className="h-4 w-4" /> Nueva atención clínica
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

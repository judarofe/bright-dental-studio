import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/data/StoreContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ClinicalStatusBadge, SummaryPanel } from "@/components/clinical";
import { SPECIALTY_META, type SpecialtyCode } from "@/lib/clinicalSections";
import type { ClinicalRecordStatus } from "@/components/clinical";
import type { HistoriaEstado } from "@/data/clinicalTypes";
import {
  Search,
  Phone,
  ChevronRight,
  CalendarCheck,
  Users,
  FilePlus,
  StickyNote,
  FolderOpen,
  AlertTriangle,
  Clock,
  FileText,
  Activity,
  Stethoscope,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type FilterTab = "all" | "today" | "recent";
type SpecialtyFilter = "todas" | SpecialtyCode;

const estadoToStatus: Record<HistoriaEstado, ClinicalRecordStatus> = {
  borrador: "draft",
  en_progreso: "in_progress",
  cerrada: "closed",
  anulada: "voided",
};

const ALL_SPECIALTIES = Object.values(SPECIALTY_META);

export default function ClinicalHistory() {
  const store = useAppStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<FilterTab>("all");
  const [specialtyFilter, setSpecialtyFilter] = useState<SpecialtyFilter>("todas");

  const today = new Date().toISOString().split("T")[0];

  const todayAppointments = useMemo(
    () => store.getAppointmentsForDate(today),
    [store, today]
  );

  const todayPatientIds = useMemo(
    () => new Set(todayAppointments.map((a) => a.patientId)),
    [todayAppointments]
  );

  const filtered = useMemo(() => {
    let list = store.patients;

    if (tab === "today") {
      list = list.filter((p) => todayPatientIds.has(p.id));
    } else if (tab === "recent") {
      const recentIds = new Set(
        store.appointments
          .filter((a) => a.status === "completed")
          .sort((a, b) => b.date.localeCompare(a.date))
          .slice(0, 10)
          .map((a) => a.patientId)
      );
      list = list.filter((p) => recentIds.has(p.id));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.phone.includes(q) ||
          p.cedula?.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q)
      );
    }

    // Specialty filter: since phase 1 only has odontología data,
    // filtering by other specialties yields empty results
    if (specialtyFilter !== "todas") {
      if (specialtyFilter === "odontologia") {
        list = list.filter((p) => !!store.clinical.getHistoriaByPatient(p.id));
      } else {
        list = []; // no data yet for other specialties
      }
    }

    return list;
  }, [store.patients, store.appointments, store.clinical, search, tab, todayPatientIds, specialtyFilter]);

  const getPatientContext = (patientId: string) => {
    const historia = store.clinical.getHistoriaByPatient(patientId);
    const todayAppt = todayAppointments.find((a) => a.patientId === patientId);
    return { historia, todayAppt };
  };

  const handleNewHistoria = (patientId: string) => {
    const existing = store.clinical.getHistoriaByPatient(patientId);
    if (existing) {
      navigate(`/patients/${patientId}/historia/${existing.id}`);
      return;
    }

    const patient = store.patients.find((p) => p.id === patientId);
    const todayStr = new Date().toISOString().split("T")[0];

    const newHistoria = store.clinical.addHistoria({
      patientId,
      estado: "borrador",
      creadoEn: todayStr,
      actualizadoEn: todayStr,
      detalle: {
        motivoConsulta: "",
        anamnesis: "",
        antecedentesMedicos: "",
        antecedentesOdontologicos: "",
        antecedentesFamiliares: "",
        habitos: "",
        revisionSistemas: "",
        examenFisico: {
          general: "",
          especifico: "",
          signosVitales: {
            presionArterial: "",
            frecuenciaCardiaca: 0,
            frecuenciaRespiratoria: 0,
            temperatura: 0,
            peso: 0,
            talla: 0,
            imc: 0,
          },
          indicadoresOdontologicos: {
            indiceOLeary: 0,
            fluorosis: "normal",
            dientesExaminados: 0,
            superficiesExaminadas: 0,
            superficiesMarcadas: 0,
            copC: 0,
            copO: 0,
            copP: 0,
            copTotal: 0,
            aptoCop: false,
          },
        },
        exploracionClinica: "",
        planTratamiento: "",
      },
      clasificacion: {
        asa: "ASA_I",
        alergias: [],
        enfermedadesCronicas: [],
        medicamentosActuales: [],
      },
      indicadores: {
        piezasTratadas: 0,
        procedimientosPendientes: 0,
        ultimaVisita: todayStr,
        proximaCita: "",
        riesgoGeneral: "bajo",
      },
      odontogramaId: "",
      diagnosticos: [],
      notas: [],
      versiones: [],
    });

    toast.success("Historia clínica creada", {
      description: `${patient?.name || "Paciente"} — Borrador listo para completar`,
    });
    navigate(`/patients/${patientId}/historia/${newHistoria.id}`);
  };

  const handleNewNote = (patientId: string) => {
    toast.info("Funcionalidad próxima", { description: "Crear nota corta" });
  };

  const todayCount = store.patients.filter((p) => todayPatientIds.has(p.id)).length;
  const withHistoria = store.clinical.historias.length;

  return (
    <div className="page-container space-y-5">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-title">Historial Clínico</h1>
          </div>
          <p className="page-subtitle">Historias clínicas de todas las especialidades</p>
        </div>
      </div>

      {/* Summary */}
      <SummaryPanel
        items={[
          { label: "Pacientes hoy", value: todayCount, icon: CalendarCheck, accent: "primary" },
          { label: "Con historia clínica", value: withHistoria, icon: FileText, accent: "success" },
          { label: "Total pacientes", value: store.patients.length, icon: Users, accent: "muted" },
        ]}
      />

      {/* Specialty filter chips */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-muted-foreground mr-1">
              <Stethoscope className="h-3.5 w-3.5" />
              <span className="text-[11px] font-medium uppercase tracking-wider">Especialidad</span>
            </div>

            <button
              onClick={() => setSpecialtyFilter("todas")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                specialtyFilter === "todas"
                  ? "bg-foreground text-background"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted"
              )}
            >
              Todas
            </button>

            {ALL_SPECIALTIES.map((spec) => {
              const Icon = spec.icon;
              const isActive = specialtyFilter === spec.code;
              return (
                <button
                  key={spec.code}
                  onClick={() => setSpecialtyFilter(spec.code)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                    isActive
                      ? cn(spec.color, spec.textColor, "ring-1", spec.borderColor)
                      : spec.active
                      ? "bg-muted/60 text-muted-foreground hover:bg-muted"
                      : "bg-muted/30 text-muted-foreground/50 cursor-default"
                  )}
                  disabled={!spec.active && spec.code !== specialtyFilter}
                >
                  <Icon className="h-3 w-3" />
                  {spec.label}
                  {!spec.active && (
                    <span className="text-[9px] opacity-60">Próx.</span>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Search + Tabs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, cédula, teléfono o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 rounded-xl border-border/60"
          />
        </div>
        <Tabs value={tab} onValueChange={(v) => setTab(v as FilterTab)}>
          <TabsList className="h-10 rounded-xl">
            <TabsTrigger value="all" className="rounded-lg text-xs px-3">Todos</TabsTrigger>
            <TabsTrigger value="today" className="rounded-lg text-xs px-3">Citas hoy</TabsTrigger>
            <TabsTrigger value="recent" className="rounded-lg text-xs px-3">Recientes</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Patient List */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="py-14 text-center">
              {specialtyFilter !== "todas" && !SPECIALTY_META[specialtyFilter as SpecialtyCode]?.active ? (
                <>
                  <Stethoscope className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-1">
                    {SPECIALTY_META[specialtyFilter as SpecialtyCode]?.label} estará disponible próximamente
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    Actualmente solo Odontología tiene historias clínicas activas.
                  </p>
                  <button onClick={() => setSpecialtyFilter("todas")} className="text-xs text-primary font-medium hover:underline mt-2">
                    Ver todas las especialidades
                  </button>
                </>
              ) : (
                <>
                  <Search className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-1">
                    {search ? `Sin resultados para "${search}"` : "No hay pacientes en esta categoría"}
                  </p>
                  {search && (
                    <button onClick={() => setSearch("")} className="text-xs text-primary font-medium hover:underline">
                      Limpiar búsqueda
                    </button>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {filtered.map((p) => {
                const { historia, todayAppt } = getPatientContext(p.id);
                const hasAlert = p.notes?.toLowerCase().includes("sensi") || p.notes?.toLowerCase().includes("alergi");

                // Phase 1: all existing histories are odontología
                const histSpecialty = historia ? SPECIALTY_META.odontologia : null;

                return (
                  <div
                    key={p.id}
                    className="flex items-start gap-4 px-5 py-4 hover:bg-accent/30 transition-colors group"
                  >
                    {/* Avatar */}
                    <div className="h-11 w-11 rounded-xl bg-primary/8 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-primary font-semibold text-xs">
                        {p.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => navigate(`/patients/${p.id}`)}
                          className="text-sm font-semibold hover:text-primary transition-colors"
                        >
                          {p.name}
                        </button>
                        {historia && (
                          <ClinicalStatusBadge status={estadoToStatus[historia.estado]} variant="pill" />
                        )}
                        {/* Specialty badge on each row */}
                        {histSpecialty && (
                          <Badge variant="outline" className={cn(
                            "gap-1 text-[9px] h-4 rounded-full px-1.5 border-0",
                            histSpecialty.color, histSpecialty.textColor
                          )}>
                            <histSpecialty.icon className="h-2.5 w-2.5" />
                            {histSpecialty.label}
                          </Badge>
                        )}
                        {todayAppt && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/8 px-2 py-0.5 rounded-full">
                            <Clock className="h-3 w-3" />
                            {todayAppt.time}
                          </span>
                        )}
                        {hasAlert && (
                          <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {p.cedula && <span>Céd: {p.cedula}</span>}
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {p.phone || "Sin teléfono"}
                        </span>
                        {historia && (
                          <span className="text-muted-foreground/60">
                            Actualizada: {new Date(historia.actualizadoEn).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                          </span>
                        )}
                        <span className="hidden sm:inline">
                          {store.getAppointmentsForPatient(p.id).length} visitas
                        </span>
                      </div>

                      {todayAppt && (
                        <p className="text-xs text-muted-foreground/70 truncate">
                          Motivo: {todayAppt.notes || "Sin motivo registrado"}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                      {historia ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1.5 text-xs rounded-lg"
                          onClick={() => navigate(`/patients/${p.id}/historia/${historia.id}`)}
                        >
                          <FolderOpen className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Abrir</span>
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1.5 text-xs rounded-lg"
                          onClick={() => handleNewHistoria(p.id)}
                        >
                          <FilePlus className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Nueva HC</span>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 text-xs rounded-lg"
                        onClick={() => handleNewNote(p.id)}
                      >
                        <StickyNote className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Nota</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        onClick={() => navigate(`/patients/${p.id}`)}
                      >
                        <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

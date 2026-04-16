import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/data/StoreContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClinicalStatusBadge, SummaryPanel } from "@/components/clinical";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type FilterTab = "all" | "today" | "recent";

const estadoToStatus: Record<HistoriaEstado, ClinicalRecordStatus> = {
  borrador: "draft",
  en_progreso: "in_progress",
  cerrada: "closed",
  anulada: "voided",
};

export default function ClinicalHistory() {
  const store = useAppStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<FilterTab>("all");

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

    // Tab filter
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

    // Search filter
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

    return list;
  }, [store.patients, store.appointments, search, tab, todayPatientIds]);

  const getPatientContext = (patientId: string) => {
    const historia = store.clinical.getHistoriaByPatient(patientId);
    const appts = store.getAppointmentsForPatient(patientId);
    const todayAppt = todayAppointments.find((a) => a.patientId === patientId);
    return { historia, appts, todayAppt };
  };

  const handleNewHistoria = (patientId: string) => {
    const existing = store.clinical.getHistoriaByPatient(patientId);
    if (existing) {
      navigate(`/patients/${patientId}/historia/${existing.id}`);
      return;
    }

    const patient = store.patients.find((p) => p.id === patientId);
    const today = new Date().toISOString().split("T")[0];

    const newHistoria = store.clinical.addHistoria({
      patientId,
      estado: "borrador",
      creadoEn: today,
      actualizadoEn: today,
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
        ultimaVisita: today,
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
            <h1 className="page-title">Atención Clínica</h1>
            <Badge variant="outline" className="gap-1 text-[10px] h-5 rounded-full border-primary/30 text-primary">
              <Activity className="h-3 w-3" /> Odontología
            </Badge>
          </div>
          <p className="page-subtitle">Historias clínicas y atención por especialidad</p>
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
              <Search className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-1">
                {search ? `Sin resultados para "${search}"` : "No hay pacientes en esta categoría"}
              </p>
              {search && (
                <button onClick={() => setSearch("")} className="text-xs text-primary font-medium hover:underline">
                  Limpiar búsqueda
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {filtered.map((p) => {
                const { historia, todayAppt } = getPatientContext(p.id);
                const hasAlert = p.notes?.toLowerCase().includes("sensi") || p.notes?.toLowerCase().includes("alergi");

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

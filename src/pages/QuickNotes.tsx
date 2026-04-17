import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/data/StoreContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { SummaryPanel, SectionHeader } from "@/components/clinical";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { SPECIALTY_META, type SpecialtyCode } from "@/lib/clinicalSections";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { NotaCortaOdontologica, NotaEstado } from "@/data/clinicalTypes";
import {
  Search,
  StickyNote,
  Plus,
  Mic,
  FileText,
  Printer,
  Pencil,
  Ban,
  Save,
  X,
  User,
  CalendarDays,
  Stethoscope,
  ChevronRight,
  Clock,
  CheckCircle2,
} from "lucide-react";

type FilterTab = "all" | "activa" | "anulada";
type SpecialtyFilter = "todas" | SpecialtyCode;

const ALL_SPECIALTIES = Object.values(SPECIALTY_META);

export default function QuickNotes() {
  const store = useAppStore();
  const navigate = useNavigate();
  const { clinical } = store;

  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<FilterTab>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [patientFilter, setPatientFilter] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState<SpecialtyFilter>("todas");

  // Create/Edit state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formPatientId, setFormPatientId] = useState("");
  const [formAppointmentId, setFormAppointmentId] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formDiagnosticoIds, setFormDiagnosticoIds] = useState<string[]>([]);
  const [formSpecialty, setFormSpecialty] = useState<SpecialtyCode>("odontologia");

  // Void confirmation
  const [voidingId, setVoidingId] = useState<string | null>(null);

  // All notes sorted by date
  const allNotas = useMemo(
    () => [...clinical.notasCortas].sort((a, b) => b.fecha.localeCompare(a.fecha)),
    [clinical.notasCortas]
  );

  // Filtered list
  const filtered = useMemo(() => {
    let list = allNotas;

    if (tab === "activa") list = list.filter((n) => n.estado === "activa");
    if (tab === "anulada") list = list.filter((n) => n.estado === "anulada");

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((n) => {
        const patient = store.patients.find((p) => p.id === n.patientId);
        return (
          n.contenido.toLowerCase().includes(q) ||
          n.creadoPor.toLowerCase().includes(q) ||
          patient?.name.toLowerCase().includes(q) ||
          patient?.cedula?.toLowerCase().includes(q)
        );
      });
    }

    if (dateFilter) {
      list = list.filter((n) => n.fecha === dateFilter);
    }

    if (patientFilter) {
      list = list.filter((n) => n.patientId === patientFilter);
    }

    // Specialty filter — phase 1: all existing notes are odontología
    if (specialtyFilter !== "todas") {
      if (specialtyFilter === "odontologia") {
        // keep all (phase 1 assumption)
      } else {
        list = []; // no data for other specialties yet
      }
    }

    return list;
  }, [allNotas, tab, search, dateFilter, patientFilter, specialtyFilter, store.patients]);

  // Stats
  const stats = useMemo(() => ({
    total: allNotas.length,
    activas: allNotas.filter((n) => n.estado === "activa").length,
    anuladas: allNotas.filter((n) => n.estado === "anulada").length,
    hoy: allNotas.filter((n) => n.fecha === new Date().toISOString().split("T")[0]).length,
  }), [allNotas]);

  // Get available appointments for selected patient
  const patientAppointments = useMemo(() => {
    if (!formPatientId) return [];
    return store.getAppointmentsForPatient(formPatientId).slice(0, 10);
  }, [formPatientId, store]);

  // Get diagnoses for the patient's historia
  const patientDiagnosticos = useMemo(() => {
    if (!formPatientId) return [];
    const historia = clinical.getHistoriaByPatient(formPatientId);
    return historia ? clinical.getDiagnosticosByHistoria(historia.id) : [];
  }, [formPatientId, clinical]);

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormPatientId("");
    setFormAppointmentId("");
    setFormContent("");
    setFormDiagnosticoIds([]);
    setFormSpecialty("odontologia");
  };

  const openNew = (patientId?: string, appointmentId?: string) => {
    resetForm();
    if (patientId) setFormPatientId(patientId);
    if (appointmentId) setFormAppointmentId(appointmentId);
    setShowForm(true);
  };

  const openEdit = (nota: NotaCortaOdontologica) => {
    if (nota.estado === "anulada") return;
    setEditingId(nota.id);
    setFormPatientId(nota.patientId);
    setFormAppointmentId(nota.appointmentId || "");
    setFormContent(nota.contenido);
    setFormDiagnosticoIds(nota.diagnosticoIds || []);
    setFormSpecialty("odontologia"); // phase 1
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formPatientId || !formContent.trim()) {
      toast.error("Completa paciente y contenido");
      return;
    }

    const historia = clinical.getHistoriaByPatient(formPatientId);
    const historiaId = historia?.id || "";

    if (editingId) {
      clinical.updateNota(editingId, {
        contenido: formContent,
        appointmentId: formAppointmentId || undefined,
        diagnosticoIds: formDiagnosticoIds.length > 0 ? formDiagnosticoIds : undefined,
      });
      toast.success("Nota actualizada");
    } else {
      clinical.addNota({
        patientId: formPatientId,
        historiaId: historiaId,
        appointmentId: formAppointmentId || undefined,
        diagnosticoIds: formDiagnosticoIds.length > 0 ? formDiagnosticoIds : undefined,
        fecha: new Date().toISOString().split("T")[0],
        contenido: formContent,
        tipo: "texto",
        creadoPor: "Dr. Méndez",
        estado: "activa",
      });
      toast.success("Nota creada");
    }
    resetForm();
  };

  const handleVoid = (id: string) => {
    clinical.updateNota(id, { estado: "anulada" });
    toast("Nota anulada", { description: "La nota fue marcada como anulada" });
    setVoidingId(null);
  };

  const handlePrint = (nota: NotaCortaOdontologica) => {
    const patient = store.patients.find((p) => p.id === nota.patientId);
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Nota Clínica</title>
      <style>body{font-family:system-ui;padding:40px;max-width:600px;margin:auto}
      h1{font-size:18px;border-bottom:2px solid #333;padding-bottom:8px}
      .meta{color:#666;font-size:13px;margin:8px 0}.content{margin-top:20px;line-height:1.6;white-space:pre-wrap}
      .brand{color:#999;font-size:11px;margin-top:24px;border-top:1px solid #eee;padding-top:8px}</style></head>
      <body>
      <h1>Nota Clínica</h1>
      <div class="meta"><strong>Paciente:</strong> ${patient?.name || "—"}</div>
      <div class="meta"><strong>Fecha:</strong> ${nota.fecha}</div>
      <div class="meta"><strong>Profesional:</strong> ${nota.creadoPor}</div>
      <div class="meta"><strong>Especialidad:</strong> Odontología</div>
      <div class="meta"><strong>Estado:</strong> ${nota.estado}</div>
      <div class="content">${nota.contenido}</div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const toggleDiagnostico = (dxId: string) => {
    setFormDiagnosticoIds((prev) =>
      prev.includes(dxId) ? prev.filter((d) => d !== dxId) : [...prev, dxId]
    );
  };

  return (
    <div className="page-container space-y-5">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Notas Clínicas</h1>
          <p className="page-subtitle">Anotaciones rápidas por especialidad, vinculadas a pacientes y diagnósticos</p>
        </div>
        <Button onClick={() => openNew()} className="gap-1.5 rounded-xl h-10 text-sm px-4">
          <Plus className="h-4 w-4" /> Nueva nota
        </Button>
      </div>

      {/* Summary */}
      <SummaryPanel
        items={[
          { label: "Total notas", value: stats.total, icon: StickyNote, accent: "primary" },
          { label: "Activas", value: stats.activas, icon: CheckCircle2, accent: "success" },
          { label: "Anuladas", value: stats.anuladas, icon: Ban, accent: "destructive" },
          { label: "Hoy", value: stats.hoy, icon: Clock, accent: "warning" },
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

      {/* Create/Edit form */}
      {showForm && (
        <Card className="border-0 shadow-md ring-1 ring-primary/10">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <SectionHeader
                title={editingId ? "Editar nota" : "Nueva nota clínica"}
                icon={editingId ? Pencil : Plus}
                size="sm"
              />
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Specialty selector */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Especialidad</Label>
              <div className="flex flex-wrap gap-1.5">
                {ALL_SPECIALTIES.map((spec) => {
                  const Icon = spec.icon;
                  const selected = formSpecialty === spec.code;
                  return (
                    <button
                      key={spec.code}
                      onClick={() => spec.active && setFormSpecialty(spec.code)}
                      disabled={!spec.active}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                        selected
                          ? cn("border-primary/40 bg-primary/10 text-primary")
                          : spec.active
                          ? "border-border/60 bg-background text-muted-foreground hover:border-primary/30"
                          : "border-border/30 bg-muted/20 text-muted-foreground/40 cursor-not-allowed"
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      {spec.label}
                      {!spec.active && <span className="text-[9px]">Próx.</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Patient select */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Paciente *</Label>
              <select
                value={formPatientId}
                onChange={(e) => {
                  setFormPatientId(e.target.value);
                  setFormAppointmentId("");
                  setFormDiagnosticoIds([]);
                }}
                className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Seleccionar paciente…</option>
                {store.patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} {p.cedula ? `(${p.cedula})` : ""}</option>
                ))}
              </select>
            </div>

            {/* Appointment select */}
            {formPatientId && patientAppointments.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Vincular a cita (opcional)</Label>
                <select
                  value={formAppointmentId}
                  onChange={(e) => setFormAppointmentId(e.target.value)}
                  className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Sin vincular</option>
                  {patientAppointments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {new Date(a.date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })} — {a.time} — {a.notes || "Sin motivo"}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Associated diagnoses */}
            {formPatientId && patientDiagnosticos.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Diagnósticos asociados (opcional)</Label>
                <div className="flex flex-wrap gap-1.5">
                  {patientDiagnosticos.map((dx) => (
                    <button
                      key={dx.id}
                      onClick={() => toggleDiagnostico(dx.id)}
                      className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border",
                        formDiagnosticoIds.includes(dx.id)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/60 bg-background text-muted-foreground hover:border-primary/30"
                      )}
                    >
                      <span className="font-mono text-[10px]">{dx.codigo}</span>
                      {dx.descripcion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Content */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Contenido de la nota *</Label>
              <Textarea
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="Escribe la nota clínica…"
                rows={4}
                className="rounded-xl resize-none text-sm"
              />
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">{formContent.length} caracteres</span>
                {!formContent.trim() && (
                  <span className="text-[10px] text-destructive">Obligatorio</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 justify-end">
              <Button variant="outline" size="sm" className="rounded-xl h-9 text-xs" onClick={resetForm}>
                Cancelar
              </Button>
              <Button
                size="sm"
                className="rounded-xl h-9 text-xs gap-1.5"
                onClick={handleSave}
                disabled={!formPatientId || !formContent.trim()}
              >
                <Save className="h-3.5 w-3.5" />
                {editingId ? "Actualizar" : "Guardar nota"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por contenido, paciente, profesional..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 rounded-xl border-border/60"
          />
        </div>
        <Tabs value={tab} onValueChange={(v) => setTab(v as FilterTab)}>
          <TabsList className="h-10 rounded-xl">
            <TabsTrigger value="all" className="rounded-lg text-xs px-3">Todas</TabsTrigger>
            <TabsTrigger value="activa" className="rounded-lg text-xs px-3">Activas</TabsTrigger>
            <TabsTrigger value="anulada" className="rounded-lg text-xs px-3">Anuladas</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Date & patient filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-8 w-36 rounded-lg text-xs"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
          <select
            value={patientFilter}
            onChange={(e) => setPatientFilter(e.target.value)}
            className="h-8 rounded-lg border border-input bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Todos los pacientes</option>
            {store.patients.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        {(dateFilter || patientFilter) && (
          <button
            onClick={() => { setDateFilter(""); setPatientFilter(""); }}
            className="text-xs text-primary font-medium hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Notes list */}
      {filtered.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-14 text-center">
            {specialtyFilter !== "todas" && !SPECIALTY_META[specialtyFilter as SpecialtyCode]?.active ? (
              <>
                <Stethoscope className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-1">
                  Notas de {SPECIALTY_META[specialtyFilter as SpecialtyCode]?.label} estarán disponibles próximamente
                </p>
                <p className="text-xs text-muted-foreground/60">
                  Actualmente solo Odontología tiene notas clínicas activas.
                </p>
                <button onClick={() => setSpecialtyFilter("todas")} className="text-xs text-primary font-medium hover:underline mt-2">
                  Ver todas las especialidades
                </button>
              </>
            ) : (
              <>
                <StickyNote className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-1">
                  {search || dateFilter || patientFilter ? "Sin resultados con estos filtros" : "No hay notas registradas"}
                </p>
                {!showForm && (
                  <Button variant="outline" size="sm" className="rounded-xl gap-1.5 mt-3 text-xs" onClick={() => openNew()}>
                    <Plus className="h-3.5 w-3.5" /> Crear primera nota
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{filtered.length} nota{filtered.length !== 1 ? "s" : ""}</p>

          {filtered.map((nota) => {
            const patient = store.patients.find((p) => p.id === nota.patientId);
            const appointment = nota.appointmentId ? store.appointments.find((a) => a.id === nota.appointmentId) : null;
            const linkedDx = nota.diagnosticoIds?.map((dxId) => clinical.diagnosticos.find((d) => d.id === dxId)).filter(Boolean) || [];
            const isVoided = nota.estado === "anulada";
            // Phase 1: all notes belong to odontología
            const notaSpecialty = SPECIALTY_META.odontologia;
            const SpecIcon = notaSpecialty.icon;

            return (
              <Card key={nota.id} className={cn("border-0 shadow-sm transition-all hover:shadow-md", isVoided && "opacity-50")}>
                <CardContent className="p-0">
                  <div className="flex items-start gap-4 px-5 py-4">
                    {/* Icon */}
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                      nota.tipo === "voz" ? "bg-primary/8" : "bg-muted/60"
                    )}>
                      {nota.tipo === "voz" ? (
                        <Mic className="h-4 w-4 text-primary" />
                      ) : (
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => navigate(`/patients/${nota.patientId}`)}
                          className="text-sm font-semibold hover:text-primary transition-colors"
                        >
                          {patient?.name || "Paciente"}
                        </button>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] h-5 px-1.5 font-medium border-0",
                            isVoided
                              ? "bg-destructive/10 text-destructive"
                              : "bg-success/10 text-success"
                          )}
                        >
                          {isVoided ? "Anulada" : "Activa"}
                        </Badge>
                        {/* Specialty badge */}
                        <Badge variant="outline" className={cn(
                          "gap-1 text-[9px] h-4 rounded-full px-1.5 border-0",
                          notaSpecialty.color, notaSpecialty.textColor
                        )}>
                          <SpecIcon className="h-2.5 w-2.5" />
                          {notaSpecialty.label}
                        </Badge>
                        {nota.tipo === "voz" && nota.duracionSegundos && (
                          <span className="text-[10px] text-primary font-medium">{nota.duracionSegundos}s audio</span>
                        )}
                      </div>

                      <p className={cn("text-sm leading-relaxed", isVoided && "line-through")}>{nota.contenido}</p>

                      {/* Metadata row */}
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground flex-wrap">
                        <span>{nota.creadoPor}</span>
                        <span>•</span>
                        <span>{new Date(nota.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</span>
                        {appointment && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <CalendarDays className="h-3 w-3" />
                              Cita: {appointment.time} — {appointment.notes || "Sin motivo"}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Linked diagnoses */}
                      {linkedDx.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {linkedDx.map((dx) => dx && (
                            <span key={dx.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/50 text-[10px] font-medium">
                              <span className="font-mono">{dx.codigo}</span>
                              {dx.descripcion}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {!isVoided && (
                        <>
                          <button
                            onClick={() => openEdit(nota)}
                            className="h-8 w-8 rounded-lg hover:bg-accent flex items-center justify-center transition-colors"
                            title="Editar"
                          >
                            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => setVoidingId(nota.id)}
                            className="h-8 w-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center transition-colors"
                            title="Anular"
                          >
                            <Ban className="h-3.5 w-3.5 text-destructive/60" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handlePrint(nota)}
                        className="h-8 w-8 rounded-lg hover:bg-accent flex items-center justify-center transition-colors"
                        title="Imprimir"
                      >
                        <Printer className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => navigate(`/patients/${nota.patientId}`)}
                        className="h-8 w-8 rounded-lg hover:bg-accent flex items-center justify-center transition-colors"
                        title="Ver paciente"
                      >
                        <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Void confirmation */}
      <ConfirmDialog
        open={!!voidingId}
        onCancel={() => setVoidingId(null)}
        title="Anular nota clínica"
        description="Esta acción marcará la nota como anulada. No se eliminará del registro pero quedará inactiva para auditoría. ¿Deseas continuar?"
        confirmLabel="Anular nota"
        variant="destructive"
        onConfirm={() => voidingId && handleVoid(voidingId)}
      />
    </div>
  );
}

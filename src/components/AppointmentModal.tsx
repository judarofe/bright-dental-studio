import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAppStore } from "@/data/StoreContext";
import { Appointment, AppointmentStatus } from "@/data/store";
import { Trash2, UserPlus, ArrowLeft, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  appointment?: Appointment | null;
  defaultDate?: string;
  defaultTime?: string;
}

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; activeClass: string }> = {
  pending: { label: "Pendiente", activeClass: "bg-warning text-warning-foreground" },
  confirmed: { label: "Confirmada", activeClass: "bg-primary text-primary-foreground" },
  completed: { label: "Completada", activeClass: "bg-success text-success-foreground" },
  noshow: { label: "No asistió", activeClass: "bg-destructive text-destructive-foreground" },
};

export function AppointmentModal({ open, onClose, appointment, defaultDate, defaultTime }: Props) {
  const store = useAppStore();
  const isEdit = !!appointment;

  const [patientId, setPatientId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<AppointmentStatus>("pending");
  const [paid, setPaid] = useState(false);
  const [amount, setAmount] = useState(0);

  const [showNewPatient, setShowNewPatient] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (appointment) {
      setPatientId(appointment.patientId);
      setDate(appointment.date);
      setTime(appointment.time);
      setNotes(appointment.notes);
      setStatus(appointment.status);
      setPaid(appointment.paid);
      setAmount(appointment.amount);
    } else {
      setPatientId("");
      setDate(defaultDate || new Date().toISOString().split("T")[0]);
      setTime(defaultTime || "09:00");
      setNotes("");
      setStatus("confirmed");
      setPaid(false);
      setAmount(0);
    }
    setShowNewPatient(false);
    setNewName("");
    setNewPhone("");
    setNewEmail("");
    setErrors({});
  }, [appointment, open, defaultDate, defaultTime]);

  const validate = useCallback(() => {
    const errs: Record<string, string> = {};
    if (!showNewPatient && !patientId) errs.patient = "Selecciona un paciente";
    if (showNewPatient && !newName.trim()) errs.newName = "El nombre es obligatorio";
    if (!date) errs.date = "Selecciona una fecha";
    if (!time) errs.time = "Selecciona una hora";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [showNewPatient, patientId, newName, date, time]);

  const handleSave = () => {
    if (!validate()) return;

    let pid = patientId;
    if (showNewPatient && newName.trim()) {
      const p = store.addPatient({
        name: newName.trim(),
        phone: newPhone.trim(),
        email: newEmail.trim(),
        cedula: "",
        address: "",
        notes: "",
      });
      pid = p.id;
    }

    const data = { patientId: pid, date, time, duration: 30, notes, status, paid, amount };
    if (isEdit && appointment) {
      store.updateAppointment(appointment.id, data);
    } else {
      store.addAppointment(data);
    }
    onClose();
  };

  const handleDelete = () => {
    if (appointment) {
      store.deleteAppointment(appointment.id);
      onClose();
    }
  };

  const patientName = appointment ? store.getPatient(appointment.patientId)?.name : undefined;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[420px] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border/60">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-base">{isEdit ? "Editar Cita" : "Nueva Cita"}</DialogTitle>
            <DialogDescription className="text-xs">
              {isEdit
                ? `Modificar la cita de ${patientName || "paciente"}`
                : "Completa los datos para agendar una cita"}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* ── Section: Patient ── */}
          {!showNewPatient ? (
            <fieldset className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Paciente</Label>
              <Select value={patientId} onValueChange={(v) => { setPatientId(v); setErrors((e) => ({ ...e, patient: "" })); }}>
                <SelectTrigger className={cn("h-10 rounded-xl", errors.patient && "border-destructive ring-1 ring-destructive/30")}>
                  <SelectValue placeholder="Seleccionar paciente..." />
                </SelectTrigger>
                <SelectContent>
                  {store.patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.patient && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.patient}</p>}
              <button
                type="button"
                onClick={() => setShowNewPatient(true)}
                className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors font-medium mt-1"
              >
                <UserPlus className="h-3.5 w-3.5" /> Crear nuevo paciente
              </button>
            </fieldset>
          ) : (
            <fieldset className="space-y-3 rounded-xl border border-primary/20 bg-primary/[0.03] p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-primary uppercase tracking-wide">Nuevo Paciente</span>
                <button
                  type="button"
                  onClick={() => { setShowNewPatient(false); setErrors((e) => ({ ...e, newName: "" })); }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" /> Existente
                </button>
              </div>
              <div className="space-y-1.5">
                <Input
                  placeholder="Nombre completo *"
                  value={newName}
                  onChange={(e) => { setNewName(e.target.value); setErrors((er) => ({ ...er, newName: "" })); }}
                  className={cn("h-10 rounded-xl", errors.newName && "border-destructive ring-1 ring-destructive/30")}
                  autoFocus
                />
                {errors.newName && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.newName}</p>}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Teléfono" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="h-10 rounded-xl" />
                <Input placeholder="Email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="h-10 rounded-xl" />
              </div>
            </fieldset>
          )}

          {/* ── Section: Date & Time ── */}
          <fieldset className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Fecha y hora</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => { setDate(e.target.value); setErrors((er) => ({ ...er, date: "" })); }}
                  className={cn("h-10 rounded-xl", errors.date && "border-destructive ring-1 ring-destructive/30")}
                />
                {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
              </div>
              <div className="space-y-1">
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => { setTime(e.target.value); setErrors((er) => ({ ...er, time: "" })); }}
                  className={cn("h-10 rounded-xl", errors.time && "border-destructive ring-1 ring-destructive/30")}
                />
                {errors.time && <p className="text-xs text-destructive">{errors.time}</p>}
              </div>
            </div>
          </fieldset>

          {/* ── Section: Amount + Notes ── */}
          <fieldset className="space-y-3">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Detalles</Label>
            <div className="space-y-1">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">€</span>
                <Input
                  type="number"
                  value={amount || ""}
                  onChange={(e) => setAmount(+e.target.value)}
                  className="h-10 rounded-xl pl-7"
                  placeholder="0.00"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">Monto del tratamiento o consulta</p>
            </div>
            <Textarea
              placeholder="Notas: limpieza, corona, seguimiento..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="rounded-xl resize-none text-sm"
            />
          </fieldset>

          {/* ── Section: Status & Payment (Edit only) ── */}
          {isEdit && (
            <fieldset className="space-y-3">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Estado</Label>
              <div className="grid grid-cols-4 gap-1.5">
                {(Object.keys(STATUS_CONFIG) as AppointmentStatus[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={cn(
                      "py-2 rounded-lg text-xs font-medium transition-all",
                      status === s ? STATUS_CONFIG[s].activeClass : "bg-muted text-muted-foreground hover:bg-accent"
                    )}
                  >
                    {STATUS_CONFIG[s].label}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3 mt-2">
                <div>
                  <p className="text-sm font-medium">Pagado</p>
                  <p className="text-[11px] text-muted-foreground">Marcar como cobrado</p>
                </div>
                <Switch checked={paid} onCheckedChange={setPaid} />
              </div>
            </fieldset>
          )}
        </div>

        {/* ── Footer actions ── */}
        <div className="px-6 py-4 border-t border-border/60 bg-muted/20 flex items-center gap-2">
          {isEdit && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-destructive/60 hover:text-destructive hover:bg-destructive/10 shrink-0 rounded-xl"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <div className="flex-1" />
          <Button type="button" variant="outline" onClick={onClose} className="h-9 rounded-xl text-sm px-4">
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave} className="h-9 rounded-xl text-sm px-5 font-medium">
            {isEdit ? "Guardar cambios" : "Agendar cita"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

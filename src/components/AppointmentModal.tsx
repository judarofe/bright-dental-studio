import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAppStore } from "@/data/StoreContext";
import { Appointment, AppointmentStatus } from "@/data/store";
import { Trash2, UserPlus } from "lucide-react";
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
  }, [appointment, open, defaultDate, defaultTime]);

  const handleSave = () => {
    let pid = patientId;
    if (showNewPatient && newName.trim()) {
      const p = store.addPatient({ name: newName.trim(), phone: newPhone.trim(), email: "", cedula: "", address: "", notes: "" });
      pid = p.id;
    }
    if (!pid) return;

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

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[400px] p-6">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Cita" : "Nueva Cita"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Patient selection */}
          {!showNewPatient ? (
            <div className="space-y-2">
              <Label className="text-sm">Paciente</Label>
              <Select value={patientId} onValueChange={setPatientId}>
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder="Elegir paciente..." />
                </SelectTrigger>
                <SelectContent>
                  {store.patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button onClick={() => setShowNewPatient(true)} className="flex items-center gap-1.5 text-xs text-primary hover:underline mt-1">
                <UserPlus className="h-3 w-3" /> Nuevo paciente
              </button>
            </div>
          ) : (
            <div className="space-y-3 rounded-xl border border-border/60 p-4 bg-muted/30">
              <p className="text-sm font-medium">Nuevo Paciente</p>
              <Input placeholder="Nombre completo" value={newName} onChange={(e) => setNewName(e.target.value)} className="h-10 rounded-xl" />
              <Input placeholder="Teléfono" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="h-10 rounded-xl" />
              <button onClick={() => setShowNewPatient(false)} className="text-xs text-primary hover:underline">← Paciente existente</button>
            </div>
          )}

          {/* Date & time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm">Fecha</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-10 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Hora</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="h-10 rounded-xl" />
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label className="text-sm">Monto (€)</Label>
            <Input type="number" value={amount} onChange={(e) => setAmount(+e.target.value)} className="h-10 rounded-xl" placeholder="0" />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-sm">Notas <span className="text-muted-foreground font-normal">(opcional)</span></Label>
            <Textarea placeholder="ej. limpieza, corona, seguimiento..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="rounded-xl resize-none" />
          </div>

          {/* Paid toggle */}
          {isEdit && (
            <div className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3">
              <Label className="text-sm">Pagado</Label>
              <Switch checked={paid} onCheckedChange={setPaid} />
            </div>
          )}

          {/* Status buttons */}
          {isEdit && (
            <div className="space-y-1.5">
              <Label className="text-sm">Estado</Label>
              <div className="grid grid-cols-4 gap-1.5">
                {(Object.keys(STATUS_CONFIG) as AppointmentStatus[]).map((s) => (
                  <button
                    key={s}
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
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {isEdit && (
              <Button variant="ghost" size="icon" className="text-destructive/70 hover:text-destructive shrink-0 rounded-xl" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button variant="outline" onClick={onClose} className="flex-1 h-10 rounded-xl">Cancelar</Button>
            <Button onClick={handleSave} className="flex-1 h-10 rounded-xl font-medium">
              {isEdit ? "Guardar" : "Crear Cita"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

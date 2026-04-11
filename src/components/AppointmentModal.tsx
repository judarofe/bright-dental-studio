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

interface Props {
  open: boolean;
  onClose: () => void;
  appointment?: Appointment | null;
  defaultDate?: string;
  defaultTime?: string;
}

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
      const p = store.addPatient({ name: newName.trim(), phone: newPhone.trim(), notes: "" });
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
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-lg">{isEdit ? "Edit Appointment" : "New Appointment"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-1">
          {/* Patient — simplified */}
          {!showNewPatient ? (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Patient</Label>
              <Select value={patientId} onValueChange={setPatientId}>
                <SelectTrigger className="h-11 rounded-xl text-base">
                  <SelectValue placeholder="Choose patient..." />
                </SelectTrigger>
                <SelectContent>
                  {store.patients.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-base py-2">{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                onClick={() => setShowNewPatient(true)}
                className="flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <UserPlus className="h-3.5 w-3.5" /> Add new patient
              </button>
            </div>
          ) : (
            <div className="space-y-3 rounded-xl border p-4 bg-accent/30">
              <p className="text-sm font-medium">New Patient</p>
              <Input placeholder="Full name" value={newName} onChange={(e) => setNewName(e.target.value)} className="h-11 rounded-xl text-base" />
              <Input placeholder="Phone number" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="h-11 rounded-xl text-base" />
              <button onClick={() => setShowNewPatient(false)} className="text-sm text-primary hover:underline">
                ← Choose existing patient
              </button>
            </div>
          )}

          {/* Date & Time — side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Time</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="h-11 rounded-xl" />
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Amount (€)</Label>
            <Input type="number" value={amount} onChange={(e) => setAmount(+e.target.value)} className="h-11 rounded-xl text-base" placeholder="0" />
          </div>

          {/* Notes — optional, collapsed feel */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Notes <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Textarea placeholder="e.g. cleaning, crown, follow-up..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="rounded-xl resize-none" />
          </div>

          {/* Paid toggle — only in edit mode, simple */}
          {isEdit && (
            <div className="flex items-center justify-between rounded-xl border p-3">
              <Label className="text-sm font-medium">Paid</Label>
              <Switch checked={paid} onCheckedChange={setPaid} />
            </div>
          )}

          {/* Status — only in edit mode */}
          {isEdit && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <div className="grid grid-cols-4 gap-1.5">
                {(["pending", "confirmed", "completed", "noshow"] as AppointmentStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                      status === s
                        ? s === "pending" ? "bg-status-pending text-warning-foreground"
                        : s === "confirmed" ? "bg-status-confirmed text-primary-foreground"
                        : s === "completed" ? "bg-status-completed text-success-foreground"
                        : "bg-status-noshow text-destructive-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {s === "noshow" ? "No-show" : s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions — big, clear buttons */}
          <div className="flex gap-2 pt-1">
            {isEdit && (
              <Button variant="ghost" size="icon" className="text-destructive shrink-0 rounded-xl" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button variant="outline" onClick={onClose} className="flex-1 h-11 rounded-xl">Cancel</Button>
            <Button onClick={handleSave} className="flex-1 h-11 rounded-xl text-base font-medium">
              {isEdit ? "Save" : "Create Appointment"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

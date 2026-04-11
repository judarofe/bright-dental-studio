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
import { StatusBadge } from "./StatusBadge";
import { Trash2 } from "lucide-react";

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
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<AppointmentStatus>("pending");
  const [paid, setPaid] = useState(false);
  const [amount, setAmount] = useState(0);

  // New patient inline
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  useEffect(() => {
    if (appointment) {
      setPatientId(appointment.patientId);
      setDate(appointment.date);
      setTime(appointment.time);
      setDuration(appointment.duration);
      setNotes(appointment.notes);
      setStatus(appointment.status);
      setPaid(appointment.paid);
      setAmount(appointment.amount);
    } else {
      setPatientId("");
      setDate(defaultDate || new Date().toISOString().split("T")[0]);
      setTime(defaultTime || "09:00");
      setDuration(30);
      setNotes("");
      setStatus("pending");
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

    const data = { patientId: pid, date, time, duration, notes, status, paid, amount };
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Appointment" : "New Appointment"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Patient */}
          {!showNewPatient ? (
            <div className="space-y-1.5">
              <Label>Patient</Label>
              <Select value={patientId} onValueChange={setPatientId}>
                <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                <SelectContent>
                  {store.patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={() => setShowNewPatient(true)}>
                + Create new patient
              </Button>
            </div>
          ) : (
            <div className="space-y-2 rounded-lg border p-3">
              <Label className="text-xs text-muted-foreground">New Patient</Label>
              <Input placeholder="Name" value={newName} onChange={(e) => setNewName(e.target.value)} />
              <Input placeholder="Phone" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
              <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={() => setShowNewPatient(false)}>
                ← Select existing patient
              </Button>
            </div>
          )}

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Time</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>

          {/* Duration & Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Duration (min)</Label>
              <Input type="number" value={duration} onChange={(e) => setDuration(+e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Amount (€)</Label>
              <Input type="number" value={amount} onChange={(e) => setAmount(+e.target.value)} />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea placeholder="Treatment notes..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>

          {/* Status & Paid */}
          <div className="grid grid-cols-2 gap-3 items-end">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as AppointmentStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="noshow">No-show</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pb-1">
              <Switch checked={paid} onCheckedChange={setPaid} />
              <Label className="text-sm">Paid</Label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-2">
            {isEdit && (
              <Button variant="ghost" size="sm" className="text-destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleSave}>{isEdit ? "Save" : "Create"}</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

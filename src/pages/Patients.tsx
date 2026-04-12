import { useState } from "react";
import { useAppStore } from "@/data/StoreContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/StatusBadge";
import { AppointmentModal } from "@/components/AppointmentModal";
import { Plus, Search, Phone, ArrowLeft } from "lucide-react";
import { Patient, Appointment } from "@/data/store";

export default function Patients() {
  const store = useAppStore();
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const [apptModalOpen, setApptModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);

  const filtered = store.patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search)
  );

  const handleAdd = () => {
    if (!newName.trim()) return;
    store.addPatient({ name: newName.trim(), phone: newPhone.trim(), notes: newNotes.trim() });
    setNewName(""); setNewPhone(""); setNewNotes(""); setAddOpen(false);
  };

  if (selectedPatient) {
    const history = store.getAppointmentsForPatient(selectedPatient.id);
    return (
      <div className="space-y-4 max-w-3xl">
        <Button variant="ghost" size="sm" onClick={() => setSelectedPatient(null)} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>

        <Card>
          <CardContent className="p-5 space-y-3">
            <h2 className="text-xl font-semibold">{selectedPatient.name}</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-3.5 w-3.5" /> {selectedPatient.phone || "Sin teléfono"}
            </div>
            {selectedPatient.notes && (
              <p className="text-sm bg-accent/50 rounded-lg p-3">{selectedPatient.notes}</p>
            )}
            <p className="text-xs text-muted-foreground">Paciente desde {selectedPatient.createdAt}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Historial de Citas</CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">Aún no hay citas</p>
            ) : (
              <div className="space-y-2">
                {history.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => { setSelectedAppt(a); setApptModalOpen(true); }}
                    className="w-full flex items-center gap-3 rounded-lg border p-3 hover:bg-accent/40 transition-colors text-left"
                  >
                    <span className="text-sm font-medium w-24 shrink-0">{a.date}</span>
                    <span className="text-sm text-muted-foreground w-14">{a.time}</span>
                    <span className="flex-1 text-sm truncate">{a.notes}</span>
                    <StatusBadge status={a.status} />
                    <span className="text-sm font-medium">€{a.amount}</span>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <AppointmentModal
          open={apptModalOpen}
          onClose={() => setApptModalOpen(false)}
          appointment={selectedAppt}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-semibold">Pacientes</h1>
        <Button onClick={() => setAddOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Nuevo Paciente
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o teléfono..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedPatient(p)}
            className="w-full flex items-center gap-4 rounded-lg border bg-card p-4 hover:shadow-sm transition-shadow text-left"
          >
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-primary font-medium text-sm">
                {p.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.phone || "Sin teléfono"}</p>
            </div>
            <span className="text-xs text-muted-foreground">{store.getAppointmentsForPatient(p.id).length} visitas</span>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-8">No se encontraron pacientes</p>
        )}
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Nuevo Paciente</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-1.5"><Label>Nombre</Label><Input value={newName} onChange={(e) => setNewName(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Teléfono</Label><Input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Notas</Label><Textarea value={newNotes} onChange={(e) => setNewNotes(e.target.value)} rows={2} /></div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setAddOpen(false)}>Cancelar</Button>
              <Button onClick={handleAdd}>Agregar Paciente</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

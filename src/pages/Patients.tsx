import { useState } from "react";
import { useAppStore } from "@/data/StoreContext";
import { Card, CardContent } from "@/components/ui/card";
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
      <div className="page-container max-w-3xl">
        <Button variant="ghost" size="sm" onClick={() => setSelectedPatient(null)} className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary font-bold text-lg">
                  {selectedPatient.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-semibold">{selectedPatient.name}</h2>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                  <Phone className="h-3 w-3" /> {selectedPatient.phone || "Sin teléfono"}
                </div>
              </div>
            </div>
            {selectedPatient.notes && (
              <p className="text-sm bg-muted/60 rounded-lg p-3 mt-4">{selectedPatient.notes}</p>
            )}
            <p className="text-xs text-muted-foreground mt-3">Paciente desde {selectedPatient.createdAt}</p>
          </CardContent>
        </Card>

        <div>
          <p className="section-title mb-3">Historial de citas</p>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              {history.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-10">Aún no hay citas</p>
              ) : (
                <div className="divide-y divide-border/60">
                  {history.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => { setSelectedAppt(a); setApptModalOpen(true); }}
                      className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-accent/40 transition-colors text-left"
                    >
                      <span className="text-sm font-medium text-muted-foreground w-20 shrink-0">{a.date}</span>
                      <span className="text-xs font-mono text-muted-foreground w-12">{a.time}</span>
                      <span className="flex-1 text-sm truncate">{a.notes || "—"}</span>
                      <StatusBadge status={a.status} />
                      <span className="text-sm font-semibold w-14 text-right">€{a.amount}</span>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <AppointmentModal
          open={apptModalOpen}
          onClose={() => setApptModalOpen(false)}
          appointment={selectedAppt}
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Pacientes</h1>
        <Button onClick={() => setAddOpen(true)} className="gap-1.5 rounded-xl h-9 text-sm">
          <Plus className="h-4 w-4" /> Nuevo
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o teléfono..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-10 rounded-xl border-border/60"
        />
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-12">No se encontraron pacientes</p>
          ) : (
            <div className="divide-y divide-border/60">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPatient(p)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-accent/40 transition-colors text-left"
                >
                  <div className="h-10 w-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
                    <span className="text-primary font-semibold text-xs">
                      {p.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.phone || "Sin teléfono"}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{store.getAppointmentsForPatient(p.id).length} visitas</span>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Nuevo Paciente</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5"><Label className="text-sm">Nombre</Label><Input value={newName} onChange={(e) => setNewName(e.target.value)} className="rounded-xl h-10" /></div>
            <div className="space-y-1.5"><Label className="text-sm">Teléfono</Label><Input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="rounded-xl h-10" /></div>
            <div className="space-y-1.5"><Label className="text-sm">Notas</Label><Textarea value={newNotes} onChange={(e) => setNewNotes(e.target.value)} rows={2} className="rounded-xl resize-none" /></div>
            <div className="flex gap-2 justify-end pt-1">
              <Button variant="outline" onClick={() => setAddOpen(false)} className="rounded-xl">Cancelar</Button>
              <Button onClick={handleAdd} className="rounded-xl">Agregar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

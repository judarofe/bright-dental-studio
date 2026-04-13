import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/data/StoreContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, Phone, ChevronRight, Mail } from "lucide-react";

export default function Patients() {
  const store = useAppStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newCedula, setNewCedula] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const filtered = store.patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search)
  );

  const handleAdd = () => {
    if (!newName.trim()) return;
    const p = store.addPatient({ name: newName.trim(), phone: newPhone.trim(), email: newEmail.trim(), cedula: newCedula.trim(), address: newAddress.trim(), notes: newNotes.trim() });
    setNewName(""); setNewPhone(""); setNewEmail(""); setNewCedula(""); setNewAddress(""); setNewNotes(""); setAddOpen(false);
    navigate(`/patients/${p.id}`);
  };

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
                  onClick={() => navigate(`/patients/${p.id}`)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-accent/40 transition-colors text-left group"
                >
                  <div className="h-10 w-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
                    <span className="text-primary font-semibold text-xs">
                      {p.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{p.name}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <Phone className="h-3 w-3" /> {p.phone || "Sin teléfono"}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{store.getAppointmentsForPatient(p.id).length} visitas</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
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
            <div className="space-y-1.5"><Label className="text-sm">Correo electrónico</Label><Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="rounded-xl h-10" /></div>
            <div className="space-y-1.5"><Label className="text-sm">Cédula</Label><Input value={newCedula} onChange={(e) => setNewCedula(e.target.value)} className="rounded-xl h-10" /></div>
            <div className="space-y-1.5"><Label className="text-sm">Dirección</Label><Input value={newAddress} onChange={(e) => setNewAddress(e.target.value)} className="rounded-xl h-10" /></div>
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

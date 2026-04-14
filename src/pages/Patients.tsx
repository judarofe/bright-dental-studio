import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/data/StoreContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, Search, Phone, ChevronRight, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = store.patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search) ||
      p.cedula?.includes(search)
  );

  const resetForm = () => {
    setNewName("");
    setNewPhone("");
    setNewEmail("");
    setNewCedula("");
    setNewAddress("");
    setNewNotes("");
    setErrors({});
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!newName.trim()) errs.name = "El nombre es obligatorio";
    if (newEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) errs.email = "Correo no válido";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAdd = () => {
    if (!validate()) return;
    const p = store.addPatient({
      name: newName.trim(),
      phone: newPhone.trim(),
      email: newEmail.trim(),
      cedula: newCedula.trim(),
      address: newAddress.trim(),
      notes: newNotes.trim(),
    });
    resetForm();
    setAddOpen(false);
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
          placeholder="Buscar por nombre, teléfono o cédula..."
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

      {/* ── New Patient Modal ── */}
      <Dialog open={addOpen} onOpenChange={(v) => { if (!v) { resetForm(); setAddOpen(false); } }}>
        <DialogContent className="sm:max-w-[420px] p-0 gap-0 overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-border/60">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-base">Nuevo Paciente</DialogTitle>
              <DialogDescription className="text-xs">Ingresa los datos del paciente. Solo el nombre es obligatorio.</DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Personal info */}
            <fieldset className="space-y-3">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Datos personales</Label>
              <div className="space-y-1">
                <Input
                  placeholder="Nombre completo *"
                  value={newName}
                  onChange={(e) => { setNewName(e.target.value); setErrors((er) => ({ ...er, name: "" })); }}
                  className={cn("h-10 rounded-xl", errors.name && "border-destructive ring-1 ring-destructive/30")}
                  autoFocus
                />
                {errors.name && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.name}</p>}
              </div>
              <Input placeholder="Cédula" value={newCedula} onChange={(e) => setNewCedula(e.target.value)} className="h-10 rounded-xl" />
            </fieldset>

            {/* Contact */}
            <fieldset className="space-y-3">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Contacto</Label>
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Teléfono" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="h-10 rounded-xl" />
                <div className="space-y-1">
                  <Input
                    placeholder="Correo electrónico"
                    type="email"
                    value={newEmail}
                    onChange={(e) => { setNewEmail(e.target.value); setErrors((er) => ({ ...er, email: "" })); }}
                    className={cn("h-10 rounded-xl", errors.email && "border-destructive ring-1 ring-destructive/30")}
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
              </div>
              <Input placeholder="Dirección" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} className="h-10 rounded-xl" />
            </fieldset>

            {/* Notes */}
            <fieldset className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Notas <span className="normal-case font-normal">(opcional)</span></Label>
              <Textarea
                placeholder="Alergias, condiciones previas, observaciones..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                rows={2}
                className="rounded-xl resize-none text-sm"
              />
            </fieldset>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border/60 bg-muted/20 flex justify-end gap-2">
            <Button variant="outline" onClick={() => { resetForm(); setAddOpen(false); }} className="h-9 rounded-xl text-sm px-4">
              Cancelar
            </Button>
            <Button onClick={handleAdd} className="h-9 rounded-xl text-sm px-5 font-medium">
              Agregar paciente
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

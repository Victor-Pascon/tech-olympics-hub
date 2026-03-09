import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Workshop = {
  id: string; nome: string; descricao: string | null; olympiad_id: string;
  professor: string | null; vagas: number | null; local: string | null;
  horario: string | null; material_apoio: string | null; material_estudo: string | null;
};

type Olympiad = { id: string; nome: string };

const emptyForm = {
  nome: "", descricao: "", olympiad_id: "", professor: "", vagas: 30,
  local: "", horario: "", material_apoio: "", material_estudo: "",
};

const WorkshopsTab = () => {
  const { toast } = useToast();
  const [workshops, setWorkshops] = useState<(Workshop & { olympiad_name?: string; enrolled?: number })[]>([]);
  const [olympiads, setOlympiads] = useState<Olympiad[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const [wsRes, olRes] = await Promise.all([
      supabase.from("workshops").select("*, workshop_enrollments(id)"),
      supabase.from("olympiads").select("id, nome"),
    ]);
    if (olRes.data) setOlympiads(olRes.data);
    if (wsRes.data && olRes.data) {
      setWorkshops(wsRes.data.map(w => ({
        ...w,
        olympiad_name: olRes.data.find(o => o.id === w.olympiad_id)?.nome || "—",
        enrolled: w.workshop_enrollments?.length || 0,
      })));
    }
  };

  const openNew = () => { setForm(emptyForm); setEditing(null); setOpen(true); };

  const openEdit = (w: Workshop) => {
    setForm({
      nome: w.nome, descricao: w.descricao || "", olympiad_id: w.olympiad_id,
      professor: w.professor || "", vagas: w.vagas || 30, local: w.local || "",
      horario: w.horario || "", material_apoio: w.material_apoio || "",
      material_estudo: w.material_estudo || "",
    });
    setEditing(w.id);
    setOpen(true);
  };

  const save = async () => {
    if (!form.nome || !form.olympiad_id) {
      toast({ title: "Nome e Olimpíada são obrigatórios", variant: "destructive" });
      return;
    }
    if (editing) {
      await supabase.from("workshops").update(form).eq("id", editing);
    } else {
      await supabase.from("workshops").insert(form);
    }
    toast({ title: editing ? "Oficina atualizada" : "Oficina criada" });
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("workshops").delete().eq("id", id);
    toast({ title: "Oficina removida" });
    load();
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Oficinas</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openNew}><Plus className="mr-1 h-4 w-4" />Nova Oficina</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-display">{editing ? "Editar Oficina" : "Nova Oficina"}</DialogTitle></DialogHeader>
            <div className="grid gap-4">
              <div className="space-y-1"><Label>Nome *</Label><Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} /></div>
              <div className="space-y-1">
                <Label>Olimpíada *</Label>
                <Select value={form.olympiad_id} onValueChange={v => setForm({ ...form, olympiad_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {olympiads.map(o => <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Descrição</Label><Textarea value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} /></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1"><Label>Ministrante</Label><Input value={form.professor} onChange={e => setForm({ ...form, professor: e.target.value })} /></div>
                <div className="space-y-1"><Label>Vagas</Label><Input type="number" value={form.vagas} onChange={e => setForm({ ...form, vagas: parseInt(e.target.value) || 0 })} /></div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1"><Label>Local</Label><Input value={form.local} onChange={e => setForm({ ...form, local: e.target.value })} /></div>
                <div className="space-y-1"><Label>Horário</Label><Input value={form.horario} onChange={e => setForm({ ...form, horario: e.target.value })} placeholder="Ex: 08:00 - 12:00" /></div>
              </div>
              <div className="space-y-1"><Label>Material de Apoio (URL)</Label><Input value={form.material_apoio} onChange={e => setForm({ ...form, material_apoio: e.target.value })} /></div>
              <div className="space-y-1"><Label>Material de Estudo (URL)</Label><Input value={form.material_estudo} onChange={e => setForm({ ...form, material_estudo: e.target.value })} /></div>
              <Button onClick={save} className="font-display">Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="card-cyber border-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-primary/10">
              <TableHead>Nome</TableHead>
              <TableHead>Ministrante</TableHead>
              <TableHead>Olimpíada</TableHead>
              <TableHead>Vagas</TableHead>
              <TableHead>Inscritos</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workshops.map((ws) => (
              <TableRow key={ws.id} className="border-primary/5">
                <TableCell className="font-medium">{ws.nome}</TableCell>
                <TableCell>{ws.professor || "—"}</TableCell>
                <TableCell><Badge variant="secondary">{ws.olympiad_name}</Badge></TableCell>
                <TableCell>{ws.vagas}</TableCell>
                <TableCell>{ws.enrolled}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(ws)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => remove(ws.id)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {workshops.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhuma oficina cadastrada</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default WorkshopsTab;

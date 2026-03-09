import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Upload, FileText, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Workshop = {
  id: string; nome: string; descricao: string | null; olympiad_id: string;
  professor: string | null; vagas: number | null; local: string | null;
  horario: string | null; material_apoio: string | null; material_estudo: string | null;
  data_inicio: string | null; data_fim: string | null; dias_aulas: string | null;
};
type Olympiad = { id: string; nome: string };
type WFile = { id: string; file_url: string; file_name: string; file_type: string; tipo: string };

const emptyForm = {
  nome: "", descricao: "", olympiad_id: "", professor: "", vagas: 30,
  local: "", horario: "", material_apoio: "", material_estudo: "",
  data_inicio: "", data_fim: "", dias_aulas: "",
};

const WorkshopsTab = () => {
  const { toast } = useToast();
  const [workshops, setWorkshops] = useState<(Workshop & { olympiad_name?: string; enrolled?: number })[]>([]);
  const [olympiads, setOlympiads] = useState<Olympiad[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState<WFile[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const [wsRes, olRes] = await Promise.all([
      supabase.from("workshops").select("*, workshop_enrollments(id)"),
      supabase.from("olympiads").select("id, nome"),
    ]);
    if (olRes.data) setOlympiads(olRes.data);
    if (wsRes.data && olRes.data) {
      setWorkshops(wsRes.data.map((w: any) => ({
        ...w,
        olympiad_name: olRes.data!.find(o => o.id === w.olympiad_id)?.nome || "—",
        enrolled: w.workshop_enrollments?.length || 0,
      })));
    }
  };

  const openNew = () => { setForm(emptyForm); setEditing(null); setFiles([]); setOpen(true); };

  const openEdit = async (w: Workshop) => {
    setForm({
      nome: w.nome, descricao: w.descricao || "", olympiad_id: w.olympiad_id,
      professor: w.professor || "", vagas: w.vagas || 30, local: w.local || "",
      horario: w.horario || "", material_apoio: w.material_apoio || "",
      material_estudo: w.material_estudo || "", data_inicio: w.data_inicio || "",
      data_fim: w.data_fim || "", dias_aulas: w.dias_aulas || "",
    });
    setEditing(w.id);
    const { data } = await supabase.from("workshop_files").select("*").eq("workshop_id", w.id);
    setFiles((data as WFile[]) || []);
    setOpen(true);
  };

  const save = async () => {
    if (!form.nome || !form.olympiad_id) {
      toast({ title: "Nome e Olimpíada são obrigatórios", variant: "destructive" }); return;
    }
    const payload = {
      ...form, vagas: form.vagas || 30,
      data_inicio: form.data_inicio || null, data_fim: form.data_fim || null,
    };
    if (editing) {
      await supabase.from("workshops").update(payload).eq("id", editing);
    } else {
      await supabase.from("workshops").insert(payload);
    }
    toast({ title: editing ? "Oficina atualizada" : "Oficina criada" });
    setOpen(false); load();
  };

  const remove = async (id: string) => {
    await supabase.from("workshops").delete().eq("id", id);
    toast({ title: "Oficina removida" }); load();
  };

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>, tipo: string) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    if (file.size > 50 * 1024 * 1024) { toast({ title: "Arquivo excede 50MB", variant: "destructive" }); return; }
    setUploading(true);
    const path = `workshops/${editing}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("uploads").upload(path, file);
    if (error) { toast({ title: "Erro no upload", description: error.message, variant: "destructive" }); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("uploads").getPublicUrl(path);
    await supabase.from("workshop_files").insert({
      workshop_id: editing, file_url: urlData.publicUrl, file_name: file.name, file_type: file.type, tipo,
    });
    const { data } = await supabase.from("workshop_files").select("*").eq("workshop_id", editing);
    setFiles((data as WFile[]) || []);
    setUploading(false);
    toast({ title: "Arquivo enviado" });
  };

  const removeFile = async (fileId: string) => {
    await supabase.from("workshop_files").delete().eq("id", fileId);
    if (editing) {
      const { data } = await supabase.from("workshop_files").select("*").eq("workshop_id", editing);
      setFiles((data as WFile[]) || []);
    }
    toast({ title: "Arquivo removido" });
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Oficinas</h2>
        <Button size="sm" onClick={openNew}><Plus className="mr-1 h-4 w-4" />Nova Oficina</Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display">{editing ? "Editar Oficina" : "Nova Oficina"}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1"><Label>Nome *</Label><Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} /></div>
              <div className="space-y-1">
                <Label>Olimpíada *</Label>
                <Select value={form.olympiad_id} onValueChange={v => setForm({ ...form, olympiad_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{olympiads.map(o => <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1"><Label>Descrição</Label><Textarea value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} /></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1"><Label>Ministrante</Label><Input value={form.professor} onChange={e => setForm({ ...form, professor: e.target.value })} /></div>
              <div className="space-y-1"><Label>Vagas</Label><Input type="number" value={form.vagas} onChange={e => setForm({ ...form, vagas: parseInt(e.target.value) || 0 })} /></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1"><Label>Local</Label><Input value={form.local} onChange={e => setForm({ ...form, local: e.target.value })} /></div>
              <div className="space-y-1"><Label>Horário</Label><Input value={form.horario} onChange={e => setForm({ ...form, horario: e.target.value })} placeholder="08:00 - 12:00" /></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1"><Label>Data Início</Label><Input type="date" value={form.data_inicio} onChange={e => setForm({ ...form, data_inicio: e.target.value })} /></div>
              <div className="space-y-1"><Label>Data Fim</Label><Input type="date" value={form.data_fim} onChange={e => setForm({ ...form, data_fim: e.target.value })} /></div>
            </div>
            <div className="space-y-1"><Label>Datas das Aulas</Label><Input value={form.dias_aulas} onChange={e => setForm({ ...form, dias_aulas: e.target.value })} placeholder="01/04, 03/04, 05/04..." /></div>

            {/* URLs */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1"><Label>Material de Apoio (URL)</Label><Input value={form.material_apoio} onChange={e => setForm({ ...form, material_apoio: e.target.value })} /></div>
              <div className="space-y-1"><Label>Material de Estudo (URL)</Label><Input value={form.material_estudo} onChange={e => setForm({ ...form, material_estudo: e.target.value })} /></div>
            </div>

            {/* File uploads (only when editing) */}
            {editing && (
              <div className="border-t border-border pt-4 space-y-3">
                <Label className="font-display text-sm">Arquivos (PDF, DOC, Vídeo, Áudio — máx 50MB)</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Material de Apoio</Label>
                    <label className="mt-1 flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-primary/30 px-3 py-2 text-sm hover:border-primary/60 transition-colors">
                      <Upload className="h-4 w-4 text-primary" />{uploading ? "Enviando..." : "Enviar arquivo"}
                      <input type="file" className="hidden" accept=".pdf,.doc,.docx,.mp4,.mp3,.wav,.m4a,.avi,.mov" onChange={e => uploadFile(e, "apoio")} disabled={uploading} />
                    </label>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Material de Estudo</Label>
                    <label className="mt-1 flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-primary/30 px-3 py-2 text-sm hover:border-primary/60 transition-colors">
                      <Upload className="h-4 w-4 text-primary" />{uploading ? "Enviando..." : "Enviar arquivo"}
                      <input type="file" className="hidden" accept=".pdf,.doc,.docx,.mp4,.mp3,.wav,.m4a,.avi,.mov" onChange={e => uploadFile(e, "estudo")} disabled={uploading} />
                    </label>
                  </div>
                </div>
                {files.length > 0 && (
                  <div className="space-y-1">
                    {files.map(f => (
                      <div key={f.id} className="flex items-center gap-2 rounded bg-muted/20 px-3 py-2 text-sm">
                        <FileText className="h-4 w-4 text-primary" />
                        <a href={f.file_url} target="_blank" rel="noreferrer" className="flex-1 truncate hover:underline">{f.file_name}</a>
                        <Badge variant="secondary" className="text-[10px]">{f.tipo}</Badge>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(f.id)}><X className="h-3 w-3" /></Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <Button onClick={save} className="font-display">Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="card-cyber border-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-primary/10">
              <TableHead>Nome</TableHead><TableHead>Ministrante</TableHead><TableHead>Olimpíada</TableHead>
              <TableHead>Vagas</TableHead><TableHead>Inscritos</TableHead><TableHead className="text-right">Ações</TableHead>
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
            {workshops.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhuma oficina</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default WorkshopsTab;

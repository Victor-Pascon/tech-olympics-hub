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
import { Plus, Edit, Trash2, Upload, FileText, X, Users, ClipboardList, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Workshop = {
  id: string; nome: string; descricao: string | null;
  professor: string | null; horario: string | null; local: string | null;
  vagas: number | null; olympiad_id: string | null; total_horas: number | null;
  material_apoio: string | null; material_estudo: string | null;
  data_inicio: string | null; data_fim: string | null; dias_aulas: string | null;
  olympiads?: { nome: string };
  enrolled?: number;
};
type Olympiad = { id: string; nome: string; };
type WFile = { id: string; file_url: string; file_name: string; file_type: string; tipo: string };

const emptyForm = {
  nome: "", descricao: "", professor: "", data_inicio: "", data_fim: "",
  horario: "", local: "", vagas: 30, olympiad_id: "none", total_horas: 0,
  material_apoio: "", material_estudo: "", dias_aulas: "",
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
  const [participantsDialog, setParticipantsDialog] = useState<Workshop | null>(null);
  const [participantsList, setParticipantsList] = useState<any[]>([]);

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

  const loadParticipants = async (w: Workshop) => {
    const { data } = await supabase.from("workshop_enrollments").select("profiles(id, nome, email, cpf)").eq("workshop_id", w.id);
    const { data: attendance } = await supabase.from("attendance").select("*").eq("workshop_id", w.id);

    if (data) {
      const list = data.map((d: any) => d.profiles).filter(Boolean).map((p: any) => {
        const att = attendance?.find(a => a.user_id === p.id);
        return { ...p, user_id: p.id, presente: att?.presente || false, attendance_id: att?.id };
      });
      setParticipantsList(list);
    }
  };

  const openParticipants = async (w: Workshop) => {
    await loadParticipants(w);
    setParticipantsDialog(w);
  };

  const togglePresence = async (userId: string, workshopId: string, currentPresent: boolean, attendanceId?: string) => {
    if (attendanceId) {
      await supabase.from("attendance").update({ presente: !currentPresent }).eq("id", attendanceId);
    } else {
      const w = workshops.find(ws => ws.id === workshopId);
      await supabase.from("attendance").insert({ user_id: userId, workshop_id: workshopId, olympiad_id: w?.olympiad_id || "", presente: true });
    }
    const w = workshops.find(ws => ws.id === workshopId);
    if (w) await loadParticipants(w);
  };

  const printList = (workshopName: string) => {
    const pw = window.open("", "_blank"); if (!pw) return;
    pw.document.write(`<html><head><title>Lista - ${workshopName}</title><style>body{font-family:Arial;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #333;padding:8px;text-align:left}th{background:#eee}</style></head><body><h2>Lista de Presença - ${workshopName}</h2><p>Data: ${new Date().toLocaleDateString("pt-BR")}</p><table><tr><th>#</th><th>Nome</th><th>E-mail</th><th>Assinatura</th></tr>${participantsList.map((p, i) => `<tr><td>${i + 1}</td><td>${p.nome}</td><td>${p.email}</td><td style="width:200px"></td></tr>`).join("")}</table></body></html>`);
    pw.document.close(); pw.print();
  };

  const openEdit = async (w: Workshop) => {
    setForm({
      nome: w.nome, descricao: w.descricao || "", professor: w.professor || "",
      data_inicio: w.data_inicio || "", data_fim: w.data_fim || "",
      horario: w.horario || "", local: w.local || "", vagas: w.vagas || 0,
      olympiad_id: w.olympiad_id || "none", total_horas: (w as any).total_horas || 0,
      material_apoio: w.material_apoio || "", material_estudo: w.material_estudo || "",
      dias_aulas: w.dias_aulas || "",
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
      ...form, vagas: form.vagas || 0,
      data_inicio: form.data_inicio || null, data_fim: form.data_fim || null,
      olympiad_id: form.olympiad_id !== "none" ? form.olympiad_id : null,
      total_horas: form.total_horas || 0,
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
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1"><Label>Vagas</Label><Input type="number" value={form.vagas} onChange={e => setForm({ ...form, vagas: parseInt(e.target.value) || 0 })} /></div>
              <div className="space-y-1"><Label>Carga Horária</Label><Input type="number" value={form.total_horas} onChange={e => setForm({ ...form, total_horas: parseInt(e.target.value) || 0 })} /></div>
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

      <Dialog open={!!participantsDialog} onOpenChange={(o) => { if (!o) setParticipantsDialog(null); }}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center justify-between">
              Inscritos - {participantsDialog?.nome}
              <Button size="sm" variant="outline" onClick={() => printList(participantsDialog?.nome || "")}><Printer className="mr-1 h-3 w-3" />Imprimir Lista</Button>
            </DialogTitle>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead className="text-right">Ação / Presença</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participantsList.map((p, i) => (
                <TableRow key={p.id || i}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell className="font-medium">{p.nome}</TableCell>
                  <TableCell>{p.email}</TableCell>
                  <TableCell>{p.cpf || "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant={p.presente ? "default" : "outline"} onClick={() => togglePresence(p.user_id, participantsDialog!.id, p.presente, p.attendance_id)}>
                      {p.presente ? "✓ Presente" : "Marcar"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {participantsList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhum inscrito ainda.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
                  <Button variant="ghost" size="icon" title="Ver Inscritos e Lançar Presença" onClick={() => openParticipants(ws)}>
                    <Users className="h-4 w-4 text-accent" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Editar" onClick={() => openEdit(ws)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Excluir" className="text-destructive" onClick={() => remove(ws.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
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

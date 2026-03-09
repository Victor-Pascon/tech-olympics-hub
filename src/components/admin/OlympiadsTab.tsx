import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Users, ClipboardList, Printer, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Olympiad = {
  id: string; nome: string; descricao: string | null; tipo: string | null;
  data_inicio: string | null; data_fim: string | null; local: string | null;
  responsavel: string | null; observacoes: string | null; numero_edital: string | null;
  limite_participantes: number | null; faixa_etaria: string | null; status: string | null;
};

type Activity = { id?: string; nome: string; descricao: string };

const emptyForm = {
  nome: "", descricao: "", tipo: "", data_inicio: "", data_fim: "", local: "",
  responsavel: "", observacoes: "", numero_edital: "", limite_participantes: 0,
  faixa_etaria: "", status: "ativa",
};

const OlympiadsTab = () => {
  const { toast } = useToast();
  const [olympiads, setOlympiads] = useState<Olympiad[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [newActivity, setNewActivity] = useState({ nome: "", descricao: "" });
  const [participantsDialog, setParticipantsDialog] = useState<string | null>(null);
  const [participants, setParticipants] = useState<{ nome: string; email: string; presente: boolean; attendance_id?: string }[]>([]);
  const [attendanceDialog, setAttendanceDialog] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await supabase.from("olympiads").select("*").order("created_at", { ascending: false });
    if (data) setOlympiads(data);
  };

  const openNew = () => {
    setForm(emptyForm);
    setActivities([]);
    setEditing(null);
    setOpen(true);
  };

  const openEdit = async (o: Olympiad) => {
    setForm({
      nome: o.nome, descricao: o.descricao || "", tipo: o.tipo || "",
      data_inicio: o.data_inicio || "", data_fim: o.data_fim || "",
      local: o.local || "", responsavel: o.responsavel || "",
      observacoes: o.observacoes || "", numero_edital: o.numero_edital || "",
      limite_participantes: o.limite_participantes || 0,
      faixa_etaria: o.faixa_etaria || "", status: o.status || "ativa",
    });
    const { data: acts } = await supabase.from("olympiad_activities").select("*").eq("olympiad_id", o.id);
    setActivities(acts?.map(a => ({ id: a.id, nome: a.nome, descricao: a.descricao || "" })) || []);
    setEditing(o.id);
    setOpen(true);
  };

  const save = async () => {
    if (!form.nome) { toast({ title: "Nome é obrigatório", variant: "destructive" }); return; }

    const payload = {
      ...form,
      limite_participantes: form.limite_participantes || 0,
      data_inicio: form.data_inicio || null,
      data_fim: form.data_fim || null,
    };

    let olympiadId = editing;
    if (editing) {
      await supabase.from("olympiads").update(payload).eq("id", editing);
    } else {
      const { data } = await supabase.from("olympiads").insert(payload).select("id").single();
      if (data) olympiadId = data.id;
    }

    if (olympiadId) {
      // Sync activities: delete existing, re-insert
      await supabase.from("olympiad_activities").delete().eq("olympiad_id", olympiadId);
      if (activities.length > 0) {
        await supabase.from("olympiad_activities").insert(
          activities.map(a => ({ olympiad_id: olympiadId!, nome: a.nome, descricao: a.descricao }))
        );
      }
    }

    toast({ title: editing ? "Olimpíada atualizada" : "Olimpíada criada" });
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("olympiad_activities").delete().eq("olympiad_id", id);
    await supabase.from("olympiads").delete().eq("id", id);
    toast({ title: "Olimpíada removida" });
    load();
  };

  const addActivity = () => {
    if (!newActivity.nome) return;
    setActivities([...activities, { ...newActivity }]);
    setNewActivity({ nome: "", descricao: "" });
  };

  const removeActivity = (i: number) => {
    setActivities(activities.filter((_, idx) => idx !== i));
  };

  const loadParticipants = async (olympiadId: string) => {
    // Get workshops for this olympiad, then enrollments
    const { data: ws } = await supabase.from("workshops").select("id").eq("olympiad_id", olympiadId);
    if (!ws?.length) { setParticipants([]); setParticipantsDialog(olympiadId); return; }

    const wsIds = ws.map(w => w.id);
    const { data: enrollments } = await supabase
      .from("workshop_enrollments")
      .select("user_id")
      .in("workshop_id", wsIds);

    if (!enrollments?.length) { setParticipants([]); setParticipantsDialog(olympiadId); return; }

    const userIds = [...new Set(enrollments.map(e => e.user_id))];
    const { data: profiles } = await supabase.from("profiles").select("id, nome, email").in("id", userIds);

    // Get attendance
    const { data: attendance } = await supabase
      .from("attendance")
      .select("*")
      .eq("olympiad_id", olympiadId)
      .in("user_id", userIds);

    const participantsList = (profiles || []).map(p => {
      const att = attendance?.find(a => a.user_id === p.id);
      return { nome: p.nome, email: p.email, presente: att?.presente || false, attendance_id: att?.id, user_id: p.id };
    });

    setParticipants(participantsList as any);
    setParticipantsDialog(olympiadId);
  };

  const openAttendance = async (olympiadId: string) => {
    await loadParticipants(olympiadId);
    setAttendanceDialog(olympiadId);
    setParticipantsDialog(null);
  };

  const togglePresence = async (userId: string, olympiadId: string, currentPresent: boolean, attendanceId?: string) => {
    if (attendanceId) {
      await supabase.from("attendance").update({ presente: !currentPresent }).eq("id", attendanceId);
    } else {
      await supabase.from("attendance").insert({ user_id: userId, olympiad_id: olympiadId, presente: true });
    }
    // Reload
    await loadParticipants(olympiadId);
    setAttendanceDialog(olympiadId);
    setParticipantsDialog(null);
  };

  const printList = (olympiadName: string) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Lista de Presença - ${olympiadName}</title>
      <style>body{font-family:Arial;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #333;padding:8px;text-align:left}th{background:#eee}</style>
      </head><body>
      <h2>Lista de Presença - ${olympiadName}</h2>
      <p>Data: ${new Date().toLocaleDateString("pt-BR")}</p>
      <table><tr><th>#</th><th>Nome</th><th>E-mail</th><th>Assinatura</th></tr>
      ${participants.map((p, i) => `<tr><td>${i + 1}</td><td>${p.nome}</td><td>${p.email}</td><td style="width:200px"></td></tr>`).join("")}
      </table></body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Olimpíadas Cadastradas</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openNew}><Plus className="mr-1 h-4 w-4" />Nova Olimpíada</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">{editing ? "Editar Olimpíada" : "Nova Olimpíada"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1"><Label>Nome *</Label><Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} /></div>
                <div className="space-y-1"><Label>Tipo</Label><Input value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} placeholder="Ex: Cibersegurança" /></div>
              </div>
              <div className="space-y-1"><Label>Descrição</Label><Textarea value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} /></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1"><Label>Data Início</Label><Input type="date" value={form.data_inicio} onChange={e => setForm({ ...form, data_inicio: e.target.value })} /></div>
                <div className="space-y-1"><Label>Data Fim</Label><Input type="date" value={form.data_fim} onChange={e => setForm({ ...form, data_fim: e.target.value })} /></div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1"><Label>Local</Label><Input value={form.local} onChange={e => setForm({ ...form, local: e.target.value })} /></div>
                <div className="space-y-1"><Label>Responsável</Label><Input value={form.responsavel} onChange={e => setForm({ ...form, responsavel: e.target.value })} /></div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1"><Label>Nº Edital</Label><Input value={form.numero_edital} onChange={e => setForm({ ...form, numero_edital: e.target.value })} /></div>
                <div className="space-y-1"><Label>Limite Participantes</Label><Input type="number" value={form.limite_participantes} onChange={e => setForm({ ...form, limite_participantes: parseInt(e.target.value) || 0 })} /></div>
                <div className="space-y-1"><Label>Faixa Etária</Label><Input value={form.faixa_etaria} onChange={e => setForm({ ...form, faixa_etaria: e.target.value })} placeholder="Ex: 14-25 anos" /></div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativa">Ativa</SelectItem>
                      <SelectItem value="inativa">Inativa</SelectItem>
                      <SelectItem value="encerrada">Encerrada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1"><Label>Observações</Label><Textarea value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} /></div>

              {/* Activities */}
              <div className="border-t border-border pt-4">
                <Label className="font-display text-sm">Atividades / Subcategorias</Label>
                <div className="mt-2 space-y-2">
                  {activities.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 rounded bg-muted/20 px-3 py-2">
                      <span className="flex-1 text-sm">{a.nome} {a.descricao && `— ${a.descricao}`}</span>
                      <Button variant="ghost" size="icon" onClick={() => removeActivity(i)}><X className="h-3 w-3" /></Button>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <Input placeholder="Nome da atividade" value={newActivity.nome} onChange={e => setNewActivity({ ...newActivity, nome: e.target.value })} className="flex-1" />
                  <Input placeholder="Descrição (opcional)" value={newActivity.descricao} onChange={e => setNewActivity({ ...newActivity, descricao: e.target.value })} className="flex-1" />
                  <Button variant="outline" size="sm" onClick={addActivity}><Plus className="h-3 w-3" /></Button>
                </div>
              </div>

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
              <TableHead>Tipo</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {olympiads.map((o) => (
              <TableRow key={o.id} className="border-primary/5">
                <TableCell className="font-medium">{o.nome}</TableCell>
                <TableCell><Badge variant="secondary">{o.tipo || "—"}</Badge></TableCell>
                <TableCell className="text-sm">
                  {o.data_inicio ? new Date(o.data_inicio).toLocaleDateString("pt-BR") : "—"} — {o.data_fim ? new Date(o.data_fim).toLocaleDateString("pt-BR") : "—"}
                </TableCell>
                <TableCell>
                  <Badge className={o.status === "ativa" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}>
                    {o.status || "ativa"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" title="Ver Participantes" onClick={() => loadParticipants(o.id)}>
                    <Users className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Lançar Presença" onClick={() => openAttendance(o.id)}>
                    <ClipboardList className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Editar" onClick={() => openEdit(o)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => remove(o.id)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {olympiads.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhuma olimpíada cadastrada</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Participants Dialog */}
      <Dialog open={!!participantsDialog} onOpenChange={() => setParticipantsDialog(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center justify-between">
              Participantes
              <Button size="sm" variant="outline" onClick={() => printList(olympiads.find(o => o.id === participantsDialog)?.nome || "")}>
                <Printer className="mr-1 h-3 w-3" />Imprimir
              </Button>
            </DialogTitle>
          </DialogHeader>
          {participants.length > 0 ? (
            <Table>
              <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Nome</TableHead><TableHead>E-mail</TableHead></TableRow></TableHeader>
              <TableBody>
                {participants.map((p, i) => (
                  <TableRow key={i}><TableCell>{i + 1}</TableCell><TableCell>{p.nome}</TableCell><TableCell className="text-sm">{p.email}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum participante inscrito</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Attendance Dialog */}
      <Dialog open={!!attendanceDialog} onOpenChange={() => setAttendanceDialog(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center justify-between">
              Lançar Presença
              <Button size="sm" variant="outline" onClick={() => printList(olympiads.find(o => o.id === attendanceDialog)?.nome || "")}>
                <Printer className="mr-1 h-3 w-3" />Imprimir Lista
              </Button>
            </DialogTitle>
          </DialogHeader>
          {participants.length > 0 ? (
            <Table>
              <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Presença</TableHead></TableRow></TableHeader>
              <TableBody>
                {participants.map((p: any, i) => (
                  <TableRow key={i}>
                    <TableCell>{p.nome}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant={p.presente ? "default" : "outline"}
                        onClick={() => togglePresence(p.user_id, attendanceDialog!, p.presente, p.attendance_id)}
                      >
                        {p.presente ? "✓ Presente" : "Marcar"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum participante para lançar presença</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OlympiadsTab;

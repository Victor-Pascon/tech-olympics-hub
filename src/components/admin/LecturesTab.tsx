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
import { Plus, Edit, Trash2, Users, Printer, X, Mic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Lecture = {
  id: string; nome: string; descricao: string | null;
  local: string | null; carga_horaria: number | null;
  data_evento: string | null; horario: string | null;
  vagas: number | null; certificates_released: boolean | null;
  enrolled?: number;
};

type Speaker = {
  id?: string; nome: string; email: string; bio: string; topico: string;
};

const emptyForm = {
  nome: "", descricao: "", local: "", carga_horaria: 0,
  data_evento: "", horario: "", vagas: 50,
};

const emptySpeaker: Speaker = { nome: "", email: "", bio: "", topico: "" };

const LecturesTab = () => {
  const { toast } = useToast();
  const [lectures, setLectures] = useState<(Lecture & { enrolled?: number })[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [newSpeaker, setNewSpeaker] = useState<Speaker>({ ...emptySpeaker });
  const [participantsDialog, setParticipantsDialog] = useState<Lecture | null>(null);
  const [participantsList, setParticipantsList] = useState<any[]>([]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await supabase.from("lectures").select("*, lecture_enrollments(id)").order("created_at", { ascending: false });
    if (data) {
      setLectures(data.map((l: any) => ({
        ...l,
        enrolled: l.lecture_enrollments?.length || 0,
      })));
    }
  };

  const openNew = () => { setForm(emptyForm); setSpeakers([]); setNewSpeaker({ ...emptySpeaker }); setEditing(null); setOpen(true); };

  const openEdit = async (l: Lecture) => {
    setForm({
      nome: l.nome, descricao: l.descricao || "", local: l.local || "",
      carga_horaria: l.carga_horaria || 0, data_evento: l.data_evento || "",
      horario: l.horario || "", vagas: l.vagas || 0,
    });
    setEditing(l.id);
    const { data } = await supabase.from("lecture_speakers").select("*").eq("lecture_id", l.id);
    setSpeakers((data || []).map((s: any) => ({
      id: s.id, nome: s.nome, email: s.email || "", bio: s.bio || "", topico: s.topico || "",
    })));
    setNewSpeaker({ ...emptySpeaker });
    setOpen(true);
  };

  const addSpeaker = () => {
    if (!newSpeaker.nome) return;
    setSpeakers([...speakers, { ...newSpeaker }]);
    setNewSpeaker({ ...emptySpeaker });
  };

  const removeSpeaker = (i: number) => setSpeakers(speakers.filter((_, idx) => idx !== i));

  const save = async () => {
    if (!form.nome) { toast({ title: "Nome é obrigatório", variant: "destructive" }); return; }
    const payload = {
      ...form, carga_horaria: form.carga_horaria || 0, vagas: form.vagas || 0,
      data_evento: form.data_evento || null,
    };
    let lectureId = editing;
    if (editing) {
      await supabase.from("lectures").update(payload).eq("id", editing);
    } else {
      const { data } = await supabase.from("lectures").insert(payload).select("id").single();
      if (data) lectureId = data.id;
    }
    if (lectureId) {
      await supabase.from("lecture_speakers").delete().eq("lecture_id", lectureId);
      if (speakers.length > 0) {
        await supabase.from("lecture_speakers").insert(
          speakers.map(s => ({
            lecture_id: lectureId!, nome: s.nome, email: s.email, bio: s.bio, topico: s.topico,
          }))
        );
      }
    }
    toast({ title: editing ? "Palestra atualizada" : "Palestra criada" });
    setOpen(false); load();
  };

  const remove = async (id: string) => {
    await supabase.from("lecture_speakers").delete().eq("lecture_id", id);
    await supabase.from("lectures").delete().eq("id", id);
    toast({ title: "Palestra removida" }); load();
  };

  const loadParticipants = async (l: Lecture) => {
    const { data: enrollments } = await supabase.from("lecture_enrollments").select("user_id").eq("lecture_id", l.id);
    if (!enrollments?.length) { setParticipantsList([]); return; }

    const userIds = [...new Set(enrollments.map(e => e.user_id))];
    const { data: profiles } = await supabase.from("profiles").select("id, nome, email, cpf").in("id", userIds);
    const { data: attendance } = await supabase.from("attendance").select("*").eq("lecture_id", l.id);

    const list = (profiles || []).map((p: any) => {
      const att = attendance?.find((a: any) => a.user_id === p.id);
      return { ...p, user_id: p.id, presente: att?.presente || false, attendance_id: att?.id };
    });
    setParticipantsList(list);
  };

  const openParticipants = async (l: Lecture) => {
    await loadParticipants(l);
    setParticipantsDialog(l);
  };

  const togglePresence = async (userId: string, lectureId: string, currentPresent: boolean, attendanceId?: string) => {
    if (attendanceId) {
      await supabase.from("attendance").update({ presente: !currentPresent }).eq("id", attendanceId);
    } else {
      await supabase.from("attendance").insert({ user_id: userId, lecture_id: lectureId, olympiad_id: "00000000-0000-0000-0000-000000000000", presente: true } as any);
    }
    const l = lectures.find(lec => lec.id === lectureId);
    if (l) await loadParticipants(l);
  };

  const printList = (lectureName: string) => {
    const pw = window.open("", "_blank"); if (!pw) return;
    pw.document.write(`<html><head><title>Lista - ${lectureName}</title><style>body{font-family:Arial;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #333;padding:8px;text-align:left}th{background:#eee}</style></head><body><h2>Lista de Presença - ${lectureName}</h2><p>Data: ${new Date().toLocaleDateString("pt-BR")}</p><table><tr><th>#</th><th>Nome</th><th>E-mail</th><th>Assinatura</th></tr>${participantsList.map((p, i) => `<tr><td>${i + 1}</td><td>${p.nome}</td><td>${p.email}</td><td style="width:200px"></td></tr>`).join("")}</table></body></html>`);
    pw.document.close(); pw.print();
  };

  const F = (key: string, val: string | number) => setForm({ ...form, [key]: val });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Palestras</h2>
        <Button size="sm" onClick={openNew}><Plus className="mr-1 h-4 w-4" />Nova Palestra</Button>
      </div>

      {/* Form Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display">{editing ? "Editar Palestra" : "Nova Palestra"}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1"><Label>Nome *</Label><Input value={form.nome} onChange={e => F("nome", e.target.value)} /></div>
              <div className="space-y-1"><Label>Local</Label><Input value={form.local} onChange={e => F("local", e.target.value)} placeholder="Auditório Principal" /></div>
            </div>
            <div className="space-y-1"><Label>Descrição</Label><Textarea value={form.descricao} onChange={e => F("descricao", e.target.value)} /></div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1"><Label>Carga Horária (h)</Label><Input type="number" value={form.carga_horaria} onChange={e => F("carga_horaria", parseInt(e.target.value) || 0)} /></div>
              <div className="space-y-1"><Label>Data do Evento</Label><Input type="date" value={form.data_evento} onChange={e => F("data_evento", e.target.value)} /></div>
              <div className="space-y-1"><Label>Horário</Label><Input value={form.horario} onChange={e => F("horario", e.target.value)} placeholder="14:00 - 17:00" /></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1"><Label>Vagas</Label><Input type="number" value={form.vagas} onChange={e => F("vagas", parseInt(e.target.value) || 0)} /></div>
            </div>

            {/* Speakers */}
            <div className="border-t border-border pt-4">
              <Label className="font-display text-sm flex items-center gap-2"><Mic className="h-4 w-4" /> Palestrantes</Label>
              <div className="mt-2 space-y-2">
                {speakers.map((s, i) => (
                  <div key={i} className="rounded-lg bg-muted/20 p-3 space-y-1">
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">{s.nome}</p>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {s.email && <span>E-mail: {s.email}</span>}
                          {s.topico && <span>• Tópico: {s.topico}</span>}
                        </div>
                        {s.bio && <p className="text-xs text-muted-foreground mt-1">{s.bio}</p>}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeSpeaker(i)}><X className="h-3 w-3" /></Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-lg border border-border p-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Adicionar Palestrante</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input placeholder="Nome *" value={newSpeaker.nome} onChange={e => setNewSpeaker({ ...newSpeaker, nome: e.target.value })} />
                  <Input placeholder="E-mail" value={newSpeaker.email} onChange={e => setNewSpeaker({ ...newSpeaker, email: e.target.value })} />
                </div>
                <Input placeholder="Tópico a ser abordado" value={newSpeaker.topico} onChange={e => setNewSpeaker({ ...newSpeaker, topico: e.target.value })} />
                <Textarea placeholder="Mini biografia (opcional)" rows={2} value={newSpeaker.bio} onChange={e => setNewSpeaker({ ...newSpeaker, bio: e.target.value })} />
                <Button variant="outline" size="sm" onClick={addSpeaker}><Plus className="mr-1 h-3 w-3" />Adicionar</Button>
              </div>
            </div>

            <Button onClick={save} className="font-display">Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Participants Dialog */}
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

      {/* Lectures Table */}
      <Card className="card-cyber border-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-primary/10">
              <TableHead>Nome</TableHead><TableHead>Local</TableHead><TableHead>Data</TableHead>
              <TableHead>Horário</TableHead><TableHead>Vagas</TableHead><TableHead>Inscritos</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lectures.map((l) => (
              <TableRow key={l.id} className="border-primary/5">
                <TableCell className="font-medium">{l.nome}</TableCell>
                <TableCell>{l.local || "—"}</TableCell>
                <TableCell>{l.data_evento ? new Date(l.data_evento + "T12:00").toLocaleDateString("pt-BR") : "—"}</TableCell>
                <TableCell>{l.horario || "—"}</TableCell>
                <TableCell>{l.vagas}</TableCell>
                <TableCell>{l.enrolled}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" title="Ver Inscritos e Lançar Presença" onClick={() => openParticipants(l)}>
                    <Users className="h-4 w-4 text-accent" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Editar" onClick={() => openEdit(l)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Excluir" className="text-destructive" onClick={() => remove(l.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {lectures.length === 0 && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Nenhuma palestra cadastrada</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default LecturesTab;

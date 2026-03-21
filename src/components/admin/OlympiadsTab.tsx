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
import { Plus, Edit, Trash2, Users, ClipboardList, Printer, X, ListPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Olympiad = {
  id: string; nome: string; descricao: string | null; tipo: string | null;
  data_inicio: string | null; data_fim: string | null; local: string | null;
  responsavel: string | null; observacoes: string | null; numero_edital: string | null;
  limite_participantes: number | null; faixa_etaria: string | null; status: string | null;
  cep: string | null; rua: string | null; bairro: string | null; cidade: string | null;
  estado: string | null; numero_endereco: string | null; complemento: string | null;
  ponto_referencia: string | null; horario: string | null; dias_semana: string | null;
  total_horas: number | null;
};

type Activity = {
  id?: string; nome: string; descricao: string; responsavel: string;
  horario: string; data_atividade: string; local_sala: string; limite_vagas: number; total_horas: number;
};

const emptyForm = {
  nome: "", descricao: "", tipo: "", data_inicio: "", data_fim: "", local: "",
  responsavel: "", observacoes: "", numero_edital: "", limite_participantes: 0,
  faixa_etaria: "", status: "ativa", cep: "", rua: "", bairro: "", cidade: "",
  estado: "", numero_endereco: "", complemento: "", ponto_referencia: "",
  horario: "", dias_semana: "", total_horas: 0,
};

const emptyActivity: Activity = {
  nome: "", descricao: "", responsavel: "", horario: "", data_atividade: "", local_sala: "", limite_vagas: 30, total_horas: 0,
};

const OlympiadsTab = () => {
  const { toast } = useToast();
  const [olympiads, setOlympiads] = useState<Olympiad[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [newActivity, setNewActivity] = useState<Activity>({ ...emptyActivity });
  const [participantsDialog, setParticipantsDialog] = useState<string | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [activityDialog, setActivityDialog] = useState<string | null>(null);
  const [activityDialogActivities, setActivityDialogActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<string>("all");
  const [currentOlympiadActivities, setCurrentOlympiadActivities] = useState<{id: string, nome: string}[]>([]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await supabase.from("olympiads").select("*").order("created_at", { ascending: false });
    if (data) setOlympiads(data as any);
  };

  const openNew = () => { setForm(emptyForm); setActivities([]); setEditing(null); setOpen(true); };

  const openEdit = async (o: Olympiad) => {
    setForm({
      nome: o.nome, descricao: o.descricao || "", tipo: o.tipo || "",
      data_inicio: o.data_inicio || "", data_fim: o.data_fim || "",
      local: o.local || "", responsavel: o.responsavel || "",
      observacoes: o.observacoes || "", numero_edital: o.numero_edital || "",
      limite_participantes: o.limite_participantes || 0,
      faixa_etaria: o.faixa_etaria || "", status: o.status || "ativa",
      cep: o.cep || "", rua: o.rua || "", bairro: o.bairro || "",
      cidade: o.cidade || "", estado: o.estado || "", numero_endereco: o.numero_endereco || "",
      complemento: o.complemento || "", ponto_referencia: o.ponto_referencia || "",
      horario: o.horario || "", dias_semana: o.dias_semana || "", total_horas: o.total_horas || 0,
    });
    const { data: acts } = await supabase.from("olympiad_activities").select("*").eq("olympiad_id", o.id);
    setActivities(acts?.map((a: any) => ({
      id: a.id, nome: a.nome, descricao: a.descricao || "", responsavel: a.responsavel || "",
      horario: a.horario || "", data_atividade: a.data_atividade || "", local_sala: a.local_sala || "",
      limite_vagas: a.limite_vagas || 0, total_horas: a.total_horas || 0,
    })) || []);
    setEditing(o.id);
    setOpen(true);
  };

  const save = async () => {
    if (!form.nome) { toast({ title: "Nome é obrigatório", variant: "destructive" }); return; }
    const payload = {
      ...form, limite_participantes: form.limite_participantes || 0,
      data_inicio: form.data_inicio || null, data_fim: form.data_fim || null,
      total_horas: form.total_horas || 0,
    };
    let olympiadId = editing;
    if (editing) {
      await supabase.from("olympiads").update(payload).eq("id", editing);
    } else {
      const { data } = await supabase.from("olympiads").insert(payload).select("id").single();
      if (data) olympiadId = data.id;
    }
    if (olympiadId) {
      await supabase.from("olympiad_activities").delete().eq("olympiad_id", olympiadId);
      if (activities.length > 0) {
        await supabase.from("olympiad_activities").insert(
          activities.map(a => ({
            olympiad_id: olympiadId!, nome: a.nome, descricao: a.descricao,
            responsavel: a.responsavel, horario: a.horario,
            data_atividade: a.data_atividade || null, local_sala: a.local_sala,
            limite_vagas: a.limite_vagas, total_horas: a.total_horas || 0,
          }))
        );
      }
    }
    toast({ title: editing ? "Olimpíada atualizada" : "Olimpíada criada" });
    setOpen(false); load();
  };

  const remove = async (id: string) => {
    await supabase.from("olympiad_activities").delete().eq("olympiad_id", id);
    await supabase.from("olympiads").delete().eq("id", id);
    toast({ title: "Olimpíada removida" }); load();
  };

  const addActivity = () => {
    if (!newActivity.nome) return;
    setActivities([...activities, { ...newActivity }]);
    setNewActivity({ ...emptyActivity });
  };

  const removeActivity = (i: number) => setActivities(activities.filter((_, idx) => idx !== i));

  // Manage activities from table (separate dialog)
  const openActivityManager = async (olympiadId: string) => {
    const { data } = await supabase.from("olympiad_activities").select("*").eq("olympiad_id", olympiadId);
    setActivityDialogActivities(data?.map((a: any) => ({
      id: a.id, nome: a.nome, descricao: a.descricao || "", responsavel: a.responsavel || "",
      horario: a.horario || "", data_atividade: a.data_atividade || "", local_sala: a.local_sala || "",
      limite_vagas: a.limite_vagas || 0, total_horas: a.total_horas || 0,
    })) || []);
    setActivityDialog(olympiadId);
  };

  const saveExternalActivity = async () => {
    if (!newActivity.nome || !activityDialog) return;
    await supabase.from("olympiad_activities").insert({
      olympiad_id: activityDialog, nome: newActivity.nome, descricao: newActivity.descricao,
      responsavel: newActivity.responsavel, horario: newActivity.horario,
      data_atividade: newActivity.data_atividade || null, local_sala: newActivity.local_sala,
      limite_vagas: newActivity.limite_vagas, total_horas: newActivity.total_horas || 0,
    });
    setNewActivity({ ...emptyActivity });
    toast({ title: "Atividade adicionada" });
    openActivityManager(activityDialog);
  };

  const removeExternalActivity = async (actId: string) => {
    await supabase.from("olympiad_activities").delete().eq("id", actId);
    if (activityDialog) openActivityManager(activityDialog);
    toast({ title: "Atividade removida" });
  };

  const loadParticipants = async (olympiadId: string, actIdFilter: string = "all") => {
    let query = supabase.from("olympiad_enrollments").select("user_id, activity_id, olympiad_activities(nome)").eq("olympiad_id", olympiadId);
    if (actIdFilter !== "all" && actIdFilter) {
      query = query.eq("activity_id", actIdFilter);
    }
    const { data: enrollments } = await query;

    if (!enrollments?.length) { setParticipants([]); return; }

    const userIds = [...new Set(enrollments.map(e => e.user_id))];
    const { data: profiles } = await supabase.from("profiles").select("id, nome, email").in("id", userIds);
    
    // Fetch attendance for this olympiad
    const { data: attendance } = await supabase.from("attendance").select("*").eq("olympiad_id", olympiadId).in("user_id", userIds);

    // If filtering by activity, we should only show the row for that activity.
    // Otherwise, we group by user and show all modalities, and general attendance.
    if (actIdFilter !== "all") {
      setParticipants((profiles || []).map(p => {
        const att = attendance?.find(a => a.user_id === p.id && a.activity_id === actIdFilter);
        const actName = currentOlympiadActivities.find(a => a.id === actIdFilter)?.nome || "Específica";
        return { ...p, user_id: p.id, presente: att?.presente || false, attendance_id: att?.id, modalidades: actName, activity_id: actIdFilter };
      }));
    } else {
      setParticipants((profiles || []).map(p => {
        const userEnrolls = enrollments.filter(e => e.user_id === p.id);
        const modalidades = userEnrolls.map(e => (e.olympiad_activities as any)?.nome).filter(Boolean).join(", ") || "Inscrição Geral";
        const att = attendance?.find(a => a.user_id === p.id && !a.activity_id); // General attendance
        return { ...p, user_id: p.id, presente: att?.presente || false, attendance_id: att?.id, modalidades, activity_id: null };
      }));
    }
  };

  const openParticipants = async (olympiadId: string) => {
    const { data } = await supabase.from("olympiad_activities").select("id, nome").eq("olympiad_id", olympiadId);
    setCurrentOlympiadActivities(data || []);
    setSelectedActivity("all");
    await loadParticipants(olympiadId, "all");
    setParticipantsDialog(olympiadId);
  };

  const handleFilterChange = async (val: string, olympiadId: string) => {
    setSelectedActivity(val);
    await loadParticipants(olympiadId, val);
  };

  const togglePresence = async (userId: string, olympiadId: string, currentPresent: boolean, attendanceId?: string, activityId?: string | null) => {
    if (attendanceId) {
      await supabase.from("attendance").update({ presente: !currentPresent }).eq("id", attendanceId);
    } else {
      await supabase.from("attendance").insert({ user_id: userId, olympiad_id: olympiadId, activity_id: activityId || null, presente: true });
    }
    await loadParticipants(olympiadId, selectedActivity);
  };

  const printList = (olympiadName: string) => {
    const actName = currentOlympiadActivities.find(a => a.id === selectedActivity)?.nome;
    const printTitle = actName ? `${olympiadName} - ${actName}` : `${olympiadName} (Geral)`;
    const pw = window.open("", "_blank"); if (!pw) return;
    pw.document.write(`<html><head><title>Lista - ${printTitle}</title><style>body{font-family:Arial;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #333;padding:8px;text-align:left}th{background:#eee}</style></head><body><h2>Lista de Presença - ${printTitle}</h2><p>Data: ${new Date().toLocaleDateString("pt-BR")}</p><table><tr><th>#</th><th>Nome</th><th>E-mail</th><th>Assinatura</th></tr>${participants.map((p, i) => `<tr><td>${i + 1}</td><td>${p.nome}</td><td>${p.email}</td><td style="width:200px"></td></tr>`).join("")}</table></body></html>`);
    pw.document.close(); pw.print();
  };

  const F = (key: string, val: string) => setForm({ ...form, [key]: val });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Olimpíadas Cadastradas</h2>
        <Button size="sm" onClick={openNew}><Plus className="mr-1 h-4 w-4" />Nova Olimpíada</Button>
      </div>

      {/* Main Form Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display">{editing ? "Editar Olimpíada" : "Nova Olimpíada"}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1"><Label>Nome *</Label><Input value={form.nome} onChange={e => F("nome", e.target.value)} /></div>
              <div className="space-y-1"><Label>Tipo</Label><Input value={form.tipo} onChange={e => F("tipo", e.target.value)} placeholder="Ex: Cibersegurança" /></div>
            </div>
            <div className="space-y-1"><Label>Descrição</Label><Textarea value={form.descricao} onChange={e => F("descricao", e.target.value)} /></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1"><Label>Data Início</Label><Input type="date" value={form.data_inicio} onChange={e => F("data_inicio", e.target.value)} /></div>
              <div className="space-y-1"><Label>Data Fim</Label><Input type="date" value={form.data_fim} onChange={e => F("data_fim", e.target.value)} /></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1"><Label>Horário</Label><Input value={form.horario} onChange={e => F("horario", e.target.value)} placeholder="Ex: 08:00 - 17:00" /></div>
              <div className="space-y-1"><Label>Dias da Semana</Label><Input value={form.dias_semana} onChange={e => F("dias_semana", e.target.value)} placeholder="Ex: Seg, Ter, Qua" /></div>
            </div>

            {/* Address Section */}
            <div className="border-t border-border pt-4">
              <Label className="font-display text-sm">Endereço</Label>
              <div className="mt-2 space-y-1"><Label>Nome do Local</Label><Input value={form.local} onChange={e => F("local", e.target.value)} placeholder="Ex: IFES Campus Serra" /></div>
              <div className="mt-2 grid gap-3 sm:grid-cols-3">
                <div className="space-y-1"><Label>CEP</Label><Input value={form.cep} onChange={e => F("cep", e.target.value)} placeholder="29000-000" /></div>
                <div className="space-y-1 sm:col-span-2"><Label>Rua</Label><Input value={form.rua} onChange={e => F("rua", e.target.value)} /></div>
              </div>
              <div className="mt-2 grid gap-3 sm:grid-cols-3">
                <div className="space-y-1"><Label>Número</Label><Input value={form.numero_endereco} onChange={e => F("numero_endereco", e.target.value)} /></div>
                <div className="space-y-1"><Label>Bairro</Label><Input value={form.bairro} onChange={e => F("bairro", e.target.value)} /></div>
                <div className="space-y-1"><Label>Complemento</Label><Input value={form.complemento} onChange={e => F("complemento", e.target.value)} /></div>
              </div>
              <div className="mt-2 grid gap-3 sm:grid-cols-3">
                <div className="space-y-1"><Label>Cidade</Label><Input value={form.cidade} onChange={e => F("cidade", e.target.value)} /></div>
                <div className="space-y-1"><Label>Estado</Label><Input value={form.estado} onChange={e => F("estado", e.target.value)} placeholder="ES" /></div>
                <div className="space-y-1"><Label>Ponto de Referência</Label><Input value={form.ponto_referencia} onChange={e => F("ponto_referencia", e.target.value)} /></div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1"><Label>Responsável</Label><Input value={form.responsavel} onChange={e => F("responsavel", e.target.value)} /></div>
              <div className="space-y-1"><Label>Nº Edital</Label><Input value={form.numero_edital} onChange={e => F("numero_edital", e.target.value)} /></div>
              <div className="space-y-1"><Label>Carga Horária (Geral)</Label><Input type="number" value={form.total_horas} onChange={e => setForm({ ...form, total_horas: parseInt(e.target.value) || 0 })} placeholder="0" /></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1"><Label>Limite Participantes</Label><Input type="number" value={form.limite_participantes} onChange={e => setForm({ ...form, limite_participantes: parseInt(e.target.value) || 0 })} /></div>
              <div className="space-y-1"><Label>Faixa Etária</Label><Input value={form.faixa_etaria} onChange={e => F("faixa_etaria", e.target.value)} placeholder="14-25 anos" /></div>
              <div className="space-y-1">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => F("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="ativa">Ativa</SelectItem><SelectItem value="inativa">Inativa</SelectItem><SelectItem value="encerrada">Encerrada</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1"><Label>Observações</Label><Textarea value={form.observacoes} onChange={e => F("observacoes", e.target.value)} /></div>

            {/* Activities */}
            <div className="border-t border-border pt-4">
              <Label className="font-display text-sm">Modalidades / Subcategorias da Olimpíada</Label>
              <div className="mt-2 space-y-2">
                {activities.map((a, i) => (
                  <div key={i} className="rounded-lg bg-muted/20 p-3 space-y-1">
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">{a.nome}</p>
                        {a.descricao && <p className="text-xs text-muted-foreground">{a.descricao}</p>}
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {a.responsavel && <span>Resp: {a.responsavel}</span>}
                          {a.horario && <span>• {a.horario}</span>}
                          {a.data_atividade && <span>• {new Date(a.data_atividade + "T12:00").toLocaleDateString("pt-BR")}</span>}
                          {a.local_sala && <span>• Sala: {a.local_sala}</span>}
                          <span>• Vagas: {a.limite_vagas}</span>
                          <span>• CH: {a.total_horas}h</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeActivity(i)}><X className="h-3 w-3" /></Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-lg border border-border p-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Adicionar Modalidade</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input placeholder="Nome *" value={newActivity.nome} onChange={e => setNewActivity({ ...newActivity, nome: e.target.value })} />
                  <Input placeholder="Responsável" value={newActivity.responsavel} onChange={e => setNewActivity({ ...newActivity, responsavel: e.target.value })} />
                </div>
                <Input placeholder="Descrição" value={newActivity.descricao} onChange={e => setNewActivity({ ...newActivity, descricao: e.target.value })} />
                <div className="grid gap-2 sm:grid-cols-5">
                  <Input placeholder="Horário" value={newActivity.horario} onChange={e => setNewActivity({ ...newActivity, horario: e.target.value })} />
                  <Input type="date" value={newActivity.data_atividade} onChange={e => setNewActivity({ ...newActivity, data_atividade: e.target.value })} />
                  <Input placeholder="Sala/Lab" value={newActivity.local_sala} onChange={e => setNewActivity({ ...newActivity, local_sala: e.target.value })} />
                  <Input type="number" placeholder="Vagas" value={newActivity.limite_vagas} onChange={e => setNewActivity({ ...newActivity, limite_vagas: parseInt(e.target.value) || 0 })} />
                  <Input type="number" placeholder="Carga Horária" value={newActivity.total_horas} onChange={e => setNewActivity({ ...newActivity, total_horas: parseInt(e.target.value) || 0 })} />
                </div>
                <Button variant="outline" size="sm" onClick={addActivity}><Plus className="mr-1 h-3 w-3" />Adicionar</Button>
              </div>
            </div>

            <Button onClick={save} className="font-display">Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Table */}
      <Card className="card-cyber border-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-primary/10">
              <TableHead>Nome</TableHead><TableHead>Tipo</TableHead><TableHead>Período</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {olympiads.map((o) => (
              <TableRow key={o.id} className="border-primary/5">
                <TableCell className="font-medium">{o.nome}</TableCell>
                <TableCell><Badge variant="secondary">{o.tipo || "—"}</Badge></TableCell>
                <TableCell className="text-sm">{o.data_inicio ? new Date(o.data_inicio).toLocaleDateString("pt-BR") : "—"} — {o.data_fim ? new Date(o.data_fim).toLocaleDateString("pt-BR") : "—"}</TableCell>
                <TableCell><Badge className={o.status === "ativa" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}>{o.status || "ativa"}</Badge></TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" title="Modalidades" onClick={() => openActivityManager(o.id)}><ListPlus className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" title="Participantes e Presença" onClick={() => openParticipants(o.id)}><Users className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" title="Editar" onClick={() => openEdit(o)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => remove(o.id)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {olympiads.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhuma olimpíada cadastrada</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Card>

      {/* Activity Manager Dialog */}
      <Dialog open={!!activityDialog} onOpenChange={() => setActivityDialog(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display">Modalidades / Subcategorias</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {activityDialogActivities.map((a) => (
              <div key={a.id} className="rounded-lg bg-muted/20 p-3 flex items-start justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{a.nome}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {a.responsavel && <span>Resp: {a.responsavel}</span>}
                    {a.horario && <span>• {a.horario}</span>}
                    {a.data_atividade && <span>• {new Date(a.data_atividade + "T12:00").toLocaleDateString("pt-BR")}</span>}
                    {a.local_sala && <span>• {a.local_sala}</span>}
                    <span>• Vagas: {a.limite_vagas}</span>
                    <span>• CH: {a.total_horas}h</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => a.id && removeExternalActivity(a.id)}><Trash2 className="h-3 w-3" /></Button>
              </div>
            ))}
            {activityDialogActivities.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhuma modalidade configurada</p>}
            <div className="border-t border-border pt-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Adicionar nova modalidade</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <Input placeholder="Nome *" value={newActivity.nome} onChange={e => setNewActivity({ ...newActivity, nome: e.target.value })} />
                <Input placeholder="Responsável" value={newActivity.responsavel} onChange={e => setNewActivity({ ...newActivity, responsavel: e.target.value })} />
              </div>
              <Input placeholder="Descrição" value={newActivity.descricao} onChange={e => setNewActivity({ ...newActivity, descricao: e.target.value })} />
              <div className="grid gap-2 sm:grid-cols-5">
                <Input placeholder="Horário" value={newActivity.horario} onChange={e => setNewActivity({ ...newActivity, horario: e.target.value })} />
                <Input type="date" value={newActivity.data_atividade} onChange={e => setNewActivity({ ...newActivity, data_atividade: e.target.value })} />
                <Input placeholder="Sala/Lab" value={newActivity.local_sala} onChange={e => setNewActivity({ ...newActivity, local_sala: e.target.value })} />
                <Input type="number" placeholder="Vagas" value={newActivity.limite_vagas} onChange={e => setNewActivity({ ...newActivity, limite_vagas: parseInt(e.target.value) || 0 })} />
                <Input type="number" placeholder="Carga Horária" value={newActivity.total_horas} onChange={e => setNewActivity({ ...newActivity, total_horas: parseInt(e.target.value) || 0 })} />
              </div>
              <Button size="sm" onClick={saveExternalActivity}><Plus className="mr-1 h-3 w-3" />Adicionar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Participants Dialog */}
      <Dialog open={!!participantsDialog} onOpenChange={() => setParticipantsDialog(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center justify-between">
              Participantes
              <Button size="sm" variant="outline" onClick={() => printList(olympiads.find(o => o.id === participantsDialog)?.nome || "")}><Printer className="mr-1 h-3 w-3" />Imprimir Lista</Button>
            </DialogTitle>
          </DialogHeader>
          <div className="mb-4">
            <Label className="text-muted-foreground mb-2 block">Filtrar por Modalidade</Label>
            <Select value={selectedActivity} onValueChange={(val) => handleFilterChange(val, participantsDialog!)}>
              <SelectTrigger className="w-full sm:w-[300px]">
                <SelectValue placeholder="Todas as Modalidades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas (Visão Geral)</SelectItem>
                {currentOlympiadActivities.map(a => (
                  <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {participants.length > 0 ? (
            <Table>
              <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Nome</TableHead><TableHead>E-mail</TableHead><TableHead>Modalidade(s)</TableHead><TableHead className="text-right">Ação / Presença</TableHead></TableRow></TableHeader>
              <TableBody>{participants.map((p, i) => (
                <TableRow key={i}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{p.nome}</TableCell>
                  <TableCell className="text-sm">{p.email}</TableCell>
                  <TableCell className="text-sm"><Badge variant="outline">{p.modalidades}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant={p.presente ? "default" : "outline"} onClick={() => togglePresence(p.user_id, participantsDialog!, p.presente, p.attendance_id, p.activity_id)}>
                      {p.presente ? "✓ Presente" : "Marcar"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          ) : <p className="text-sm text-muted-foreground text-center py-4">Nenhum participante inscrito</p>}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OlympiadsTab;

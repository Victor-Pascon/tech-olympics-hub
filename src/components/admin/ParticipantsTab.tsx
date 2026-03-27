import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Profile = {
  id: string; nome: string; email: string; cpf: string | null;
  telefone: string | null; cep: string | null; estado: string | null;
  cidade: string | null; rua: string | null; numero: string | null;
  created_at: string;
};

const ESTADOS_BR = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA",
  "PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"
];

const ParticipantsTab = () => {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filtered, setFiltered] = useState<Profile[]>([]);
  const [olympiads, setOlympiads] = useState<any[]>([]);
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [lectures, setLectures] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<{ olympiad: any[]; workshop: any[]; lecture: any[] }>({ olympiad: [], workshop: [], lecture: [] });

  // Filters
  const [filterNome, setFilterNome] = useState("");
  const [filterCpf, setFilterCpf] = useState("");
  const [filterOlympiad, setFilterOlympiad] = useState("all");
  const [filterWorkshop, setFilterWorkshop] = useState("all");
  const [filterLecture, setFilterLecture] = useState("all");

  // Detail dialog
  const [detailProfile, setDetailProfile] = useState<Profile | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const [profRes, olyRes, wsRes, lecRes, oeRes, weRes, leRes, rolesRes, adminUsersRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("olympiads").select("id, nome"),
      supabase.from("workshops").select("id, nome"),
      supabase.from("lectures").select("id, nome"),
      supabase.from("olympiad_enrollments").select("user_id, olympiad_id"),
      supabase.from("workshop_enrollments").select("user_id, workshop_id"),
      supabase.from("lecture_enrollments").select("user_id, lecture_id"),
      supabase.from("user_roles").select("user_id").eq("role", "admin"),
      supabase.from("admin_users").select("user_id"),
    ]);
    const adminIds = new Set([
      ...(rolesRes.data || []).map((r: any) => r.user_id),
      ...(adminUsersRes.data || []).map((r: any) => r.user_id)
    ]);
    const profs = (profRes.data || []).filter((p: any) => !adminIds.has(p.id));
    setProfiles(profs);
    setFiltered(profs);
    setOlympiads(olyRes.data || []);
    setWorkshops(wsRes.data || []);
    setLectures(lecRes.data || []);
    setEnrollments({
      olympiad: oeRes.data || [],
      workshop: weRes.data || [],
      lecture: leRes.data || [],
    });
  };

  useEffect(() => {
    let result = profiles;

    if (filterNome) {
      const q = filterNome.toLowerCase();
      result = result.filter(p => p.nome.toLowerCase().includes(q) || p.email.toLowerCase().includes(q));
    }
    if (filterCpf) {
      result = result.filter(p => (p.cpf || "").includes(filterCpf));
    }
    if (filterOlympiad !== "all") {
      const userIds = enrollments.olympiad.filter(e => e.olympiad_id === filterOlympiad).map(e => e.user_id);
      result = result.filter(p => userIds.includes(p.id));
    }
    if (filterWorkshop !== "all") {
      const userIds = enrollments.workshop.filter(e => e.workshop_id === filterWorkshop).map(e => e.user_id);
      result = result.filter(p => userIds.includes(p.id));
    }
    if (filterLecture !== "all") {
      const userIds = enrollments.lecture.filter(e => e.lecture_id === filterLecture).map(e => e.user_id);
      result = result.filter(p => userIds.includes(p.id));
    }
    setFiltered(result);
  }, [filterNome, filterCpf, filterOlympiad, filterWorkshop, filterLecture, profiles, enrollments]);

  const openDetail = (p: Profile) => {
    setEditForm({ ...p });
    setDetailProfile(p);
  };

  const saveProfile = async () => {
    if (!detailProfile) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      nome: editForm.nome, telefone: editForm.telefone, cpf: editForm.cpf,
      cep: editForm.cep, estado: editForm.estado, cidade: editForm.cidade,
      rua: editForm.rua, numero: editForm.numero,
    }).eq("id", detailProfile.id);
    setSaving(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Perfil atualizado com sucesso" });
      setDetailProfile(null);
      load();
    }
  };

  const sendPasswordReset = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "E-mail de redefinição enviado", description: `Um e-mail foi enviado para ${email}` });
    }
  };

  const getUserEnrollments = (userId: string) => {
    const olyIds = enrollments.olympiad.filter(e => e.user_id === userId).map(e => e.olympiad_id);
    const wsIds = enrollments.workshop.filter(e => e.user_id === userId).map(e => e.workshop_id);
    const lecIds = enrollments.lecture.filter(e => e.user_id === userId).map(e => e.lecture_id);
    return {
      olympiads: olympiads.filter(o => olyIds.includes(o.id)).map(o => o.nome),
      workshops: workshops.filter(w => wsIds.includes(w.id)).map(w => w.nome),
      lectures: lectures.filter(l => lecIds.includes(l.id)).map(l => l.nome),
    };
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="font-display text-lg font-semibold mb-4">Participantes</h2>

        {/* Filters */}
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5 mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Nome ou e-mail" value={filterNome} onChange={e => setFilterNome(e.target.value)} className="pl-8" />
          </div>
          <Input placeholder="CPF" value={filterCpf} onChange={e => setFilterCpf(e.target.value)} />
          <Select value={filterOlympiad} onValueChange={setFilterOlympiad}>
            <SelectTrigger><SelectValue placeholder="Olimpíada" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Olimpíadas</SelectItem>
              {olympiads.map(o => <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterWorkshop} onValueChange={setFilterWorkshop}>
            <SelectTrigger><SelectValue placeholder="Oficina" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Oficinas</SelectItem>
              {workshops.map(w => <SelectItem key={w.id} value={w.id}>{w.nome}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterLecture} onValueChange={setFilterLecture}>
            <SelectTrigger><SelectValue placeholder="Palestra" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Palestras</SelectItem>
              {lectures.map(l => <SelectItem key={l.id} value={l.id}>{l.nome}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-muted-foreground mb-2">{filtered.length} participante(s) encontrado(s)</p>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!detailProfile} onOpenChange={(o) => { if (!o) setDetailProfile(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display">Dados do Participante</DialogTitle></DialogHeader>
          {detailProfile && (
            <div className="grid gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1"><Label>Nome</Label><Input value={editForm.nome || ""} onChange={e => setEditForm({ ...editForm, nome: e.target.value })} /></div>
                <div className="space-y-1"><Label>E-mail</Label><Input value={editForm.email || ""} disabled className="opacity-60" /></div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1"><Label>CPF</Label><Input value={editForm.cpf || ""} onChange={e => setEditForm({ ...editForm, cpf: e.target.value })} /></div>
                <div className="space-y-1"><Label>Telefone</Label><Input value={editForm.telefone || ""} onChange={e => setEditForm({ ...editForm, telefone: e.target.value })} /></div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1"><Label>CEP</Label><Input value={editForm.cep || ""} onChange={e => setEditForm({ ...editForm, cep: e.target.value })} /></div>
                <div className="space-y-1">
                  <Label>Estado</Label>
                  <Select value={editForm.estado || ""} onValueChange={v => setEditForm({ ...editForm, estado: v })}>
                    <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                    <SelectContent>{ESTADOS_BR.map(uf => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>Cidade</Label><Input value={editForm.cidade || ""} onChange={e => setEditForm({ ...editForm, cidade: e.target.value })} /></div>
              </div>
              <div className="grid gap-3 sm:grid-cols-[1fr_100px]">
                <div className="space-y-1"><Label>Rua</Label><Input value={editForm.rua || ""} onChange={e => setEditForm({ ...editForm, rua: e.target.value })} /></div>
                <div className="space-y-1"><Label>Nº</Label><Input value={editForm.numero || ""} onChange={e => setEditForm({ ...editForm, numero: e.target.value })} /></div>
              </div>

              {/* Enrollments summary */}
              {(() => {
                const enr = getUserEnrollments(detailProfile.id);
                return (
                  <div className="border-t border-border pt-4 space-y-2">
                    <Label className="font-display text-sm">Inscrições</Label>
                    {enr.olympiads.length > 0 && <div className="flex flex-wrap gap-1">{enr.olympiads.map(n => <Badge key={n} variant="secondary" className="text-xs">🏆 {n}</Badge>)}</div>}
                    {enr.workshops.length > 0 && <div className="flex flex-wrap gap-1">{enr.workshops.map(n => <Badge key={n} variant="outline" className="text-xs">📖 {n}</Badge>)}</div>}
                    {enr.lectures.length > 0 && <div className="flex flex-wrap gap-1">{enr.lectures.map(n => <Badge key={n} className="bg-purple-500/20 text-purple-300 text-xs">🎤 {n}</Badge>)}</div>}
                    {enr.olympiads.length === 0 && enr.workshops.length === 0 && enr.lectures.length === 0 && <p className="text-xs text-muted-foreground">Nenhuma inscrição registrada.</p>}
                  </div>
                );
              })()}

              <div className="flex gap-2 pt-2">
                <Button onClick={saveProfile} disabled={saving} className="flex-1 font-display">{saving ? "Salvando..." : "Salvar Alterações"}</Button>
                <Button variant="outline" onClick={() => sendPasswordReset(detailProfile.email)} title="Enviar e-mail de redefinição de senha">
                  <Mail className="mr-1 h-4 w-4" />Redefinir Senha
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Table */}
      <Card className="card-cyber border-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-primary/10">
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Data Cadastro</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id} className="border-primary/5 cursor-pointer hover:bg-muted/10" onClick={() => openDetail(p)}>
                <TableCell className="font-medium">{p.nome}</TableCell>
                <TableCell className="text-sm">{p.email}</TableCell>
                <TableCell>{p.cpf || "—"}</TableCell>
                <TableCell>{p.telefone || "—"}</TableCell>
                <TableCell className="text-sm">{new Date(p.created_at).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" title="Ver Detalhes" onClick={(e) => { e.stopPropagation(); openDetail(p); }}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhum participante encontrado</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default ParticipantsTab;

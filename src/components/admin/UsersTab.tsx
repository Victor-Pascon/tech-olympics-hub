import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FUNCOES = [
  { value: "ministrante", label: "Ministrante" },
  { value: "professor_auxiliador", label: "Professor Auxiliador" },
  { value: "responsavel", label: "Responsável" },
  { value: "juiz", label: "Juiz da Olimpíada" },
  { value: "criador_olimpiada", label: "Criador de Olimpíada" },
  { value: "criador_desafios", label: "Criador de Desafios" },
];

type AdminUser = {
  id: string; user_id: string; matricula: string | null;
  funcao: string[] | null; profile?: { nome: string; email: string };
};

const UsersTab = () => {
  const { toast } = useToast();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nome: "", email: "", password: "", matricula: "", funcao: [] as string[] });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await supabase.from("admin_users").select("*");
    if (!data) return;

    // Load profiles for each admin
    const userIds = data.map(a => a.user_id);
    const { data: profiles } = await supabase.from("profiles").select("id, nome, email").in("id", userIds);

    setAdmins(data.map(a => ({
      ...a,
      profile: profiles?.find(p => p.id === a.user_id),
    })));
  };

  const toggleFuncao = (val: string) => {
    setForm(prev => ({
      ...prev,
      funcao: prev.funcao.includes(val) ? prev.funcao.filter(f => f !== val) : [...prev.funcao, val],
    }));
  };

  const save = async () => {
    if (!form.nome || !form.email || !form.password) {
      toast({ title: "Nome, e-mail e senha são obrigatórios", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-admin-user", {
        body: { nome: form.nome, email: form.email, password: form.password, matricula: form.matricula, funcao: form.funcao },
        headers: {
          "x-supabase-key": (supabase as any).supabaseKey || "",
        }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Usuário administrativo criado com sucesso" });
      setOpen(false);
      setForm({ nome: "", email: "", password: "", matricula: "", funcao: [] });
      load();
    } catch (err: any) {
      toast({ title: "Erro ao criar usuário", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string, userId: string) => {
    await supabase.from("admin_users").delete().eq("id", id);
    // Remove admin role
    // Note: we can't delete from user_roles client-side due to RLS. The user remains but loses admin_users record.
    toast({ title: "Registro administrativo removido" });
    load();
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Usuários Administrativos</h2>
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="mr-1 h-4 w-4" />Novo Usuário Admin</Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display">Novo Usuário Administrativo</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-1"><Label>Nome Completo *</Label><Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} /></div>
            <div className="space-y-1"><Label>E-mail *</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
            <div className="space-y-1"><Label>Senha *</Label><Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
            <div className="space-y-1"><Label>Matrícula (opcional)</Label><Input value={form.matricula} onChange={e => setForm({ ...form, matricula: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Funções</Label>
              <div className="grid grid-cols-2 gap-2">
                {FUNCOES.map(f => (
                  <label key={f.value} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={form.funcao.includes(f.value)} onCheckedChange={() => toggleFuncao(f.value)} />
                    {f.label}
                  </label>
                ))}
              </div>
            </div>
            <Button onClick={save} disabled={saving} className="font-display">
              {saving ? "Criando..." : "Criar Usuário"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="card-cyber border-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-primary/10">
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Matrícula</TableHead>
              <TableHead>Funções</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.map((a) => (
              <TableRow key={a.id} className="border-primary/5">
                <TableCell className="font-medium">{a.profile?.nome || "—"}</TableCell>
                <TableCell className="text-sm">{a.profile?.email || "—"}</TableCell>
                <TableCell>{a.matricula || "—"}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {(a.funcao || []).map(f => (
                      <Badge key={f} variant="secondary" className="text-xs">
                        {FUNCOES.find(fn => fn.value === f)?.label || f}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => remove(a.id, a.user_id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {admins.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhum usuário administrativo cadastrado</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default UsersTab;

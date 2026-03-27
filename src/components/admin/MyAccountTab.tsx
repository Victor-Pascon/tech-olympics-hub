import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ESTADOS_BR = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA",
  "PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"
];

const passwordChecks = (pwd: string) => [
  { label: "Mínimo 6 caracteres", ok: pwd.length >= 6 },
  { label: "Letra minúscula (a-z)", ok: /[a-z]/.test(pwd) },
  { label: "Letra maiúscula (A-Z)", ok: /[A-Z]/.test(pwd) },
  { label: "Número (0-9)", ok: /\d/.test(pwd) },
  { label: "Caractere especial (!@#$...)", ok: /[^A-Za-z0-9]/.test(pwd) },
];

const MyAccountTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  // Password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  useEffect(() => { if (user) loadProfile(); }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (data) {
      setProfile(data);
      setForm({ ...data });
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      nome: form.nome, telefone: form.telefone, cpf: form.cpf,
      cep: form.cep, estado: form.estado, cidade: form.cidade,
      rua: form.rua, numero: form.numero,
    }).eq("id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Perfil atualizado com sucesso" });
      loadProfile();
    }
  };

  const changePassword = async () => {
    const checks = passwordChecks(newPassword);
    if (checks.some(c => !c.ok)) {
      toast({ title: "Senha não atende os requisitos", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "As senhas não coincidem", variant: "destructive" });
      return;
    }
    setChangingPass(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPass(false);
    if (error) {
      toast({ title: "Erro ao alterar senha", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Senha alterada com sucesso" });
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  if (!profile) return <p className="text-muted-foreground text-center py-8">Carregando...</p>;

  const checks = passwordChecks(newPassword);

  return (
    <div className="grid gap-6 max-w-2xl">
      <Card className="card-cyber border-0">
        <CardHeader>
          <CardTitle className="font-display text-xl">Minha Conta</CardTitle>
          <CardDescription>Suas informações pessoais e login</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1"><Label>Nome Completo</Label><Input value={form.nome || ""} onChange={e => setForm({ ...form, nome: e.target.value })} /></div>
            <div className="space-y-1"><Label>E-mail</Label><Input value={form.email || ""} disabled className="opacity-60" /></div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1"><Label>CPF</Label><Input value={form.cpf || ""} onChange={e => setForm({ ...form, cpf: e.target.value })} /></div>
            <div className="space-y-1"><Label>Telefone</Label><Input value={form.telefone || ""} onChange={e => setForm({ ...form, telefone: e.target.value })} /></div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1"><Label>CEP</Label><Input value={form.cep || ""} onChange={e => setForm({ ...form, cep: e.target.value })} /></div>
            <div className="space-y-1">
              <Label>Estado</Label>
              <Select value={form.estado || ""} onValueChange={v => setForm({ ...form, estado: v })}>
                <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                <SelectContent>{ESTADOS_BR.map(uf => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Cidade</Label><Input value={form.cidade || ""} onChange={e => setForm({ ...form, cidade: e.target.value })} /></div>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_100px]">
            <div className="space-y-1"><Label>Rua</Label><Input value={form.rua || ""} onChange={e => setForm({ ...form, rua: e.target.value })} /></div>
            <div className="space-y-1"><Label>Nº</Label><Input value={form.numero || ""} onChange={e => setForm({ ...form, numero: e.target.value })} /></div>
          </div>
          <Button onClick={saveProfile} disabled={saving} className="font-display w-full">{saving ? "Salvando..." : "Salvar Alterações"}</Button>
        </CardContent>
      </Card>

      <Card className="card-cyber border-0">
        <CardHeader>
          <CardTitle className="font-display text-lg">Alterar Senha</CardTitle>
          <CardDescription>Defina uma nova senha para sua conta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Nova Senha</Label>
              <div className="relative">
                <Input type={showPass ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Nova senha" />
                <button type="button" className="absolute right-2 top-2.5 text-muted-foreground hover:text-primary transition-colors" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Confirmar Nova Senha</Label>
              <Input type={showPass ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirme a nova senha" />
            </div>
          </div>
          {newPassword && (
            <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground mb-1">Requisitos da senha:</p>
              {checks.map(c => (
                <div key={c.label} className="flex items-center gap-2 text-xs">
                  {c.ok ? <Check className="h-3.5 w-3.5 text-primary" /> : <X className="h-3.5 w-3.5 text-destructive" />}
                  <span className={c.ok ? "text-primary" : "text-muted-foreground"}>{c.label}</span>
                </div>
              ))}
            </div>
          )}
          <Button onClick={changePassword} disabled={changingPass || !newPassword} variant="outline" className="w-full font-display">
            {changingPass ? "Alterando..." : "Alterar Senha"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyAccountTab;

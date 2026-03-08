import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ESTADOS_BR = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA",
  "PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"
];

const Cadastro = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: "", email: "", cpf: "", telefone: "",
    cep: "", estado: "", cidade: "", rua: "", numero: "",
    senha: "", confirmarSenha: "",
  });

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const formatCPF = (v: string) => {
    const nums = v.replace(/\D/g, "").slice(0, 11);
    return nums.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const formatPhone = (v: string) => {
    const nums = v.replace(/\D/g, "").slice(0, 11);
    if (nums.length <= 10) return nums.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
    return nums.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.senha !== form.confirmarSenha) {
      toast({ title: "Erro", description: "As senhas não coincidem.", variant: "destructive" });
      return;
    }
    if (form.senha.length < 6) {
      toast({ title: "Erro", description: "A senha deve ter pelo menos 6 caracteres.", variant: "destructive" });
      return;
    }
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.senha,
    });

    if (error) {
      setLoading(false);
      toast({ title: "Erro no cadastro", description: error.message, variant: "destructive" });
      return;
    }

    // Update profile with additional data
    if (data.user) {
      await supabase.from("profiles").update({
        nome: form.nome,
        cpf: form.cpf,
        telefone: form.telefone,
        cep: form.cep,
        estado: form.estado,
        cidade: form.cidade,
        rua: form.rua,
        numero: form.numero,
      }).eq("id", data.user.id);
    }

    setLoading(false);
    toast({ title: "Cadastro realizado!", description: "Sua conta foi criada com sucesso." });
    navigate("/participante");
  };

  return (
    <Layout>
      <div className="hero-bg circuit-pattern min-h-screen py-12">
        <div className="container max-w-2xl">
          <Card className="card-cyber border-0">
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="font-display text-2xl">Cadastre-se na Olimpíada</CardTitle>
              <CardDescription>Preencha seus dados para participar da Tech Defense</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {/* Personal */}
                <div className="space-y-4">
                  <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-primary">Dados Pessoais</h3>
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input id="nome" placeholder="Seu nome completo" value={form.nome} onChange={(e) => update("nome", e.target.value)} required />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail *</Label>
                      <Input id="email" type="email" placeholder="seu@email.com" value={form.email} onChange={(e) => update("email", e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF *</Label>
                      <Input id="cpf" placeholder="000.000.000-00" value={form.cpf} onChange={(e) => update("cpf", formatCPF(e.target.value))} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input id="telefone" placeholder="(79) 99999-0000" value={form.telefone} onChange={(e) => update("telefone", formatPhone(e.target.value))} />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-4">
                  <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-primary">Endereço</h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="cep">CEP *</Label>
                      <Input id="cep" placeholder="49500-000" value={form.cep} onChange={(e) => update("cep", e.target.value.replace(/\D/g, "").slice(0, 8))} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estado">Estado *</Label>
                      <Select value={form.estado} onValueChange={(v) => update("estado", v)}>
                        <SelectTrigger id="estado"><SelectValue placeholder="UF" /></SelectTrigger>
                        <SelectContent>
                          {ESTADOS_BR.map((uf) => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cidade">Cidade *</Label>
                      <Input id="cidade" placeholder="Itabaiana" value={form.cidade} onChange={(e) => update("cidade", e.target.value)} required />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-[1fr_100px]">
                    <div className="space-y-2">
                      <Label htmlFor="rua">Rua *</Label>
                      <Input id="rua" placeholder="Rua / Av." value={form.rua} onChange={(e) => update("rua", e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="numero">Nº *</Label>
                      <Input id="numero" placeholder="123" value={form.numero} onChange={(e) => update("numero", e.target.value)} required />
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-4">
                  <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-primary">Senha de Acesso</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="senha">Senha *</Label>
                      <div className="relative">
                        <Input id="senha" type={showPass ? "text" : "password"} placeholder="Mínimo 6 caracteres" value={form.senha} onChange={(e) => update("senha", e.target.value)} required />
                        <button type="button" className="absolute right-2 top-2.5 text-muted-foreground" onClick={() => setShowPass(!showPass)}>
                          {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmarSenha">Confirmar Senha *</Label>
                      <Input id="confirmarSenha" type={showPass ? "text" : "password"} placeholder="Repita a senha" value={form.confirmarSenha} onChange={(e) => update("confirmarSenha", e.target.value)} required />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-3">
                <Button type="submit" size="lg" className="w-full font-display tracking-wide" disabled={loading}>
                  {loading ? "Cadastrando..." : "Criar Conta"}
                </Button>
                <p className="text-sm text-muted-foreground">
                  Já tem uma conta?{" "}
                  <Link to="/login" className="text-primary hover:underline">Faça login</Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Cadastro;

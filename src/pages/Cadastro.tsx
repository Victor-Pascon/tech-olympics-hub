import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Eye, EyeOff, Check, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ESTADOS_BR = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA",
  "PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"
];

function validateCPF(cpf: string): boolean {
  const nums = cpf.replace(/\D/g, "");
  if (nums.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(nums)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(nums[i]) * (10 - i);
  let rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  if (rest !== parseInt(nums[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(nums[i]) * (11 - i);
  rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  return rest === parseInt(nums[10]);
}

const passwordChecks = (pwd: string) => [
  { label: "Mínimo 6 caracteres", ok: pwd.length >= 6 },
  { label: "Letra minúscula (a-z)", ok: /[a-z]/.test(pwd) },
  { label: "Letra maiúscula (A-Z)", ok: /[A-Z]/.test(pwd) },
  { label: "Número (0-9)", ok: /\d/.test(pwd) },
  { label: "Caractere especial (!@#$...)", ok: /[^A-Za-z0-9]/.test(pwd) },
];

const Cadastro = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    nome: "", email: "", cpf: "", telefone: "",
    cep: "", estado: "", cidade: "", rua: "", numero: "",
    senha: "", confirmarSenha: "",
  });

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const formatCPF = (v: string) => {
    const nums = v.replace(/\D/g, "").slice(0, 11);
    return nums.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const formatPhone = (v: string) => {
    const nums = v.replace(/\D/g, "").slice(0, 11);
    if (nums.length <= 10) return nums.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
    return nums.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
  };

  const handleCPFBlur = () => {
    const nums = form.cpf.replace(/\D/g, "");
    if (nums.length === 11 && !validateCPF(form.cpf)) {
      setErrors((prev) => ({ ...prev, cpf: "CPF inválido." }));
    }
  };

  const formatCEP = (v: string) => {
    const nums = v.replace(/\D/g, "").slice(0, 8);
    return nums.replace(/(\d{5})(\d)/, "$1-$2");
  };

  useEffect(() => {
    const nums = form.cep.replace(/\D/g, "");
    if (nums.length !== 8) return;
    const controller = new AbortController();
    setCepLoading(true);
    setErrors((prev) => ({ ...prev, cep: "" }));
    fetch(`https://viacep.com.br/ws/${nums}/json/`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        if (data.erro) {
          setErrors((prev) => ({ ...prev, cep: "CEP não encontrado." }));
        } else {
          setForm((prev) => ({
            ...prev,
            estado: data.uf || prev.estado,
            cidade: data.localidade || prev.cidade,
            rua: data.logradouro || prev.rua,
          }));
        }
      })
      .catch(() => {})
      .finally(() => setCepLoading(false));
    return () => controller.abort();
  }, [form.cep]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!validateCPF(form.cpf)) newErrors.cpf = "CPF inválido.";
    const cepNums = form.cep.replace(/\D/g, "");
    if (cepNums.length !== 8) newErrors.cep = "CEP deve ter 8 dígitos.";
    const checks = passwordChecks(form.senha);
    if (checks.some((c) => !c.ok)) newErrors.senha = "A senha não atende todos os requisitos.";
    if (form.senha !== form.confirmarSenha) newErrors.confirmarSenha = "As senhas não coincidem.";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast({ title: "Erro", description: "Corrija os campos destacados.", variant: "destructive" });
      return;
    }
    setLoading(true);

    // Verifica CPF duplicado
    const { data: cpfExists } = await supabase
      .from("profiles")
      .select("id")
      .eq("cpf", form.cpf)
      .maybeSingle();
    if (cpfExists) {
      setLoading(false);
      setErrors((prev) => ({ ...prev, cpf: "CPF já cadastrado." }));
      toast({ title: "Erro", description: "Este CPF já está cadastrado no sistema.", variant: "destructive" });
      return;
    }

    const { data, error } = await supabase.auth.signUp({ email: form.email, password: form.senha });
    if (error) {
      setLoading(false);
      toast({ title: "Erro no cadastro", description: error.message, variant: "destructive" });
      return;
    }
    if (data.user) {
      await supabase.from("profiles").update({
        nome: form.nome, cpf: form.cpf, telefone: form.telefone,
        cep: form.cep, estado: form.estado, cidade: form.cidade, rua: form.rua, numero: form.numero,
      }).eq("id", data.user.id);
    }
    setLoading(false);
    toast({ title: "Cadastro realizado!", description: "Sua conta foi criada com sucesso." });
    navigate("/participante");
  };

  const checks = passwordChecks(form.senha);

  return (
    <Layout>
      <div className="hero-bg-animated circuit-pattern min-h-screen py-12">
        <div className="container max-w-2xl">
          <Card className="card-cyber border-0">
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 border border-primary/10">
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
                    <Input id="nome" placeholder="Seu nome completo" value={form.nome} onChange={(e) => update("nome", e.target.value)} className="glow-border" required />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail *</Label>
                      <Input id="email" type="email" placeholder="seu@email.com" value={form.email} onChange={(e) => update("email", e.target.value)} className="glow-border" required />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="cpf">CPF *</Label>
                      <Input
                        id="cpf" placeholder="000.000.000-00" value={form.cpf}
                        onChange={(e) => update("cpf", formatCPF(e.target.value))}
                        onBlur={handleCPFBlur}
                        className={errors.cpf ? "border-destructive focus-visible:ring-destructive" : "glow-border"}
                        required
                      />
                      {errors.cpf && <p className="text-xs text-destructive">{errors.cpf}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input id="telefone" placeholder="(79) 99999-0000" value={form.telefone} onChange={(e) => update("telefone", formatPhone(e.target.value))} className="glow-border" />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-4">
                  <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-primary">Endereço</h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-1">
                      <Label htmlFor="cep">CEP *</Label>
                      <div className="relative">
                        <Input
                          id="cep" placeholder="49500-000" value={form.cep}
                          onChange={(e) => update("cep", formatCEP(e.target.value))}
                          className={errors.cep ? "border-destructive focus-visible:ring-destructive" : "glow-border"}
                          required
                        />
                        {cepLoading && <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />}
                      </div>
                      {errors.cep && <p className="text-xs text-destructive">{errors.cep}</p>}
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
                      <Input id="cidade" placeholder="Itabaiana" value={form.cidade} onChange={(e) => update("cidade", e.target.value)} className="glow-border" required />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-[1fr_100px]">
                    <div className="space-y-2">
                      <Label htmlFor="rua">Rua *</Label>
                      <Input id="rua" placeholder="Rua / Av." value={form.rua} onChange={(e) => update("rua", e.target.value)} className="glow-border" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="numero">Nº *</Label>
                      <Input id="numero" placeholder="123" value={form.numero} onChange={(e) => update("numero", e.target.value)} className="glow-border" required />
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
                        <Input
                          id="senha" type={showPass ? "text" : "password"} placeholder="Crie sua senha"
                          value={form.senha} onChange={(e) => update("senha", e.target.value)}
                          className={errors.senha ? "border-destructive focus-visible:ring-destructive" : "glow-border"}
                          required
                        />
                        <button type="button" className="absolute right-2 top-2.5 text-muted-foreground hover:text-primary transition-colors" onClick={() => setShowPass(!showPass)}>
                          {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="confirmarSenha">Confirmar Senha *</Label>
                      <Input
                        id="confirmarSenha" type={showPass ? "text" : "password"} placeholder="Repita a senha"
                        value={form.confirmarSenha} onChange={(e) => update("confirmarSenha", e.target.value)}
                        className={errors.confirmarSenha ? "border-destructive focus-visible:ring-destructive" : "glow-border"}
                        required
                      />
                      {errors.confirmarSenha && <p className="text-xs text-destructive">{errors.confirmarSenha}</p>}
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Requisitos da senha:</p>
                    {checks.map((c) => (
                      <div key={c.label} className="flex items-center gap-2 text-xs">
                        {c.ok ? <Check className="h-3.5 w-3.5 text-primary" /> : <X className="h-3.5 w-3.5 text-destructive" />}
                        <span className={c.ok ? "text-primary" : "text-muted-foreground"}>{c.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-3">
                <Button type="submit" size="lg" className="btn-cyber w-full font-display tracking-wide" disabled={loading}>
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

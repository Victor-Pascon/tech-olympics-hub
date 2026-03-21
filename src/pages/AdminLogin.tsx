import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdminLogin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      setLoading(false);
      toast({ title: "Erro no login", description: "Credenciais inválidas.", variant: "destructive" });
      return;
    }

    const { data: roleData, error: roleError } = await supabase
      .rpc("has_role", { _user_id: data.user.id, _role: "admin" });

    if (roleError || !roleData) {
      await supabase.auth.signOut();
      setLoading(false);
      toast({
        title: "Acesso negado",
        description: "Você não possui permissão de administrador.",
        variant: "destructive",
      });
      return;
    }

    setLoading(false);
    toast({ title: "Bem-vindo, Admin!", description: "Acesso ao painel administrativo liberado." });
    navigate("/admin");
  };

  return (
    <Layout>
      <div className="hero-bg-animated circuit-pattern flex min-h-[calc(100vh-4rem)] items-center py-12">
        <div className="container max-w-md">
          <Card className="card-cyber border-0">
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-destructive/10 border border-destructive/10">
                <ShieldAlert className="h-7 w-7 text-destructive" />
              </div>
              <CardTitle className="font-display text-2xl">Acesso Administrativo</CardTitle>
              <CardDescription>Insira suas credenciais de administrador</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">E-mail do Administrador</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="glow-border"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-senha">Senha</Label>
                  <div className="relative">
                    <Input
                      id="admin-senha"
                      type={showPass ? "text" : "password"}
                      placeholder="Senha de administrador"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      className="glow-border"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-2.5 text-muted-foreground hover:text-primary transition-colors"
                      onClick={() => setShowPass(!showPass)}
                    >
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-3">
                <Button type="submit" size="lg" className="btn-cyber w-full font-display tracking-wide" disabled={loading}>
                  <Settings className="mr-2 h-4 w-4" />
                  {loading ? "Verificando..." : "Acessar Painel"}
                </Button>
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  onClick={async () => {
                    if (!email) { toast({ title: "Informe seu e-mail", description: "Digite seu e-mail antes de solicitar a recuperação.", variant: "destructive" }); return; }
                    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
                    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
                    toast({ title: "E-mail enviado!", description: "Verifique sua caixa de entrada para redefinir a senha." });
                  }}
                >
                  Esqueceu a senha?
                </button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AdminLogin;

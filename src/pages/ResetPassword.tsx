import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ResetPassword = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({ title: "Erro", description: "As senhas não coincidem.", variant: "destructive" });
      return;
    }

    if (password.length < 6) {
      toast({ title: "Erro", description: "A senha deve ter pelo menos 6 caracteres.", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Senha atualizada!", description: "Sua senha foi redefinida com sucesso." });
    navigate("/login");
  };

  if (!isRecovery) {
    return (
      <Layout>
        <div className="hero-bg-animated circuit-pattern flex min-h-[calc(100vh-4rem)] items-center py-12">
          <div className="container max-w-md text-center">
            <Card className="card-cyber border-0">
              <CardHeader>
                <CardTitle className="font-display text-2xl">Link inválido</CardTitle>
                <CardDescription>Este link de recuperação é inválido ou expirou. Solicite um novo link na página de login.</CardDescription>
              </CardHeader>
              <CardFooter className="justify-center">
                <Button onClick={() => navigate("/login")} className="btn-cyber font-display">Voltar ao Login</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="hero-bg-animated circuit-pattern flex min-h-[calc(100vh-4rem)] items-center py-12">
        <div className="container max-w-md">
          <Card className="card-cyber border-0">
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 border border-primary/10">
                <KeyRound className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="font-display text-2xl">Nova Senha</CardTitle>
              <CardDescription>Defina sua nova senha de acesso</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Nova Senha</Label>
                  <div className="relative">
                    <Input id="password" type={showPass ? "text" : "password"} placeholder="Mínimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} className="glow-border" required />
                    <button type="button" className="absolute right-2 top-2.5 text-muted-foreground hover:text-primary transition-colors" onClick={() => setShowPass(!showPass)}>
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirmar Senha</Label>
                  <Input id="confirm" type={showPass ? "text" : "password"} placeholder="Repita a nova senha" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="glow-border" required />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" size="lg" className="btn-cyber w-full font-display tracking-wide" disabled={loading}>
                  {loading ? "Salvando..." : "Redefinir Senha"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ResetPassword;

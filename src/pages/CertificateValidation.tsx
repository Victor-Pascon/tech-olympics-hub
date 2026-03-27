import { useState } from "react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Search, XCircle, Award, Calendar, Clock, User } from "lucide-react";

const CertificateValidation = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleValidate = async () => {
    const cleanCode = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (cleanCode.length < 5) {
      setError("Código inválido. Insira o código completo do certificado.");
      setResult(null);
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    // Find the attendance record with this validation code
    const { data: att, error: attErr } = await (supabase.from("attendance") as any)
      .select("*")
      .eq("validation_code", cleanCode)
      .eq("presente", true)
      .maybeSingle();

    if (attErr || !att) {
      setError("Certificado não encontrado. Verifique se o código foi digitado corretamente.");
      setLoading(false);
      return;
    }

    // Get profile
    const { data: profile } = await supabase.from("profiles").select("nome, email").eq("id", att.user_id).single();

    // Determine event details
    let eventName = "";
    let eventType = "";
    let hours = 0;
    let eventDate = att.data || att.created_at;

    if (att.lecture_id) {
      const { data: lec } = await supabase.from("lectures").select("nome, carga_horaria, data_evento").eq("id", att.lecture_id).single();
      if (lec) {
        eventName = lec.nome;
        eventType = "Palestra";
        hours = lec.carga_horaria || 0;
        eventDate = lec.data_evento || eventDate;
      }
    } else if (att.workshop_id) {
      const { data: ws } = await supabase.from("workshops").select("nome, total_horas").eq("id", att.workshop_id).single();
      if (ws) {
        eventName = ws.nome;
        eventType = "Oficina";
        hours = ws.total_horas || 0;
      }
    } else if (att.olympiad_id) {
      const { data: oly } = await supabase.from("olympiads").select("nome, total_horas").eq("id", att.olympiad_id).single();
      if (oly) {
        eventName = oly.nome;
        eventType = "Olimpíada";
        hours = oly.total_horas || 0;
      }
      if (att.activity_id) {
        const { data: act } = await supabase.from("olympiad_activities").select("nome").eq("id", att.activity_id).single();
        if (act) eventName += ` — ${act.nome}`;
      }
    }

    setResult({
      participantName: profile?.nome || "Participante",
      participantEmail: profile?.email || "",
      eventName,
      eventType,
      hours,
      date: eventDate,
      code: cleanCode,
    });
    setLoading(false);
  };

  return (
    <Layout>
      <div className="hero-bg min-h-[calc(100vh-4rem)]">
        <div className="container py-12 max-w-2xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <ShieldCheck className="h-8 w-8 text-primary" />
              <h1 className="font-display text-3xl font-bold text-primary-foreground">
                Validar <span className="text-primary">Certificado</span>
              </h1>
            </div>
            <p className="text-muted-foreground text-sm">
              Insira o código de validação impresso no certificado para verificar sua autenticidade.
            </p>
          </div>

          <Card className="card-cyber border-0 mb-6">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Input
                  placeholder="Ex: ABCD123XYZ"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === "Enter" && handleValidate()}
                  className="font-mono text-lg tracking-widest text-center"
                  maxLength={20}
                />
                <Button onClick={handleValidate} disabled={loading} className="px-6">
                  <Search className="h-4 w-4 mr-2" />{loading ? "Buscando..." : "Validar"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {error && (
            <Card className="border-destructive/30 bg-destructive/5 mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 text-destructive">
                  <XCircle className="h-6 w-6 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Certificado não encontrado</p>
                    <p className="text-sm opacity-80">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {result && (
            <Card className="card-cyber border-primary/30 bg-primary/5">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                  <CardTitle className="font-display text-lg text-primary">Certificado Válido ✓</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Participante</p>
                      <p className="font-semibold">{result.participantName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Award className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Evento</p>
                      <p className="font-semibold">{result.eventName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Tipo</p>
                      <Badge variant="outline" className="border-primary/30">{result.eventType}</Badge>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Carga Horária</p>
                      <p className="font-semibold">{result.hours}h</p>
                    </div>
                  </div>
                </div>
                <div className="pt-3 border-t border-primary/10 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Código de Validação</p>
                  <p className="font-mono text-lg font-bold text-primary tracking-widest">{result.code}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Emitido via Plataforma Tech Olympics Hub
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CertificateValidation;

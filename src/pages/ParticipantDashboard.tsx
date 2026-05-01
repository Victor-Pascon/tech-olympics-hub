import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  LayoutDashboard, BookOpen, MapPin, FileText, User,
  Calendar, Clock, GraduationCap, Download, Trophy, Target, Award, Mic, Eye, EyeOff, Check, X as XIcon, Medal, Crown, History
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

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

const MEDAL_COLORS_P: Record<number, string> = { 1: "text-yellow-400", 2: "text-gray-300", 3: "text-amber-600" };

const ParticipantRankingView = ({ enrolledOlympiadIds, enrolledModalityIds, olympiads, activities }: {
  enrolledOlympiadIds: string[]; enrolledModalityIds: string[]; olympiads: any[]; activities: any[];
}) => {
  const [selectedOly, setSelectedOly] = useState<string>("");
  const [selectedAct, setSelectedAct] = useState<string>("");
  const [ranking, setRanking] = useState<any[]>([]);
  const [loadingRank, setLoadingRank] = useState(false);

  const myOlympiads = olympiads.filter(o => enrolledOlympiadIds.includes(o.id));
  const myActivities = activities.filter(a => enrolledModalityIds.includes(a.id) && a.olympiad_id === selectedOly);

  const loadRanking = async (actId: string) => {
    setSelectedAct(actId);
    if (!selectedOly || !actId) return;
    setLoadingRank(true);
    const { data: scores } = await (supabase.from("olympiad_scores") as any)
      .select("user_id, pontuacao, colocacao")
      .eq("olympiad_id", selectedOly)
      .eq("activity_id", actId)
      .order("colocacao", { ascending: true });

    if (!scores?.length) { setRanking([]); setLoadingRank(false); return; }

    const userIds = scores.map((s: any) => s.user_id);
    const { data: profiles } = await supabase.from("profiles").select("id, nome").in("id", userIds);
    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p.nome]));

    setRanking(scores.map((s: any) => ({ ...s, nome: profileMap.get(s.user_id) || "Participante" })));
    setLoadingRank(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Trophy className="h-5 w-5 text-yellow-400" />
        <h3 className="text-lg font-display font-semibold text-white">Ranking da Olimpíada</h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 max-w-xl">
        <div className="space-y-1">
          <Label>Olimpíada</Label>
          <Select value={selectedOly} onValueChange={(v) => { setSelectedOly(v); setSelectedAct(""); setRanking([]); }}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>{myOlympiads.map(o => <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Modalidade</Label>
          <Select value={selectedAct} onValueChange={loadRanking} disabled={!selectedOly}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>{myActivities.map(a => <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      {loadingRank && <p className="text-sm text-muted-foreground">Carregando ranking...</p>}

      {!loadingRank && selectedAct && ranking.length === 0 && (
        <Card className="card-cyber border-0 p-8 text-center">
          <Trophy className="h-10 w-10 mx-auto mb-3 opacity-20 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">O ranking desta modalidade ainda não foi publicado.</p>
        </Card>
      )}

      {ranking.length > 0 && (
        <>
          {/* Podium for Top 3 */}
          <div className="grid gap-3 sm:grid-cols-3 max-w-xl mx-auto">
            {ranking.slice(0, 3).map((r: any) => {
              const bgColors: Record<number, string> = {
                1: "bg-yellow-500/10 border-yellow-500/50",
                2: "bg-gray-400/10 border-gray-400/40",
                3: "bg-amber-600/10 border-amber-600/40",
              };
              return (
                <div key={r.user_id} className={`rounded-lg border p-4 text-center ${bgColors[r.colocacao] || "bg-muted/10 border-border"}`}>
                  <Crown className={`h-6 w-6 mx-auto mb-1 ${MEDAL_COLORS_P[r.colocacao]}`} />
                  <span className="font-display text-xl font-bold">{r.colocacao}º</span>
                  <p className="font-medium text-sm mt-1 truncate">{r.nome}</p>
                  <p className="text-xs text-muted-foreground mt-1">{r.pontuacao} pts</p>
                </div>
              );
            })}
          </div>

          {/* Full Table */}
          <Card className="card-cyber border-0 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-primary/10">
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Participante</TableHead>
                  <TableHead className="text-right">Pontuação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ranking.map((r: any) => (
                  <TableRow key={r.user_id} className="border-primary/5">
                    <TableCell>
                      {r.colocacao <= 3 ? (
                        <Crown className={`h-4 w-4 ${MEDAL_COLORS_P[r.colocacao]}`} />
                      ) : (
                        <span className="text-muted-foreground font-mono">{r.colocacao}</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{r.nome}</TableCell>
                    <TableCell className="text-right font-mono">{r.pontuacao}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </>
      )}
    </div>
  );
};

const ParticipantDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  // Listen for tab changes from header hamburger menu
  useEffect(() => {
    const handler = (e: Event) => {
      const t = (e as CustomEvent).detail;
      if (t) setTab(t);
    };
    window.addEventListener("participant-tab-change", handler);
    return () => window.removeEventListener("participant-tab-change", handler);
  }, []);

  const [profile, setProfile] = useState<any>(null);
  const [profileForm, setProfileForm] = useState<any>({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [olympiads, setOlympiads] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [lectures, setLectures] = useState<any[]>([]);
  const [lectureSpeakers, setLectureSpeakers] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [enrolledOlympiadIds, setEnrolledOlympiadIds] = useState<string[]>([]);
  const [enrolledModalityIds, setEnrolledModalityIds] = useState<string[]>([]);
  const [enrolledWorkshopIds, setEnrolledWorkshopIds] = useState<string[]>([]);
  const [enrolledLectureIds, setEnrolledLectureIds] = useState<string[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);

  // Password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  const [enrollOlympiadId, setEnrollOlympiadId] = useState<string | null>(null);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (prof) { setProfile(prof); setProfileForm({ ...prof }); }

      const [olyRes, actRes, wsRes, lecRes, spkRes, matRes, enrollOlyRes, enrollWsRes, enrollLecRes, attRes, tplRes] = await Promise.all([
        supabase.from("olympiads").select("*").order("created_at", { ascending: false }),
        supabase.from("olympiad_activities").select("*"),
        supabase.from("workshops").select("*").order("created_at", { ascending: false }),
        supabase.from("lectures").select("*").order("created_at", { ascending: false }),
        supabase.from("lecture_speakers").select("*"),
        supabase.from("support_materials").select("*"),
        supabase.from("olympiad_enrollments").select("*").eq("user_id", user.id),
        supabase.from("workshop_enrollments").select("workshop_id").eq("user_id", user.id),
        supabase.from("lecture_enrollments").select("lecture_id").eq("user_id", user.id),
        supabase.from("attendance").select("*").eq("user_id", user.id).eq("presente", true),
        supabase.from("certificate_templates").select("*")
      ]);

      setOlympiads(olyRes.data || []);
      setActivities(actRes.data || []);
      setWorkshops(wsRes.data || []);
      setLectures(lecRes.data || []);
      setLectureSpeakers(spkRes.data || []);
      setMaterials(matRes.data || []);
      
      setEnrollments(enrollOlyRes.data || []);
      setEnrolledOlympiadIds(enrollOlyRes.data?.map(e => e.olympiad_id) || []);
      setEnrolledModalityIds(enrollOlyRes.data?.map(e => e.activity_id).filter(Boolean) || []);
      setEnrolledWorkshopIds(enrollWsRes.data?.map(e => e.workshop_id) || []);
      setEnrolledLectureIds(enrollLecRes.data?.map(e => e.lecture_id) || []);
      
      setAttendance(attRes.data || []);
      setTemplates(tplRes.data || []);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleEnrollModality = async (olympiadId: string, activityId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from("olympiad_enrollments").insert({
        user_id: user.id, olympiad_id: olympiadId, activity_id: activityId
      });
      if (error) throw error;
      toast({ title: "Inscrição realizada!", description: "Você foi inscrito na modalidade com sucesso." });
      setEnrollOlympiadId(null);
      loadData();
    } catch (error: any) {
      toast({ title: "Erro na inscrição", description: error.message, variant: "destructive" });
    }
  };

  const handleEnrollWorkshop = async (workshopId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from("workshop_enrollments").insert({ user_id: user.id, workshop_id: workshopId });
      if (error) throw error;
      toast({ title: "Inscrição realizada!", description: "Você foi inscrito na oficina com sucesso." });
      loadData();
    } catch (error: any) {
      toast({ title: "Erro na inscrição", description: error.message, variant: "destructive" });
    }
  };

  const handleEnrollLecture = async (lectureId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from("lecture_enrollments").insert({ user_id: user.id, lecture_id: lectureId });
      if (error) throw error;
      toast({ title: "Inscrição realizada!", description: "Você foi inscrito na palestra com sucesso." });
      loadData();
    } catch (error: any) {
      toast({ title: "Erro na inscrição", description: error.message, variant: "destructive" });
    }
  };

  const updateProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    const { error } = await supabase.from("profiles").update({
      nome: profileForm.nome, telefone: profileForm.telefone, cpf: profileForm.cpf,
      cep: profileForm.cep, estado: profileForm.estado, cidade: profileForm.cidade,
      rua: profileForm.rua, numero: profileForm.numero,
    }).eq("id", user.id);
    setSavingProfile(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Perfil atualizado", description: "Suas informações foram salvas com sucesso." });
      loadData();
    }
  };

  const changePassword = async () => {
    const checks = passwordChecks(newPassword);
    if (checks.some(c => !c.ok)) {
      toast({ title: "Senha não atende os requisitos", variant: "destructive" }); return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "As senhas não coincidem", variant: "destructive" }); return;
    }
    setChangingPass(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPass(false);
    if (error) {
      toast({ title: "Erro ao alterar senha", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Senha alterada com sucesso" });
      setNewPassword(""); setConfirmPassword("");
    }
  };

  if (loading) {
    return (
      <Layout hideFooter>
        <div className="hero-bg min-h-[calc(100vh-4rem)]">
          <div className="container py-8">
            <div className="mb-6">
              <div className="h-8 w-64 bg-muted/20 rounded animate-pulse mb-2" />
              <div className="h-4 w-48 bg-muted/20 rounded animate-pulse" />
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card-cyber border-0 p-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted/20 animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-3 w-24 bg-muted/20 rounded animate-pulse" />
                      <div className="h-6 w-12 bg-muted/20 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const enrolledOlympiads = olympiads.filter(o => enrolledOlympiadIds.includes(o.id));
  const availableModalitiesForDialog = enrollOlympiadId 
    ? activities.filter(a => a.olympiad_id === enrollOlympiadId)
    : [];

  const visibleMaterials = materials.filter(m => {
    if (m.workshop_id) return enrolledWorkshopIds.includes(m.workshop_id);
    if (m.activity_id) return enrolledModalityIds.includes(m.activity_id);
    if (m.olympiad_id) return enrolledOlympiadIds.includes(m.olympiad_id);
    return true;
  });

  const groupedMaterials = visibleMaterials.reduce((acc, m) => {
    let group = "Materiais Gerais";
    if (m.workshop_id) {
      const w = workshops.find(x => x.id === m.workshop_id);
      if (w) group = `Oficina: ${w.nome}`;
    } else if (m.activity_id) {
      const a = activities.find(x => x.id === m.activity_id);
      if (a) group = `Modalidade: ${a.nome}`;
    } else if (m.olympiad_id) {
      const o = olympiads.find(x => x.id === m.olympiad_id);
      if (o) group = `Olimpíada: ${o.nome} (Geral)`;
    }
    if (!acc[group]) acc[group] = [];
    acc[group].push(m);
    return acc;
  }, {} as Record<string, any[]>);

  const availableCertificates: { id: string, tipo: string, nome: string, modalidade: string | null, horas: number, validation_code: string }[] = [];
  attendance.forEach(att => {
    if (att.lecture_id) {
      const lec = lectures.find(l => l.id === att.lecture_id);
      if (lec && lec.certificates_released) {
        availableCertificates.push({
          id: `lec-${lec.id}`, tipo: "Palestra", nome: lec.nome, horas: lec.carga_horaria || 0, modalidade: null,
          validation_code: (att as any).validation_code || "",
        });
      }
    } else if (att.workshop_id) {
      const ws = workshops.find(w => w.id === att.workshop_id);
      if (ws && ws.certificates_released) {
        availableCertificates.push({
          id: `ws-${ws.id}`, tipo: "Oficina", nome: ws.nome, horas: ws.total_horas || 0, modalidade: null,
          validation_code: (att as any).validation_code || "",
        });
      }
    } else if (att.olympiad_id) {
      const oly = olympiads.find(o => o.id === att.olympiad_id);
      if (oly && oly.certificates_released) {
        const act = activities.find(a => a.id === att.activity_id);
        availableCertificates.push({
          id: `oly-${oly.id}-${att.activity_id || 'geral'}`, tipo: "Olimpíada", nome: oly.nome,
          horas: oly.total_horas || 0, modalidade: act ? act.nome : "Participação Geral",
          validation_code: (att as any).validation_code || "",
        });
      }
    }
  });

  const printCertificate = (cert: any) => {
    const template = templates.length > 0 ? templates[0] : { cor_primaria: "#00ffcc", logo_url: "", texto_padrao: "Certificamos que [NOME_ALUNO] participou do evento [NOME_CURSO] na modalidade [NOME_MODALIDADE], totalizando [HORAS] horas de atividades." };
    
    let texto = (template.texto_padrao || "Certificamos que [NOME_ALUNO] participou do evento [NOME_CURSO] na modalidade [NOME_MODALIDADE], totalizando [HORAS] horas de atividades.");
    texto = texto.replace(/\[NOME_ALUNO\]/g, profile?.nome || "Participante");
    texto = texto.replace(/\[NOME_CURSO\]/g, cert.nome || "");
    texto = texto.replace(/\[NOME_MODALIDADE\]/g, cert.modalidade || cert.tipo || "");
    texto = texto.replace(/\[HORAS\]/g, String(cert.horas || 0));

    // Use the stored validation code from DB
    const formattedCode = cert.validation_code || "SEM-CODIGO";

    const primaryColor = template.cor_primaria || "#00ffcc";

    const pw = window.open("", "_blank");
    if (!pw) return;

    const html = `<!DOCTYPE html>
<html><head><title>Certificado - ${cert.nome}</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { display:flex; align-items:center; justify-content:center; min-height:100vh; background:#1a1a2e; font-family:'Inter',sans-serif; }
  @media print { body { background:none; } @page { size:landscape; margin:0; } }
  .cert {
    width:1120px; height:790px; background:#fff; position:relative; overflow:hidden;
    border:8px solid ${primaryColor}; box-shadow:inset 0 0 0 3px #fff, inset 0 0 0 5px ${primaryColor}33;
  }
  .cert-inner { padding:50px 70px 40px; height:100%; display:flex; flex-direction:column; }
  .cert-watermark {
    position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
    opacity:0.04; width:400px; height:400px; pointer-events:none;
    ${template.logo_url ? `background:url('${template.logo_url}') center/contain no-repeat;` : ""}
  }
  .cert-corner { position:absolute; width:60px; height:60px; border:3px solid ${primaryColor}44; }
  .ct { top:15px; left:15px; border-right:none; border-bottom:none; }
  .cr { top:15px; right:15px; border-left:none; border-bottom:none; }
  .cb { bottom:15px; left:15px; border-right:none; border-top:none; }
  .cd { bottom:15px; right:15px; border-left:none; border-top:none; }
  .cert-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
  .cert-logo { height:70px; max-width:200px; object-fit:contain; }
  .cert-header-text { text-align:right; font-size:11px; color:#888; line-height:1.5; }
  .cert-divider { height:2px; background:linear-gradient(90deg,transparent,${primaryColor},transparent); margin:15px 0; }
  .cert-title {
    font-family:'Playfair Display',serif; font-size:38px; font-weight:700;
    color:${primaryColor}; text-align:center; letter-spacing:4px; text-transform:uppercase; margin:15px 0 5px;
  }
  .cert-subtitle { font-size:14px; color:#777; text-align:center; letter-spacing:2px; margin-bottom:20px; }
  .cert-recipient {
    font-family:'Playfair Display',serif; font-size:28px; font-weight:700;
    text-align:center; color:#222; margin:10px 0 5px; border-bottom:2px solid ${primaryColor}44; padding-bottom:8px;
    display:inline-block; margin-left:auto; margin-right:auto;
  }
  .cert-recipient-wrap { text-align:center; }
  .cert-body { font-size:14px; line-height:1.9; color:#444; text-align:center; margin:15px 40px; flex:1; }
  .cert-footer { display:flex; justify-content:space-around; align-items:flex-end; margin-top:auto; padding-top:15px; }
  .cert-sig { text-align:center; width:220px; }
  .cert-sig-line { border-top:1px solid #333; padding-top:6px; font-size:12px; color:#333; font-weight:500; }
  .cert-sig-role { font-size:10px; color:#777; margin-top:2px; }
  .cert-meta { display:flex; justify-content:space-between; align-items:center; margin-top:12px; padding-top:8px; border-top:1px solid #eee; }
  .cert-date { font-size:10px; color:#999; }
  .cert-code { font-family:monospace; font-size:11px; color:${primaryColor}; background:${primaryColor}11; padding:4px 10px; border-radius:4px; letter-spacing:1px; font-weight:600; }
  .cert-code-label { font-size:9px; color:#999; margin-bottom:2px; display:block; }
</style></head>
<body>
<div class="cert">
  <div class="cert-corner ct"></div><div class="cert-corner cr"></div>
  <div class="cert-corner cb"></div><div class="cert-corner cd"></div>
  <div class="cert-watermark"></div>
  <div class="cert-inner">
    <div class="cert-header">
      ${template.logo_url ? `<img src="${template.logo_url}" class="cert-logo" />` : '<div></div>'}
      <div class="cert-header-text">Tech Olympics Hub<br/>Plataforma de Eventos</div>
    </div>
    <div class="cert-divider"></div>
    <div class="cert-title">Certificado</div>
    <div class="cert-subtitle">ESTE CERTIFICADO É CONFERIDO A</div>
    <div class="cert-recipient-wrap"><span class="cert-recipient">${profile?.nome || "Participante"}</span></div>
    <div class="cert-body">${texto}</div>
    <div class="cert-footer">
      <div class="cert-sig"><div class="cert-sig-line">Coordenação Geral</div><div class="cert-sig-role">Organização do Evento</div></div>
      <div class="cert-sig"><div class="cert-sig-line">Diretoria Tech Olympics</div><div class="cert-sig-role">Responsável Institucional</div></div>
    </div>
    <div class="cert-meta">
      <div class="cert-date">Emitido em ${new Date().toLocaleDateString("pt-BR")} via Plataforma Tech Olympics Hub</div>
      <div><span class="cert-code-label">Código de Validação</span><span class="cert-code">${formattedCode}</span></div>
    </div>
  </div>
</div>
<script>window.onload=()=>{setTimeout(()=>window.print(),600)}</script>
</body></html>`;
    pw.document.write(html);
    pw.document.close();
  };

  const checks = passwordChecks(newPassword);

  return (
    <Layout hideFooter>
      <div className="hero-bg min-h-[calc(100vh-4rem)]">
        <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-[1600px] mx-auto">
          <Tabs value={tab} onValueChange={setTab}>

            {/* Dashboard */}
            <TabsContent value="dashboard">
              <div className="grid gap-4 md:grid-cols-4">
                <Card className="card-cyber border-0">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Trophy className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Inscrições (Modalidades)</p>
                        <p className="font-display text-2xl font-semibold">{enrollments.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="card-cyber border-0">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                        <BookOpen className="h-5 w-5 text-secondary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Oficinas Inscritas</p>
                        <p className="font-display text-2xl font-semibold">{enrolledWorkshopIds.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="card-cyber border-0">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                        <Mic className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Palestras Inscritas</p>
                        <p className="font-display text-2xl font-semibold">{enrolledLectureIds.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="card-cyber border-0">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                        <Award className="h-5 w-5 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Certificados</p>
                        <p className="font-display text-2xl font-semibold">{availableCertificates.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-display font-semibold mb-4 text-white">Minhas Olimpíadas & Modalidades</h3>
                {enrollments.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Você ainda não está inscrito em nenhuma olimpíada.</p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {enrollments.map(enr => {
                      const oly = olympiads.find(o => o.id === enr.olympiad_id);
                      const act = activities.find(a => a.id === enr.activity_id);
                      return (
                        <Card key={enr.id} className="card-cyber border-0 p-4">
                          <h4 className="font-bold text-lg mb-1">{oly?.nome || "Olimpíada"}</h4>
                          {act ? (
                            <div className="space-y-1 mt-2 p-2 bg-muted/20 rounded">
                              <p className="text-sm font-medium text-accent flex items-center gap-1"><Target className="h-3.5 w-3.5" /> Modalidade: {act.nome}</p>
                              <p className="text-xs text-muted-foreground">Local: {act.local_sala || "A definir"}</p>
                              <p className="text-xs text-muted-foreground">Data: {act.data_atividade ? new Date(act.data_atividade).toLocaleDateString("pt-BR") : "A definir"} {act.horario ? `às ${act.horario}` : ""}</p>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground mt-2">Inscrição Geral</p>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Olympiads */}
            <TabsContent value="olympiads">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {olympiads.map((o) => {
                  const OlympiadModalities = activities.filter(a => a.olympiad_id === o.id);
                  const isEnrolledOverall = enrolledOlympiadIds.includes(o.id);
                  
                  return (
                    <Card key={o.id} className="card-cyber border-0 flex flex-col">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <CardTitle className="font-display text-base">{o.nome}</CardTitle>
                          {isEnrolledOverall && <Badge className="bg-primary/20 text-primary">Inscrito</Badge>}
                        </div>
                        <CardDescription className="line-clamp-2">
                          {o.descricao || 'Olimpíada na plataforma Tech Olympics.'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 text-sm text-muted-foreground mt-2 flex-grow flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-primary" />{o.data_inicio ? new Date(o.data_inicio).toLocaleDateString("pt-BR") : 'Em breve'}</div>
                          <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-primary" />{o.local || 'Online/A definir'}</div>
                          <div className="mt-3 text-xs">
                             <span className="font-semibold text-white">Modalidades disponíveis:</span> {OlympiadModalities.length}
                          </div>
                        </div>
                        <Button size="sm" className="w-full mt-4" onClick={() => setEnrollOlympiadId(o.id)}>
                          Ver Modalidades / Inscrever-se
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
                {olympiads.length === 0 && (
                  <div className="col-span-full py-8 text-center text-muted-foreground">
                    Nenhuma olimpíada disponível no momento.
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Workshops */}
            <TabsContent value="workshops">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {workshops.map((ws) => {
                  const isEnrolledInWs = enrolledWorkshopIds.includes(ws.id);
                  const isEnrolledInOlymp = enrolledOlympiadIds.includes(ws.olympiad_id);
                  const relatedOlympiad = olympiads.find(o => o.id === ws.olympiad_id);

                  return (
                    <Card key={ws.id} className="card-cyber border-0">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <CardTitle className="font-display text-base">{ws.nome}</CardTitle>
                          {isEnrolledInWs && <Badge className="bg-primary/20 text-primary">Inscrito</Badge>}
                        </div>
                        <CardDescription className="flex flex-col gap-1">
                          <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" /> {ws.professor || 'Indefinido'}</span>
                          <span className="text-xs text-primary/80">Olimpíada: {relatedOlympiad?.nome || '—'}</span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm text-muted-foreground mt-2">
                        <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-primary" />{ws.data_inicio ? new Date(ws.data_inicio).toLocaleDateString("pt-BR") : 'Data a definir'}</div>
                        <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-primary" />{ws.horario || 'Horário a definir'}</div>
                        <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-primary" />{ws.local || 'Local a definir'}</div>
                        
                        <div className="pt-3">
                          {isEnrolledInWs ? (
                            <Button size="sm" variant="outline" className="w-full cursor-default" disabled>Inscrição Confirmada</Button>
                          ) : isEnrolledInOlymp ? (
                            <Button size="sm" className="w-full" onClick={() => handleEnrollWorkshop(ws.id)}>Inscrever-se na Oficina</Button>
                          ) : (
                            <p className="text-xs text-destructive text-center py-2 bg-destructive/10 rounded">
                              Para se inscrever, você deve primeiro se inscrever na Olimpíada "{relatedOlympiad?.nome}".
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {workshops.length === 0 && (
                  <div className="col-span-full py-8 text-center text-muted-foreground">
                    Nenhuma oficina disponível no momento.
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Lectures (Palestras) */}
            <TabsContent value="lectures">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {lectures.map((lec) => {
                  const isEnrolled = enrolledLectureIds.includes(lec.id);
                  const speakers = lectureSpeakers.filter(s => s.lecture_id === lec.id);

                  return (
                    <Card key={lec.id} className="card-cyber border-0 flex flex-col">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <CardTitle className="font-display text-base">{lec.nome}</CardTitle>
                          {isEnrolled && <Badge className="bg-purple-500/20 text-purple-300">Inscrito</Badge>}
                        </div>
                        <CardDescription className="line-clamp-2">{lec.descricao || "Palestra na plataforma Tech Olympics."}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm text-muted-foreground mt-2 flex-grow flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-purple-400" />{lec.data_evento ? new Date(lec.data_evento + "T12:00").toLocaleDateString("pt-BR") : "Data a definir"}</div>
                          <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-purple-400" />{lec.horario || "Horário a definir"}</div>
                          <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-purple-400" />{lec.local || "Local a definir"}</div>
                          <div className="flex items-center gap-2 text-xs"><GraduationCap className="h-3.5 w-3.5 text-purple-400" />Carga Horária: {lec.carga_horaria || 0}h</div>
                          
                          {speakers.length > 0 && (
                            <div className="mt-3 space-y-1">
                              <p className="text-xs font-semibold text-white">Palestrantes:</p>
                              {speakers.map(s => (
                                <div key={s.id} className="text-xs bg-muted/20 rounded p-2">
                                  <p className="font-medium text-purple-300">{s.nome}</p>
                                  {s.topico && <p className="text-muted-foreground">Tópico: {s.topico}</p>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="pt-3">
                          {isEnrolled ? (
                            <Button size="sm" variant="outline" className="w-full cursor-default" disabled>Inscrição Confirmada</Button>
                          ) : (
                            <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => handleEnrollLecture(lec.id)}>
                              Inscrever-se na Palestra
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {lectures.length === 0 && (
                  <div className="col-span-full py-8 text-center text-muted-foreground">
                    Nenhuma palestra disponível no momento.
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Materials */}
            <TabsContent value="materials">
              <div className="space-y-6">
                {Object.entries(groupedMaterials).map(([group, mats]) => (
                  <div key={group}>
                    <h3 className="text-lg font-display font-semibold mb-3 text-primary flex items-center gap-2">
                      <FileText className="h-5 w-5" /> {group}
                    </h3>
                    <div className="grid gap-3 md:grid-cols-2">
                      {(mats as any[]).map((mat) => (
                        <Card key={mat.id} className="card-cyber border-primary/20 bg-muted/10">
                          <CardContent className="flex items-center justify-between py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                                <FileText className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-white">{mat.titulo}</p>
                                <p className="text-xs text-muted-foreground">{mat.descricao || 'Material complementar'}</p>
                              </div>
                            </div>
                            {mat.arquivo_url && (
                              <Button variant="outline" size="sm" className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground" onClick={() => window.open(mat.arquivo_url, '_blank')}>
                                <Download className="mr-1 h-4 w-4" /> Baixar
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
                {Object.keys(groupedMaterials).length === 0 && (
                  <div className="py-12 text-center text-muted-foreground bg-muted/5 rounded-lg border border-dashed border-muted">
                    <FileText className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    Nenhum material de apoio disponível no momento para suas inscrições.
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Certificates */}
            <TabsContent value="certificates">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-display font-semibold text-white">Meus Certificados</h3>
                </div>
                
                {availableCertificates.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {availableCertificates.map(cert => (
                      <Card key={cert.id} className="card-cyber border-primary/30 p-4 flex flex-col justify-between">
                        <div>
                          <Badge variant="secondary" className="mb-2">{cert.tipo}</Badge>
                          <h4 className="font-bold text-lg mb-1 line-clamp-2 text-white">{cert.nome}</h4>
                          {cert.modalidade && <p className="text-sm text-accent mb-2">Mod: {cert.modalidade}</p>}
                          <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Carga Horária: {cert.horas}h</p>
                        </div>
                        <Button className="w-full mt-4" onClick={() => printCertificate(cert)}>
                          <Download className="mr-2 h-4 w-4" /> Visualizar / Baixar
                        </Button>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="card-cyber border-0 p-8 text-center">
                    <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">Nenhum certificado disponível no momento.</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Os certificados são liberados após a confirmação da sua presença e encerramento do evento.
                    </p>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Ranking */}
            <TabsContent value="ranking">
              <ParticipantRankingView enrolledOlympiadIds={enrolledOlympiadIds} enrolledModalityIds={enrolledModalityIds} olympiads={olympiads} activities={activities} />
            </TabsContent>

            {/* History */}
            <TabsContent value="history">
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <History className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-display font-semibold text-white">Meu Histórico</h3>
                </div>

                {/* Enrollments Timeline */}
                {enrollments.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-display font-semibold text-muted-foreground uppercase tracking-wider">Inscrições em Olimpíadas</h4>
                    <div className="relative space-y-0">
                      {enrollments.map((enr, idx) => {
                        const oly = olympiads.find(o => o.id === enr.olympiad_id);
                        const act = activities.find(a => a.id === enr.activity_id);
                        return (
                          <div key={enr.id} className="flex gap-4 pb-6 relative">
                            {idx < enrollments.length - 1 && (
                              <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-primary/20" />
                            )}
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 border border-primary/30">
                              <div className="h-2 w-2 rounded-full bg-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white">{oly?.nome || "Olimpíada"}</p>
                              {act && <p className="text-xs text-accent">Modalidade: {act.nome}</p>}
                              <p className="text-xs text-muted-foreground">
                                {new Date(enr.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs shrink-0">Inscrição</Badge>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Workshops Timeline */}
                {enrolledWorkshopIds.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-display font-semibold text-muted-foreground uppercase tracking-wider">Inscrições em Oficinas</h4>
                    <div className="relative space-y-0">
                      {workshops.filter(w => enrolledWorkshopIds.includes(w.id)).map((ws, idx, arr) => (
                        <div key={ws.id} className="flex gap-4 pb-6 relative">
                          {idx < arr.length - 1 && (
                            <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-secondary/20" />
                          )}
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary/20 border border-secondary/30">
                            <div className="h-2 w-2 rounded-full bg-secondary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">{ws.nome}</p>
                            <p className="text-xs text-muted-foreground">{ws.professor || "Professor"}</p>
                          </div>
                          <Badge variant="outline" className="text-xs shrink-0">Oficina</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lectures Timeline */}
                {enrolledLectureIds.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-display font-semibold text-muted-foreground uppercase tracking-wider">Inscrições em Palestras</h4>
                    <div className="relative space-y-0">
                      {lectures.filter(l => enrolledLectureIds.includes(l.id)).map((lec, idx, arr) => (
                        <div key={lec.id} className="flex gap-4 pb-6 relative">
                          {idx < arr.length - 1 && (
                            <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-purple-500/20" />
                          )}
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-500/20 border border-purple-500/30">
                            <div className="h-2 w-2 rounded-full bg-purple-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">{lec.nome}</p>
                            <p className="text-xs text-muted-foreground">{lec.local || "Local a definir"}</p>
                          </div>
                          <Badge variant="outline" className="text-xs shrink-0">Palestra</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attendance Timeline */}
                {attendance.filter(a => a.presente).length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-display font-semibold text-muted-foreground uppercase tracking-wider">Presenças Registradas</h4>
                    <div className="relative space-y-0">
                      {attendance.filter(a => a.presente).map((att, idx, arr) => {
                        const oly = olympiads.find(o => o.id === att.olympiad_id);
                        const ws = workshops.find(w => w.id === att.workshop_id);
                        const lec = lectures.find(l => l.id === att.lecture_id);
                        const nome = oly?.nome || ws?.nome || lec?.nome || "Evento";
                        const tipo = ws ? "Oficina" : lec ? "Palestra" : "Olimpíada";
                        return (
                          <div key={att.id} className="flex gap-4 pb-6 relative">
                            {idx < arr.length - 1 && (
                              <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-primary/20" />
                            )}
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500/20 border border-green-500/30">
                              <div className="h-2 w-2 rounded-full bg-green-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white">{nome}</p>
                              <p className="text-xs text-green-400">Presença Confirmada</p>
                              <p className="text-xs text-muted-foreground">{att.data ? new Date(att.data + "T12:00").toLocaleDateString("pt-BR") : ""}</p>
                            </div>
                            <Badge className="text-xs shrink-0 bg-green-500/20 text-green-400 border-green-500/30">{tipo}</Badge>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {enrollments.length === 0 && enrolledWorkshopIds.length === 0 && enrolledLectureIds.length === 0 && attendance.filter(a => a.presente).length === 0 && (
                  <Card className="card-cyber border-0 p-8 text-center">
                    <History className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">Nenhum registro de atividade encontrado.</p>
                    <p className="text-xs text-muted-foreground mt-2">Participe de olimpíadas, oficinas ou palestras para ver seu histórico.</p>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Profile */}
            <TabsContent value="profile">
              <div className="grid gap-6 max-w-2xl">
                <Card className="card-cyber border-0">
                  <CardHeader>
                    <CardTitle className="font-display text-xl">Meu Perfil</CardTitle>
                    <CardDescription>Visualize e edite seus dados pessoais</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Nome Completo</Label>
                        <Input value={profileForm.nome || ""} onChange={e => setProfileForm({ ...profileForm, nome: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>E-mail</Label>
                        <Input value={profileForm.email || ""} disabled className="opacity-60" />
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>CPF</Label>
                        <Input value={profileForm.cpf || ""} onChange={e => setProfileForm({ ...profileForm, cpf: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Telefone</Label>
                        <Input value={profileForm.telefone || ""} onChange={e => setProfileForm({ ...profileForm, telefone: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="space-y-2">
                        <Label>CEP</Label>
                        <Input value={profileForm.cep || ""} onChange={e => setProfileForm({ ...profileForm, cep: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Estado</Label>
                        <Select value={profileForm.estado || ""} onValueChange={v => setProfileForm({ ...profileForm, estado: v })}>
                          <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                          <SelectContent>{ESTADOS_BR.map(uf => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Cidade</Label>
                        <Input value={profileForm.cidade || ""} onChange={e => setProfileForm({ ...profileForm, cidade: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-[1fr_100px]">
                      <div className="space-y-2">
                        <Label>Rua</Label>
                        <Input value={profileForm.rua || ""} onChange={e => setProfileForm({ ...profileForm, rua: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Nº</Label>
                        <Input value={profileForm.numero || ""} onChange={e => setProfileForm({ ...profileForm, numero: e.target.value })} />
                      </div>
                    </div>
                    <Button className="font-display tracking-wide w-full" onClick={updateProfile} disabled={savingProfile}>
                      {savingProfile ? "Salvando..." : "Salvar Alterações"}
                    </Button>
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
                        <Input type={showPass ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirme" />
                      </div>
                    </div>
                    {newPassword && (
                      <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-1.5">
                        <p className="text-xs font-semibold text-muted-foreground mb-1">Requisitos da senha:</p>
                        {checks.map(c => (
                          <div key={c.label} className="flex items-center gap-2 text-xs">
                            {c.ok ? <Check className="h-3.5 w-3.5 text-primary" /> : <XIcon className="h-3.5 w-3.5 text-destructive" />}
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
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Enroll Dialog for Modalities */}
      <Dialog open={!!enrollOlympiadId} onOpenChange={(open) => !open && setEnrollOlympiadId(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Escolha sua as Modalidades</DialogTitle>
            <DialogDescription>
              A olimpíada está dividida nas seguintes modalidades. Você pode se candidatar nas que desejar participar!
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {availableModalitiesForDialog.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhuma modalidade configurada pelo administrador para esta olimpíada.</p>
            ) : (
              availableModalitiesForDialog.map(modality => {
                const isEnrolled = enrolledModalityIds.includes(modality.id);
                return (
                  <Card key={modality.id} className="border-border bg-muted/10">
                    <CardHeader className="py-3 px-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base text-primary">{modality.nome}</CardTitle>
                          <CardDescription className="text-xs">{modality.descricao}</CardDescription>
                        </div>
                        {isEnrolled && <Badge className="bg-primary/20 text-primary">Inscrito</Badge>}
                      </div>
                    </CardHeader>
                    <CardContent className="py-3 px-4 border-t border-border/50 text-sm space-y-2">
                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-muted-foreground">
                        <span className="flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" /> Resp: {modality.responsavel || "Indefinido"}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Local: {modality.local_sala || "A definir"}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Data: {modality.data_atividade ? new Date(modality.data_atividade).toLocaleDateString("pt-BR") : "A definir"}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Hora: {modality.horario || "A definir"}</span>
                      </div>
                      
                      <div className="mt-4 pt-2">
                        {!isEnrolled ? (
                          <Button size="sm" onClick={() => handleEnrollModality(enrollOlympiadId!, modality.id)}>
                            Realizar Inscrição nesta Modalidade
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" disabled>
                            Inscrição Efetuada ✓
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ParticipantDashboard;

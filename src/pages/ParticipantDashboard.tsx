import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  LayoutDashboard, BookOpen, MapPin, FileText, User,
  Calendar, Clock, GraduationCap, Download, Trophy, Target, Award
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

const ParticipantDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<any>(null);
  const [olympiads, setOlympiads] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]); // Modalities
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [enrolledOlympiadIds, setEnrolledOlympiadIds] = useState<string[]>([]);
  const [enrolledModalityIds, setEnrolledModalityIds] = useState<string[]>([]);
  const [enrolledWorkshopIds, setEnrolledWorkshopIds] = useState<string[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);

  // Dialog state
  const [enrollOlympiadId, setEnrollOlympiadId] = useState<string | null>(null);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (prof) setProfile(prof);

      const [olyRes, actRes, wsRes, matRes, enrollOlyRes, enrollWsRes, attRes, tplRes] = await Promise.all([
        supabase.from("olympiads").select("*").order("created_at", { ascending: false }),
        supabase.from("olympiad_activities").select("*"),
        supabase.from("workshops").select("*").order("created_at", { ascending: false }),
        supabase.from("support_materials").select("*"),
        supabase.from("olympiad_enrollments").select("*").eq("user_id", user.id),
        supabase.from("workshop_enrollments").select("workshop_id").eq("user_id", user.id),
        supabase.from("attendance").select("*").eq("user_id", user.id).eq("presente", true),
        supabase.from("certificate_templates").select("*")
      ]);

      setOlympiads(olyRes.data || []);
      setActivities(actRes.data || []);
      setWorkshops(wsRes.data || []);
      setMaterials(matRes.data || []);
      
      setEnrollments(enrollOlyRes.data || []);
      setEnrolledOlympiadIds(enrollOlyRes.data?.map(e => e.olympiad_id) || []);
      setEnrolledModalityIds(enrollOlyRes.data?.map(e => e.activity_id).filter(Boolean) || []);
      setEnrolledWorkshopIds(enrollWsRes.data?.map(e => e.workshop_id) || []);
      
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
        user_id: user.id,
        olympiad_id: olympiadId,
        activity_id: activityId
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
      const { error } = await supabase.from("workshop_enrollments").insert({
        user_id: user.id,
        workshop_id: workshopId
      });
      if (error) throw error;
      toast({ title: "Inscrição realizada!", description: "Você foi inscrito na oficina com sucesso." });
      loadData();
    } catch (error: any) {
      toast({ title: "Erro na inscrição", description: error.message, variant: "destructive" });
    }
  };

  const updateProfile = async () => {
    toast({ title: "Perfil atualizado", description: "Suas informações foram salvas." });
  };

  if (loading) {
    return (
      <Layout hideFooter>
        <div className="hero-bg min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <p className="text-white">Carregando...</p>
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
    return true; // General materials available to everyone
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

  const availableCertificates: { id: string, tipo: string, nome: string, modalidade: string | null, horas: number }[] = [];
  attendance.forEach(att => {
    if (att.workshop_id) {
      const ws = workshops.find(w => w.id === att.workshop_id);
      if (ws && ws.certificates_released) {
        availableCertificates.push({
          id: `ws-${ws.id}`, tipo: "Oficina", nome: ws.nome, horas: ws.total_horas || 0, modalidade: null,
        });
      }
    } else if (att.olympiad_id) {
      const oly = olympiads.find(o => o.id === att.olympiad_id);
      if (oly && oly.certificates_released) {
        const act = activities.find(a => a.id === att.activity_id);
        availableCertificates.push({
          id: `oly-${oly.id}-${att.activity_id || 'geral'}`, tipo: "Olimpíada", nome: oly.nome,
          horas: oly.total_horas || 0, modalidade: act ? act.nome : "Participação Geral",
        });
      }
    }
  });

  const printCertificate = (cert: any) => {
    const template = templates.length > 0 ? templates[0] : { cor_primaria: "#00ffcc", logo_url: "", texto_padrao: "Certificamos que [NOME_ALUNO] participou ativamente no evento [NOME_CURSO] na modalidade [NOME_MODALIDADE] totalizando [HORAS] horas de carga horária." };
    
    let texto = template.texto_padrao || "";
    texto = texto.replace(/\[NOME_ALUNO\]/g, profile?.nome || "");
    texto = texto.replace(/\[NOME_CURSO\]/g, cert.nome);
    texto = texto.replace(/\[NOME_MODALIDADE\]/g, cert.modalidade || "");
    texto = texto.replace(/\[HORAS\]/g, cert.horas.toString());

    const pw = window.open("", "_blank");
    if (!pw) return;

    const html = `
      <html>
      <head>
        <title>Certificado - ${cert.nome}</title>
        <style>
          body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: 'Arial', sans-serif; background: #222; }
          @media print { body { background: none; } }
          .cert-container { width: 1056px; height: 816px; background: white; padding: 40px; box-sizing: border-box; position: relative; border: 12px solid ${template.cor_primaria || '#333'}; text-align: center; overflow: hidden; }
          .cert-bg { position: absolute; top:0; left:0; right:0; bottom:0; opacity: 0.05; background: url('${template.logo_url || ''}') center/50% no-repeat; pointer-events:none; }
          .cert-title { font-size: 56px; font-weight: bold; color: ${template.cor_primaria || '#333'}; margin-top: 80px; text-transform: uppercase; letter-spacing: 6px; }
          .cert-subtitle { font-size: 24px; color: #555; margin-top: 10px; font-weight: 300; letter-spacing: 2px; }
          .cert-body { font-size: 26px; line-height: 1.8; margin: 80px 80px; color: #333; }
          .cert-signature-box { position: absolute; bottom: 80px; left: 0; right: 0; display: flex; justify-content: space-around; }
          .cert-signature { border-top: 1px solid #000; padding-top: 10px; width: 300px; font-size: 18px; color: #000; }
          .cert-date { position: absolute; bottom: 40px; right: 60px; font-size: 14px; color: #666; }
          .logo-img { height: 90px; position:absolute; top:40px; left:40px; }
        </style>
      </head>
      <body>
        <div class="cert-container">
          <div class="cert-bg"></div>
          ${template.logo_url ? `<img src="${template.logo_url}" class="logo-img" />` : ''}
          <div class="cert-title">Certificado de Participação</div>
          <div class="cert-subtitle">Este certificado é orgulhosamente apresentado a</div>
          
          <div class="cert-body">
            <strong>${profile?.nome || ""}</strong><br/><br/>
            ${texto}
          </div>
          
          <div class="cert-signature-box">
            <div class="cert-signature">Coordenação Geral</div>
            <div class="cert-signature">Diretoria Tech Olympics</div>
          </div>
          <div class="cert-date">Emitido via Plataforma Sulis em: ${new Date().toLocaleDateString('pt-BR')}</div>
        </div>
        <script>
          window.onload = () => { setTimeout(() => window.print(), 500); }
        </script>
      </body>
      </html>
    `;
    pw.document.write(html);
    pw.document.close();
  };

  return (
    <Layout hideFooter>
      <div className="hero-bg min-h-[calc(100vh-4rem)]">
        <div className="container py-8">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold text-primary-foreground">
              Olá, <span className="text-primary">{profile?.nome || "Participante"}</span>
            </h1>
            <p className="text-sm text-muted-foreground">Gerencie sua participação nos eventos e modalidades</p>
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="mb-6 flex flex-wrap gap-1 bg-muted/10">
              <TabsTrigger value="dashboard" className="gap-1.5"><LayoutDashboard className="h-4 w-4" />Resumo</TabsTrigger>
              <TabsTrigger value="olympiads" className="gap-1.5"><Trophy className="h-4 w-4" />Olimpíadas e Modalidades</TabsTrigger>
              <TabsTrigger value="workshops" className="gap-1.5"><BookOpen className="h-4 w-4" />Oficinas</TabsTrigger>
              <TabsTrigger value="materials" className="gap-1.5"><FileText className="h-4 w-4" />Materiais</TabsTrigger>
              <TabsTrigger value="certificates" className="gap-1.5"><Award className="h-4 w-4" />Certificados</TabsTrigger>
              <TabsTrigger value="profile" className="gap-1.5"><User className="h-4 w-4" />Perfil</TabsTrigger>
            </TabsList>

            {/* Dashboard */}
            <TabsContent value="dashboard">
              <div className="grid gap-4 md:grid-cols-3">
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
                        
                        <Button 
                          size="sm" 
                          className="w-full mt-4" 
                          onClick={() => setEnrollOlympiadId(o.id)}
                        >
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
                          <span className="flex items-center gap-1">
                            <GraduationCap className="h-3 w-3" /> {ws.professor || 'Indefinido'}
                          </span>
                          <span className="text-xs text-primary/80">Olimpíada: {relatedOlympiad?.nome || '—'}</span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm text-muted-foreground mt-2">
                        <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-primary" />{ws.data_inicio ? new Date(ws.data_inicio).toLocaleDateString("pt-BR") : 'Data a definir'}</div>
                        <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-primary" />{ws.horario || 'Horário a definir'}</div>
                        <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-primary" />{ws.local || 'Local a definir'}</div>
                        
                        <div className="pt-3">
                          {isEnrolledInWs ? (
                            <Button size="sm" variant="outline" className="w-full cursor-default" disabled>
                              Inscrição Confirmada
                            </Button>
                          ) : isEnrolledInOlymp ? (
                            <Button 
                              size="sm" 
                              className="w-full"
                              onClick={() => handleEnrollWorkshop(ws.id)}
                            >
                              Inscrever-se na Oficina
                            </Button>
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
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
                                onClick={() => window.open(mat.arquivo_url, '_blank')}
                              >
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

            {/* Profile */}
            <TabsContent value="profile">
              <Card className="card-cyber border-0 max-w-xl">
                <CardHeader>
                  <CardTitle className="font-display text-xl">Meu Perfil</CardTitle>
                  <CardDescription>Visualize seus dados pessoais</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Nome Completo</Label>
                      <Input defaultValue={profile?.nome || ""} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>E-mail</Label>
                      <Input defaultValue={profile?.email || ""} disabled />
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>CPF</Label>
                      <Input defaultValue={profile?.cpf || ""} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Telefone</Label>
                      <Input defaultValue={profile?.telefone || ""} disabled />
                    </div>
                  </div>
                  <Button className="font-display tracking-wide" onClick={updateProfile}>Salvar Alterações</Button>
                </CardContent>
              </Card>
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

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Trophy, BookOpen, Eye } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const COLORS = ["hsl(152, 85%, 45%)", "hsl(210, 60%, 50%)", "hsl(175, 70%, 40%)", "hsl(0, 84%, 60%)", "hsl(45, 90%, 50%)", "hsl(280, 60%, 55%)"];

type OlympiadData = {
  id: string; nome: string; inscritos: number;
  workshops: { nome: string; inscritos: number }[];
};

const DashboardTab = () => {
  const [stats, setStats] = useState({ profiles: 0, olympiads: 0, workshops: 0, views: 0 });
  const [olympiadData, setOlympiadData] = useState<OlympiadData[]>([]);
  const [postViews, setPostViews] = useState<{ titulo: string; visualizacoes: number }[]>([]);
  const [drillDialog, setDrillDialog] = useState<string | null>(null);
  const [drillData, setDrillData] = useState<{ nome: string; inscritos: number }[]>([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [profilesRes, olympiadsRes, workshopsRes, postsRes, activitiesRes] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("olympiads").select("*"),
      supabase.from("workshops").select("*, workshop_enrollments(id)"),
      supabase.from("posts").select("titulo, visualizacoes"),
      supabase.from("olympiad_activities").select("*"),
    ]);

    const totalViews = postsRes.data?.reduce((sum, p) => sum + (p.visualizacoes || 0), 0) || 0;
    setStats({
      profiles: profilesRes.count || 0,
      olympiads: olympiadsRes.data?.length || 0,
      workshops: workshopsRes.data?.length || 0,
      views: totalViews,
    });

    if (olympiadsRes.data && workshopsRes.data) {
      const oData: OlympiadData[] = olympiadsRes.data.map(o => {
        const wsForO = (workshopsRes.data || []).filter((w: any) => w.olympiad_id === o.id);
        const totalInscritos = wsForO.reduce((sum: number, w: any) => sum + (w.workshop_enrollments?.length || 0), 0);
        return {
          id: o.id, nome: o.nome, inscritos: totalInscritos,
          workshops: wsForO.map((w: any) => ({ nome: w.nome, inscritos: w.workshop_enrollments?.length || 0 })),
        };
      });
      setOlympiadData(oData);
    }

    if (postsRes.data) {
      setPostViews(postsRes.data.map(p => ({ titulo: p.titulo, visualizacoes: p.visualizacoes || 0 })));
    }
  };

  const openDrill = async (olympiadId: string) => {
    // Load activities/subcategories for this olympiad
    const { data: activities } = await supabase.from("olympiad_activities").select("nome, limite_vagas").eq("olympiad_id", olympiadId);
    setDrillData(activities?.map((a: any) => ({ nome: a.nome, inscritos: a.limite_vagas || 0 })) || []);
    setDrillDialog(olympiadId);
  };

  const statCards = [
    { label: "Participantes", value: stats.profiles, icon: Users, color: "text-primary" },
    { label: "Olimpíadas", value: stats.olympiads, icon: Trophy, color: "text-secondary" },
    { label: "Oficinas", value: stats.workshops, icon: BookOpen, color: "text-accent" },
    { label: "Visualizações Blog", value: stats.views, icon: Eye, color: "text-primary" },
  ];

  const tooltipStyle = { background: "hsl(220, 35%, 8%)", border: "1px solid hsl(152, 85%, 45%, 0.3)", borderRadius: 8 };
  const tickStyle = { fill: "hsl(220, 15%, 55%)", fontSize: 11 };

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="card-cyber border-0">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/10">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="font-display text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Per-Olympiad Charts */}
      {olympiadData.map((o, idx) => (
        <Card key={o.id} className="card-cyber border-0">
          <CardHeader>
            <CardTitle className="font-display text-sm flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              {o.nome} — {o.inscritos} inscrito(s)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="cursor-pointer"
              onClick={() => openDrill(o.id)}
              title="Clique para ver subcategorias"
            >
              {o.workshops.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={o.workshops}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 30%, 14%)" />
                    <XAxis dataKey="nome" tick={tickStyle} />
                    <YAxis tick={tickStyle} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="inscritos" radius={[4, 4, 0, 0]}>
                      {o.workshops.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">Nenhuma oficina vinculada</p>
              )}
            </div>
            {o.workshops.length > 0 && (
              <p className="mt-2 text-[11px] text-muted-foreground text-center">Clique no gráfico para ver subcategorias</p>
            )}
          </CardContent>
        </Card>
      ))}

      {olympiadData.length === 0 && (
        <Card className="card-cyber border-0">
          <CardContent className="py-8 text-center text-muted-foreground text-sm">Nenhuma olimpíada cadastrada</CardContent>
        </Card>
      )}

      {/* Blog Views */}
      <Card className="card-cyber border-0">
        <CardHeader><CardTitle className="font-display text-sm">Visualizações do Blog</CardTitle></CardHeader>
        <CardContent>
          {postViews.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={postViews}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 30%, 14%)" />
                <XAxis dataKey="titulo" tick={{ ...tickStyle, fontSize: 10 }} />
                <YAxis tick={tickStyle} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="visualizacoes" fill="hsl(175, 70%, 40%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhuma postagem</p>
          )}
        </CardContent>
      </Card>

      {/* Drill-down Dialog */}
      <Dialog open={!!drillDialog} onOpenChange={() => setDrillDialog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">
              Subcategorias — {olympiadData.find(o => o.id === drillDialog)?.nome}
            </DialogTitle>
          </DialogHeader>
          {drillData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={drillData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 30%, 14%)" />
                <XAxis dataKey="nome" tick={tickStyle} />
                <YAxis tick={tickStyle} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="inscritos" fill="hsl(210, 60%, 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhuma subcategoria</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardTab;

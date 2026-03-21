import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Trophy, BookOpen, Eye } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

const COLORS = ["hsl(152, 85%, 45%)", "hsl(210, 60%, 50%)", "hsl(175, 70%, 40%)", "hsl(0, 84%, 60%)", "hsl(45, 90%, 50%)", "hsl(280, 60%, 55%)"];

const DashboardTab = () => {
  const [stats, setStats] = useState({ profiles: 0, olympiads: 0, workshops: 0, views: 0 });
  const [olympiadChart, setOlympiadChart] = useState<{ nome: string; inscritos: number }[]>([]);
  const [activityChart, setActivityChart] = useState<{ nome: string; inscritos: number }[]>([]);
  const [workshopChart, setWorkshopChart] = useState<{ nome: string; inscritos: number }[]>([]);
  const [postViews, setPostViews] = useState<{ titulo: string; visualizacoes: number }[]>([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [profilesRes, olympiadsRes, workshopsRes, postsRes, activitiesRes, oEnrollRes, wEnrollRes] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("olympiads").select("*"),
      supabase.from("workshops").select("*"),
      supabase.from("posts").select("titulo, visualizacoes"),
      supabase.from("olympiad_activities").select("*"),
      supabase.from("olympiad_enrollments").select("olympiad_id, activity_id"),
      supabase.from("workshop_enrollments").select("workshop_id")
    ]);

    const totalViews = postsRes.data?.reduce((sum, p) => sum + (p.visualizacoes || 0), 0) || 0;
    setStats({
      profiles: profilesRes.count || 0,
      olympiads: olympiadsRes.data?.length || 0,
      workshops: workshopsRes.data?.length || 0,
      views: totalViews,
    });

    const oData = olympiadsRes.data?.map((o: any) => ({
      nome: o.nome,
      inscritos: oEnrollRes.data?.filter((e: any) => e.olympiad_id === o.id).length || 0
    })).sort((a,b) => b.inscritos - a.inscritos) || [];

    const aData = activitiesRes.data?.map((a: any) => ({
      nome: a.nome,
      inscritos: oEnrollRes.data?.filter((e: any) => e.activity_id === a.id).length || 0
    })).sort((a,b) => b.inscritos - a.inscritos) || [];

    const wData = workshopsRes.data?.map((w: any) => ({
      nome: w.nome,
      inscritos: wEnrollRes.data?.filter((e: any) => e.workshop_id === w.id).length || 0
    })).sort((a,b) => b.inscritos - a.inscritos) || [];

    setOlympiadChart(oData);
    setActivityChart(aData);
    setWorkshopChart(wData);

    if (postsRes.data) {
      setPostViews(postsRes.data.map(p => ({ titulo: p.titulo, visualizacoes: p.visualizacoes || 0 })).sort((a,b) => b.visualizacoes - a.visualizacoes));
    }
  };

  const statCards = [
    { label: "Participantes", value: stats.profiles, icon: Users, color: "text-primary" },
    { label: "Olimpíadas", value: stats.olympiads, icon: Trophy, color: "text-secondary" },
    { label: "Oficinas", value: stats.workshops, icon: BookOpen, color: "text-accent" },
    { label: "Visualizações Blog", value: stats.views, icon: Eye, color: "text-primary" },
  ];

  const tooltipStyle = { background: "hsl(220, 35%, 8%)", border: "1px solid hsl(152, 85%, 45%, 0.3)", borderRadius: 8 };
  const tickStyle = { fill: "hsl(220, 15%, 55%)", fontSize: 11 };

  const renderChart = (title: string, data: any[], colorIdx: number) => (
    <Card className="card-cyber border-0 flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="font-display text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-end">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 30%, 14%)" vertical={false} />
              <XAxis dataKey="nome" tick={{ ...tickStyle, fontSize: 10 }} tickFormatter={(val) => val.length > 15 ? val.substring(0, 15) + '...' : val} />
              <YAxis tick={tickStyle} width={30} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="inscritos" fill={COLORS[colorIdx]} radius={[4, 4, 0, 0]}>
                {data.map((_, i) => <Cell key={i} fill={COLORS[(colorIdx + i) % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">Sem dados suficientes</div>
        )}
      </CardContent>
    </Card>
  );

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

      {/* Main Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {renderChart("Inscritos / Olimpíada", olympiadChart, 0)}
        {renderChart("Inscritos / Modalidade", activityChart, 1)}
        {renderChart("Inscritos / Oficina", workshopChart, 4)}
      </div>

      {/* Blog Views */}
      <Card className="card-cyber border-0 mt-6">
        <CardHeader><CardTitle className="font-display text-sm">Visualizações do Blog</CardTitle></CardHeader>
        <CardContent>
          {postViews.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={postViews}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 30%, 14%)" vertical={false} />
                <XAxis dataKey="titulo" tick={{ ...tickStyle, fontSize: 10 }} />
                <YAxis tick={tickStyle} width={40} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="visualizacoes" fill="hsl(175, 70%, 40%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhuma postagem</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardTab;

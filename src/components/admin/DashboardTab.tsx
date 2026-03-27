import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Trophy, BookOpen, Eye, Mic, UserPlus, TrendingUp, Calendar } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, Area, AreaChart,
} from "recharts";

const COLORS = ["hsl(152, 85%, 45%)", "hsl(210, 60%, 50%)", "hsl(175, 70%, 40%)", "hsl(0, 84%, 60%)", "hsl(45, 90%, 50%)", "hsl(280, 60%, 55%)"];

const DashboardTab = () => {
  const [stats, setStats] = useState({ profiles: 0, olympiads: 0, workshops: 0, lectures: 0, views: 0, totalEnrollments: 0 });
  const [olympiadChart, setOlympiadChart] = useState<{ nome: string; inscritos: number }[]>([]);
  const [activityChart, setActivityChart] = useState<{ nome: string; inscritos: number }[]>([]);
  const [workshopChart, setWorkshopChart] = useState<{ nome: string; inscritos: number }[]>([]);
  const [enrollmentsByDay, setEnrollmentsByDay] = useState<{ data: string; inscritos: number }[]>([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [profilesRes, olympiadsRes, workshopsRes, lecturesRes, postsRes, activitiesRes, oEnrollRes, wEnrollRes, lEnrollRes, rolesRes, adminUsersRes] = await Promise.all([
      supabase.from("profiles").select("id, created_at"),
      supabase.from("olympiads").select("*"),
      supabase.from("workshops").select("*"),
      supabase.from("lectures").select("id"),
      supabase.from("posts").select("titulo, visualizacoes"),
      supabase.from("olympiad_activities").select("*"),
      supabase.from("olympiad_enrollments").select("olympiad_id, activity_id, created_at"),
      supabase.from("workshop_enrollments").select("workshop_id, created_at"),
      supabase.from("lecture_enrollments").select("lecture_id, created_at"),
      supabase.from("user_roles").select("user_id").eq("role", "admin"),
      supabase.from("admin_users").select("user_id"),
    ]);

    const adminIds = new Set([
      ...(rolesRes.data || []).map((r: any) => r.user_id),
      ...(adminUsersRes.data || []).map((r: any) => r.user_id)
    ]);
    const participantProfiles = (profilesRes.data || []).filter((p: any) => !adminIds.has(p.id));

    const totalViews = postsRes.data?.reduce((sum, p) => sum + (p.visualizacoes || 0), 0) || 0;
    const totalEnrollments = (oEnrollRes.data?.length || 0) + (wEnrollRes.data?.length || 0) + (lEnrollRes.data?.length || 0);
    
    setStats({
      profiles: participantProfiles.length,
      olympiads: olympiadsRes.data?.length || 0,
      workshops: workshopsRes.data?.length || 0,
      lectures: lecturesRes.data?.length || 0,
      views: totalViews,
      totalEnrollments,
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

    // Build enrollment by day (last 14 days)
    const allEnrollments = [
      ...(oEnrollRes.data || []).map(e => e.created_at),
      ...(wEnrollRes.data || []).map(e => e.created_at),
      ...(lEnrollRes.data || []).map(e => e.created_at),
    ];
    
    const profileDates = participantProfiles.map((p: any) => p.created_at);
    const allDates = [...allEnrollments, ...profileDates];
    
    const dayMap: Record<string, number> = {};
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dayMap[key] = 0;
    }
    
    allDates.forEach(dateStr => {
      if (!dateStr) return;
      const key = new Date(dateStr).toISOString().slice(0, 10);
      if (dayMap[key] !== undefined) dayMap[key]++;
    });
    
    setEnrollmentsByDay(Object.entries(dayMap).map(([data, inscritos]) => ({
      data: new Date(data + "T12:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      inscritos,
    })));
  };

  const statCards = [
    { label: "Participantes", value: stats.profiles, icon: Users, color: "text-primary" },
    { label: "Olimpíadas", value: stats.olympiads, icon: Trophy, color: "text-secondary" },
    { label: "Oficinas", value: stats.workshops, icon: BookOpen, color: "text-accent" },
    { label: "Palestras", value: stats.lectures, icon: Mic, color: "text-purple-400" },
    { label: "Total Inscrições", value: stats.totalEnrollments, icon: UserPlus, color: "text-amber-400" },
    { label: "Visualizações Blog", value: stats.views, icon: Eye, color: "text-cyan-400" },
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
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {statCards.map((stat) => (
          <Card key={stat.label} className="card-cyber border-0">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/10">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="font-display text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enrollments by Day Chart */}
      <Card className="card-cyber border-0">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> Inscrições / Cadastros por Dia (últimos 14 dias)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {enrollmentsByDay.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={enrollmentsByDay}>
                <defs>
                  <linearGradient id="colorInscritos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(152, 85%, 45%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(152, 85%, 45%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 30%, 14%)" vertical={false} />
                <XAxis dataKey="data" tick={{ ...tickStyle, fontSize: 10 }} />
                <YAxis tick={tickStyle} width={30} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="inscritos" stroke="hsl(152, 85%, 45%)" fill="url(#colorInscritos)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">Sem dados suficientes</div>
          )}
        </CardContent>
      </Card>

      {/* Main Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {renderChart("Inscritos / Olimpíada", olympiadChart, 0)}
        {renderChart("Inscritos / Modalidade", activityChart, 1)}
        {renderChart("Inscritos / Oficina", workshopChart, 4)}
      </div>
    </div>
  );
};

export default DashboardTab;

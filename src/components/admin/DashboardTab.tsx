import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Users, Trophy, BookOpen, Eye, Mic, UserPlus, TrendingUp, Calendar, AlertCircle } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, Area, AreaChart,
} from "recharts";

const COLORS = ["hsl(152, 85%, 45%)", "hsl(210, 60%, 50%)", "hsl(175, 70%, 40%)", "hsl(0, 84%, 60%)", "hsl(45, 90%, 50%)", "hsl(280, 60%, 55%)"];

const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

const DashboardTab = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ profiles: 0, olympiads: 0, workshops: 0, lectures: 0, views: 0, totalEnrollments: 0 });
  const [olympiadChart, setOlympiadChart] = useState<{ nome: string; inscritos: number }[]>([]);
  const [activityChart, setActivityChart] = useState<{ nome: string; inscritos: number }[]>([]);
  const [workshopChart, setWorkshopChart] = useState<{ nome: string; inscritos: number }[]>([]);
  const [enrollmentsByDay, setEnrollmentsByDay] = useState<{ data: string; inscritos: number }[]>([]);
  const [attendanceByMonth, setAttendanceByMonth] = useState<{ mes: string; presencas: number }[]>([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setError(null);
    try {
      const results = await Promise.allSettled([
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
        supabase.from("attendance").select("data, presente").eq("presente", true),
      ]);

      const hasErrors = results.some(r => r.status === "rejected");
      if (hasErrors) {
        const errorCount = results.filter(r => r.status === "rejected").length;
        toast({ title: "Erro ao carregar dados", description: `${errorCount} consulta(s) falharam.`, variant: "destructive" });
        setError("Algumas consultas ao banco falharam. Os dados podem estar incompletos.");
      }

      const extractData = (idx: number) =>
        results[idx].status === "fulfilled" ? results[idx].value.data || [] : [];

      const profilesRes = extractData(0) as any[];
      const olympiadsRes = extractData(1) as any[];
      const workshopsRes = extractData(2) as any[];
      const lecturesRes = extractData(3) as any[];
      const postsRes = extractData(4) as any[];
      const activitiesRes = extractData(5) as any[];
      const oEnrollRes = extractData(6) as any[];
      const wEnrollRes = extractData(7) as any[];
      const lEnrollRes = extractData(8) as any[];
      const rolesRes = extractData(9) as any[];
      const adminUsersRes = extractData(10) as any[];
      const attendanceRes = extractData(11) as any[];

      const adminIds = new Set([
        ...rolesRes.map((r: any) => r.user_id),
        ...adminUsersRes.map((r: any) => r.user_id)
      ]);
      const participantProfiles = profilesRes.filter((p: any) => !adminIds.has(p.id));

      const totalViews = postsRes.reduce((sum: number, p: any) => sum + (p.visualizacoes || 0), 0);
      const totalEnrollments = oEnrollRes.length + wEnrollRes.length + lEnrollRes.length;

      setStats({
        profiles: participantProfiles.length,
        olympiads: olympiadsRes.length,
        workshops: workshopsRes.length,
        lectures: lecturesRes.length,
        views: totalViews,
        totalEnrollments,
      });

      const oData = olympiadsRes.map((o: any) => ({
        nome: o.nome,
        inscritos: oEnrollRes.filter((e: any) => e.olympiad_id === o.id).length
      })).sort((a: any, b: any) => b.inscritos - a.inscritos);

      const aData = activitiesRes.map((a: any) => ({
        nome: a.nome,
        inscritos: oEnrollRes.filter((e: any) => e.activity_id === a.id).length
      })).sort((a: any, b: any) => b.inscritos - a.inscritos);

      const wData = workshopsRes.map((w: any) => ({
        nome: w.nome,
        inscritos: wEnrollRes.filter((e: any) => e.workshop_id === w.id).length
      })).sort((a: any, b: any) => b.inscritos - a.inscritos);

      setOlympiadChart(oData);
      setActivityChart(aData);
      setWorkshopChart(wData);

      // Enrollment by day (last 14 days)
      const allEnrollments = [
        ...oEnrollRes.map((e: any) => e.created_at),
        ...wEnrollRes.map((e: any) => e.created_at),
        ...lEnrollRes.map((e: any) => e.created_at),
      ];

      const profileDates = participantProfiles.map((p: any) => p.created_at);
      const allDates = [...allEnrollments, ...profileDates].filter(Boolean);

      const dayMap: Record<string, number> = {};
      const today = new Date();
      for (let i = 13; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        dayMap[d.toISOString().slice(0, 10)] = 0;
      }

      allDates.forEach((dateStr: string) => {
        const key = new Date(dateStr).toISOString().slice(0, 10);
        if (dayMap[key] !== undefined) dayMap[key]++;
      });

      setEnrollmentsByDay(Object.entries(dayMap).map(([data, inscritos]) => ({
        data: new Date(data + "T12:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        inscritos,
      })));

      // Attendance by month (last 12 months)
      const monthMap: Record<string, number> = {};
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        monthMap[key] = 0;
      }

      attendanceRes.forEach((a: any) => {
        if (!a.data) return;
        const key = a.data.slice(0, 7);
        if (monthMap[key] !== undefined) monthMap[key]++;
      });

      setAttendanceByMonth(Object.entries(monthMap).map(([key, presencas]) => ({
        mes: `${MONTHS[parseInt(key.split("-")[1]) - 1]}/${key.split("-")[0].slice(2)}`,
        presencas,
      })));

      setLoading(false);
    } catch (err) {
      console.error("Dashboard load error:", err);
      setError("Erro inesperado ao carregar o dashboard.");
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="card-cyber border-0">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted/20 animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-3 w-20 bg-muted/20 rounded animate-pulse" />
                    <div className="h-6 w-12 bg-muted/20 rounded animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
        {renderContent()}
      </div>
    );
  }

  return renderContent();

  function renderContent() {
    return (
    <div className="space-y-6">
      {/* Error banner if partial errors */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}
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

      {/* Attendance Evolution by Month */}
      <Card className="card-cyber border-0">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" /> Presenças por Mês (últimos 12 meses)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {attendanceByMonth.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={attendanceByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 30%, 14%)" vertical={false} />
                <XAxis dataKey="mes" tick={tickStyle} />
                <YAxis tick={tickStyle} width={30} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="presencas" stroke="hsl(152, 85%, 45%)" strokeWidth={2} dot={{ fill: "hsl(152, 85%, 45%)", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">Sem dados de presença</div>
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
  }

};

export default DashboardTab;

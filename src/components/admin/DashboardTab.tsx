import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Trophy, BookOpen, Eye } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";

const COLORS = ["hsl(152, 85%, 45%)", "hsl(210, 60%, 50%)", "hsl(175, 70%, 40%)", "hsl(0, 84%, 60%)", "hsl(45, 90%, 50%)"];

const DashboardTab = () => {
  const [stats, setStats] = useState({ profiles: 0, olympiads: 0, workshops: 0, views: 0 });
  const [enrollmentsByOlympiad, setEnrollmentsByOlympiad] = useState<{ name: string; inscritos: number }[]>([]);
  const [enrollmentsByWorkshop, setEnrollmentsByWorkshop] = useState<{ name: string; inscritos: number }[]>([]);
  const [comparison, setComparison] = useState<{ name: string; value: number }[]>([]);
  const [postViews, setPostViews] = useState<{ titulo: string; visualizacoes: number }[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [profilesRes, olympiadsRes, workshopsRes, postsRes] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("olympiads").select("*"),
      supabase.from("workshops").select("*, workshop_enrollments(id)"),
      supabase.from("posts").select("titulo, visualizacoes"),
    ]);

    const totalViews = postsRes.data?.reduce((sum, p) => sum + (p.visualizacoes || 0), 0) || 0;
    setStats({
      profiles: profilesRes.count || 0,
      olympiads: olympiadsRes.data?.length || 0,
      workshops: workshopsRes.data?.length || 0,
      views: totalViews,
    });

    // Enrollments by olympiad (via workshop_enrollments -> workshops -> olympiad)
    if (olympiadsRes.data && workshopsRes.data) {
      const byOlympiad: Record<string, number> = {};
      for (const o of olympiadsRes.data) {
        const wsForOlympiad = workshopsRes.data.filter((w) => w.olympiad_id === o.id);
        const count = wsForOlympiad.reduce((sum, w) => sum + (w.workshop_enrollments?.length || 0), 0);
        byOlympiad[o.nome] = count;
      }
      setEnrollmentsByOlympiad(Object.entries(byOlympiad).map(([name, inscritos]) => ({ name, inscritos })));
    }

    // Enrollments by workshop
    if (workshopsRes.data) {
      setEnrollmentsByWorkshop(
        workshopsRes.data.map((w) => ({
          name: w.nome,
          inscritos: w.workshop_enrollments?.length || 0,
        }))
      );
    }

    // Comparison pie
    setComparison([
      { name: "Inscritos", value: profilesRes.count || 0 },
      { name: "Oficinas", value: workshopsRes.data?.length || 0 },
    ]);

    // Post views
    if (postsRes.data) {
      setPostViews(postsRes.data.map((p) => ({ titulo: p.titulo, visualizacoes: p.visualizacoes || 0 })));
    }
  };

  const statCards = [
    { label: "Participantes", value: stats.profiles, icon: Users, color: "text-primary" },
    { label: "Olimpíadas", value: stats.olympiads, icon: Trophy, color: "text-secondary" },
    { label: "Oficinas", value: stats.workshops, icon: BookOpen, color: "text-accent" },
    { label: "Visualizações Blog", value: stats.views, icon: Eye, color: "text-primary" },
  ];

  return (
    <div className="space-y-6">
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Inscritos por Olimpíada */}
        <Card className="card-cyber border-0">
          <CardHeader><CardTitle className="font-display text-sm">Inscritos por Olimpíada</CardTitle></CardHeader>
          <CardContent>
            {enrollmentsByOlympiad.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={enrollmentsByOlympiad}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 30%, 14%)" />
                  <XAxis dataKey="name" tick={{ fill: "hsl(220, 15%, 55%)", fontSize: 11 }} />
                  <YAxis tick={{ fill: "hsl(220, 15%, 55%)" }} />
                  <Tooltip contentStyle={{ background: "hsl(220, 35%, 8%)", border: "1px solid hsl(152, 85%, 45%, 0.3)", borderRadius: 8 }} />
                  <Bar dataKey="inscritos" fill="hsl(152, 85%, 45%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum dado disponível</p>
            )}
          </CardContent>
        </Card>

        {/* Inscritos por Oficina */}
        <Card className="card-cyber border-0">
          <CardHeader><CardTitle className="font-display text-sm">Inscritos por Oficina</CardTitle></CardHeader>
          <CardContent>
            {enrollmentsByWorkshop.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={enrollmentsByWorkshop}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 30%, 14%)" />
                  <XAxis dataKey="name" tick={{ fill: "hsl(220, 15%, 55%)", fontSize: 11 }} />
                  <YAxis tick={{ fill: "hsl(220, 15%, 55%)" }} />
                  <Tooltip contentStyle={{ background: "hsl(220, 35%, 8%)", border: "1px solid hsl(210, 60%, 50%, 0.3)", borderRadius: 8 }} />
                  <Bar dataKey="inscritos" fill="hsl(210, 60%, 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum dado disponível</p>
            )}
          </CardContent>
        </Card>

        {/* Comparativo */}
        <Card className="card-cyber border-0">
          <CardHeader><CardTitle className="font-display text-sm">Comparativo Inscritos vs Oficinas</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={comparison} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {comparison.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(220, 35%, 8%)", border: "1px solid hsl(152, 85%, 45%, 0.3)", borderRadius: 8 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Visualizações Blog */}
        <Card className="card-cyber border-0">
          <CardHeader><CardTitle className="font-display text-sm">Visualizações do Blog</CardTitle></CardHeader>
          <CardContent>
            {postViews.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={postViews}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 30%, 14%)" />
                  <XAxis dataKey="titulo" tick={{ fill: "hsl(220, 15%, 55%)", fontSize: 10 }} />
                  <YAxis tick={{ fill: "hsl(220, 15%, 55%)" }} />
                  <Tooltip contentStyle={{ background: "hsl(220, 35%, 8%)", border: "1px solid hsl(175, 70%, 40%, 0.3)", borderRadius: 8 }} />
                  <Bar dataKey="visualizacoes" fill="hsl(175, 70%, 40%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhuma postagem ainda</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardTab;

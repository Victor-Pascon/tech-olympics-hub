import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Medal, Save, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MEDAL_COLORS: Record<number, string> = {
  1: "text-yellow-400",
  2: "text-gray-300",
  3: "text-amber-600",
};

const RankingTab = () => {
  const { toast } = useToast();
  const [olympiads, setOlympiads] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [selectedOlympiad, setSelectedOlympiad] = useState<string>("");
  const [selectedActivity, setSelectedActivity] = useState<string>("");
  const [participants, setParticipants] = useState<any[]>([]);
  const [scores, setScores] = useState<Record<string, { pontuacao: number; observacoes: string }>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadOlympiads(); }, []);

  const loadOlympiads = async () => {
    const { data } = await supabase.from("olympiads").select("id, nome").order("created_at", { ascending: false });
    setOlympiads(data || []);
  };

  const onOlympiadChange = async (olympiadId: string) => {
    setSelectedOlympiad(olympiadId);
    setSelectedActivity("");
    setParticipants([]);
    setScores({});
    const { data } = await supabase.from("olympiad_activities").select("id, nome").eq("olympiad_id", olympiadId);
    setActivities(data || []);
  };

  const loadParticipants = async (activityId: string) => {
    setSelectedActivity(activityId);
    if (!selectedOlympiad || !activityId) return;

    // Get enrollments for this activity
    const { data: enrollments } = await supabase
      .from("olympiad_enrollments")
      .select("user_id")
      .eq("olympiad_id", selectedOlympiad)
      .eq("activity_id", activityId);

    if (!enrollments?.length) {
      setParticipants([]);
      setScores({});
      return;
    }

    const userIds = [...new Set(enrollments.map(e => e.user_id))];
    const { data: profiles } = await supabase.from("profiles").select("id, nome, email").in("id", userIds);

    // Get existing scores
    const { data: existingScores } = await supabase
      .from("olympiad_scores")
      .select("*")
      .eq("olympiad_id", selectedOlympiad)
      .eq("activity_id", activityId);

    const scoreMap: Record<string, { pontuacao: number; observacoes: string }> = {};
    (existingScores || []).forEach((s: any) => {
      scoreMap[s.user_id] = { pontuacao: s.pontuacao || 0, observacoes: s.observacoes || "" };
    });

    setScores(scoreMap);
    setParticipants(
      (profiles || []).sort((a: any, b: any) => {
        const sa = scoreMap[a.id]?.pontuacao || 0;
        const sb = scoreMap[b.id]?.pontuacao || 0;
        return sb - sa;
      })
    );
  };

  const updateScore = (userId: string, field: "pontuacao" | "observacoes", value: string | number) => {
    setScores(prev => ({
      ...prev,
      [userId]: {
        pontuacao: prev[userId]?.pontuacao || 0,
        observacoes: prev[userId]?.observacoes || "",
        [field]: field === "pontuacao" ? parseFloat(String(value)) || 0 : value,
      },
    }));
  };

  const saveScores = async () => {
    if (!selectedOlympiad || !selectedActivity) return;
    setSaving(true);

    // Delete existing scores for this olympiad+activity
    await supabase.from("olympiad_scores").delete()
      .eq("olympiad_id", selectedOlympiad)
      .eq("activity_id", selectedActivity);

    // Sort by score descending to assign placement
    const sortedEntries = Object.entries(scores)
      .filter(([_, s]) => s.pontuacao > 0)
      .sort((a, b) => b[1].pontuacao - a[1].pontuacao);

    if (sortedEntries.length > 0) {
      const records = sortedEntries.map(([userId, s], index) => ({
        olympiad_id: selectedOlympiad,
        activity_id: selectedActivity,
        user_id: userId,
        pontuacao: s.pontuacao,
        colocacao: index + 1,
        observacoes: s.observacoes,
      }));

      const { error } = await supabase.from("olympiad_scores").insert(records);
      if (error) {
        toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
        setSaving(false);
        return;
      }
    }

    toast({ title: "Ranking salvo com sucesso!" });
    setSaving(false);
    loadParticipants(selectedActivity);
  };

  // Re-sort participants when scores change
  const sortedParticipants = [...participants].sort((a, b) => {
    const sa = scores[a.id]?.pontuacao || 0;
    const sb = scores[b.id]?.pontuacao || 0;
    return sb - sa;
  });

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="font-display text-lg font-semibold flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-400" /> Ranking das Olimpíadas
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Selecione a olimpíada e a modalidade para lançar pontuações</p>
      </div>

      {/* Filters */}
      <div className="grid gap-4 sm:grid-cols-2 max-w-2xl">
        <div className="space-y-1">
          <Label>Olimpíada</Label>
          <Select value={selectedOlympiad} onValueChange={onOlympiadChange}>
            <SelectTrigger><SelectValue placeholder="Selecione a olimpíada" /></SelectTrigger>
            <SelectContent>
              {olympiads.map(o => <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Modalidade / Subcategoria</Label>
          <Select value={selectedActivity} onValueChange={loadParticipants} disabled={!selectedOlympiad}>
            <SelectTrigger><SelectValue placeholder="Selecione a modalidade" /></SelectTrigger>
            <SelectContent>
              {activities.map(a => <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Score Table */}
      {selectedActivity && (
        <Card className="card-cyber border-0 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-display text-sm">
              Pontuações – {activities.find(a => a.id === selectedActivity)?.nome}
            </CardTitle>
            <Button size="sm" onClick={saveScores} disabled={saving}>
              <Save className="mr-1 h-4 w-4" />{saving ? "Salvando..." : "Salvar Ranking"}
            </Button>
          </CardHeader>
          <CardContent>
            {sortedParticipants.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-primary/10">
                    <TableHead className="w-16">#</TableHead>
                    <TableHead>Participante</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead className="w-32">Pontuação</TableHead>
                    <TableHead className="w-48">Observações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedParticipants.map((p, i) => {
                    const rank = i + 1;
                    const score = scores[p.id]?.pontuacao || 0;
                    return (
                      <TableRow key={p.id} className="border-primary/5">
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {score > 0 && rank <= 3 ? (
                              <Crown className={`h-5 w-5 ${MEDAL_COLORS[rank]}`} />
                            ) : (
                              <span className="text-muted-foreground font-mono">{score > 0 ? rank : "—"}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{p.nome}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{p.email}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={scores[p.id]?.pontuacao || ""}
                            onChange={e => updateScore(p.id, "pontuacao", e.target.value)}
                            className="h-8 text-sm"
                            placeholder="0.00"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={scores[p.id]?.observacoes || ""}
                            onChange={e => updateScore(p.id, "observacoes", e.target.value)}
                            className="h-8 text-sm"
                            placeholder="Obs..."
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Trophy className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Nenhum participante inscrito nesta modalidade.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Ranking Preview */}
      {selectedActivity && sortedParticipants.filter(p => (scores[p.id]?.pontuacao || 0) > 0).length > 0 && (
        <Card className="card-cyber border-0">
          <CardHeader>
            <CardTitle className="font-display text-sm flex items-center gap-2">
              <Medal className="h-4 w-4 text-yellow-400" /> Classificação Final
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
              {sortedParticipants
                .filter(p => (scores[p.id]?.pontuacao || 0) > 0)
                .map((p, i) => {
                  const rank = i + 1;
                  const bgColors: Record<number, string> = {
                    1: "bg-yellow-500/10 border-yellow-500/40",
                    2: "bg-gray-400/10 border-gray-400/40",
                    3: "bg-amber-600/10 border-amber-600/40",
                  };
                  const bg = bgColors[rank] || "bg-muted/10 border-border";
                  return (
                    <div key={p.id} className={`rounded-lg border p-3 text-center ${bg}`}>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        {rank <= 3 && <Crown className={`h-5 w-5 ${MEDAL_COLORS[rank]}`} />}
                        <span className="font-display text-lg font-bold">{rank}º</span>
                      </div>
                      <p className="font-medium text-sm truncate">{p.nome}</p>
                      <p className="text-xs text-muted-foreground mt-1">{scores[p.id]?.pontuacao || 0} pts</p>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RankingTab;

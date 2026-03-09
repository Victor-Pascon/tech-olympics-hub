import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, Users, UserCheck, UserX } from "lucide-react";

type Olympiad = { id: string; nome: string };
type Workshop = { id: string; nome: string; olympiad_id: string };

const ReportsTab = () => {
  const [olympiads, setOlympiads] = useState<Olympiad[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [selectedOlympiad, setSelectedOlympiad] = useState("all");
  const [selectedWorkshop, setSelectedWorkshop] = useState("all");
  const [participants, setParticipants] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({ total: 0, present: 0, absent: 0 });

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    loadReport();
  }, [selectedOlympiad, selectedWorkshop]);

  const loadFilters = async () => {
    const [olRes, wsRes] = await Promise.all([
      supabase.from("olympiads").select("id, nome"),
      supabase.from("workshops").select("id, nome, olympiad_id"),
    ]);
    if (olRes.data) setOlympiads(olRes.data);
    if (wsRes.data) setWorkshops(wsRes.data);
  };

  const loadReport = async () => {
    // Get relevant workshop IDs
    let workshopIds: string[] = [];
    if (selectedWorkshop !== "all") {
      workshopIds = [selectedWorkshop];
    } else if (selectedOlympiad !== "all") {
      workshopIds = workshops.filter(w => w.olympiad_id === selectedOlympiad).map(w => w.id);
    } else {
      workshopIds = workshops.map(w => w.id);
    }

    if (workshopIds.length === 0) {
      setParticipants([]);
      setMetrics({ total: 0, present: 0, absent: 0 });
      return;
    }

    const { data: enrollments } = await supabase
      .from("workshop_enrollments")
      .select("user_id, workshop_id")
      .in("workshop_id", workshopIds);

    if (!enrollments?.length) {
      setParticipants([]);
      setMetrics({ total: 0, present: 0, absent: 0 });
      return;
    }

    const userIds = [...new Set(enrollments.map(e => e.user_id))];
    const { data: profiles } = await supabase.from("profiles").select("id, nome, email, cpf").in("id", userIds);

    // Get attendance for selected olympiad
    let attendanceData: any[] = [];
    if (selectedOlympiad !== "all") {
      const { data } = await supabase.from("attendance").select("*").eq("olympiad_id", selectedOlympiad).in("user_id", userIds);
      attendanceData = data || [];
    }

    const list = (profiles || []).map(p => {
      const ws = enrollments.find(e => e.user_id === p.id);
      const workshopName = workshops.find(w => w.id === ws?.workshop_id)?.nome || "—";
      const att = attendanceData.find(a => a.user_id === p.id);
      return { ...p, workshop: workshopName, presente: att?.presente || false };
    });

    setParticipants(list);
    const present = list.filter(p => p.presente).length;
    setMetrics({ total: list.length, present, absent: list.length - present });
  };

  const filteredWorkshops = selectedOlympiad === "all" ? workshops : workshops.filter(w => w.olympiad_id === selectedOlympiad);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Relatório</title>
      <style>body{font-family:Arial;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #333;padding:8px;text-align:left}th{background:#eee}.metrics{display:flex;gap:30px;margin-bottom:20px}</style>
      </head><body>
      <h2>Relatório de Participantes</h2>
      <div class="metrics"><p><strong>Total:</strong> ${metrics.total}</p><p><strong>Presentes:</strong> ${metrics.present}</p><p><strong>Ausentes:</strong> ${metrics.absent}</p><p><strong>Taxa:</strong> ${metrics.total > 0 ? ((metrics.present / metrics.total) * 100).toFixed(1) : 0}%</p></div>
      <table><tr><th>#</th><th>Nome</th><th>E-mail</th><th>CPF</th><th>Oficina</th><th>Presença</th></tr>
      ${participants.map((p, i) => `<tr><td>${i + 1}</td><td>${p.nome}</td><td>${p.email}</td><td>${p.cpf || "—"}</td><td>${p.workshop}</td><td>${p.presente ? "Presente" : "Ausente"}</td></tr>`).join("")}
      </table></body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      <Card className="card-cyber border-0">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label>Olimpíada</Label>
              <Select value={selectedOlympiad} onValueChange={v => { setSelectedOlympiad(v); setSelectedWorkshop("all"); }}>
                <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {olympiads.map(o => <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Oficina</Label>
              <Select value={selectedWorkshop} onValueChange={setSelectedWorkshop}>
                <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {filteredWorkshops.map(w => <SelectItem key={w.id} value={w.id}>{w.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" className="border-primary/30 text-primary" onClick={handlePrint}>
              <Printer className="mr-1 h-4 w-4" />Exportar / Imprimir
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Total Inscritos", value: metrics.total, icon: Users, color: "text-primary" },
          { label: "Presentes", value: metrics.present, icon: UserCheck, color: "text-accent" },
          { label: "Ausentes", value: metrics.absent, icon: UserX, color: "text-destructive" },
        ].map(m => (
          <Card key={m.label} className="card-cyber border-0">
            <CardContent className="pt-6 flex items-center gap-3">
              <m.icon className={`h-5 w-5 ${m.color}`} />
              <div>
                <p className="text-sm text-muted-foreground">{m.label}</p>
                <p className="font-display text-xl font-bold">{m.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="card-cyber border-0 overflow-hidden">
        <CardHeader>
          <CardTitle className="font-display text-base">Lista de Participantes</CardTitle>
          <CardDescription>
            {participants.length} participantes — Taxa de comparecimento: {metrics.total > 0 ? ((metrics.present / metrics.total) * 100).toFixed(1) : 0}%
          </CardDescription>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow className="border-primary/10">
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Oficina</TableHead>
              <TableHead>Presença</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.map((p, i) => (
              <TableRow key={i} className="border-primary/5">
                <TableCell className="font-medium">{p.nome}</TableCell>
                <TableCell className="text-sm">{p.email}</TableCell>
                <TableCell className="text-sm">{p.cpf || "—"}</TableCell>
                <TableCell><Badge variant="secondary">{p.workshop}</Badge></TableCell>
                <TableCell>
                  <Badge className={p.presente ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}>
                    {p.presente ? "Presente" : "Ausente"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {participants.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhum participante encontrado</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default ReportsTab;

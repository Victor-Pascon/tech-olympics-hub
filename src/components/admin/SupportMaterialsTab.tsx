import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Upload, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

type SupportMaterial = {
  id: string;
  titulo: string;
  descricao: string | null;
  arquivo_url: string;
  created_at: string;
  olympiad_id: string | null;
  activity_id: string | null;
  workshop_id: string | null;
  // joined fields
  olympiads?: { nome: string };
  olympiad_activities?: { nome: string };
  workshops?: { nome: string };
};

const SupportMaterialsTab = () => {
  const { toast } = useToast();
  const [materials, setMaterials] = useState<SupportMaterial[]>([]);
  const [olympiads, setOlympiads] = useState<{ id: string; nome: string }[]>([]);
  const [activities, setActivities] = useState<{ id: string; nome: string; olympiad_id: string }[]>([]);
  const [workshops, setWorkshops] = useState<{ id: string; nome: string }[]>([]);

  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    titulo: "",
    descricao: "",
    olympiad_id: "none",
    activity_id: "none",
    workshop_id: "none",
    arquivo_url: "",
  });

  useEffect(() => { load(); }, []);

  const load = async () => {
    const [matRes, olRes, actRes, wsRes] = await Promise.all([
      supabase.from("support_materials").select(`
        *,
        olympiads(nome),
        olympiad_activities(nome),
        workshops(nome)
      `).order("created_at", { ascending: false }),
      supabase.from("olympiads").select("id, nome").order("nome"),
      supabase.from("olympiad_activities").select("id, nome, olympiad_id").order("nome"),
      supabase.from("workshops").select("id, nome").order("nome")
    ]);
    
    if (matRes.data) setMaterials(matRes.data as any);
    if (olRes.data) setOlympiads(olRes.data);
    if (actRes.data) setActivities(actRes.data);
    if (wsRes.data) setWorkshops(wsRes.data);
  };

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast({ title: "Arquivo excede 5MB", variant: "destructive" }); return; }
    setUploading(true);
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-]/g, '_');
    const path = `materials/${Date.now()}_${sanitizedName}`;
    const { error } = await supabase.storage.from("uploads").upload(path, file);
    if (error) { toast({ title: "Erro no upload", description: error.message, variant: "destructive" }); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("uploads").getPublicUrl(path);
    setForm({ ...form, arquivo_url: urlData.publicUrl, titulo: form.titulo || file.name.split('.')[0] });
    setUploading(false);
    toast({ title: "Arquivo carregado" });
  };

  const save = async () => {
    if (!form.titulo || !form.arquivo_url) {
      toast({ title: "Título e Arquivo são obrigatórios", variant: "destructive" }); return;
    }
    const payload = {
      titulo: form.titulo,
      descricao: form.descricao || null,
      arquivo_url: form.arquivo_url,
      olympiad_id: form.olympiad_id !== "none" ? form.olympiad_id : null,
      activity_id: form.activity_id !== "none" ? form.activity_id : null,
      workshop_id: form.workshop_id !== "none" ? form.workshop_id : null,
    };
    await supabase.from("support_materials").insert(payload);
    toast({ title: "Material disponibilizado!" });
    setOpen(false); load();
  };

  const remove = async (id: string) => {
    await supabase.from("support_materials").delete().eq("id", id);
    toast({ title: "Material removido" }); load();
  };

  const F = (k: string, v: string) => setForm({ ...form, [k]: v });

  const filteredActivities = activities.filter(a => form.olympiad_id !== "none" ? a.olympiad_id === form.olympiad_id : true);

  const groupedMaterials = materials.reduce((acc, m) => {
    let group = "Materiais Gerais (Todas as Olimpíadas)";
    if (m.workshop_id) group = `Oficina: ${m.workshops?.nome}`;
    else if (m.activity_id) group = `Modalidade: ${m.olympiad_activities?.nome}`;
    else if (m.olympiad_id) group = `Olimpíada: ${m.olympiads?.nome} (Geral)`;
    
    if (!acc[group]) acc[group] = [];
    acc[group].push(m);
    return acc;
  }, {} as Record<string, SupportMaterial[]>);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Materiais de Apoio</h2>
        <Button size="sm" onClick={() => {
          setForm({ titulo: "", descricao: "", olympiad_id: "none", activity_id: "none", workshop_id: "none", arquivo_url: "" });
          setOpen(true);
        }}>
          <Plus className="mr-1 h-4 w-4" />Novo Material
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle className="font-display">Novo Material de Apoio</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-1"><Label>Título *</Label><Input value={form.titulo} onChange={e => F("titulo", e.target.value)} /></div>
            <div className="space-y-1"><Label>Descrição</Label><Textarea value={form.descricao} onChange={e => F("descricao", e.target.value)} /></div>

            {/* Target Selection */}
            <div className="border-t border-border pt-3 space-y-3">
              <Label className="font-display text-sm">Vincular a (Opcional - deixe vazio para Geral)</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Olimpíada</Label>
                  <Select value={form.olympiad_id} onValueChange={(v) => { F("olympiad_id", v); F("activity_id", "none"); }}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Geral (Todas as Olimpíadas)</SelectItem>
                      {olympiads.map(o => <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {form.olympiad_id !== "none" && (
                  <div className="space-y-1">
                    <Label>Subcategoria (Modalidade)</Label>
                    <Select value={form.activity_id} onValueChange={v => F("activity_id", v)}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Todas as modalidades da Olimpíada</SelectItem>
                        {filteredActivities.map(a => <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-1">
                  <Label>Oficina</Label>
                  <Select value={form.workshop_id} onValueChange={v => F("workshop_id", v)}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma</SelectItem>
                      {workshops.map(w => <SelectItem key={w.id} value={w.id}>{w.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-3">
              <Label className="text-sm">Arquivo (PDF, Imagens, Documentos — máx 5MB) *</Label>
              <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-primary/30 py-6 text-sm hover:border-primary/60 hover:bg-muted/10 transition-colors">
                {uploading ? "Enviando..." : (
                  <>
                    <Upload className="h-5 w-5 text-primary" />
                    {form.arquivo_url ? "Arquivo Anexado!" : "Clique para anexar arquivo"}
                  </>
                )}
                <input type="file" className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip" onChange={uploadFile} disabled={uploading} />
              </label>
            </div>
            
            <Button onClick={save} disabled={uploading || !form.arquivo_url || !form.titulo}>Salvar Material</Button>
          </div>
        </DialogContent>
      </Dialog>

      {Object.entries(groupedMaterials).length === 0 ? (
        <Card className="card-cyber border-0 overflow-hidden">
          <div className="text-center text-muted-foreground py-12">Nenhum material de apoio cadastrado</div>
        </Card>
      ) : (
        Object.entries(groupedMaterials).map(([group, mats]) => (
          <Card key={group} className="card-cyber border-0 overflow-hidden mb-6">
            <div className="bg-primary/10 px-4 py-3 border-b border-primary/20">
              <h3 className="font-display font-medium text-primary flex items-center gap-2">
                <FileText className="h-4 w-4" /> {group}
              </h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-primary/10">
                  <TableHead>Material</TableHead>
                  <TableHead>Arquivo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mats.map((m) => (
                  <TableRow key={m.id} className="border-primary/5">
                    <TableCell>
                      <p className="font-medium text-sm">{m.titulo}</p>
                      {m.descricao && <p className="text-xs text-muted-foreground">{m.descricao}</p>}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={m.arquivo_url} target="_blank" rel="noreferrer"><FileText className="mr-1 h-3 w-3" />Ver</a>
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => remove(m.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ))
      )}
    </div>
  );
};

export default SupportMaterialsTab;

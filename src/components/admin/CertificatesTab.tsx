import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Award, FileImage, ShieldCheck } from "lucide-react";

type Template = {
  id: string; tipo: string; texto_padrao: string | null; cor_primaria: string | null; logo_url: string | null;
};

const CertificatesTab = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [olympiads, setOlympiads] = useState<any[]>([]);
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [lectures, setLectures] = useState<any[]>([]);

  const [form, setForm] = useState({ tipo: "", texto_padrao: "", cor_primaria: "#00ffcc", logo_url: "" });
  const [uploading, setUploading] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const [tRes, oRes, wRes, lRes] = await Promise.all([
      supabase.from("certificate_templates").select("*").order("created_at"),
      supabase.from("olympiads").select("id, nome, certificates_released, total_horas"),
      supabase.from("workshops").select("id, nome, certificates_released, total_horas, olympiad_id"),
      supabase.from("lectures").select("id, nome, certificates_released, carga_horaria"),
    ]);
    if (tRes.data) setTemplates(tRes.data as any);
    if (oRes.data) setOlympiads(oRes.data);
    if (wRes.data) setWorkshops(wRes.data);
    if (lRes.data) setLectures(lRes.data);
  };

  const uploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-]/g, '_');
    const path = `logos/${Date.now()}_${sanitizedName}`;
    const { error } = await supabase.storage.from("uploads").upload(path, file);
    if (error) { toast({ title: "Erro no upload", description: error.message, variant: "destructive" }); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("uploads").getPublicUrl(path);
    setForm({ ...form, logo_url: urlData.publicUrl });
    setUploading(false);
    toast({ title: "Logo carregada" });
  };

  const saveTemplate = async () => {
    if (!form.tipo) { toast({ title: "O Nome/Tipo do modelo é obrigatório", variant: "destructive" }); return; }
    await supabase.from("certificate_templates").insert(form);
    toast({ title: "Template salvo!" });
    setForm({ tipo: "", texto_padrao: "", cor_primaria: "#00ffcc", logo_url: "" });
    load();
  };

  const deleteTemplate = async (id: string) => {
    await supabase.from("certificate_templates").delete().eq("id", id);
    toast({ title: "Template removido" }); load();
  };

  const toggleRelease = async (table: "olympiads" | "workshops", id: string, current: boolean) => {
    await supabase.from(table).update({ certificates_released: !current }).eq("id", id);
    toast({ title: !current ? "Certificados Liberados!" : "Certificados Bloqueados!" });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Módulo de Certificados</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Templates setup */}
        <Card className="card-cyber border-0">
          <CardHeader>
            <CardTitle className="font-display text-sm flex items-center gap-2"><Award className="h-4 w-4" /> Novo Modelo de Certificado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1"><Label>Nome do Modelo (Ex: Padrão, Ouro, Robótica)</Label><Input value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} /></div>
            <div className="space-y-1">
              <Label>Texto Base do Certificado</Label>
              <p className="text-xs text-muted-foreground mb-1">Use [NOME_ALUNO], [NOME_CURSO], [NOME_MODALIDADE], [HORAS] para variáveis automáticas.</p>
              <Textarea rows={4} value={form.texto_padrao} onChange={e => setForm({ ...form, texto_padrao: e.target.value })} placeholder="Certificamos que [NOME_ALUNO] participou ativamente no evento [NOME_CURSO] na modalidade [NOME_MODALIDADE] totalizando [HORAS] horas de carga horária." />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1"><Label>Cor Primária</Label><Input type="color" className="h-10" value={form.cor_primaria} onChange={e => setForm({ ...form, cor_primaria: e.target.value })} /></div>
              <div className="space-y-1">
                <Label>Logomarca (opcional)</Label>
                <label className="mt-1 flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-primary/30 h-10 text-sm hover:border-primary/60 transition-colors">
                  <FileImage className="h-4 w-4" /> {uploading ? "..." : form.logo_url ? "Trocada" : "Fazer Upload"}
                  <input type="file" className="hidden" accept="image/*" onChange={uploadLogo} disabled={uploading} />
                </label>
              </div>
            </div>
            <Button className="w-full" onClick={saveTemplate}><Plus className="mr-2 h-4 w-4" /> Criar Template</Button>

            <div className="mt-6 pt-4 border-t border-border">
              <Label className="text-xs font-semibold mb-2 block">Modelos Existentes:</Label>
              <div className="space-y-2">
                {templates.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-2 rounded bg-muted/20 text-sm border-l-4" style={{ borderColor: t.cor_primaria || "#000" }}>
                    <span>{t.tipo}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteTemplate(t.id)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                ))}
                {templates.length === 0 && <p className="text-xs text-muted-foreground">Nenhum modelo cadastrado</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Release panel */}
        <div className="space-y-6">
          <Card className="card-cyber border-0">
            <CardHeader>
              <CardTitle className="font-display text-sm flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Liberação - Olimpíadas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Olimpíada</TableHead><TableHead className="w-24">CH (Geral)</TableHead><TableHead className="text-right">Liberado?</TableHead></TableRow></TableHeader>
                <TableBody>
                  {olympiads.map(o => (
                    <TableRow key={o.id}>
                      <TableCell className="text-sm font-medium">{o.nome}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{o.total_horas || 0}h</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant={o.certificates_released ? "default" : "outline"} onClick={() => toggleRelease("olympiads", o.id, !!o.certificates_released)}>
                          {o.certificates_released ? "Sim" : "Não"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="card-cyber border-0">
            <CardHeader>
              <CardTitle className="font-display text-sm flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-secondary" /> Liberação - Oficinas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Oficina</TableHead><TableHead className="w-24">CH</TableHead><TableHead className="text-right">Liberado?</TableHead></TableRow></TableHeader>
                <TableBody>
                  {workshops.map(w => (
                    <TableRow key={w.id}>
                      <TableCell className="text-sm font-medium">{w.nome}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{w.total_horas || 0}h</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant={w.certificates_released ? "default" : "outline"} onClick={() => toggleRelease("workshops", w.id, !!w.certificates_released)}>
                          {w.certificates_released ? "Sim" : "Não"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="card-cyber border-0">
            <CardHeader>
              <CardTitle className="font-display text-sm flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-purple-400" /> Liberação - Palestras</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Palestra</TableHead><TableHead className="w-24">CH</TableHead><TableHead className="text-right">Liberado?</TableHead></TableRow></TableHeader>
                <TableBody>
                  {lectures.map(l => (
                    <TableRow key={l.id}>
                      <TableCell className="text-sm font-medium">{l.nome}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{l.carga_horaria || 0}h</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant={l.certificates_released ? "default" : "outline"} onClick={() => toggleRelease("lectures" as any, l.id, !!l.certificates_released)}>
                          {l.certificates_released ? "Sim" : "Não"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CertificatesTab;

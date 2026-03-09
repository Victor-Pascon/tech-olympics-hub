import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Post = {
  id: string; titulo: string; conteudo: string | null; imagem_url: string | null;
  categoria: string | null; tags: string | null; publicado: boolean | null;
  visualizacoes: number | null; autor_id: string | null; created_at: string;
};

const emptyForm = { titulo: "", conteudo: "", imagem_url: "", categoria: "", tags: "" };

const PostsTab = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
    if (data) setPosts(data);
  };

  const openNew = () => { setForm(emptyForm); setEditing(null); setOpen(true); };

  const openEdit = (p: Post) => {
    setForm({
      titulo: p.titulo, conteudo: p.conteudo || "", imagem_url: p.imagem_url || "",
      categoria: p.categoria || "", tags: p.tags || "",
    });
    setEditing(p.id);
    setOpen(true);
  };

  const save = async (publish: boolean) => {
    if (!form.titulo) { toast({ title: "Título é obrigatório", variant: "destructive" }); return; }
    const payload = { ...form, publicado: publish, autor_id: user?.id || null, updated_at: new Date().toISOString() };
    if (editing) {
      await supabase.from("posts").update(payload).eq("id", editing);
    } else {
      await supabase.from("posts").insert(payload);
    }
    toast({ title: publish ? "Postagem publicada" : "Rascunho salvo" });
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("posts").delete().eq("id", id);
    toast({ title: "Postagem removida" });
    load();
  };

  const togglePublish = async (id: string, current: boolean) => {
    await supabase.from("posts").update({ publicado: !current }).eq("id", id);
    toast({ title: current ? "Postagem despublicada" : "Postagem publicada" });
    load();
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Postagens do Blog</h2>
        <Button size="sm" onClick={openNew}><Plus className="mr-1 h-4 w-4" />Nova Postagem</Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display">{editing ? "Editar Postagem" : "Nova Postagem"}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-1"><Label>Título *</Label><Input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} /></div>
            <div className="space-y-1"><Label>Conteúdo</Label><Textarea value={form.conteudo} onChange={e => setForm({ ...form, conteudo: e.target.value })} className="min-h-[150px]" /></div>
            <div className="space-y-1"><Label>URL da Imagem</Label><Input value={form.imagem_url} onChange={e => setForm({ ...form, imagem_url: e.target.value })} /></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1"><Label>Categoria</Label><Input value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} placeholder="Ex: Novidades" /></div>
              <div className="space-y-1"><Label>Tags (vírgula)</Label><Input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="Oficina, Novidade" /></div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => save(true)} className="font-display">Publicar</Button>
              <Button variant="outline" onClick={() => save(false)}>Salvar Rascunho</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="card-cyber border-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-primary/10">
              <TableHead>Título</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Visualizações</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((p) => (
              <TableRow key={p.id} className="border-primary/5">
                <TableCell className="font-medium">{p.titulo}</TableCell>
                <TableCell>{p.categoria || "—"}</TableCell>
                <TableCell>{p.visualizacoes || 0}</TableCell>
                <TableCell>
                  <Badge className={p.publicado ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}>
                    {p.publicado ? "Publicado" : "Rascunho"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{new Date(p.created_at).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => togglePublish(p.id, !!p.publicado)}>
                    {p.publicado ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {posts.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhuma postagem</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default PostsTab;

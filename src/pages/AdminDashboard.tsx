import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LayoutDashboard, Trophy, BookOpen, FileText, BarChart3,
  Plus, Edit, Trash2, Users, CheckCircle, Download, Printer
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockOlympiads = [
  { id: "1", name: "Tech Defense 2026", type: "Cibersegurança", startDate: "2026-04-01", endDate: "2026-04-30", participants: 124 },
];

const mockWorkshopsAdmin = [
  { id: "1", name: "Fundamentos de Cibersegurança", professor: "Prof. Dr. Carlos Silva", olympiad: "Tech Defense 2026", slots: 30, enrolled: 25 },
  { id: "2", name: "Redes e Protocolos", professor: "Prof. Ana Santos", olympiad: "Tech Defense 2026", slots: 25, enrolled: 13 },
];

const mockParticipants = [
  { id: "1", name: "João da Silva", email: "joao@email.com", cpf: "123.456.789-00", workshop: "Cibersegurança", confirmed: true, present: false },
  { id: "2", name: "Maria Souza", email: "maria@email.com", cpf: "987.654.321-00", workshop: "Redes", confirmed: true, present: true },
  { id: "3", name: "Pedro Lima", email: "pedro@email.com", cpf: "456.789.123-00", workshop: "Cibersegurança", confirmed: false, present: false },
];

const AdminDashboard = () => {
  const { toast } = useToast();
  const [tab, setTab] = useState("dashboard");

  return (
    <Layout hideFooter>
      <div className="hero-bg min-h-[calc(100vh-4rem)]">
        <div className="container py-8">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold text-primary-foreground">
              Painel <span className="text-primary">Administrativo</span>
            </h1>
            <p className="text-sm text-muted-foreground">Gerencie olimpíadas, oficinas, postagens e relatórios</p>
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="mb-6 flex flex-wrap gap-1 bg-muted/10">
              <TabsTrigger value="dashboard" className="gap-1.5"><LayoutDashboard className="h-4 w-4" />Resumo</TabsTrigger>
              <TabsTrigger value="olympiads" className="gap-1.5"><Trophy className="h-4 w-4" />Olimpíadas</TabsTrigger>
              <TabsTrigger value="workshops" className="gap-1.5"><BookOpen className="h-4 w-4" />Oficinas</TabsTrigger>
              <TabsTrigger value="posts" className="gap-1.5"><FileText className="h-4 w-4" />Postagens</TabsTrigger>
              <TabsTrigger value="reports" className="gap-1.5"><BarChart3 className="h-4 w-4" />Relatórios</TabsTrigger>
            </TabsList>

            {/* Dashboard */}
            <TabsContent value="dashboard">
              <div className="grid gap-4 md:grid-cols-4">
                {[
                  { label: "Participantes", value: "124", icon: Users, color: "text-primary" },
                  { label: "Olimpíadas", value: "1", icon: Trophy, color: "text-secondary" },
                  { label: "Oficinas", value: "3", icon: BookOpen, color: "text-accent" },
                  { label: "Confirmados", value: "98", icon: CheckCircle, color: "text-primary" },
                ].map((stat) => (
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
            </TabsContent>

            {/* Olympiads */}
            <TabsContent value="olympiads">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">Olimpíadas Cadastradas</h2>
                <Button size="sm"><Plus className="mr-1 h-4 w-4" />Nova Olimpíada</Button>
              </div>
              <Card className="card-cyber border-0 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-primary/10">
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead>Participantes</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockOlympiads.map((o) => (
                      <TableRow key={o.id} className="border-primary/5">
                        <TableCell className="font-medium">{o.name}</TableCell>
                        <TableCell><Badge variant="secondary">{o.type}</Badge></TableCell>
                        <TableCell className="text-sm">{new Date(o.startDate).toLocaleDateString("pt-BR")} — {new Date(o.endDate).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell>{o.participants}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            {/* Workshops */}
            <TabsContent value="workshops">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">Oficinas</h2>
                <Button size="sm"><Plus className="mr-1 h-4 w-4" />Nova Oficina</Button>
              </div>
              <Card className="card-cyber border-0 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-primary/10">
                      <TableHead>Nome</TableHead>
                      <TableHead>Professor</TableHead>
                      <TableHead>Olimpíada</TableHead>
                      <TableHead>Vagas</TableHead>
                      <TableHead>Inscritos</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockWorkshopsAdmin.map((ws) => (
                      <TableRow key={ws.id} className="border-primary/5">
                        <TableCell className="font-medium">{ws.name}</TableCell>
                        <TableCell>{ws.professor}</TableCell>
                        <TableCell><Badge variant="secondary">{ws.olympiad}</Badge></TableCell>
                        <TableCell>{ws.slots}</TableCell>
                        <TableCell>{ws.enrolled}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            {/* Posts */}
            <TabsContent value="posts">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">Postagens do Blog</h2>
                <Button size="sm"><Plus className="mr-1 h-4 w-4" />Nova Postagem</Button>
              </div>
              <Card className="card-cyber border-0">
                <CardHeader>
                  <CardTitle className="font-display text-base">Editor de Postagem</CardTitle>
                  <CardDescription>Crie ou edite uma publicação do blog</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input placeholder="Título da postagem" />
                  </div>
                  <div className="space-y-2">
                    <Label>Conteúdo</Label>
                    <Textarea placeholder="Escreva o conteúdo da postagem..." className="min-h-[200px]" />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Imagem de Capa</Label>
                      <Input type="file" accept="image/*" />
                    </div>
                    <div className="space-y-2">
                      <Label>Tags (separadas por vírgula)</Label>
                      <Input placeholder="Oficina, Novidade" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button className="font-display tracking-wide">Publicar</Button>
                    <Button variant="outline">Salvar Rascunho</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reports */}
            <TabsContent value="reports">
              <div className="space-y-6">
                {/* Filters */}
                <Card className="card-cyber border-0">
                  <CardContent className="pt-6">
                    <div className="flex flex-wrap items-end gap-4">
                      <div className="space-y-2">
                        <Label>Olimpíada</Label>
                        <Select defaultValue="all">
                          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            <SelectItem value="1">Tech Defense 2026</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Oficina</Label>
                        <Select defaultValue="all">
                          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            <SelectItem value="1">Cibersegurança</SelectItem>
                            <SelectItem value="2">Redes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select defaultValue="all">
                          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="confirmed">Confirmados</SelectItem>
                            <SelectItem value="pending">Pendentes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button variant="outline" className="border-primary/30 text-primary">
                        <Printer className="mr-1 h-4 w-4" />Exportar PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Participants Table */}
                <Card className="card-cyber border-0 overflow-hidden">
                  <CardHeader>
                    <CardTitle className="font-display text-base">Lista de Participantes</CardTitle>
                    <CardDescription>{mockParticipants.length} participantes encontrados</CardDescription>
                  </CardHeader>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-primary/10">
                        <TableHead>Nome</TableHead>
                        <TableHead>E-mail</TableHead>
                        <TableHead>CPF</TableHead>
                        <TableHead>Oficina</TableHead>
                        <TableHead>Confirmado</TableHead>
                        <TableHead>Presença</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockParticipants.map((p) => (
                        <TableRow key={p.id} className="border-primary/5">
                          <TableCell className="font-medium">{p.name}</TableCell>
                          <TableCell className="text-sm">{p.email}</TableCell>
                          <TableCell className="text-sm">{p.cpf}</TableCell>
                          <TableCell><Badge variant="secondary">{p.workshop}</Badge></TableCell>
                          <TableCell>
                            {p.confirmed ? (
                              <Badge className="bg-primary/20 text-primary">Sim</Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground">Não</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button variant={p.present ? "default" : "outline"} size="sm" className={p.present ? "" : "border-primary/30 text-primary"}>
                              {p.present ? <><CheckCircle className="mr-1 h-3 w-3" />Presente</> : "Marcar"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;

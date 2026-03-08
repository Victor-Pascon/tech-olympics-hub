import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  LayoutDashboard, BookOpen, MapPin, FileText, User,
  Calendar, Clock, GraduationCap, Download, CheckCircle,
} from "lucide-react";

const mockWorkshops = [
  { id: "1", name: "Fundamentos de Cibersegurança", professor: "Prof. Dr. Carlos Silva", date: "2026-04-10", time: "14:00 - 17:00", location: "Lab 1 — IFS Itabaiana", slots: 5, enrolled: true },
  { id: "2", name: "Redes e Protocolos", professor: "Prof. Ana Santos", date: "2026-04-12", time: "09:00 - 12:00", location: "Lab 2 — IFS Itabaiana", slots: 12, enrolled: false },
  { id: "3", name: "Programação Segura com Python", professor: "Prof. João Lima", date: "2026-04-15", time: "14:00 - 17:00", location: "Lab 3 — IFS Itabaiana", slots: 8, enrolled: false },
];

const mockMaterials = [
  { id: "1", name: "Apostila de Cibersegurança", type: "PDF", url: "#" },
  { id: "2", name: "Slides — Redes e Protocolos", type: "PDF", url: "#" },
  { id: "3", name: "Guia de Estudos — Olimpíada", type: "PDF", url: "#" },
];

const ParticipantDashboard = () => {
  const [tab, setTab] = useState("dashboard");

  return (
    <Layout hideFooter>
      <div className="hero-bg min-h-[calc(100vh-4rem)]">
        <div className="container py-8">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold text-primary-foreground">
              Olá, <span className="text-primary">Participante</span>
            </h1>
            <p className="text-sm text-muted-foreground">Gerencie sua participação na Olimpíada Tech Defense</p>
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="mb-6 flex flex-wrap gap-1 bg-muted/10">
              <TabsTrigger value="dashboard" className="gap-1.5"><LayoutDashboard className="h-4 w-4" />Resumo</TabsTrigger>
              <TabsTrigger value="workshops" className="gap-1.5"><BookOpen className="h-4 w-4" />Oficinas</TabsTrigger>
              <TabsTrigger value="exam" className="gap-1.5"><MapPin className="h-4 w-4" />Prova</TabsTrigger>
              <TabsTrigger value="materials" className="gap-1.5"><FileText className="h-4 w-4" />Materiais</TabsTrigger>
              <TabsTrigger value="profile" className="gap-1.5"><User className="h-4 w-4" />Perfil</TabsTrigger>
            </TabsList>

            {/* Dashboard */}
            <TabsContent value="dashboard">
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="card-cyber border-0">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <GraduationCap className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Olimpíada</p>
                        <p className="font-display text-sm font-semibold">Tech Defense 2026</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="card-cyber border-0">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                        <BookOpen className="h-5 w-5 text-secondary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Oficina Inscrita</p>
                        <p className="font-display text-sm font-semibold">Cibersegurança</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="card-cyber border-0">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                        <Calendar className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Data da Prova</p>
                        <p className="font-display text-sm font-semibold">20/04/2026</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Workshops */}
            <TabsContent value="workshops">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {mockWorkshops.map((ws) => (
                  <Card key={ws.id} className="card-cyber border-0">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="font-display text-base">{ws.name}</CardTitle>
                        {ws.enrolled && <Badge className="bg-primary/20 text-primary">Inscrito</Badge>}
                      </div>
                      <CardDescription className="flex items-center gap-1">
                        <GraduationCap className="h-3 w-3" /> {ws.professor}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-primary" />{new Date(ws.date).toLocaleDateString("pt-BR")}</div>
                      <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-primary" />{ws.time}</div>
                      <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-primary" />{ws.location}</div>
                      <p className="text-xs">{ws.slots} vagas restantes</p>
                      {!ws.enrolled && (
                        <Button size="sm" className="mt-2 w-full">Inscrever-se</Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Exam Info */}
            <TabsContent value="exam">
              <Card className="card-cyber border-0">
                <CardHeader>
                  <CardTitle className="font-display text-xl">Informações da Prova</CardTitle>
                  <CardDescription>Detalhes sobre a prova presencial</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center gap-3 rounded-lg bg-muted/10 p-4">
                      <Calendar className="h-6 w-6 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Data</p>
                        <p className="font-display font-semibold">20 de Abril de 2026</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg bg-muted/10 p-4">
                      <Clock className="h-6 w-6 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Horário</p>
                        <p className="font-display font-semibold">09:00 — 12:00</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-muted/10 p-4">
                    <MapPin className="h-6 w-6 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Local</p>
                      <p className="font-display font-semibold">Auditório Principal — IFS Campus Itabaiana</p>
                      <p className="text-sm text-muted-foreground">Rod. Jorge Amado, Itabaiana/SE</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Materials */}
            <TabsContent value="materials">
              <div className="space-y-3">
                {mockMaterials.map((mat) => (
                  <Card key={mat.id} className="card-cyber border-0">
                    <CardContent className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{mat.name}</p>
                          <p className="text-xs text-muted-foreground">{mat.type}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="border-primary/30 text-primary">
                        <Download className="mr-1 h-4 w-4" /> Baixar
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Profile */}
            <TabsContent value="profile">
              <Card className="card-cyber border-0 max-w-xl">
                <CardHeader>
                  <CardTitle className="font-display text-xl">Meu Perfil</CardTitle>
                  <CardDescription>Edite seus dados pessoais</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Nome Completo</Label>
                      <Input defaultValue="João da Silva" />
                    </div>
                    <div className="space-y-2">
                      <Label>E-mail</Label>
                      <Input defaultValue="joao@email.com" disabled />
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>CPF</Label>
                      <Input defaultValue="123.456.789-00" disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Telefone</Label>
                      <Input defaultValue="(79) 99999-0000" />
                    </div>
                  </div>
                  <Button className="font-display tracking-wide">Salvar Alterações</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default ParticipantDashboard;

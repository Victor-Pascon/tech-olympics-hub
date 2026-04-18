import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Trophy, BookOpen, FileText, BarChart3, Users, Mic, UserCheck, UserCircle, Medal, Award } from "lucide-react";
import DashboardTab from "@/components/admin/DashboardTab";
import OlympiadsTab from "@/components/admin/OlympiadsTab";
import WorkshopsTab from "@/components/admin/WorkshopsTab";
import LecturesTab from "@/components/admin/LecturesTab";
import PostsTab from "@/components/admin/PostsTab";
import ReportsTab from "@/components/admin/ReportsTab";
import UsersTab from "@/components/admin/UsersTab";
import SupportMaterialsTab from "@/components/admin/SupportMaterialsTab";
import CertificatesTab from "@/components/admin/CertificatesTab";
import ParticipantsTab from "@/components/admin/ParticipantsTab";
import MyAccountTab from "@/components/admin/MyAccountTab";
import RankingTab from "@/components/admin/RankingTab";
import MobileTabsMenu from "@/components/MobileTabsMenu";

const TAB_ITEMS = [
  { value: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { value: "olympiads", label: "Olimpíadas", icon: Trophy },
  { value: "workshops", label: "Oficinas", icon: BookOpen },
  { value: "lectures", label: "Palestras", icon: Mic },
  { value: "posts", label: "Postagens", icon: FileText },
  { value: "materials", label: "Materiais de Apoio", icon: FileText },
  { value: "certificates", label: "Certificados", icon: Award },
  { value: "participants", label: "Participantes", icon: UserCheck },
  { value: "ranking", label: "Ranking", icon: Medal },
  { value: "reports", label: "Relatórios", icon: BarChart3 },
  { value: "users", label: "Usuários", icon: Users },
  { value: "myaccount", label: "Minha Conta", icon: UserCircle },
];

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("dashboard");
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/admin-login"); return; }
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => {
      if (!data) navigate("/admin-login");
      else setAuthorized(true);
    });
  }, [user, loading, navigate]);

  if (loading || !authorized) {
    return (
      <Layout>
        <div className="hero-bg flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <p className="font-display text-primary-foreground">Verificando permissões...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideFooter>
      <div className="hero-bg min-h-[calc(100vh-4rem)]">
        <div className="container py-8">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold text-primary-foreground">
              Painel <span className="text-primary">Administrativo</span>
            </h1>
            <p className="text-sm text-muted-foreground">Gerencie olimpíadas, oficinas, palestras, postagens e relatórios</p>
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="mb-6 flex flex-wrap gap-1 bg-muted/10">
              <TabsTrigger value="dashboard" className="gap-1.5"><LayoutDashboard className="h-4 w-4" />Dashboard</TabsTrigger>
              <TabsTrigger value="olympiads" className="gap-1.5"><Trophy className="h-4 w-4" />Olimpíadas</TabsTrigger>
              <TabsTrigger value="workshops" className="gap-1.5"><BookOpen className="h-4 w-4" />Oficinas</TabsTrigger>
              <TabsTrigger value="lectures" className="gap-1.5"><Mic className="h-4 w-4" />Palestras</TabsTrigger>
              <TabsTrigger value="posts" className="gap-1.5"><FileText className="h-4 w-4" />Postagens</TabsTrigger>
              <TabsTrigger value="materials" className="gap-1.5"><FileText className="h-4 w-4" />Materiais de Apoio</TabsTrigger>
              <TabsTrigger value="certificates" className="gap-1.5"><Award className="h-4 w-4" />Certificados</TabsTrigger>
              <TabsTrigger value="participants" className="gap-1.5"><UserCheck className="h-4 w-4" />Participantes</TabsTrigger>
              <TabsTrigger value="ranking" className="gap-1.5"><Medal className="h-4 w-4" />Ranking</TabsTrigger>
              <TabsTrigger value="reports" className="gap-1.5"><BarChart3 className="h-4 w-4" />Relatórios</TabsTrigger>
              <TabsTrigger value="users" className="gap-1.5"><Users className="h-4 w-4" />Usuários</TabsTrigger>
              <TabsTrigger value="myaccount" className="gap-1.5"><UserCircle className="h-4 w-4" />Minha Conta</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard"><DashboardTab /></TabsContent>
            <TabsContent value="olympiads"><OlympiadsTab /></TabsContent>
            <TabsContent value="workshops"><WorkshopsTab /></TabsContent>
            <TabsContent value="lectures"><LecturesTab /></TabsContent>
            <TabsContent value="posts"><PostsTab /></TabsContent>
            <TabsContent value="materials"><SupportMaterialsTab /></TabsContent>
            <TabsContent value="certificates"><CertificatesTab /></TabsContent>
            <TabsContent value="participants"><ParticipantsTab /></TabsContent>
            <TabsContent value="ranking"><RankingTab /></TabsContent>
            <TabsContent value="reports"><ReportsTab /></TabsContent>
            <TabsContent value="users"><UsersTab /></TabsContent>
            <TabsContent value="myaccount"><MyAccountTab /></TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;

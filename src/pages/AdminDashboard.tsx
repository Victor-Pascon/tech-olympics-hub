import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Tabs, TabsContent } from "@/components/ui/tabs";
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

  // Listen for tab changes from header hamburger menu
  useEffect(() => {
    const handler = (e: Event) => {
      const tab = (e as CustomEvent).detail;
      if (tab) setTab(tab);
    };
    window.addEventListener("admin-tab-change", handler);
    return () => window.removeEventListener("admin-tab-change", handler);
  }, []);

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
        <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-[1600px] mx-auto">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsContent value="dashboard" className="mt-0"><DashboardTab /></TabsContent>
            <TabsContent value="olympiads" className="mt-0"><OlympiadsTab /></TabsContent>
            <TabsContent value="workshops" className="mt-0"><WorkshopsTab /></TabsContent>
            <TabsContent value="lectures" className="mt-0"><LecturesTab /></TabsContent>
            <TabsContent value="posts" className="mt-0"><PostsTab /></TabsContent>
            <TabsContent value="materials" className="mt-0"><SupportMaterialsTab /></TabsContent>
            <TabsContent value="certificates" className="mt-0"><CertificatesTab /></TabsContent>
            <TabsContent value="participants" className="mt-0"><ParticipantsTab /></TabsContent>
            <TabsContent value="ranking" className="mt-0"><RankingTab /></TabsContent>
            <TabsContent value="reports" className="mt-0"><ReportsTab /></TabsContent>
            <TabsContent value="users" className="mt-0"><UsersTab /></TabsContent>
            <TabsContent value="myaccount" className="mt-0"><MyAccountTab /></TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;

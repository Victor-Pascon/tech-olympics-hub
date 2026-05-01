import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import {
  Menu, X, Shield, Settings, UserCircle, LogOut, User,
  LayoutDashboard, Trophy, BookOpen, FileText, BarChart3,
  Users, Mic, UserCheck, Medal, Award, History
} from "lucide-react";

const ADMIN_MODULES = [
  { label: "Dashboard", icon: LayoutDashboard, tab: "dashboard" },
  { label: "Olimpíadas", icon: Trophy, tab: "olympiads" },
  { label: "Oficinas", icon: BookOpen, tab: "workshops" },
  { label: "Palestras", icon: Mic, tab: "lectures" },
  { label: "Postagens", icon: FileText, tab: "posts" },
  { label: "Certificados", icon: Award, tab: "certificates" },
  { label: "Participantes", icon: UserCheck, tab: "participants" },
  { label: "Ranking", icon: Medal, tab: "ranking" },
  { label: "Relatórios", icon: BarChart3, tab: "reports" },
  { label: "Materiais", icon: FileText, tab: "materials" },
  { label: "Usuários", icon: Users, tab: "users" },
  { label: "Minha Conta", icon: UserCircle, tab: "myaccount" },
];

const PARTICIPANT_MODULES = [
  { label: "Resumo", icon: LayoutDashboard, tab: "dashboard" },
  { label: "Olimpíadas", icon: Trophy, tab: "olympiads" },
  { label: "Oficinas", icon: BookOpen, tab: "workshops" },
  { label: "Palestras", icon: Mic, tab: "lectures" },
  { label: "Materiais", icon: FileText, tab: "materials" },
  { label: "Certificados", icon: Award, tab: "certificates" },
  { label: "Ranking", icon: Medal, tab: "ranking" },
  { label: "Histórico", icon: History, tab: "history" },
  { label: "Perfil", icon: UserCircle, tab: "profile" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminSheetOpen, setAdminSheetOpen] = useState(false);
  const [participantSheetOpen, setParticipantSheetOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const isAdminPage = location.pathname.startsWith("/admin");
  const isParticipantPage = location.pathname === "/participante";
  const isAdmin = isAdminPage && !!user;
  const isParticipant = isParticipantPage && !!user;

  const handleSignOut = async () => {
    await signOut();
    setAdminSheetOpen(false);
    setParticipantSheetOpen(false);
    navigate("/");
  };

  const handleAdminNav = (tab: string) => {
    setAdminSheetOpen(false);
    if (location.pathname === "/admin") {
      window.dispatchEvent(new CustomEvent("admin-tab-change", { detail: tab }));
    } else {
      navigate("/admin");
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("admin-tab-change", { detail: tab }));
      }, 100);
    }
  };

  const handleParticipantNav = (tab: string) => {
    setParticipantSheetOpen(false);
    if (location.pathname === "/participante") {
      window.dispatchEvent(new CustomEvent("participant-tab-change", { detail: tab }));
    } else {
      navigate("/participante");
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("participant-tab-change", { detail: tab }));
      }, 100);
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleNavClick = (path: string) => {
    setMobileOpen(false);
    if (path.startsWith("/#")) {
      const id = path.replace("/#", "");
      if (location.pathname === "/") scrollToSection(id);
      else window.location.href = path;
    }
  };

  const navItems = [
    { label: "Início", path: "/" },
    { label: "Sobre", path: "/#sobre" },
    { label: "Contato", path: "/#contato" },
  ];

  // ---- ADMIN HEADER ----
  if (isAdmin) {
    return (
      <header className="sticky top-0 z-50 glass">
        <div className="flex h-16 items-center justify-between px-4 lg:px-8">
          {/* Left: Logo + Hamburger */}
          <div className="flex items-center gap-4">
            <Sheet open={adminSheetOpen} onOpenChange={setAdminSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0 flex flex-col">
                {/* User profile section */}
                <div className="border-b border-border p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user?.user_metadata?.nome || user?.email || "Administrador"}
                      </p>
                      <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 w-full justify-start gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </Button>
                </div>

                {/* Admin modules */}
                <div className="flex-1 overflow-y-auto py-2">
                  <p className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Módulos do Painel
                  </p>
                  {ADMIN_MODULES.map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.tab}
                        onClick={() => handleAdminNav(m.tab)}
                        className="flex w-full items-center gap-3 rounded-md px-5 py-2.5 text-left text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>

            <Link to="/admin" className="flex items-center gap-2 group">
              <img
                src="/logo-tech-defense-sem_fundo.jpeg"
                alt="Olimpíada Tech Defense"
                className="h-8 w-8 rounded-md object-cover ring-1 ring-primary/20"
              />
              <span className="font-display text-base font-bold tracking-wider text-foreground">
                Tech <span className="text-primary">Defense</span>
              </span>
            </Link>
          </div>

          {/* Right: Administrativo label */}
          <div className="flex items-center gap-3">
            <span className="font-display text-sm font-semibold tracking-wider text-primary">
              Administrativo
            </span>
          </div>
        </div>
      </header>
    );
  }

  // ---- PARTICIPANT HEADER ----
  if (isParticipant) {
    return (
      <header className="sticky top-0 z-50 glass">
        <div className="flex h-16 items-center justify-between px-4 lg:px-8">
          {/* Left: Hamburger + Logo */}
          <div className="flex items-center gap-4">
            <Sheet open={participantSheetOpen} onOpenChange={setParticipantSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0 flex flex-col">
                {/* User profile section */}
                <div className="border-b border-border p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {user?.user_metadata?.nome || user?.email || "Participante"}
                      </p>
                      <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 w-full justify-start gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </Button>
                </div>

                {/* Participant modules */}
                <div className="flex-1 overflow-y-auto py-2">
                  <p className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Menu do Participante
                  </p>
                  {PARTICIPANT_MODULES.map((m) => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.tab}
                        onClick={() => handleParticipantNav(m.tab)}
                        className="flex w-full items-center gap-3 rounded-md px-5 py-2.5 text-left text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>

            <Link to="/participante" className="flex items-center gap-2 group">
              <img
                src="/logo-tech-defense-sem_fundo.jpeg"
                alt="Olimpíada Tech Defense"
                className="h-8 w-8 rounded-md object-cover ring-1 ring-primary/20"
              />
              <span className="font-display text-base font-bold tracking-wider text-foreground">
                Tech <span className="text-primary">Defense</span>
              </span>
            </Link>
          </div>

          {/* Right: Participant name */}
          <div className="flex items-center gap-3">
            <span className="font-display text-sm font-semibold tracking-wider text-primary truncate max-w-[180px]">
              {user?.user_metadata?.nome || user?.email?.split("@")[0] || "Participante"}
            </span>
          </div>
        </div>
      </header>
    );
  }

  // ---- REGULAR HEADER ----
  return (
    <header className="sticky top-0 z-50 glass">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/logo-tech-defense-sem_fundo.jpeg"
            alt="Olimpíada Tech Defense"
            className="h-10 w-10 rounded-md object-cover ring-1 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300"
          />
          <span className="font-display text-lg font-bold tracking-wider text-foreground">
            Tech <span className="text-primary">Defense</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) =>
            item.path.startsWith("/#") ? (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className="text-sm font-medium text-muted-foreground transition-colors duration-300 hover:text-primary"
              >
                {item.label}
              </button>
            ) : (
              <Link
                key={item.path}
                to={item.path}
                className="text-sm font-medium text-muted-foreground transition-colors duration-300 hover:text-primary"
              >
                {item.label}
              </Link>
            )
          )}
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="btn-cyber border-primary/20 text-primary hover:bg-primary/10">
              <Link to="/login">Área do Participante</Link>
            </Button>
            <Button asChild size="sm" className="btn-cyber bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/cadastro">
                <Shield className="mr-1 h-4 w-4" />
                Cadastre-se
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-primary hover:bg-primary/10">
              <Link to="/admin-login">
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </nav>

        {/* Mobile toggle */}
        <button
          className="text-muted-foreground md:hidden hover:text-primary transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="border-t border-primary/10 bg-background/95 backdrop-blur-xl p-4 md:hidden animate-fade-in">
          <nav className="flex flex-col gap-3">
            {navItems.map((item) =>
              item.path.startsWith("/#") ? (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className="text-left text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.path}
                  to={item.path}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              )
            )}
            <div className="mt-2 flex flex-col gap-2">
              <Button asChild variant="outline" size="sm" className="btn-cyber border-primary/20 text-primary">
                <Link to="/login" onClick={() => setMobileOpen(false)}>Área do Participante</Link>
              </Button>
              <Button asChild size="sm" className="btn-cyber">
                <Link to="/cadastro" onClick={() => setMobileOpen(false)}>
                  <Shield className="mr-1 h-4 w-4" />
                  Cadastre-se
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                <Link to="/admin-login" onClick={() => setMobileOpen(false)}>
                  <Settings className="mr-1 h-4 w-4" />
                  Painel Admin
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;

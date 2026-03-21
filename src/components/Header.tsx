import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Shield, Settings } from "lucide-react";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleNavClick = (path: string) => {
    setMobileOpen(false);
    if (path.startsWith("/#")) {
      const id = path.replace("/#", "");
      if (location.pathname === "/") {
        scrollToSection(id);
      } else {
        window.location.href = path;
      }
    }
  };

  const navItems = [
    { label: "Início", path: "/" },
    { label: "Sobre", path: "/#sobre" },
    { label: "Contato", path: "/#contato" },
  ];

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

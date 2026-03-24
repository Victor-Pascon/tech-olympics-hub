import { Link } from "react-router-dom";
import { Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-primary/10 bg-background">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Marca */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img src="/logo-tech-defense-sem_fundo.jpeg" alt="Tech Defense" className="h-10 w-10 rounded-md object-cover ring-1 ring-primary/20" />
              <span className="font-display text-lg font-bold text-foreground">
                Tech <span className="text-primary">Defense</span>
              </span>
            </div>
            <img src="/logo-ifs-sem_fundo.png" alt="IFS" className="h-10 w-10 rounded-md object-cover ring-1 ring-primary/20" />
            <img src="/logo-fapitec-sem_fundo.png" alt="FAPITEC" className="h-10 w-10 rounded-md object-cover ring-1 ring-primary/20" />
            <p className="text-sm text-muted-foreground">
              Olimpíada de tecnologia e segurança digital promovida pelo Instituto Federal de Sergipe — Campus Itabaiana.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-primary">Links</h4>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors duration-300">Início</Link>
              <Link to="/cadastro" className="hover:text-primary transition-colors duration-300">Cadastre-se</Link>
              <Link to="/login" className="hover:text-primary transition-colors duration-300">Área do Participante</Link>
            </nav>
          </div>

          {/* Contato */}
          <div className="space-y-3">
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-primary">Contato</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>contato@techdefense.edu.br</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>IFS — Campus Itabaiana, SE</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-primary/10 pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Olimpíada Tech Defense — IFS Itabaiana · Apoio: FAPITEC/SE
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

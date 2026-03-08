import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, UserPlus, Calendar, MapPin, ArrowRight, BookOpen, Trophy } from "lucide-react";

const mockPosts = [
  {
    id: "1",
    title: "Inscrições Abertas para a Olimpíada Tech Defense 2026",
    excerpt: "Participe da maior olimpíada de tecnologia e segurança digital do estado de Sergipe. Inscrições gratuitas para todos os interessados.",
    date: "2026-03-01",
    image: "/placeholder.svg",
    tags: ["Inscrições", "Novidade"],
  },
  {
    id: "2",
    title: "Oficina de Cibersegurança: Proteja seus Dados",
    excerpt: "Aprenda os fundamentos de segurança digital com nossos professores especializados. Oficina presencial no campus IFS Itabaiana.",
    date: "2026-02-20",
    image: "/placeholder.svg",
    tags: ["Oficina", "Cibersegurança"],
  },
  {
    id: "3",
    title: "Local da Prova Presencial Confirmado",
    excerpt: "A prova presencial da Olimpíada Tech Defense será realizada no auditório principal do IFS Campus Itabaiana.",
    date: "2026-02-15",
    image: "/placeholder.svg",
    tags: ["Prova", "Local"],
  },
];

const Index = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="hero-bg circuit-pattern relative overflow-hidden py-20 lg:py-32">
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <img
                src="/logos_tech_defense.jpeg"
                alt="Olimpíada Tech Defense"
                className="h-28 w-28 rounded-2xl object-cover shadow-lg shadow-primary/20 lg:h-36 lg:w-36"
              />
            </div>
            <Badge className="mb-4 bg-primary/20 text-primary hover:bg-primary/30">
              <Trophy className="mr-1 h-3 w-3" /> IFS Itabaiana · FAPITEC/SE
            </Badge>
            <h1 className="font-display mb-6 text-4xl font-bold tracking-tight text-primary-foreground cyber-glow lg:text-6xl">
              Olimpíada <span className="text-primary">Tech Defense</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground lg:text-xl">
              Desafie seus conhecimentos em tecnologia e segurança digital. Participe de oficinas, prove suas habilidades e faça parte da comunidade tech.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-display tracking-wide">
                <Link to="/cadastro">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Cadastre-se na Olimpíada
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto border-primary/30 text-primary hover:bg-primary/10 font-display tracking-wide">
                <Link to="/login">
                  <Shield className="mr-2 h-5 w-5" />
                  Área do Participante
                </Link>
              </Button>
            </div>
          </div>
        </div>
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />
      </section>

      {/* Features / Sobre */}
      <section className="py-16" id="sobre">
        <div className="container">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-display mb-3 text-2xl font-bold tracking-tight lg:text-3xl">
              Por que participar?
            </h2>
            <p className="text-muted-foreground">
              Uma experiência completa em tecnologia e segurança digital
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: BookOpen, title: "Oficinas Práticas", desc: "Aprenda com profissionais em oficinas presenciais de cibersegurança, redes e programação." },
              { icon: Trophy, title: "Competição", desc: "Teste seus conhecimentos em provas presenciais e ganhe certificados e prêmios." },
              { icon: Shield, title: "Segurança Digital", desc: "Domine conceitos essenciais de proteção de dados e defesa cibernética." },
            ].map((feat) => (
              <Card key={feat.title} className="card-cyber border-0">
                <CardContent className="pt-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-display mb-2 text-lg font-semibold">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground">{feat.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="hero-bg-animated circuit-pattern py-16" id="blog">
        <div className="container">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-primary-foreground lg:text-3xl">Últimas Publicações</h2>
              <p className="mt-1 text-primary-foreground/70">Fique por dentro das novidades</p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockPosts.map((post) => (
              <Card key={post.id} className="card-cyber group overflow-hidden border-0 transition-all">
                <div className="aspect-video overflow-hidden bg-muted">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <CardHeader className="pb-2">
                  <div className="mb-2 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <h3 className="font-display text-base font-semibold leading-tight">{post.title}</h3>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                </CardContent>
                <CardFooter className="justify-between">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(post.date).toLocaleDateString("pt-BR")}
                  </span>
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                    Ler mais <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Location / Contact */}
      <section className="border-t border-border py-16" id="contato">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="font-display mb-4 text-2xl font-bold">Localização & Contato</h2>
              <div className="space-y-4 text-muted-foreground">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Instituto Federal de Sergipe</p>
                    <p>Campus Itabaiana — Rod. Jorge Amado, Itabaiana/SE</p>
                  </div>
                </div>
                <p>
                  Para dúvidas e informações, entre em contato pelo e-mail{" "}
                  <a href="mailto:contato@techdefense.edu.br" className="text-primary hover:underline">
                    contato@techdefense.edu.br
                  </a>
                </p>
              </div>
            </div>
            <div className="overflow-hidden rounded-lg border border-primary/10">
              <iframe
                title="Localização IFS Itabaiana"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.123456!2d-37.424!3d-10.684!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQxJzAyLjQiUyAzN8KwMjUnMjYuNCJX!5e0!3m2!1spt-BR!2sbr!4v1234567890"
                className="h-64 w-full lg:h-80"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;

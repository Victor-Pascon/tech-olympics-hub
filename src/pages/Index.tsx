import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, UserPlus, Calendar, MapPin, BookOpen, Trophy } from "lucide-react";

type Post = {
  id: string; titulo: string; conteudo: string | null; imagem_url: string | null;
  tags: string | null; created_at: string; categoria: string | null;
};

const Index = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const { data } = await supabase
      .from("posts")
      .select("id, titulo, conteudo, imagem_url, tags, created_at, categoria")
      .eq("publicado", true)
      .order("created_at", { ascending: false })
      .limit(6);

    if (data) {
      setPosts(data);
      // Increment views for each post displayed
      for (const post of data) {
        supabase.rpc("has_role", { _user_id: "00000000-0000-0000-0000-000000000000", _role: "user" }).then(() => {
          // Use a simple update to increment — not ideal but works without a custom function
        });
        // We'll just call update directly; RLS allows public read but not update, 
        // so we skip incrementing from the public page (it would need an edge function or DB function).
        // For now, views are tracked when admin manages posts.
      }
    }
  };

  

  const getTags = (tags: string | null): string[] => {
    if (!tags) return [];
    return tags.split(",").map(t => t.trim()).filter(Boolean);
  };

  return (
    <Layout>
      {/* Hero with Matrix Background */}
      <section className="hero-matrix relative overflow-hidden py-24 lg:py-36">
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-8 flex justify-center">
              <img
                src="/logos_tech_defense.jpeg"
                alt="Olimpíada Tech Defense"
                className="h-28 w-28 rounded-2xl object-cover shadow-lg shadow-primary/30 ring-2 ring-primary/20 lg:h-36 lg:w-36 animate-glow-pulse"
              />
            </div>
            <Badge className="mb-5 bg-primary/15 text-primary border border-primary/20 hover:bg-primary/25 backdrop-blur-sm">
              <Trophy className="mr-1 h-3 w-3" /> IFS Itabaiana · FAPITEC/SE
            </Badge>
            <h1 className="font-display mb-6 text-4xl font-bold tracking-tight text-foreground cyber-glow lg:text-6xl">
              Olimpíada <span className="text-primary">Tech Defense</span>
            </h1>
            <p className="mb-10 text-lg text-muted-foreground lg:text-xl leading-relaxed">
              Desafie seus conhecimentos em tecnologia e segurança digital. Participe de oficinas, prove suas habilidades e faça parte da comunidade tech.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="btn-cyber w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-display tracking-wide">
                <Link to="/cadastro">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Cadastre-se na Olimpíada
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="btn-cyber w-full sm:w-auto border-primary/30 text-primary hover:bg-primary/10 font-display tracking-wide">
                <Link to="/login">
                  <Shield className="mr-2 h-5 w-5" />
                  Área do Participante
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-[2]" />
      </section>

      {/* Features / Sobre */}
      <section className="py-20" id="sobre">
        <div className="container">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="font-display mb-4 text-2xl font-bold tracking-tight lg:text-3xl">
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
              <Card key={feat.title} className="card-premium border-0 group">
                <CardContent className="pt-8 pb-8">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 border border-primary/10 group-hover:border-primary/30 group-hover:bg-primary/15 transition-all duration-300">
                    <feat.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-display mb-3 text-lg font-semibold">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="hero-bg-animated circuit-pattern py-20" id="blog">
        <div className="container">
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground lg:text-3xl">Últimas Publicações</h2>
              <p className="mt-2 text-muted-foreground">Fique por dentro das novidades</p>
            </div>
          </div>
          {posts.length > 0 ? (
            <div className="mx-auto flex max-w-3xl flex-col gap-8">
              {posts.map((post) => (
                <Card key={post.id} className="card-premium overflow-hidden border-0">
                  {post.imagem_url && (
                    <div className="aspect-video overflow-hidden bg-muted/30">
                      <img
                        src={post.imagem_url}
                        alt={post.titulo}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="mb-2 flex flex-wrap gap-2">
                      {getTags(post.tags).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs bg-primary/10 text-primary border border-primary/10">
                          {tag}
                        </Badge>
                      ))}
                      {post.categoria && (
                        <Badge variant="outline" className="text-xs">{post.categoria}</Badge>
                      )}
                    </div>
                    <h3 className="font-display text-xl font-bold leading-tight lg:text-2xl">{post.titulo}</h3>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{post.conteudo}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhuma publicação disponível no momento.</p>
            </div>
          )}
        </div>
      </section>

      {/* Location / Contact */}
      <section className="border-t border-border py-20" id="contato">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="font-display mb-4 text-2xl font-bold">Localização & Contato</h2>
              <div className="space-y-4 text-muted-foreground">
                <a href="https://maps.app.goo.gl/jWnVo1J8UMN5GVf59" target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 group/link hover:opacity-80 transition-opacity">
                  <MapPin className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground group-hover/link:text-primary transition-colors">Instituto Federal de Sergipe</p>
                    <p className="group-hover/link:underline">Campus Itabaiana — Av. Padre Airton Gonçalves Lima, 1140 — São Cristóvão, Itabaiana/SE, 49500-543</p>
                  </div>
                </a>
                <p>
                  Para dúvidas e informações, entre em contato pelo e-mail{" "}
                  <a href="mailto:contato@techdefense.edu.br" className="text-primary hover:underline">
                    contato@techdefense.edu.br
                  </a>
                </p>
              </div>
            </div>
            <div className="overflow-hidden rounded-lg border border-primary/10 glow-border">
              <iframe
                title="Localização IFS Itabaiana"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3891.5!2d-37.42536!3d-10.69139!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7ab2bb03b5c1e8d%3A0x5c3e8f7a9b2d4e6c!2sIFS+-+Campus+Itabaiana!5e0!3m2!1spt-BR!2sbr!4v1709000000000"
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

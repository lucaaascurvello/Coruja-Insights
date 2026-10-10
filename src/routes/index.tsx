import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import mascote from "@/assets/mascote.png";
import qrCafezinho from "@/assets/qr-cafezinho.png.asset.json";
import fotoAutor from "@/assets/lucas-curvello.jpg.asset.json";
import { buildBookmarklet } from "@/lib/bookmarklet";
import { InstallationGuide } from "@/components/installation-guide";
import { BrowserCarousel } from "@/components/browser-carousel";
import { Button } from "@/components/ui/button";
import { Check, Copy, Github, Linkedin, Sparkles } from "lucide-react";

const PIX_CODE = "00020101021126580014br.gov.bcb.pix013602f1c965-4f88-4396-a8ca-8bab9e280f0f5204000053039865802BR5921LUCAS W C DE CARVALHO6007PALHOCA62070503***6304591A";
const LINKEDIN_URL = "https://www.linkedin.com/in/lucaascarvalho/";
const GITHUB_URL = "https://github.com/lucaaascurvello";
const LOVABLE_URL = "https://lovable.dev";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Coruja Insights — Análise grátis do seu Instagram" },
      { name: "description", content: "Ferramenta gratuita que analisa seu perfil do Instagram com IA e mostra quem não te segue de volta." },
      { property: "og:title", content: "Coruja Insights — Análise grátis do seu Instagram" },
      { property: "og:description", content: "Engajamento, melhores posts, público e quem não te segue de volta. Grátis e sem salvar nada." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const features = [
  ["📊", "Engajamento real", "Taxa de engajamento, média de interações e a publicação que mais bombou."],
  ["💬", "Quem mais interage", "Os seguidores que mais comentam e o comentário mais relevante."],
  ["🧠", "Insights com IA", "Público estimado (gênero, regiões) e dicas práticas para crescer."],
  ["👀", "Não te seguem de volta", "A cereja do bolo: veja quem você segue que não te segue, e pare de seguir com um clique."],
];

function Index() {
  const ref = useRef<HTMLAnchorElement>(null);
  const [copied, setCopied] = useState(false);
  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  useEffect(() => {
    ref.current?.setAttribute("href", buildBookmarklet(window.location.origin));
  }, []);

  return (
    <main className="min-h-screen overflow-hidden">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-sm font-medium tracking-wide">
          Coruja <span className="text-muted-foreground">Insights</span>
        </span>
        <a href="#cafe" className="text-sm text-muted-foreground transition hover:text-foreground">Cafezinho</a>
      </header>

      <section className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 pb-20 pt-10 md:grid-cols-2">
        <div className="grid-bg pointer-events-none absolute inset-0 -z-10 opacity-40 [mask-image:radial-gradient(circle,black,transparent_70%)]" />
        <div className="animate-rise">
          <span className="bg-brand shadow-glow animate-glow inline-flex items-center gap-2 rounded-full px-5 py-2 font-display text-sm font-bold uppercase tracking-wide text-primary-foreground"><Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />100% gratuito</span>
          <h1 className="mt-5 text-5xl font-bold leading-tight md:text-6xl">
            Seu Instagram, <span className="text-gradient">analisado</span> por uma corujinha esperta.
          </h1>
          <p className="mt-5 max-w-md text-lg text-muted-foreground">
            Abra qualquer perfil, clique no favorito e receba um mini relatório profissional na hora.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              ref={ref}
              href="#"
              onClick={(e) => { e.preventDefault(); document.getElementById("instalar")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); }}
              className="bg-brand shadow-glow rounded-2xl px-6 py-4 font-display font-bold text-primary-foreground transition hover:-translate-y-0.5"
            >
              🦉 Coruja Insights
            </a>
            <span className="text-sm text-muted-foreground">← arraste para a barra de favoritos</span>
          </div>
          <Button asChild variant="link" className="mt-3 h-auto p-0 text-muted-foreground"><a href="#instalar">Ver como instalar, passo a passo →</a></Button>
        </div>
        <img src={mascote} alt="Mascote coruja analista" width={1024} height={1024} className="animate-float mx-auto w-80 drop-shadow-2xl md:w-[26rem]" />
      </section>

      <BrowserCarousel />


      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-3xl font-bold">O que ela faz</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(([i, t, d], k) => (
            <div key={t} className="glass animate-rise rounded-3xl p-6 transition hover:-translate-y-1 hover:shadow-glow" style={{ animationDelay: `${k * 90}ms` }}>
              <div className="text-3xl">{i}</div>
              <h3 className="mt-4 font-semibold">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <InstallationGuide />

      <section id="cafe" className="mx-auto max-w-4xl scroll-mt-8 px-6 pb-24">
        <div className="glass shadow-glow overflow-hidden rounded-3xl">
          <div className="grid items-center gap-8 p-8 md:grid-cols-[11rem_1fr] md:p-10">
            <img
              src={fotoAutor.url}
              alt="Lucas Curvello"
              width={640}
              height={640}
              className="shadow-glow mx-auto h-44 w-44 rounded-3xl border border-border object-cover"
            />
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-accent">Um projeto caseiro</span>
              <h2 className="mt-2 text-3xl font-bold">Oi, sou <span className="text-gradient">Lucas Curvello</span></h2>
              <p className="mt-1 font-display text-lg">Analista de Redes Sociais e curioso por vibe code.</p>
              <p className="mt-4 text-sm text-muted-foreground">
                A Coruja Insights é um projeto feito em casa, para fins de estudo e para ajudar quem precisa dessas ferramentas de forma gratuita.
                Ela lê apenas dados públicos que o próprio Instagram mostra a você. Nenhum dado é guardado: ao fechar, tudo some.
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                Estimativas de público (gênero e regiões) são feitas por IA e servem só como referência. Não tem vínculo com o Instagram/Meta.
              </p>
            </div>
          </div>

          <div className="grid items-center gap-10 border-t border-border p-8 md:grid-cols-[13.5rem_1fr] md:p-10">
            <img
              src={qrCafezinho.url}
              width={216}
              height={216}
              alt="QR Code Pix para pagar um cafezinho"
              className="mx-auto h-[13.5rem] w-[13.5rem] rounded-2xl"
            />
            <div className="min-w-0">
              <span className="font-mono text-xs text-accent">APOIE O PROJETO</span>
              <h2 className="mt-3 text-3xl font-bold">Pague um cafezinho ☕</h2>
              <p className="mt-3 text-muted-foreground">
                Gostou da corujinha? Qualquer valor via Pix ajuda a mantê-la acordada e o projeto no ar.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button onClick={() => copy(PIX_CODE)}>
                  {copied ? <Check /> : <Copy />}
                  {copied ? "Código copiado" : "Copiar código Pix"}
                </Button>
                <span className="text-xs text-muted-foreground">ou escaneie o QR no app do banco</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-8 py-5 md:px-10">
            <span className="font-mono text-xs text-muted-foreground">ONDE ME ACHAR</span>
            <div className="flex flex-wrap items-center gap-2">
              {GITHUB_URL && (
                <Button asChild variant="outline" size="sm">
                  <a href={GITHUB_URL} target="_blank" rel="noreferrer"><Github className="h-3.5 w-3.5" />GitHub</a>
                </Button>
              )}
              <Button asChild variant="outline" size="sm">
                <a href={LINKEDIN_URL} target="_blank" rel="noreferrer"><Linkedin className="h-3.5 w-3.5" />LinkedIn</a>
              </Button>
              <p className="text-xs text-muted-foreground">
                Criado com <a href={LOVABLE_URL} target="_blank" rel="noreferrer" className="font-semibold text-foreground underline decoration-primary underline-offset-4">Lovable</a>
              </p>
            </div>
          </div>
        </div>
        <p className="mx-auto mt-10 max-w-2xl text-center text-xs leading-relaxed text-muted-foreground">
          © 2026 Lucas Curvello · Coruja Insights foi idealizada, desenhada e desenvolvida por ele, de forma
          independente, como projeto pessoal de estudo e sem fins comerciais — sem qualquer vínculo com o Instagram
          ou a Meta.
        </p>
      </section>
    </main>
  );
}

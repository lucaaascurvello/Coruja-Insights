import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import mascote from "@/assets/mascote-ghost.png";
import { buildBookmarklet } from "@/lib/bookmarklet";

const PIX_KEY = "seu-pix@email.com";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Boo Insights — Análise grátis do seu Instagram" },
      { name: "description", content: "Ferramenta gratuita que analisa seu perfil do Instagram com IA e mostra quem não te segue de volta." },
      { property: "og:title", content: "Boo Insights — Análise grátis do seu Instagram" },
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
  useEffect(() => {
    ref.current?.setAttribute("href", buildBookmarklet(window.location.origin));
  }, []);

  return (
    <main className="min-h-screen overflow-hidden">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 font-display font-bold">
          <span className="h-3 w-3 rounded-full bg-brand shadow-glow" /> Boo Insights
        </div>
        <a href="#cafe" className="text-sm text-muted-foreground transition hover:text-foreground">☕ Cafezinho</a>
      </header>

      <section className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 pb-20 pt-10 md:grid-cols-2">
        <div className="grid-bg pointer-events-none absolute inset-0 -z-10 opacity-40 [mask-image:radial-gradient(circle,black,transparent_70%)]" />
        <div className="animate-rise">
          <span className="glass inline-block rounded-full px-3 py-1 font-mono text-xs text-primary">100% gratuito · nada é salvo</span>
          <h1 className="mt-5 text-5xl font-bold leading-tight md:text-6xl">
            Seu Instagram, <span className="text-gradient">analisado</span> por um fantasminha espertinho.
          </h1>
          <p className="mt-5 max-w-md text-lg text-muted-foreground">
            Abra qualquer perfil, clique no favorito e receba um mini relatório profissional na hora.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              ref={ref}
              href="#"
              onClick={(e) => { e.preventDefault(); alert("Arraste este botão para a sua barra de favoritos 😉"); }}
              className="bg-brand shadow-glow rounded-2xl px-6 py-4 font-display font-bold text-primary-foreground transition hover:-translate-y-0.5"
            >
              👻 Boo Insights
            </a>
            <span className="text-sm text-muted-foreground">← arraste para a barra de favoritos</span>
          </div>
        </div>
        <img src={mascote} alt="Mascote fantasminha analista" width={1024} height={1024} className="animate-float mx-auto w-80 drop-shadow-2xl md:w-[26rem]" />
      </section>

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

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-3xl font-bold">Como usar</h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["Instale", "Mostre a barra de favoritos (Ctrl/Cmd + Shift + B) e arraste o botão 👻 para ela. Funciona no Chrome, Edge, Firefox, Brave, Opera e Safari."],
            ["Abra um perfil", "Entre no instagram.com já logado e abra o perfil que quer analisar — o seu ou qualquer outro público."],
            ["Clique no favorito", "O menu do Boo aparece por cima da página. Gere o relatório com IA e baixe. Para ver quem não te segue, abra o seu próprio perfil."],
          ].map(([t, d], k) => (
            <li key={t} className="glass rounded-3xl p-6">
              <span className="font-mono text-sm text-primary">0{k + 1}</span>
              <h3 className="mt-2 text-xl font-semibold">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm text-muted-foreground">
          Por que favorito e não extensão? Instalar extensão com um clique só é possível pelas lojas oficiais. O favorito funciona em qualquer navegador de computador, sem permissões extras.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h2 className="text-3xl font-bold">Um projeto caseiro 🏡</h2>
        <p className="mt-4 text-muted-foreground">
          O Boo Insights é um projeto feito em casa, para fins de estudo e para ajudar quem precisa dessas ferramentas de forma gratuita.
          Ele lê apenas dados públicos que o próprio Instagram mostra a você. Nenhum dado é guardado: ao fechar, tudo some — feito fantasma.
          Estimativas de público (gênero e regiões) são feitas por IA e servem só como referência. Não tem vínculo com o Instagram/Meta.
        </p>
      </section>

      <section id="cafe" className="mx-auto max-w-xl px-6 pb-24">
        <div className="glass shadow-glow rounded-3xl p-8 text-center">
          <div className="text-4xl">☕</div>
          <h2 className="mt-3 text-2xl font-bold">Pague um cafezinho</h2>
          <p className="mt-2 text-sm text-muted-foreground">Gostou? Qualquer valor via Pix ajuda o fantasminha a continuar assombrando de graça.</p>
          <button
            onClick={() => { navigator.clipboard.writeText(PIX_KEY); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="mt-6 w-full rounded-2xl border border-border bg-secondary px-4 py-4 font-mono text-sm transition hover:border-primary"
          >
            {copied ? "Chave Pix copiada ✓" : `Pix: ${PIX_KEY}  ·  copiar`}
          </button>
        </div>
        <p className="mt-10 text-center text-xs text-muted-foreground">
          Feito com carinho · <Link to="/relatorio" className="underline">exemplo de relatório</Link>
        </p>
      </section>
    </main>
  );
}

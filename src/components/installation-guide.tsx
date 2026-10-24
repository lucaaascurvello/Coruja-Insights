import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  Bookmark,
  Check,
  Globe,
  Grip,
  MousePointer2,
  PanelTop,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildBookmarklet } from "@/lib/bookmarklet";
import mascote from "@/assets/mascote.png";

type Browser = "chrome" | "firefox" | "safari";

function BrowserFrame({ children, address }: { children: React.ReactNode; address: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background">
      <div className="flex h-10 items-center gap-2 border-b border-border bg-secondary px-3">
        <span className="flex gap-1" aria-hidden="true">
          {[1, 2, 3].map((n) => (
            <span key={n} className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
          ))}
        </span>
        <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded bg-background px-2 py-1 text-[10px] text-muted-foreground">
          <Globe className="h-3 w-3 shrink-0" />
          <span className="truncate">{address}</span>
        </div>
        <Star className="h-3 w-3 shrink-0 text-muted-foreground" />
      </div>
      {children}
    </div>
  );
}

export function InstallationGuide() {
  const bookmark = useRef<HTMLAnchorElement>(null);
  const [browser, setBrowser] = useState<Browser>("chrome");
  useEffect(() => {
    bookmark.current?.setAttribute("href", buildBookmarklet(window.location.origin));
  }, []);

  return (
    <section id="instalar" className="mx-auto max-w-6xl scroll-mt-8 px-6 py-16">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <span className="font-mono text-xs text-accent">PRIMEIRO PASSO</span>
          <h2 className="mt-3 text-3xl font-bold">Sua coruja, a um clique.</h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Salve na barra de favoritos do seu navegador. Sem baixar arquivos e sem passar pela loja
            de extensões.
          </p>
        </div>
        <div
          className="flex flex-wrap gap-1 rounded-lg border border-border p-1"
          aria-label="Escolha seu navegador"
        >
          {(
            [
              ["chrome", "Chrome / Edge / outros"],
              ["firefox", "Firefox"],
              ["safari", "Safari"],
            ] as const
          ).map(([value, label]) => (
            <Button
              key={value}
              size="sm"
              variant={browser === value ? "secondary" : "ghost"}
              aria-pressed={browser === value}
              onClick={() => setBrowser(value)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <ol className="mt-10 grid gap-8 md:grid-cols-3">
        <li className="min-w-0">
          <BrowserFrame address="coruja insights">
            <div className="flex h-9 items-center gap-2 border-b border-dashed border-primary/60 bg-primary/10 px-3 text-[10px] text-primary">
              <Bookmark className="h-3 w-3" />
              Barra de favoritos
              <ArrowDown className="ml-auto h-3 w-3" />
            </div>
            <div className="flex h-40 flex-col items-center justify-center gap-3 px-4">
              <PanelTop className="h-8 w-8 text-accent" />
              <div className="flex flex-wrap justify-center gap-1.5 font-mono text-xs">
                {(browser === "safari" ? ["⌘", "Shift", "B"] : ["Ctrl / ⌘", "Shift", "B"]).map(
                  (key) => (
                    <kbd
                      key={key}
                      className="rounded border border-border bg-secondary px-2 py-1.5 text-foreground"
                    >
                      {key}
                    </kbd>
                  ),
                )}
              </div>
              <span className="text-[10px] text-muted-foreground">
                {browser === "safari"
                  ? "Mostrar barra de favoritos"
                  : "Mostrar barra de favoritos no navegador"}
              </span>
            </div>
          </BrowserFrame>
          <div className="mt-5 flex gap-3">
            <span className="font-mono text-lg text-primary">01</span>
            <div>
              <h3 className="font-semibold">Mostre a barra de favoritos</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {browser === "safari"
                  ? "No Safari, use ⌘ + Shift + B ou abra Visualizar → Mostrar Barra de Favoritos."
                  : browser === "firefox"
                    ? "No Firefox, use Ctrl + Shift + B (⌘ no Mac). Você também pode clicar com o botão direito no topo e escolher Barra de favoritos → Sempre mostrar."
                    : "Use Ctrl + Shift + B no Windows ou ⌘ + Shift + B no Mac. A barra aparece logo abaixo do endereço."}
              </p>
            </div>
          </div>
        </li>

        <li className="min-w-0">
          <BrowserFrame address="coruja insights">
            <div className="flex h-9 items-center gap-2 border-b border-border bg-primary/10 px-3 text-[10px]">
              <Star className="h-3 w-3 text-accent" />
              <span className="rounded border border-dashed border-primary/60 px-2 py-1 text-primary">
                Solte o favorito aqui
              </span>
            </div>
            <div className="relative flex h-40 flex-col items-center justify-center gap-3 px-4">
              <div className="installation-drag-path" aria-hidden="true">
                <ArrowDown className="h-4 w-4 rotate-180 text-primary" />
              </div>
              <Button
                asChild
                className="bg-brand shadow-glow h-auto whitespace-normal px-4 py-3 text-primary-foreground"
              >
                <a
                  ref={bookmark}
                  href="#instalar"
                  draggable
                  onClick={(e) => e.preventDefault()}
                  aria-label="Arraste Coruja Insights para sua barra de favoritos"
                >
                  <Grip />
                  🦉 Coruja Insights
                </a>
              </Button>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <MousePointer2 className="h-3 w-3" />
                Segure, arraste para cima e solte
              </span>
            </div>
          </BrowserFrame>
          <div className="mt-5 flex gap-3">
            <span className="font-mono text-lg text-primary">02</span>
            <div>
              <h3 className="font-semibold">Arraste a coruja para a barra</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                O botão acima é o favorito de verdade. Segure com o mouse, arraste até a barra do
                seu navegador e solte. Apenas clicar não instala.
              </p>
            </div>
          </div>
        </li>

        <li className="min-w-0">
          <BrowserFrame address="instagram.com/seuusuario">
            <div className="flex h-9 items-center border-b border-border bg-secondary px-3 text-[10px]">
              <span className="flex items-center gap-1 rounded bg-primary/15 px-2 py-1 text-primary">
                🦉 Coruja Insights
                <MousePointer2 className="h-3 w-3" />
              </span>
            </div>
            <div className="flex h-40 gap-3 p-4">
              <div className="flex min-w-0 flex-1 flex-col gap-2 pt-2" aria-hidden="true">
                <div className="h-7 w-7 rounded-full bg-muted" />
                <div className="h-1.5 w-16 rounded bg-muted" />
                <div className="grid grid-cols-3 gap-1">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <div key={n} className="aspect-square rounded-sm bg-secondary" />
                  ))}
                </div>
              </div>
              <div className="flex w-32 shrink-0 flex-col items-center rounded-md border border-border bg-card p-2">
                <img src={mascote} alt="" className="h-12 w-12 object-contain" />
                <span className="text-[10px] font-semibold">Coruja Insights</span>
                <span className="mt-2 flex items-center gap-1 text-[9px] text-accent">
                  <Check className="h-3 w-3" />
                  Perfil aberto
                </span>
                <div className="mt-2 h-1 w-full rounded-full bg-brand" />
              </div>
            </div>
          </BrowserFrame>
          <div className="mt-5 flex gap-3">
            <span className="font-mono text-lg text-primary">03</span>
            <div>
              <h3 className="font-semibold">Abra o Instagram e clique</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Entre na sua contado instagram, abra um perfil e espere as publicações aparecerem.
                Clique em 🦉 Coruja Insights na barra. Para ver quem não segue de volta, abra seu
                próprio perfil.
              </p>
            </div>
          </div>
        </li>
      </ol>
    </section>
  );
}

import brave from "@/assets/browsers/brave.svg";
import chrome from "@/assets/browsers/chrome.svg";
import edge from "@/assets/browsers/edge.svg";
import firefox from "@/assets/browsers/firefox.svg";
import opera from "@/assets/browsers/opera.svg";
import safari from "@/assets/browsers/safari.svg";
import vivaldi from "@/assets/browsers/vivaldi.svg";

const browsers = [
  { name: "Chrome", src: chrome },
  { name: "Edge", src: edge },
  { name: "Firefox", src: firefox },
  { name: "Safari", src: safari },
  { name: "Brave", src: brave },
  { name: "Opera", src: opera },
  { name: "Vivaldi", src: vivaldi },
];

function LogoRow({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul className="flex shrink-0 items-center gap-x-3 pr-3" aria-hidden={hidden || undefined}>
      {browsers.map((b) => (
        <li
          key={b.name}
          className="glass flex items-center gap-3 rounded-2xl px-5 py-3 transition duration-300 hover:-translate-y-0.5 hover:border-primary/60"
        >
          <img
            src={b.src}
            alt=""
            width={24}
            height={24}
            draggable={false}
            className="h-6 w-6 shrink-0 object-contain"
          />
          <span className="whitespace-nowrap font-display text-sm font-semibold">{b.name}</span>
        </li>
      ))}
    </ul>
  );
}

export function BrowserCarousel() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-6 pt-4" aria-labelledby="navegadores-title">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="font-mono text-xs text-accent">COMPATIBILIDADE</span>
        <h2 id="navegadores-title" className="text-lg font-semibold text-muted-foreground">
          Funciona no navegador que você já usa
        </h2>
      </div>

      <div className="marquee mt-6">
        <div className="marquee-track">
          <LogoRow />
          <LogoRow hidden />
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Se o seu navegador tem barra de favoritos, a coruja voa. Passe o mouse por cima para pausar.
      </p>
    </section>
  );
}

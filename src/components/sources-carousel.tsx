import meta from "@/assets/sources/meta.png";
import rivaliq from "@/assets/sources/rivaliq.png";
import socialinsider from "@/assets/sources/socialinsider.png";
import hypeauditor from "@/assets/sources/hypeauditor.png";
import hootsuite from "@/assets/sources/hootsuite.png";
import later from "@/assets/sources/later.png";

const sources = [
  { name: "Meta · Instagram Creators", logo: meta },
  { name: "Rival IQ", logo: rivaliq },
  { name: "Socialinsider", logo: socialinsider },
  { name: "HypeAuditor", logo: hypeauditor },
  { name: "Hootsuite", logo: hootsuite },
  { name: "Later", logo: later },
];

function Row({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul className="flex shrink-0 items-center gap-x-3 pr-3" aria-hidden={hidden || undefined}>
      {sources.map((s) => (
        <li
          key={s.name}
          className="glass flex items-center gap-3 rounded-2xl px-5 py-3 font-display text-sm font-semibold whitespace-nowrap transition duration-300 hover:-translate-y-0.5 hover:border-primary/60"
        >
          <img
            src={s.logo}
            alt={hidden ? "" : `Logo ${s.name}`}
            width={28}
            height={28}
            loading="lazy"
            className="h-7 w-7 rounded-lg bg-foreground object-contain p-0.5"
          />
          {s.name}
        </li>
      ))}
    </ul>
  );
}

export function SourcesCarousel({ className = "mt-14" }: { className?: string }) {
  return (
    <section className={className} aria-labelledby="fontes-title">
      <span className="font-mono text-xs text-accent">BASE DE DADOS</span>
      <h2 id="fontes-title" className="text-lg font-semibold text-muted-foreground">
        Referências de mercado usadas pela IA
      </h2>
      <div className="marquee mt-5">
        <div className="marquee-track">
          <Row />
          <Row hidden />
        </div>
      </div>
    </section>
  );
}

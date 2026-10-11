const sources = ["Meta · Instagram Creators", "Rival IQ", "Socialinsider", "HypeAuditor", "Hootsuite", "Later"];

function Row({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul className="flex shrink-0 items-center gap-x-3 pr-3" aria-hidden={hidden || undefined}>
      {sources.map((s) => (
        <li key={s} className="glass rounded-2xl px-5 py-3 font-display text-sm font-semibold whitespace-nowrap transition duration-300 hover:-translate-y-0.5 hover:border-primary/60">
          {s}
        </li>
      ))}
    </ul>
  );
}

export function SourcesCarousel() {
  return (
    <section className="mt-14" aria-labelledby="fontes-title">
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

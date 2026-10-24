import { Check, Lock } from "lucide-react";

const GITHUB_URL = "https://github.com/lucaaascurvello/Coruja-Insights";

const PROMESAS = ["Não pede senha", "Não guarda nada", "Não publica nada", "Só vê o que você vê"];

export function SecuritySeal() {
  return (
    <div className="glass rounded-2xl px-6 py-5">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
        <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-seal/35 bg-seal/10">
          <Lock className="h-5 w-5 text-seal" />
          <span className="bg-seal absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background">
            <Check className="h-2.5 w-2.5 text-seal-foreground" />
          </span>
        </span>

        <div className="min-w-0">
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-seal">
            Selo de segurança
          </span>
          <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5">
            {PROMESAS.map((p) => (
              <li key={p} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Check className="h-3.5 w-3.5 shrink-0 text-seal" />
                {p}
              </li>
            ))}
          </ul>
          <p className="mt-2.5 text-xs text-muted-foreground/70">
            Todo o projeto é código aberto e está disponível no GitHub:{" "}
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="text-seal underline decoration-seal/40 underline-offset-4 hover:decoration-seal"
            >
              github.com/lucaaascurvello/Coruja-Insights
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

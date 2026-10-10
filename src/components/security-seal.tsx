import { Check, ShieldCheck } from "lucide-react";
import owlIcon from "@/assets/owl-icon.png";

const PROMESAS: { t: string; d: string }[] = [
  { t: "Não pede a sua senha", d: "Ela usa a aba em que você já entrou. Nada de digitar credencial em lugar nenhum." },
  { t: "Não guarda nada", d: "Fechou a aba, o que foi lido desaparece. Sem histórico, sem cadastro, sem e-mail." },
  { t: "Não publica nada", d: "Ela lê e mostra. Não curte, não comenta, não posta, não segue ninguém sozinha." },
  { t: "Só vê o que você vê", d: "Se um dado não aparece para a sua conta, a corujinha também não tem como ler." },
];

export function SecuritySeal() {
  return (
    <div className="glass shadow-glow overflow-hidden rounded-3xl p-7 md:p-9">
      <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:gap-10">
        <div className="relative h-44 w-44 shrink-0">
          <svg viewBox="0 0 200 200" className="h-full w-full" role="img" aria-label="Selo Coruja Insights">
            <defs>
              <linearGradient id="seal-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" style={{ stopColor: "var(--glow)" }} />
                <stop offset="55%" style={{ stopColor: "var(--ring)" }} />
                <stop offset="100%" style={{ stopColor: "var(--coral)" }} />
              </linearGradient>
              <path id="seal-ring" d="M100,100 m-71,0 a71,71 0 1,1 142,0 a71,71 0 1,1 -142,0" />
            </defs>

            <circle cx="100" cy="100" r="95" fill="none" stroke="url(#seal-grad)" strokeWidth="1" opacity=".45" />
            {TICKS.map((t, i) => (
              <line
                key={i}
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                stroke="url(#seal-grad)"
                strokeWidth="1.2"
                opacity=".5"
              />
            ))}
            <circle cx="100" cy="100" r="84" fill="none" stroke="url(#seal-grad)" strokeWidth="3" />
            <circle cx="100" cy="100" r="58" fill="none" stroke="url(#seal-grad)" strokeWidth="1" strokeDasharray="3 6" opacity=".55" />

            <text
              style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: 1.8, fill: "var(--accent)" }}
            >
              <textPath href="#seal-ring" startOffset="1%">
                CORUJA INSIGHTS · SEM GUARDAR NADA
              </textPath>
            </text>
          </svg>

          <img
            src={owlIcon}
            alt=""
            className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-[58%] drop-shadow-[0_0_14px_var(--glow)]"
          />
          <span className="bg-brand absolute bottom-[26%] left-1/2 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full border border-background/70 shadow-glow">
            <ShieldCheck className="h-4 w-4 text-primary-foreground" />
          </span>
        </div>

        <div className="min-w-0">
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-accent">Selo de segurança</span>
          <h2 className="mt-1.5 text-2xl font-bold">O que a corujinha promete — e você pode conferir</h2>

          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {PROMESAS.map((p) => (
              <li key={p.t} className="flex gap-2.5">
                <span className="bg-brand mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </span>
                <span>
                  <span className="font-display text-sm font-semibold">{p.t}</span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-muted-foreground">{p.d}</span>
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            Para o texto do relatório, vão para a IA o nome do perfil, a bio e os números das publicações lidas.
            Nada disso fica guardado depois, e nenhuma das suas listas sai do seu navegador.
          </p>

          <p className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
            Autodeclaração, não certificação: a Coruja Insights é um projeto de estudo, sem auditoria de empresa
            externa. A garantia de verdade é o comportamento — e o código do favorito está inteiro no endereço dele,
            pronto para você colar em uma aba e ler.
          </p>
        </div>
      </div>
    </div>
  );
}

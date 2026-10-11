import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SecuritySeal } from "@/components/security-seal";
import openaiLogo from "@/assets/openai.svg";
import { BENCHMARKS, KNOWLEDGE, SOURCES } from "@/lib/ig-knowledge";

export const Route = createFileRoute("/como-funciona")({
  head: () => ({
    meta: [
      { title: "Como a Coruja Insights funciona — coleta, análise e base de conhecimento" },
      { name: "description", content: "O caminho completo da corujinha: o que ela lê na sua aba do Instagram, como os números são calculados e por que a IA não pode inventar nada." },
      { property: "og:title", content: "Como a Coruja Insights funciona" },
      { property: "og:description", content: "Coleta de dados, cálculo dos fatos, comparação com o mercado e a base de conhecimento que limita a IA." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ComoFunciona,
});

const RESUMO = [
  ["Roda na sua aba", "O script executa dentro do próprio Instagram, na sua sessão. Nada é instalado no computador."],
  ["Lê o que já é seu", "Só dados que a sua conta consegue ver na tela: perfil, publicações e as suas listas de seguidores."],
  ["A conta vem antes", "Os números são calculados por código. A IA só comenta o que já foi medido."],
];

type Item = { t: string; d: string; ai?: boolean };
type Step = { n: string; label: string; title: string; lead: string; items: Item[] };

const STEPS: Step[] = [
  {
    n: "01",
    label: "ONDE ELA RODA",
    title: "Um favorito com um script dentro",
    lead: "A Coruja Insights não é programa instalado nem extensão de loja: é um atalho da barra de favoritos que carrega o próprio código no endereço dele. Você arrasta uma vez e ele vira um botão.",
    items: [
      { t: "Sessão própria", d: "Ao clicar, o código roda dentro da aba do Instagram em que você já está logado. Ele enxerga exatamente o que a sua conta enxerga — nem um dado a mais." },
      { t: "Sem servidor de coleta", d: "Não há cadastro, histórico, banco de dados nem envio das suas listas para nenhum armazenamento. As únicas coisas que saem da sua aba são os números do perfil analisado, para a IA gerar o texto do relatório." },
      { t: "Duradouro só na aba", d: "Fechou a aba, o que foi lido desaparece. Por isso, se a análise for interrompida no meio, o botão Continuar funciona apenas enquanto a aba estiver aberta." },
    ],
  },
  {
    n: "02",
    label: "COMO ELA CAPTA OS DADOS",
    title: "Lendo a página que você já abriu",
    lead: "Nada de pedir a sua senha nem de usar uma API paralela. A corujinha lê as mesmas informações que o Instagram entrega para você, no ritmo do site.",
    items: [
      { t: "Perfil", d: "Nome, foto, bio, categoria, contadores de seguidores, seguindo e publicações, se a conta é pública ou privada e se é profissional. Isso vem dos dados que a própria página carrega. Se o Instagram bloqueia a consulta (o erro de limite 429), ela tenta de novo e, se não der, usa os números que já estão na tela." },
      { t: "Publicações", d: "As publicações recentes são abertas uma por uma, com pausas entre elas, e as curtidas e comentários são lidos do texto que o próprio Instagram mostra em cada foto. Se o perfil esconde as curtidas, o campo aparece como indisponível — nunca como zero." },
      { t: "Seguidores e seguindo", d: "As duas listas são percorridas em blocos, no mesmo ritmo do site, com pausa quando o Instagram pede trégua." },
      { t: "Quem não segue de volta", d: "Ela compara quem você segue com quem te segue, conferindo o código e o nome de usuário de cada pessoa. Quando o Instagram não libera a comparação direta, ela confere pessoa por pessoa, com quatro buscas ao mesmo tempo. Se a leitura vier incompleta, o app avisa em vez de mostrar uma lista errada." },
      { t: "Parar de seguir", d: "O clique faz o pedido de desfazer e depois lê a situação da amizade para conferir se parou de fato. Sem confirmação, a linha não é marcada como feita." },
    ],
  },
  {
    n: "03",
    label: "COMO VIRA ANÁLISE",
    title: "Primeiro a conta, depois a IA",
    lead: "A ordem importa: nenhuma opinião é formada antes de os números existirem. É assim que a ferramenta evita advice genérico e número inventado.",
    items: [
      { t: "Passo 1 · A matemática", d: "Código puro calcula: quantos posts foram lidos, o número típico de interações, se os resultados variam muito, comentários a cada 100 curtidas, posts por semana, a maior pausa sem postar, se as interações estão subindo ou caindo, Reels contra fotos, e o melhor dia e a melhor faixa de horário — estes dois últimos só quando pelo menos 3 posts sustentam a média." },
      { t: "Passo 2 · A comparação", d: "A sua taxa de engajamento é posicionada na faixa de referência de contas do mesmo tamanho: abaixo, dentro ou acima da média." },
      { t: "Passo 3 · A IA", ai: true, d: "A análise e a redação dos insights são feitas pelo GPT-6 Astra, da OpenAI. O modelo recebe apenas os números calculados, a base de conhecimento e a referência de mercado. Ele devolve pontos fortes e melhorias, e cada item precisa citar o número que o sustenta, além de um nível de confiança: alta, média ou baixa." },
      { t: "Passo 4 · O filtro", d: "Antes de chegar ao relatório, toda evidência é conferida. Se o número citado na dica não bate com os seus dados, a dica é descartada — e o documento informa quantas saíram." },
    ],
  },
];

const TIERS = ["nano", "micro", "medio", "macro", "mega"];

const RULES = KNOWLEDGE
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => /^\d+\./.test(l))
  .map((l) => {
    const i = l.indexOf(".");
    return { n: l.slice(0, i), t: l.slice(i + 1).trim() };
  });

const LIMITES: Item[] = [
  { t: "O que ela não faz", d: "Não pede nem usa a sua senha, não publica, não curte, não baixa fotos, não guarda histórico e não monta cadastro seu." },
  { t: "Depende do Instagram", d: "Tudo que ela lê é o que a sua conta consegue ver na tela, e o limite de uso do próprio Instagram pode interromper a leitura. Daí as pausas, o contador de tempo e o botão Continuar." },
  { t: "Conta pessoal", d: "Sem conta Profissional não há alcance, salvamentos nem público por idade e cidade. A ferramenta recomenda migrar (é gratuito), mas não tem como calcular o que não aparece." },
  { t: "Aproximação, não contabilidade", d: "O engajamento calculado em público (curtidas e comentários sobre seguidores) não é o mesmo número do painel oficial. Serve para comparar e ver tendência, não para fechar balanço." },
  { t: "O que saiu de propósito", d: "Estimativas de gênero e de regiões a partir de nomes ficaram de fora do relatório: eram chute, não dado. Preferimos um relatório menor a um relatório inventado." },
];

function ComoFunciona() {
  return (
    <main className="min-h-screen overflow-hidden">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <span className="font-display text-sm font-medium tracking-wide">
          Coruja <span className="text-muted-foreground">Insights</span>
        </span>
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao início
        </Link>
      </header>

      <section className="relative mx-auto max-w-3xl px-6 pb-14 pt-6">
        <div className="grid-bg pointer-events-none absolute inset-0 -z-10 opacity-30 [mask-image:radial-gradient(circle,black,transparent_70%)]" />
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-accent">Como funciona</span>
        <h1 className="animate-rise mt-3 text-4xl font-bold leading-tight">
          Da aba aberta ao <span className="text-gradient">relatório</span>, sem inventar nada
        </h1>
        <p className="mt-5 max-w-2xl text-muted-foreground">
          A Coruja Insights lê a página do Instagram que você já abriu, calcula os números por código e só
          então pede um texto para a IA. Abaixo está o caminho inteiro: onde o código roda, o que ele lê,
          como vira análise e qual base de conhecimento ele tem permissão de usar.
        </p>

        <div className="glass shadow-glow mt-8 grid gap-6 rounded-3xl p-7 sm:grid-cols-3">
          {RESUMO.map(([t, d]) => (
            <div key={t}>
              <h2 className="font-display text-sm font-semibold">{t}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-12">
        <SecuritySeal />
      </section>

      {STEPS.map((s) => (
        <section key={s.n} className="mx-auto max-w-3xl px-6 pb-12">
          <div className="glass overflow-hidden rounded-3xl">
            <div className="flex items-start gap-5 border-b border-border p-7">
              <span className="font-mono text-3xl font-bold leading-none text-gradient">{s.n}</span>
              <div>
                <span className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-accent">{s.label}</span>
                <h2 className="mt-1.5 text-2xl font-bold">{s.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.lead}</p>
              </div>
            </div>
            <dl className="divide-y divide-border">
              {s.items.map((it) => (
                <div key={it.t} className="grid gap-1.5 p-7 md:grid-cols-[9.5rem_1fr] md:gap-6">
                  <dt className="font-display text-sm font-semibold">{it.t}</dt>
                  <dd className="text-sm leading-relaxed text-muted-foreground">
                    {it.ai && (
                      <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-xs font-medium text-foreground">
                        <img src={openaiLogo} alt="Logo da OpenAI" className="h-4 w-4" />
                        Feito com GPT-6 Astra · OpenAI
                      </span>
                    )}
                    <span className="block">{it.d}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      ))}

      <section className="mx-auto max-w-3xl px-6 pb-12">
        <div className="glass overflow-hidden rounded-3xl">
          <div className="border-b border-border p-7">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-accent">04 · BANCO DE CONHECIMENTO</span>
            <h2 className="mt-1.5 text-2xl font-bold">A base que ensina a IA a analisar</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              A IA não recebe opinião de blog de marketing: ela recebe uma base escrita à mão, com 12 regras
              de boas práticas e faixas de referência por tamanho de conta. Uma regra só pode ser aplicada
              quando a condição dela aparece nos seus números — se não aparece, a dica não pode existir.
            </p>
          </div>

          <ol className="divide-y divide-border">
            {RULES.map((r) => (
              <li key={r.n} className="grid gap-1.5 p-6 md:grid-cols-[2.5rem_1fr] md:gap-4">
                <span className="font-mono text-sm text-accent">{r.n}</span>
                <span className="text-sm leading-relaxed text-muted-foreground">{r.t}</span>
              </li>
            ))}
          </ol>

          <div className="border-t border-border p-7">
            <h3 className="font-display text-sm font-semibold">Faixas de engajamento usadas como referência</h3>
            <div className="mt-4 overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="bg-card/60 text-left font-mono text-[0.7rem] uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Tamanho da conta</th>
                    <th className="px-4 py-2.5 font-medium">Faixa de referência</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {TIERS.map((k) => {
                    const b = BENCHMARKS[k];
                    if (!b) return null;
                    return (
                      <tr key={k}>
                        <td className="px-4 py-2.5">{b.label}</td>
                        <td className="px-4 py-2.5 font-mono text-accent">{b.min}% – {b.max}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <h3 className="mt-8 font-display text-sm font-semibold">De onde vêm essas faixas</h3>
            <ul className="mt-3 space-y-1.5">
              {SOURCES.map((s) => (
                <li key={s} className="text-sm leading-relaxed text-muted-foreground">{s}</li>
              ))}
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              São estudos públicos de mercado, com números aproximados e que mudam de ano para ano. Por isso
              aparecem como referência de comparação, nunca como veredito sobre o seu perfil.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-12">
        <div className="glass overflow-hidden rounded-3xl">
          <div className="border-b border-border p-7">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-accent">05 · LIMITES</span>
            <h2 className="mt-1.5 text-2xl font-bold">Onde a corujinha para</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Preferimos dizer onde a ferramenta é fraca a deixar você descobrir sozinho no meio de uma análise.
            </p>
          </div>
          <dl className="divide-y divide-border">
            {LIMITES.map((it) => (
              <div key={it.t} className="grid gap-1.5 p-7 md:grid-cols-[9.5rem_1fr] md:gap-6">
                <dt className="font-display text-sm font-semibold">{it.t}</dt>
                <dd className="text-sm leading-relaxed text-muted-foreground">
                    {it.ai && (
                      <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-xs font-medium text-foreground">
                        <img src={openaiLogo} alt="Logo da OpenAI" className="h-4 w-4" />
                        Feito com GPT-6 Astra · OpenAI
                      </span>
                    )}
                    <span className="block">{it.d}</span>
                  </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-24">
        <div className="glass shadow-glow flex flex-wrap items-center justify-between gap-5 rounded-3xl p-7">
          <div>
            <h2 className="text-xl font-bold">Pronto para ver na prática?</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Instale o favorito, abra um perfil e clique na corujinha.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/">
                Voltar para a página principal <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <a href="/#instalar">Ver como instalar</a>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

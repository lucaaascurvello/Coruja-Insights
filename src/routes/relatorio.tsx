import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import mascote from "@/assets/mascote.png";
import { analyzeProfile, type AiReport } from "@/lib/analyze.functions";

export const Route = createFileRoute("/relatorio")({
  head: () => ({
    meta: [
      { title: "Relatório — Coruja Insights" },
      { name: "description", content: "Mini relatório do perfil do Instagram gerado na hora com IA. Nada é armazenado." },
      { property: "og:title", content: "Relatório — Coruja Insights" },
      { property: "og:description", content: "Mini relatório do perfil do Instagram gerado com IA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Relatorio,
});

type Data = any;
const fmt = (n: number) => (n || 0).toLocaleString("pt-BR");

function Relatorio() {
  const [d, setD] = useState<Data | null>(null);
  const [ai, setAi] = useState<AiReport | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiProg, setAiProg] = useState(0);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.data?.type !== "coruja:data") return;
      setD(e.data.payload);
    };
    window.addEventListener("message", onMsg);
    window.opener?.postMessage("coruja:ready", "https://www.instagram.com");
    return () => window.removeEventListener("message", onMsg);
  }, []);

  useEffect(() => {
    if (!d) return;
    setLoading(true);
    setAiProg(8);
    const tick = setInterval(() => setAiProg((p) => (p < 90 ? p + Math.max(1, (90 - p) / 6) : p)), 700);
    const slim = { ...d, posts: d.posts?.slice(0, 12) };
    analyzeProfile({ data: slim })
      .then((r) => (r.report ? setAi(r.report) : setErr(r.error || "Erro")))
      .catch(() => setErr("Não foi possível gerar a análise agora."))
      .finally(() => {
        clearInterval(tick);
        setAiProg(100);
        setTimeout(() => setLoading(false), 400);
      });
  }, [d]);

  const download = () => {
    const html = `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Relatório @${d.username}</title><link rel="icon" type="image/png" href="${location.origin}/favicon.png"><style>body{font-family:system-ui;max-width:760px;margin:40px auto;padding:0 20px;color:#1a2230}h1{margin:0}h2{margin-top:28px;color:#0a8aa0}li{margin:6px 0}</style>` +
      document.getElementById("report")!.innerHTML + "</html>";
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    a.download = `relatorio-${d.username}.html`;
    a.click();
  };

  if (!d) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <img src={mascote} alt="Coruja" width={1024} height={1024} className="animate-float w-48" />
        <h1 className="mt-6 text-2xl font-bold">Esperando dados do Instagram…</h1>
        <p className="mt-2 max-w-md text-muted-foreground">Esta página abre sozinha quando você clica em “Gerar relatório” no menu da coruja dentro do Instagram.</p>
        <Link to="/" className="mt-6 text-primary underline">Como instalar</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center justify-between">
        <span className="font-display font-bold">🦉 Coruja Insights</span>
        <button onClick={download} disabled={!ai} className="bg-brand rounded-xl px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-40">Baixar relatório</button>
      </div>

      <div id="report" className="animate-rise mt-8">
        <h1 className="text-4xl font-bold">@{d.username}</h1>
        <p className="text-muted-foreground">{d.fullName} {d.category ? `· ${d.category}` : ""}</p>

        {!d.isBusiness && (
          <p className="mt-4 rounded-2xl border border-accent/40 bg-accent/10 p-4 text-sm">💡 Conta não Profissional: análise feita só com dados públicos. Recomendamos migrar para conta Profissional/Business.</p>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[["Seguidores", fmt(d.followers)], ["Engajamento", `${d.engagementRate}%`], ["Média interações", fmt(d.avgInteractions)], ["Publicações", fmt(d.postsCount)]].map(([k, v]) => (
            <div key={k} className="glass rounded-2xl p-4"><small className="text-xs uppercase text-muted-foreground">{k}</small><div className="text-2xl font-bold">{v}</div></div>
          ))}
        </div>

        {d.topPost && (<><h2 className="mt-8 text-xl font-bold">Publicação que mais engajou</h2>
          <p className="text-muted-foreground">❤ {fmt(d.topPost.likes)} · 💬 {fmt(d.topPost.comments)} — <a className="text-primary" href={`https://instagram.com/p/${d.topPost.code}`} target="_blank" rel="noreferrer">instagram.com/p/{d.topPost.code}</a></p>
          {d.topPost.caption && <p className="mt-1 text-sm italic text-muted-foreground">“{d.topPost.caption}”</p>}</>)}

        {d.topComment && (<><h2 className="mt-8 text-xl font-bold">Comentário mais relevante</h2>
          <p className="text-muted-foreground">@{d.topComment.user}: “{d.topComment.text}” ({d.topComment.likes} curtidas)</p></>)}

        {d.engagedUsers?.length > 0 && (<><h2 className="mt-8 text-xl font-bold">Usuários mais engajados</h2>
          <ul className="mt-2 flex flex-wrap gap-2">{d.engagedUsers.map((u: any) => <li key={u.user} className="glass rounded-full px-3 py-1 text-sm">@{u.user} · {u.count}</li>)}</ul></>)}

        {loading && (
          <div className="mt-10">
            <p className="animate-pulse text-primary">A coruja está analisando com IA…</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div className="bg-brand h-2 rounded-full transition-all duration-700" style={{ width: `${aiProg}%` }} />
            </div>
          </div>
        )}
        {err && <p className="mt-10 text-destructive">{err}</p>}

        {ai && (() => { const st = ai.stats; const n = (v: number | null, suf = "") => (v == null ? "—" : `${v.toLocaleString("pt-BR")}${suf}`);
          const conf = { alta: "Confiança alta", media: "Confiança média", baixa: "Confiança baixa" } as const;
          const fatos: [string, string][] = [
            ["Posts analisados", String(st.sample)],
            ["Mediana de interações", n(st.medianInteractions)],
            ["Variação entre posts", n(st.variation, "%")],
            ["Comentários a cada 100 curtidas", n(st.commentLikeRatio)],
            ["Posts por semana", n(st.postsPerWeek)],
            ["Maior pausa sem postar", st.longestGapDays == null ? "—" : `${st.longestGapDays} dias`],
            ["Tendência (últimos 6 vs 6 anteriores)", st.trendPct == null ? "—" : `${st.trendPct > 0 ? "+" : ""}${st.trendPct}%`],
            ["Reels", `${st.formats.reels.posts} posts · ${n(st.formats.reels.avgInteractions)} média`],
            ["Fotos/carrosséis", `${st.formats.fotos.posts} posts · ${n(st.formats.fotos.avgInteractions)} média`],
            ["Melhor dia", st.bestWeekday ? `${st.bestWeekday.dia} (${st.bestWeekday.posts} posts)` : "amostra pequena"],
            ["Melhor horário (Brasília)", st.bestTimeSlot ? `${st.bestTimeSlot.faixa} (${st.bestTimeSlot.posts} posts)` : "amostra pequena"],
          ];
          return (<div className="animate-rise">
          <h2 className="mt-10 text-xl font-bold">Resumo</h2><p className="text-muted-foreground">{ai.resumo}</p>
          {ai.benchmark && <p className="glass mt-4 rounded-2xl p-4 text-sm">Referência de mercado para contas com {ai.benchmark.faixa}: {ai.benchmark.min}% a {ai.benchmark.max}%. Seu engajamento está <b className="text-primary">{ai.benchmark.posicao} da média</b>.</p>}
          <h2 className="mt-8 text-xl font-bold">Fatos do perfil</h2>
          <p className="text-xs text-muted-foreground">Calculados direto das publicações, sem IA.</p>
          <dl className="mt-3 grid gap-2 sm:grid-cols-2">{fatos.map(([k, v]) => <div key={k} className="glass flex justify-between gap-3 rounded-xl px-4 py-2 text-sm"><dt className="text-muted-foreground">{k}</dt><dd className="font-semibold">{v}</dd></div>)}</dl>
          {ai.pontos_fortes.length > 0 && (<><h2 className="mt-8 text-xl font-bold">Pontos fortes</h2>
            <ul className="mt-2 space-y-2">{ai.pontos_fortes.map((x) => <li key={x.texto} className="glass rounded-xl p-3 text-sm"><p>{x.texto}</p><p className="mt-1 text-xs text-muted-foreground">Dado: {x.evidencia}</p></li>)}</ul></>)}
          <h2 className="mt-8 text-xl font-bold">Recomendações</h2>
          <ul className="mt-2 space-y-3">{ai.melhorias.map((m) => <li key={m.acao} className="glass rounded-xl p-4 text-sm">
            <div className="flex items-start justify-between gap-3"><b>{m.acao}</b><span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">{conf[m.confianca]}</span></div>
            <p className="mt-1 text-muted-foreground">{m.motivo}</p><p className="mt-1 text-xs text-accent">Dado: {m.evidencia}</p></li>)}</ul>
          {ai.descartados > 0 && <p className="mt-3 text-xs text-muted-foreground">{ai.descartados} sugestão(ões) da IA foram descartadas por citar números que não batem com os dados.</p>}
          {st.sample < 8 && <p className="mt-3 text-xs text-accent">Amostra pequena ({st.sample} posts): trate as conclusões com cautela.</p>}
          <p className="mt-8 text-xs text-muted-foreground">Gênero e localização do público só ficam disponíveis no Instagram Insights (conta Profissional) — não estimamos para não inventar.</p>
          <p className="mt-2 text-xs text-muted-foreground">Referências: {ai.sources.join(" · ")}.</p>
        </div>); })()}
      </div>
      <p className="mt-12 text-center text-xs text-muted-foreground">Nada foi salvo. Ao fechar esta aba, o relatório some.</p>
    </main>
  );
}

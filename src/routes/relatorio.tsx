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
    const slim = { ...d, posts: d.posts?.slice(0, 12) };
    analyzeProfile({ data: slim })
      .then((r) => (r.report ? setAi(r.report) : setErr(r.error || "Erro")))
      .catch(() => setErr("Não foi possível gerar a análise agora."))
      .finally(() => setLoading(false));
  }, [d]);

  const download = () => {
    const html = `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Relatório @${d.username}</title><style>body{font-family:system-ui;max-width:760px;margin:40px auto;padding:0 20px;color:#1a2230}h1{margin:0}h2{margin-top:28px;color:#0a8aa0}li{margin:6px 0}</style>` +
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

        {ai && (<div className="animate-rise">
          <h2 className="mt-10 text-xl font-bold">Resumo</h2><p className="text-muted-foreground">{ai.resumo}</p>
          <h2 className="mt-8 text-xl font-bold">Público (estimativa por IA)</h2>
          <p className="text-muted-foreground">{ai.publico}</p>
          <p className="mt-2">👨 Homens {ai.genero.homens}% · 👩 Mulheres {ai.genero.mulheres}% · ❔ Indefinido {ai.genero.indefinido}%</p>
          <ul className="mt-3 space-y-2">{ai.regioes.map((r) => (
            <li key={r.nome}><div className="flex justify-between text-sm"><span>{r.nome}</span><span>{r.percentual}%</span></div>
              <div className="h-2 rounded-full bg-muted"><div className="bg-brand h-2 rounded-full" style={{ width: `${Math.min(100, r.percentual)}%` }} /></div></li>))}</ul>
          <h2 className="mt-8 text-xl font-bold">Pontos fortes</h2><ul className="list-disc pl-5 text-muted-foreground">{ai.pontos_fortes.map((x) => <li key={x}>{x}</li>)}</ul>
          <h2 className="mt-8 text-xl font-bold">Insights de melhoria</h2><ul className="list-disc pl-5 text-muted-foreground">{ai.melhorias.map((x) => <li key={x}>{x}</li>)}</ul>
          <h2 className="mt-8 text-xl font-bold">Melhor horário</h2><p className="text-muted-foreground">{ai.melhor_horario}</p>
        </div>)}
      </div>
      <p className="mt-12 text-center text-xs text-muted-foreground">Nada foi salvo. Ao fechar esta aba, o relatório some.</p>
    </main>
  );
}

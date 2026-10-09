/* Self-contained script injected on instagram.com via bookmark.
   Must not reference anything outside its own body (it's serialized with toString). */
function corujaScript(ORIGIN: string) {
  const W = window as any;
  if (!/instagram\.com$/.test(location.hostname)) {
    alert("Abra um perfil no instagram.com e clique no favorito novamente.");
    return;
  }
  if (W.__coruja) { W.__coruja.remove(); W.__coruja = null; }
  const username = location.pathname.split("/").filter(Boolean)[0];
  if (!username || ["explore", "reels", "direct", "p", "stories", "accounts"].includes(username)) {
    alert("Abra a página de um perfil (ex: instagram.com/seuusuario).");
    return;
  }
  const H: Record<string, string> = { "x-ig-app-id": "936619743392459", "x-requested-with": "XMLHttpRequest" };
  const csrf = (document.cookie.match(/csrftoken=([^;]+)/) || [])[1] || "";
  const viewerId = (document.cookie.match(/ds_user_id=([^;]+)/) || [])[1] || "";
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const get = async (u: string) => {
    const r = await fetch(u, { headers: H, credentials: "include" });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return r.json();
  };
  const fmt = (n: number) => (n || 0).toLocaleString("pt-BR");
  const esc = (s: any) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" } as any)[c]);

  const host = document.createElement("div");
  host.style.cssText = "position:fixed;top:20px;right:20px;z-index:2147483647;";
  const root = host.attachShadow({ mode: "open" });
  document.body.appendChild(host);
  W.__coruja = host;

  root.innerHTML = `<style>
  *{box-sizing:border-box;font-family:Manrope,system-ui,sans-serif}
  .p{width:380px;max-height:86vh;overflow:auto;background:rgba(22,28,40,.94);backdrop-filter:blur(16px);color:#eef4f8;border:1px solid rgba(255,255,255,.1);border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,.5),0 0 50px -10px rgba(80,220,240,.4);animation:in .5s cubic-bezier(.2,.7,.2,1)}
  @keyframes in{from{opacity:0;transform:translateY(-12px) scale(.97)}to{opacity:1;transform:none}}
  @keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
  .h{display:flex;align-items:center;gap:10px;padding:16px 18px;border-bottom:1px solid rgba(255,255,255,.08)}
  .h b{font-size:15px}.h span{font-size:11px;color:#8fa3b5}
  .dot{width:10px;height:10px;border-radius:50%;background:linear-gradient(120deg,#5fe0ef,#ff7a59);box-shadow:0 0 12px #5fe0ef}
  .x{margin-left:auto;background:none;border:0;color:#8fa3b5;font-size:20px;cursor:pointer}
  .b{padding:16px 18px}
  .g{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .c{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:12px}
  .c small{display:block;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#8fa3b5}
  .c strong{font-size:18px}
  .w{margin-top:10px;padding:10px 12px;border-radius:12px;background:rgba(255,122,89,.12);border:1px solid rgba(255,122,89,.3);font-size:12px;color:#ffc2b0}
  .btn{width:100%;margin-top:10px;padding:12px;border:0;border-radius:12px;font-weight:700;cursor:pointer;font-size:13px;transition:transform .2s}
  .btn:hover{transform:translateY(-1px)}
  .pr{background:linear-gradient(120deg,#5fe0ef,#ff7a59);color:#141a26}
  .sc{background:rgba(255,255,255,.07);color:#eef4f8;border:1px solid rgba(255,255,255,.1)}
  .l{font-size:12px;color:#8fa3b5;animation:pulse 1.4s infinite;padding:8px 0}
  .row{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:13px}
  .row img{width:30px;height:30px;border-radius:50%}
  .row a{color:#eef4f8;text-decoration:none;flex:1;overflow:hidden;text-overflow:ellipsis}
  .u{background:rgba(255,122,89,.15);color:#ff9d82;border:1px solid rgba(255,122,89,.35);border-radius:8px;padding:5px 9px;font-size:11px;cursor:pointer}
  .u[disabled]{opacity:.5}
  h4{margin:16px 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#5fe0ef}
  </style>
  <div class="p"><div class="h"><div class="dot"></div><div><b>Coruja Insights</b><br><span>@${esc(username)}</span></div><button class="x" id="x">×</button></div>
  <div class="b" id="b"><div class="l">Coletando dados públicos do perfil…</div></div></div>`;
  const $ = (s: string) => root.querySelector(s) as HTMLElement;
  $("#x").onclick = () => { host.remove(); W.__coruja = null; };
  const body = $("#b");

  (async () => {
    let data: any;
    try {
      const info = await get(`/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`);
      const u = info.data.user;
      const posts = (u.edge_owner_to_timeline_media?.edges || []).map((e: any) => ({
        id: e.node.id,
        code: e.node.shortcode,
        likes: e.node.edge_liked_by?.count ?? e.node.edge_media_preview_like?.count ?? 0,
        comments: e.node.edge_media_to_comment?.count ?? 0,
        views: e.node.video_view_count || 0,
        video: !!e.node.is_video,
        ts: e.node.taken_at_timestamp,
        caption: (e.node.edge_media_to_caption?.edges?.[0]?.node?.text || "").slice(0, 200),
      }));
      const followers = u.edge_followed_by?.count || 0;
      const avg = posts.length ? posts.reduce((a: number, p: any) => a + p.likes + p.comments, 0) / posts.length : 0;
      const er = followers ? (avg / followers) * 100 : 0;
      const top = [...posts].sort((a: any, b: any) => b.likes + b.comments - (a.likes + a.comments))[0];
      data = {
        username, fullName: u.full_name, bio: u.biography, category: u.category_name,
        followers, following: u.edge_follow?.count || 0, postsCount: u.edge_owner_to_timeline_media?.count || 0,
        isBusiness: !!(u.is_business_account || u.is_professional_account), isPrivate: !!u.is_private,
        isOwn: viewerId && viewerId === u.id, userId: u.id,
        engagementRate: +er.toFixed(2), avgInteractions: Math.round(avg), posts, topPost: top || null,
        engagedUsers: [], topComment: null, followerNames: [],
      };
      render(data);
      // comments of top posts
      const users: Record<string, number> = {};
      let best: any = null;
      for (const p of [...posts].sort((a: any, b: any) => b.comments - a.comments).slice(0, 5)) {
        try {
          const c = await get(`/api/v1/media/${p.id}/comments/?can_support_threading=true&permalink_enabled=false`);
          for (const cm of c.comments || []) {
            const n = cm.user?.username; if (n && n !== username) users[n] = (users[n] || 0) + 1;
            if (!best || (cm.comment_like_count || 0) > best.likes) best = { user: n, text: (cm.text || "").slice(0, 300), likes: cm.comment_like_count || 0, post: p.code };
          }
        } catch {}
        await sleep(400);
      }
      data.engagedUsers = Object.entries(users).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([user, count]) => ({ user, count }));
      data.topComment = best;
      try {
        const f = await get(`/api/v1/friendships/${u.id}/followers/?count=100&search_surface=follow_list_page`);
        data.followerNames = (f.users || []).map((x: any) => x.full_name || x.username).slice(0, 100);
      } catch {}
      render(data);
    } catch (e: any) {
      body.innerHTML = `<div class="w">Não foi possível ler este perfil (${esc(e.message)}). Verifique se está logado e se o perfil é público.</div>`;
    }
  })();

  function render(d: any) {
    body.innerHTML = `
    <div class="g">
      <div class="c"><small>Seguidores</small><strong>${fmt(d.followers)}</strong></div>
      <div class="c"><small>Engajamento</small><strong>${d.engagementRate}%</strong></div>
      <div class="c"><small>Seguindo</small><strong>${fmt(d.following)}</strong></div>
      <div class="c"><small>Publicações</small><strong>${fmt(d.postsCount)}</strong></div>
    </div>
    ${d.isBusiness ? "" : `<div class="w">💡 Esta conta não é Profissional/Business. A análise usa só dados públicos. Recomendamos mudar para conta Profissional para ter métricas mais completas.</div>`}
    ${d.topPost ? `<h4>Publicação que mais engajou</h4><div class="c" style="font-size:13px">❤ ${fmt(d.topPost.likes)} · 💬 ${fmt(d.topPost.comments)}<br><a style="color:#5fe0ef" target="_blank" href="/p/${d.topPost.code}/">Ver publicação →</a></div>` : ""}
    ${d.engagedUsers.length ? `<h4>Mais engajados</h4>${d.engagedUsers.map((x: any) => `<div class="row"><a target="_blank" href="/${esc(x.user)}/">@${esc(x.user)}</a><span>${x.count} coment.</span></div>`).join("")}` : `<div class="l">Lendo comentários…</div>`}
    <button class="btn pr" id="ai">✨ Gerar relatório completo com IA</button>
    ${d.isOwn ? `<button class="btn sc" id="nf">👀 Quem não me segue de volta</button><div id="nfl"></div>` : `<div class="w" style="background:rgba(95,224,239,.08);border-color:rgba(95,224,239,.25);color:#bdf3f9">Para ver quem não te segue de volta, abra o <b>seu próprio</b> perfil.</div>`}`;
    $("#ai").onclick = () => openReport(d);
    const nf = root.querySelector("#nf") as HTMLElement | null;
    if (nf) nf.onclick = () => nonFollowers(d.userId);
  }

  function openReport(d: any) {
    const win = window.open(ORIGIN + "/relatorio", "coruja_relatorio");
    const onMsg = (ev: MessageEvent) => {
      if (ev.origin !== ORIGIN || ev.data !== "coruja:ready") return;
      win?.postMessage({ type: "coruja:data", payload: d }, ORIGIN);
      window.removeEventListener("message", onMsg);
    };
    window.addEventListener("message", onMsg);
  }

  async function listAll(id: string, kind: string, cb: (n: number) => void) {
    const out: any[] = []; let max = "";
    for (let i = 0; i < 60; i++) {
      const r = await get(`/api/v1/friendships/${id}/${kind}/?count=200${max ? "&max_id=" + max : ""}`);
      out.push(...(r.users || [])); cb(out.length);
      if (!r.next_max_id) break; max = r.next_max_id; await sleep(900);
    }
    return out;
  }

  async function nonFollowers(id: string) {
    const box = $("#nfl");
    box.innerHTML = `<div class="l" id="st">Lendo quem você segue…</div>`;
    try {
      const st = () => root.querySelector("#st") as HTMLElement;
      const following = await listAll(id, "following", (n) => (st().textContent = `Lendo quem você segue… ${n}`));
      const followers = await listAll(id, "followers", (n) => (st().textContent = `Lendo seus seguidores… ${n}`));
      const set = new Set(followers.map((u) => u.pk || u.id));
      const list = following.filter((u) => !set.has(u.pk || u.id));
      box.innerHTML = `<h4>${list.length} não te seguem de volta</h4>` + list.map((u) =>
        `<div class="row"><img src="${esc(u.profile_pic_url)}" referrerpolicy="no-referrer"><a target="_blank" href="/${esc(u.username)}/">@${esc(u.username)}</a><button class="u" data-id="${esc(u.pk || u.id)}">Deixar de seguir</button></div>`).join("") +
        `<div class="w">Vá com calma: deixar de seguir muitas contas rápido pode fazer o Instagram limitar sua conta temporariamente.</div>`;
      box.querySelectorAll<HTMLButtonElement>(".u").forEach((b) => (b.onclick = async () => {
        b.disabled = true; b.textContent = "…";
        try {
          const r = await fetch(`/api/v1/friendships/destroy/${b.dataset.id}/`, {
            method: "POST", credentials: "include",
            headers: { ...H, "x-csrftoken": csrf, "content-type": "application/x-www-form-urlencoded" },
          });
          b.textContent = r.ok ? "Feito ✓" : "Erro";
        } catch { b.textContent = "Erro"; b.disabled = false; }
      }));
    } catch (e: any) {
      box.innerHTML = `<div class="w">Não deu para carregar a lista (${esc(e.message)}). Tente novamente em alguns minutos.</div>`;
    }
  }
}

export function buildBookmarklet(origin: string) {
  return "javascript:" + encodeURIComponent(`(${corujaScript.toString()})(${JSON.stringify(origin)});void 0;`);
}

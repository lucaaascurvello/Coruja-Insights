import designStyles from "@/styles.css?raw";

/* Self-contained script injected on instagram.com via bookmark.
   Must not reference anything outside its own body (it's serialized with toString). */
function corujaScript(ORIGIN: string, theme: string) {
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
  H["x-csrftoken"] = csrf;
  H["x-asbd-id"] = "129477";
  try { H["x-ig-www-claim"] = sessionStorage.getItem("www-claim-v2") || "0"; } catch { H["x-ig-www-claim"] = "0"; }
  const get = async (u: string, tries = 4): Promise<any> => {
    let last = 0;
    for (let i = 0; i < tries; i++) {
      const r = await fetch(u, { headers: H, credentials: "include" });
      if (r.ok) return r.json();
      last = r.status;
      if (r.status !== 429 && r.status < 500) break;
      const st = root.querySelector(".l");
      if (st) st.textContent = `Instagram pediu uma pausa… tentando de novo (${i + 1}/${tries})`;
      await sleep(2500 * Math.pow(2, i));
    }
    throw new Error("HTTP " + last);
  };
  // Parse "1,2 mil", "12.5K", "3M", "1.234" etc.
  const num = (s: string): number => {
    if (!s) return 0;
    const t = s.toLowerCase().replace(/\s/g, "");
    const m = t.match(/([\d.,]+)(k|m|mi|mil|b)?/);
    if (!m) return 0;
    let v = m[1] || "";
    const suf = m[2] || "";
    if (suf) v = v.replace(",", ".");
    else v = v.replace(/[.,](?=\d{3}(\D|$))/g, "").replace(",", ".");
    const n = parseFloat(v) || 0;
    const mult = suf === "k" || suf === "mil" ? 1e3 : suf === "m" || suf === "mi" ? 1e6 : suf === "b" ? 1e9 : 1;
    return Math.round(n * mult);
  };
  // Read data already embedded on the page (no network = no 429)
  const fromPage = (): any => {
    let user: any = null;
    const media: any[] = [];
    const seen = new Set<string>();
    const walk = (o: any, depth: number) => {
      if (!o || typeof o !== "object" || depth > 40) return;
      if (Array.isArray(o)) { for (const x of o) walk(x, depth + 1); return; }
      if (o.username === username && (o.follower_count != null || o.edge_followed_by)) {
        user = { ...(user || {}), ...o };
      }
      const code = o.code || o.shortcode;
      if (code && (o.like_count != null || o.comment_count != null || o.edge_liked_by) && !seen.has(code)) {
        const owner = o.user?.username || o.owner?.username;
        if (!owner || owner === username) {
          seen.add(code);
          media.push({
            node: {
              id: String(o.pk || o.id || "").split("_")[0], shortcode: code,
              edge_liked_by: { count: o.like_count ?? o.edge_liked_by?.count ?? 0 },
              edge_media_to_comment: { count: o.comment_count ?? o.edge_media_to_comment?.count ?? 0 },
              video_view_count: o.play_count || o.view_count || o.video_view_count || 0,
              is_video: o.media_type === 2 || !!o.is_video,
              taken_at_timestamp: o.taken_at || o.taken_at_timestamp,
              edge_media_to_caption: { edges: [{ node: { text: o.caption?.text || "" } }] },
            },
          });
        }
      }
      for (const k in o) walk(o[k], depth + 1);
    };
    document.querySelectorAll('script[type="application/json"]').forEach((s) => {
      const t = s.textContent || "";
      if (!t.includes(username)) return;
      try { walk(JSON.parse(t), 0); } catch {}
    });
    // DOM / meta fallback
    const meta = (document.querySelector('meta[property="og:description"]') as HTMLMetaElement)?.content
      || (document.querySelector('meta[name="description"]') as HTMLMetaElement)?.content || "";
    const pick = (re: RegExp) => { const m = meta.match(re); return m ? num(m[1] || "") : 0; };
    const header = document.querySelector("header");
    const hdr = (re: RegExp) => {
      const links = header ? Array.from(header.querySelectorAll("a, li, span")) : [];
      for (const el of links) {
        const tx = (el as HTMLElement).innerText || "";
        if (re.test(tx)) {
          const titled = el.querySelector("[title]")?.getAttribute("title");
          return num(titled || tx);
        }
      }
      return 0;
    };
    const followers = user?.follower_count ?? user?.edge_followed_by?.count
      ?? (pick(/([\d.,]+\s*(?:k|m|mil|mi)?)\s*(?:followers|seguidores)/i) || hdr(/seguidores|followers/i));
    const following = user?.following_count ?? user?.edge_follow?.count
      ?? (pick(/([\d.,]+\s*(?:k|m|mil|mi)?)\s*(?:following|seguindo)/i) || hdr(/seguindo|following/i));
    const postsCount = user?.media_count ?? user?.edge_owner_to_timeline_media?.count
      ?? (pick(/([\d.,]+\s*(?:k|m|mil|mi)?)\s*(?:posts|publicaç)/i) || hdr(/publicaç|posts/i));
    // Grid scan: always merge counts found in alt / aria-label / visible text
    const cnt = (tx: string, re: RegExp) => { const m = tx.match(re); return m ? num(m[1] || "") : 0; };
    const byCode: Record<string, any> = {};
    media.forEach((m) => (byCode[m.node.shortcode] = m));
    document.querySelectorAll('main a[href*="/p/"], main a[href*="/reel/"]').forEach((a) => {
      const code = (a.getAttribute("href") || "").split("/").filter(Boolean).find((_, i, arr) => arr[i - 1] === "p" || arr[i - 1] === "reel");
      if (!code) return;
      const alt = a.querySelector("img")?.getAttribute("alt") || "";
      const tx = [alt, a.getAttribute("aria-label") || "", (a as HTMLElement).innerText || "", a.querySelector("[aria-label]")?.getAttribute("aria-label") || ""].join(" ");
      const likes = cnt(tx, /([\d.,]+\s*(?:mil|mi|k|m)?)\s*(?:curtidas?|likes?)/i);
      const comments = cnt(tx, /([\d.,]+\s*(?:mil|mi|k|m)?)\s*(?:coment[aá]rios?|comments?)/i);
      const isVideo = (a.getAttribute("href") || "").includes("/reel/");
      let m = byCode[code];
      if (!m) {
        m = { node: { id: "", shortcode: code, is_video: isVideo, edge_liked_by: { count: 0 }, edge_media_to_comment: { count: 0 }, edge_media_to_caption: { edges: [{ node: { text: alt } }] } } };
        byCode[code] = m; seen.add(code); media.push(m);
      }
      if (!m.node.edge_liked_by.count && likes) m.node.edge_liked_by.count = likes;
      if (!m.node.edge_media_to_comment.count && comments) m.node.edge_media_to_comment.count = comments;
    });
    const html = document.documentElement.innerHTML;
    const un = username.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const idMatch = html.match(/"profile_id":"(\d+)"|profilePage_(\d+)/)
      || html.match(new RegExp(`"username":"${un}"[^}]{0,400}?"id":"?(\\d+)`))
      || html.match(new RegExp(`"id":"?(\\d+)"?,"username":"${un}"`));
    const id = user?.pk || user?.id || (idMatch && (idMatch[1] || idMatch[2])) || "";
    if (!followers && !user) return null;
    return {
      id: String(id), full_name: user?.full_name || (document.title.split("(")[0] || "").trim(), biography: user?.biography || "",
      category_name: user?.category_name || user?.category || "",
      is_business_account: user?.is_business_account || user?.is_business, is_professional_account: user?.is_professional_account,
      is_private: user?.is_private,
      edge_followed_by: { count: followers }, edge_follow: { count: following },
      edge_owner_to_timeline_media: { count: postsCount, edges: media.slice(0, 24) },
    };
  };
  const hasLikes = (p: any) => p?.edge_owner_to_timeline_media.edges.some((e: any) => e.node.edge_liked_by.count > 0);
  // Read each post's public page meta ("123 likes, 4 comments") — same as opening the post normally
  const enrichFromPosts = async (p: any) => {
    const edges = p.edge_owner_to_timeline_media.edges.slice(0, 12);
    for (let i = 0; i < edges.length; i++) {
      const n = edges[i].node;
      try {
        (window as any).__corujaProg?.(15 + Math.round((i / edges.length) * 22), `Lendo curtidas das publicações… (${i + 1}/${edges.length})`);
        const r = await fetch(`/p/${n.shortcode}/`, { credentials: "include" });
        if (r.ok) {
          const h = await r.text();
          const m = h.match(/<meta[^>]+(?:property="og:description"|name="description")[^>]+content="([^"]+)"/i);
          const d = (m?.[1] || "").replace(/&#064;|&#x40;/g, "@");
          const l = d.match(/([\d.,]+\s*(?:mil|mi|k|m)?)\s*(?:curtidas?|likes?)/i);
          const c = d.match(/([\d.,]+\s*(?:mil|mi|k|m)?)\s*(?:coment[aá]rios?|comments?)/i);
          if (l) n.edge_liked_by.count = num(l[1] || "");
          if (c) n.edge_media_to_comment.count = num(c[1] || "");
          if (!n.id) { const id = h.match(/"media_id":"(\d+)"|instagram:\/\/media\?id=(\d+)/); if (id) n.id = id[1] || id[2]; }
        }
      } catch {}
      await sleep(350);
    }
  };
  const getProfile = async (): Promise<any> => {
    const p = fromPage();
    if (p && p.id && hasLikes(p)) return p;
    try {
      const u = (await get(`/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`, 1)).data.user;
      if (u && (hasLikes(u) || !p)) return u;
      if (u && p && !p.id) p.id = u.id;
    } catch (e) {
      if (!p) throw e;
    }
    if (!p) throw new Error("sem dados");
    if (!hasLikes(p)) await enrichFromPosts(p);
    if (!hasLikes(p)) p.likesHidden = true;
    return p;
  };
  const fmt = (n: number) => (n || 0).toLocaleString("pt-BR");
  const esc = (s: any) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" } as any)[c]);

  const host = document.createElement("div");
  host.style.cssText = "position:fixed;top:20px;right:20px;z-index:2147483647;";
  const root = host.attachShadow({ mode: "open" });
  document.body.appendChild(host);
  W.__coruja = host;

  root.innerHTML = `<style>
  ${theme}
  *{box-sizing:border-box;font-family:Manrope,system-ui,sans-serif}
  .p{width:380px;max-width:calc(100vw - 40px);max-height:86vh;overflow:auto;background:color-mix(in oklab,var(--background) 96%,transparent);backdrop-filter:blur(16px);color:var(--foreground);border:1px solid var(--border);border-radius:20px;box-shadow:var(--shadow-glow);animation:in .5s cubic-bezier(.2,.7,.2,1)}
  @keyframes in{from{opacity:0;transform:translateY(-12px) scale(.97)}to{opacity:1;transform:none}}
  @keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
  .h{display:flex;align-items:center;gap:10px;padding:16px 18px;border-bottom:1px solid var(--border)}
  .h b{font-size:15px}.h span{font-size:11px;color:var(--muted-foreground)}
  .dot{width:10px;height:10px;border-radius:50%;background:var(--gradient-brand);box-shadow:var(--shadow-glow)}
  .x{margin-left:auto;background:none;border:0;color:var(--muted-foreground);font-size:20px;cursor:pointer}
  .b{padding:16px 18px}
  .g{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .c{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:12px}
  .c small{display:block;font-size:10px;text-transform:uppercase;letter-spacing:0;color:var(--muted-foreground)}
  .c strong{font-size:18px}
  .w{margin-top:10px;padding:10px 12px;border-radius:12px;background:color-mix(in oklab,var(--accent) 12%,transparent);border:1px solid color-mix(in oklab,var(--accent) 30%,transparent);font-size:12px;color:var(--accent)}
  .info{background:color-mix(in oklab,var(--primary) 10%,transparent);border-color:color-mix(in oklab,var(--primary) 30%,transparent);color:var(--foreground)}
  .btn{width:100%;margin-top:10px;padding:12px;border:0;border-radius:12px;font-weight:700;cursor:pointer;font-size:13px;transition:transform .2s}
  .btn:hover{transform:translateY(-1px)}
  .pr{background:var(--gradient-brand);color:var(--primary-foreground);text-shadow:var(--shadow-glow)}
  .sc{background:var(--secondary);color:var(--secondary-foreground);border:1px solid var(--border)}
  .l{font-size:12px;color:var(--muted-foreground);animation:pulse 1.4s infinite;padding:8px 0}
  .bar{height:6px;border-radius:99px;background:var(--muted);overflow:hidden;margin:4px 0 8px}
  .bar i{display:block;height:100%;border-radius:99px;background:var(--gradient-brand);transition:width .45s ease}
  .row{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px}
  .row .av{position:relative;flex:none;width:36px;height:36px;border-radius:50%;background:var(--gradient-brand);display:grid;place-items:center;font-weight:700;color:var(--primary-foreground);overflow:hidden}
  .row .av img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
  .row small{color:var(--muted-foreground);margin-left:4px}
  .row a{color:var(--foreground);text-decoration:none;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis}
  .u{background:color-mix(in oklab,var(--primary) 15%,transparent);color:var(--foreground);border:1px solid color-mix(in oklab,var(--primary) 35%,transparent);border-radius:8px;padding:5px 9px;font-size:11px;cursor:pointer}
  .u[disabled]{opacity:.5}
  h4{margin:16px 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:0;color:var(--accent)}
  .post-link{color:var(--accent)}
  .btn:focus-visible,.u:focus-visible,.x:focus-visible{outline:2px solid var(--ring);outline-offset:3px}
  @media(prefers-reduced-motion:reduce){.p,.l{animation:none}.btn,.bar i{transition:none}}
  </style>
  <div class="p"><div class="h"><div class="dot"></div><div><b>Coruja Insights</b><br><span>@${esc(username)}</span></div><button class="x" id="x">×</button></div>
  <div class="b" id="b"><div class="l" id="pl">Coletando dados públicos do perfil…</div><div class="bar"><i id="pb" style="width:6%"></i></div></div></div>`;
  const prog = (p: number, t?: string) => {
    const b = root.querySelector("#pb") as HTMLElement | null;
    if (b) b.style.width = p + "%";
    const l = root.querySelector("#pl");
    if (l && t) l.textContent = t;
  };
  (window as any).__corujaProg = prog;
  const $ = (s: string) => root.querySelector(s) as HTMLElement;
  $("#x").onclick = () => { host.remove(); W.__coruja = null; };
  const body = $("#b");

  (async () => {
    let data: any;
    try {
      prog(15, "Lendo dados do perfil…");
      const u = await getProfile();
      prog(40, "Calculando métricas…");
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
      const likesHidden = !!u.likesHidden || (posts.length > 0 && posts.every((p: any) => p.likes + p.comments === 0));
      const avg = posts.length ? posts.reduce((a: number, p: any) => a + p.likes + p.comments, 0) / posts.length : 0;
      const er = followers ? (avg / followers) * 100 : 0;
      const top = [...posts].sort((a: any, b: any) => b.likes + b.comments - (a.likes + a.comments))[0];
      data = {
        username, fullName: u.full_name, bio: u.biography, category: u.category_name,
        followers, following: u.edge_follow?.count || 0, postsCount: u.edge_owner_to_timeline_media?.count || 0,
        isBusiness: !!(u.is_business_account || u.is_professional_account), isPrivate: !!u.is_private,
        isOwn: (viewerId && String(viewerId) === String(u.id))
          || !!document.querySelector('a[href*="/accounts/edit"]')
          || Array.from(document.querySelectorAll("header a, header button, header span")).some((el) => /editar perfil|edit profile/i.test((el as HTMLElement).textContent || "")),
        userId: u.id,
        likesHidden,
        engagementRate: likesHidden ? null : +er.toFixed(2), avgInteractions: likesHidden ? null : Math.round(avg), posts, topPost: likesHidden ? null : top || null,
        engagedUsers: [], topComment: null, followerNames: [],
      };
      render(data);
      // comments of top posts
      const users: Record<string, number> = {};
      let best: any = null;
      const topCommented = [...posts].filter((p: any) => p.id).sort((a: any, b: any) => b.comments - a.comments).slice(0, 5);
      let ci = 0, commentsOk = false;
      for (const p of topCommented) {
        prog(45 + Math.round((ci++ / Math.max(1, topCommented.length)) * 35), `Lendo comentários… (${ci}/${topCommented.length})`);
        try {
          const c = await get(`/api/v1/media/${p.id}/comments/?can_support_threading=true&permalink_enabled=false`);
          commentsOk = true;
          for (const cm of c.comments || []) {
            const n = cm.user?.username; if (n && n !== username) users[n] = (users[n] || 0) + 1;
            if (!best || (cm.comment_like_count || 0) > best.likes) best = { user: n, text: (cm.text || "").slice(0, 300), likes: cm.comment_like_count || 0, post: p.code };
          }
        } catch {}
        await sleep(400);
      }
      data.engagedUsers = Object.entries(users).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([user, count]) => ({ user, count }));
      data.topComment = best;
      data.commentsDone = true;
      data.commentsFailed = !commentsOk;
      prog(85, "Lendo amostra de seguidores…");
      try {
        const f = await get(`/api/v1/friendships/${u.id}/followers/?count=100&search_surface=follow_list_page`);
        data.followerNames = (f.users || []).map((x: any) => x.full_name || x.username).slice(0, 100);
      } catch {}
      prog(100, "Análise pronta! ✨");
      await sleep(500);
      render(data);
    } catch (e: any) {
      body.innerHTML = `<div class="w">${String(e.message).includes("429") ? "O Instagram limitou temporariamente as consultas da sua conta (erro 429). Isso acontece após muitos acessos seguidos: aguarde de 10 a 30 minutos e recarregue a página antes de tentar de novo." : "Não consegui ler os dados desta página. Role a página do perfil até aparecerem as publicações, recarregue (F5) e clique no favorito de novo."}</div>`;
    }
  })();

  function render(d: any) {
    body.innerHTML = `
    <div class="g">
      <div class="c"><small>Seguidores</small><strong>${fmt(d.followers)}</strong></div>
      <div class="c"><small>Engajamento</small><strong>${d.engagementRate == null ? "—" : d.engagementRate + "%"}</strong></div>
      <div class="c"><small>Seguindo</small><strong>${fmt(d.following)}</strong></div>
      <div class="c"><small>Publicações</small><strong>${fmt(d.postsCount)}</strong></div>
    </div>
    ${d.likesHidden ? `<div class="w info">O Instagram ocultou as curtidas nesta leitura, então engajamento e publicação em destaque ficam indisponíveis. O relatório com IA ainda funciona.</div>` : ""}
    ${d.isBusiness ? "" : `<div class="w">💡 Esta conta não é Profissional/Business. A análise usa só dados públicos. Recomendamos mudar para conta Profissional para ter métricas mais completas.</div>`}
    ${d.topPost ? `<h4>Publicação que mais engajou</h4><div class="c" style="font-size:13px">❤ ${fmt(d.topPost.likes)} · 💬 ${fmt(d.topPost.comments)}<br><a class="post-link" target="_blank" href="/p/${d.topPost.code}/">Ver publicação →</a></div>` : ""}
    ${d.engagedUsers.length ? `<h4>Mais engajados</h4>${d.engagedUsers.map((x: any) => `<div class="row"><a target="_blank" href="/${esc(x.user)}/">@${esc(x.user)}</a><span>${x.count} coment.</span></div>`).join("")}` : d.commentsDone ? (d.commentsFailed ? `<div class="l" style="animation:none">Comentários indisponíveis nesta leitura (o Instagram limitou o acesso).</div>` : "") : `<div class="l">Lendo comentários…</div>`}
    <button class="btn pr" id="ai">✨ Gerar relatório completo com IA</button>
    ${d.isOwn ? `<button class="btn sc" id="nf">👀 Quem não me segue de volta</button><div id="nfl"></div>` : `<div class="w info">Para ver quem não te segue de volta, abra o <b>seu próprio</b> perfil.</div>`}`;
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

  async function listRest(id: string, kind: string, cb: (n: number) => void) {
    const out: any[] = []; let max = "";
    for (let i = 0; i < 100; i++) {
      const r = await get(`/api/v1/friendships/${id}/${kind}/?count=200${max ? "&max_id=" + max : ""}`, 3);
      out.push(...(r.users || [])); cb(out.length);
      if (!r.next_max_id) break; max = r.next_max_id; await sleep(500);
    }
    return out;
  }
  async function listGql(id: string, kind: string, cb: (n: number) => void) {
    const hash = kind === "followers" ? "c76146de99bb02f6415203be841dd25a" : "d04b0a864b4b54837c0d870b0e77e076";
    const key = kind === "followers" ? "edge_followed_by" : "edge_follow";
    const out: any[] = []; let after = "";
    for (let i = 0; i < 100; i++) {
      const vars = JSON.stringify({ id, include_reel: true, fetch_mutual: false, first: 50, ...(after ? { after } : {}) });
      const r = await get(`/graphql/query/?query_hash=${hash}&variables=${encodeURIComponent(vars)}`, 3);
      const e = r?.data?.user?.[key];
      if (!e) throw new Error("HTTP 404");
      out.push(...e.edges.map((x: any) => ({ pk: x.node.id, username: x.node.username, profile_pic_url: x.node.profile_pic_url })));
      cb(out.length);
      if (!e.page_info?.has_next_page) break; after = e.page_info.end_cursor; await sleep(1200);
    }
    return out;
  }
  async function listAll(id: string, kind: string, cb: (n: number) => void) {
    try { return await listRest(id, kind, cb); }
    catch { return await listGql(id, kind, cb); }
  }

  async function nonFollowers(id: string) {
    const box = $("#nfl");
    box.innerHTML = `<div class="l" id="st">Lendo quem você segue…</div><div class="bar"><i id="nb" style="width:3%"></i></div>`;
    try {
      // On your own profile, the login cookie holds the exact account ID.
      if (viewerId) id = viewerId;
      if (!id) {
        const u = (await get(`/api/v1/users/web_profile_info/?username=${encodeURIComponent(String(username))}`, 2)).data.user;
        id = u?.id ? String(u.id) : "";
        if (!id) throw new Error("ID do perfil não encontrado");
      }
      const st = () => root.querySelector("#st") as HTMLElement;
      const nb = (p: number) => { const b = root.querySelector("#nb") as HTMLElement | null; if (b) b.style.width = p + "%"; };
      const total = 0;
      const following = await listAll(id, "following", (n) => { st().textContent = `Lendo quem você segue… ${n}${total ? " de " + total : ""}`; nb(Math.min(60, 3 + (total ? (n / total) * 57 : n / 20))); });
      const uid = (u: any) => String(u.pk ?? u.pk_id ?? u.id ?? "");
      // Check only the people you follow: does each one follow you back?
      const back = new Map<string, boolean>();
      const ids = following.map(uid).filter(Boolean);
      const tok = (document.cookie.match(/csrftoken=([^;]+)/) || [])[1] || csrf;
      let bulkOk = true;
      for (let i = 0; i < ids.length && bulkOk; i += 100) {
        const chunk = ids.slice(i, i + 100);
        st().textContent = `Conferindo quem te segue de volta… ${Math.min(i + 100, ids.length)} de ${ids.length}`;
        nb(60 + Math.round((i / Math.max(1, ids.length)) * 38));
        try {
          const r = await fetch("/api/v1/friendships/show_many/", {
            method: "POST", credentials: "include",
            headers: { ...H, "x-csrftoken": tok, "content-type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ user_ids: chunk.join(",") }).toString(),
          });
          if (!r.ok) throw new Error();
          const j = await r.json();
          const fs = j.friendship_statuses || {};
          for (const k of chunk) if (fs[k]) back.set(k, fs[k].followed_by === true);
          if (i + 100 < ids.length) await sleep(400);
        } catch { bulkOk = false; }
      }
      if (!bulkOk || back.size < ids.length * 0.9) {
        // Fallback: compare against the full followers list
        const followers = await listAll(id, "followers", (n) => { st().textContent = `Lendo seus seguidores… ${n}`; nb(Math.min(97, 60 + n / 30)); });
        const fset = new Set(followers.map(uid));
        for (const k of ids) if (!back.has(k)) back.set(k, fset.has(k));
      }
      nb(100);
      const list = following.filter((u) => back.get(uid(u)) === false);
      const pic = (u: any) => u.profile_pic_url || u.hd_profile_pic_url_info?.url || "";
      box.innerHTML = `<h4>${list.length} não te seguem de volta</h4>` + list.map((u) =>
        `<div class="row"><span class="av">${esc(String(u.username || "?")[0].toUpperCase())}<img src="${esc(pic(u))}" referrerpolicy="no-referrer" loading="lazy" alt="" onerror="this.remove()"></span><a target="_blank" href="/${esc(u.username)}/">@${esc(u.username)}${u.full_name ? `<small> ${esc(u.full_name)}</small>` : ""}</a><button class="u" data-id="${esc(uid(u))}">Deixar de seguir</button></div>`).join("") +
        `<div class="w">Vá com calma: deixar de seguir muitas contas rápido pode fazer o Instagram limitar sua conta temporariamente.</div>`;
      box.querySelectorAll<HTMLButtonElement>(".u").forEach((b) => (b.onclick = async () => {
        b.disabled = true; b.textContent = "…";
        const uid = b.dataset["id"] || "";
        const tok = (document.cookie.match(/csrftoken=([^;]+)/) || [])[1] || csrf;
        const hdr = { ...H, "x-csrftoken": tok, "content-type": "application/x-www-form-urlencoded" };
        const body = new URLSearchParams({ user_id: uid, container_module: "profile", nav_chain: "" }).toString();
        // Confirm with Instagram whether we still follow this person
        const stillFollowing = async (): Promise<boolean | null> => {
          try {
            const s = await fetch(`/api/v1/friendships/show/${uid}/`, { headers: H, credentials: "include" });
            if (!s.ok) return null;
            const j = await s.json();
            return typeof j.following === "boolean" ? j.following : null;
          } catch { return null; }
        };
        const tryPost = async (url: string) => {
          try {
            const r = await fetch(url, { method: "POST", credentials: "include", headers: hdr, body });
            const j = await r.json().catch(() => null);
            return r.ok && j && j.status === "ok" && j.friendship_status?.following !== true;
          } catch { return false; }
        };
        let ok = await tryPost(`/api/v1/friendships/destroy/${uid}/`);
        if (!ok) ok = await tryPost(`/api/v1/web/friendships/${uid}/unfollow/`);
        await sleep(800);
        const still = await stillFollowing();
        if (still === false || (ok && still === null)) {
          b.textContent = "Feito ✓";
          b.closest(".row")?.setAttribute("style", "opacity:.45");
        } else {
          b.disabled = false;
          b.textContent = "Tentar de novo";
          b.title = "O Instagram não confirmou. Espere alguns minutos ou deixe de seguir pelo perfil.";
        }
      }));
    } catch (e: any) {
      box.innerHTML = `<div class="w">Não deu para carregar a lista (${esc(e.message)}). Tente novamente em alguns minutos.</div>`;
    }
  }
}

export function buildBookmarklet(origin: string) {
  const tokens = designStyles.match(/:root\s*\{([^}]+)\}/)?.[1] || "";
  const theme = `:host{${tokens}}`;
  return "javascript:" + encodeURIComponent(`(${corujaScript.toString()})(${JSON.stringify(origin)},${JSON.stringify(theme)});void 0;`);
}

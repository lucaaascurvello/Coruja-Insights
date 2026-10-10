// Fatos calculados a partir dos dados públicos coletados. Nada aqui é opinião.
export type Post = { likes: number; comments: number; views?: number; video?: boolean; ts?: number; caption?: string };

export type Group = { posts: number; avgInteractions: number };
export type ProfileStats = {
  sample: number;
  followers: number;
  likesHidden: boolean;
  engagementRate: number | null; // % média por post / seguidores
  medianInteractions: number | null;
  avgInteractions: number | null;
  variation: number | null; // coeficiente de variação em %
  commentLikeRatio: number | null; // comentários por 100 curtidas
  formats: { reels: Group; fotos: Group };
  postsPerWeek: number | null;
  longestGapDays: number | null;
  daysSinceLastPost: number | null;
  trendPct: number | null; // últimos 6 vs 6 anteriores
  bestWeekday: { dia: string; posts: number; avgInteractions: number } | null;
  bestTimeSlot: { faixa: string; posts: number; avgInteractions: number } | null;
  captions: { avgLength: number; withHashtags: Group; withoutHashtags: Group; withQuestion: Group; withoutQuestion: Group };
  tier: string;
};

const DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
const FAIXAS = [
  { faixa: "madrugada (0h–6h)", from: 0, to: 6 },
  { faixa: "manhã (6h–12h)", from: 6, to: 12 },
  { faixa: "tarde (12h–18h)", from: 12, to: 18 },
  { faixa: "noite (18h–24h)", from: 18, to: 24 },
];
export const MIN_GROUP = 3;

const r1 = (n: number) => Math.round(n * 10) / 10;
const inter = (p: Post) => (p.likes || 0) + (p.comments || 0);
const group = (ps: Post[]): Group => ({ posts: ps.length, avgInteractions: ps.length ? Math.round(ps.reduce((a, p) => a + inter(p), 0) / ps.length) : 0 });

export function tierOf(followers: number) {
  if (followers < 10_000) return "nano";
  if (followers < 50_000) return "micro";
  if (followers < 100_000) return "medio";
  if (followers < 1_000_000) return "macro";
  return "mega";
}

// Hora/dia em Brasília (UTC-3)
const br = (ts: number) => new Date((ts - 3 * 3600) * 1000);

function best<T extends string>(posts: Post[], key: (p: Post) => T | null) {
  const m = new Map<T, Post[]>();
  for (const p of posts) { const k = key(p); if (k == null) continue; m.set(k, [...(m.get(k) || []), p]); }
  let out: { k: T; g: Group } | null = null;
  for (const [k, ps] of m) {
    if (ps.length < MIN_GROUP) continue;
    const g = group(ps);
    if (!out || g.avgInteractions > out.g.avgInteractions) out = { k, g };
  }
  return out;
}

export function computeStats(input: { followers: number; likesHidden?: boolean; posts: Post[] }, now = Date.now()): ProfileStats {
  const posts = [...(input.posts || [])].sort((a, b) => (b.ts || 0) - (a.ts || 0));
  const hidden = !!input.likesHidden || (posts.length > 0 && posts.every((p) => inter(p) === 0));
  const n = posts.length;
  const vals = posts.map(inter);
  const avg = n ? vals.reduce((a, b) => a + b, 0) / n : 0;
  const sorted = [...vals].sort((a, b) => a - b);
  const median = n ? (n % 2 ? (sorted[(n - 1) / 2] ?? 0) : ((sorted[n / 2 - 1] ?? 0) + (sorted[n / 2] ?? 0)) / 2) : 0;
  const sd = n ? Math.sqrt(vals.reduce((a, v) => a + (v - avg) ** 2, 0) / n) : 0;
  const likes = posts.reduce((a, p) => a + (p.likes || 0), 0);
  const comments = posts.reduce((a, p) => a + (p.comments || 0), 0);

  const tss = posts.map((p) => p.ts || 0).filter(Boolean);
  let gap = 0;
  for (let i = 1; i < tss.length; i++) gap = Math.max(gap, (tss[i - 1] ?? 0) - (tss[i] ?? 0));
  const spanDays = tss.length > 1 ? ((tss[0] ?? 0) - (tss[tss.length - 1] ?? 0)) / 86400 : 0;

  const recent = posts.slice(0, 6), prev = posts.slice(6, 12);
  const ra = group(recent).avgInteractions, pa = group(prev).avgInteractions;

  const wd = best(posts, (p) => (p.ts ? DIAS[br(p.ts).getUTCDay()] : null));
  const ts = best(posts, (p) => (p.ts ? (FAIXAS.find((f) => br(p.ts!).getUTCHours() >= f.from && br(p.ts!).getUTCHours() < f.to)?.faixa ?? null) : null));
  const hasTag = (p: Post) => /#\w/.test(p.caption || "");
  const hasQ = (p: Post) => /\?/.test(p.caption || "");

  return {
    sample: n,
    followers: input.followers || 0,
    likesHidden: hidden,
    engagementRate: hidden || !input.followers || !n ? null : +((avg / input.followers) * 100).toFixed(2),
    avgInteractions: hidden || !n ? null : Math.round(avg),
    medianInteractions: hidden || !n ? null : Math.round(median),
    variation: hidden || !avg ? null : Math.round((sd / avg) * 100),
    commentLikeRatio: hidden || !likes ? null : r1((comments / likes) * 100),
    formats: { reels: group(posts.filter((p) => p.video)), fotos: group(posts.filter((p) => !p.video)) },
    postsPerWeek: spanDays >= 1 ? r1(((tss.length - 1) / spanDays) * 7) : null,
    longestGapDays: tss.length > 1 ? Math.round(gap / 86400) : null,
    daysSinceLastPost: tss.length ? Math.floor((now / 1000 - (tss[0] ?? 0)) / 86400) : null,
    trendPct: hidden || recent.length < 6 || prev.length < 6 || !pa ? null : Math.round(((ra - pa) / pa) * 100),
    bestWeekday: hidden || !wd ? null : { dia: wd.k, posts: wd.g.posts, avgInteractions: wd.g.avgInteractions },
    bestTimeSlot: hidden || !ts ? null : { faixa: ts.k, posts: ts.g.posts, avgInteractions: ts.g.avgInteractions },
    captions: {
      avgLength: n ? Math.round(posts.reduce((a, p) => a + (p.caption || "").length, 0) / n) : 0,
      withHashtags: group(posts.filter(hasTag)), withoutHashtags: group(posts.filter((p) => !hasTag(p))),
      withQuestion: group(posts.filter(hasQ)), withoutQuestion: group(posts.filter((p) => !hasQ(p))),
    },
    tier: tierOf(input.followers || 0),
  };
}

// Todos os números que um insight pode citar.
export function allowedNumbers(s: unknown, out: number[] = []): number[] {
  if (typeof s === "number" && Number.isFinite(s)) out.push(s);
  else if (s && typeof s === "object") for (const v of Object.values(s)) allowedNumbers(v, out);
  return out;
}

export function parseNumbers(text: string): number[] {
  const m = text.match(/\d+(?:[.,]\d+)*/g) || [];
  return m.map((t) => {
    if (/^\d{1,3}(\.\d{3})+$/.test(t)) return Number(t.replace(/\./g, "")); // 1.420
    if (/^\d{1,3}(,\d{3})+$/.test(t) && !/,\d{1,2}$/.test(t)) return Number(t.replace(/,/g, ""));
    return Number(t.replace(",", "."));
  });
}

// Verdadeiro se todo número citado bate (±6%) com algum fato calculado ou com a base de conhecimento.
export function evidenceIsGrounded(evidence: string, allowed: number[]): boolean {
  const nums = parseNumbers(evidence);
  return nums.every((x) => x <= 12 || allowed.some((v) => Math.abs(x - v) <= Math.max(Math.abs(v) * 0.06, 0.06)) || allowed.some((v) => Math.abs(x - v * 1000) <= v * 60));
}

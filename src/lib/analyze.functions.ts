import { createServerFn } from "@tanstack/react-start";

import { computeStats, allowedNumbers, evidenceIsGrounded, type ProfileStats } from "./stats";
import { KNOWLEDGE, SOURCES, BENCHMARKS, benchmarkPosition } from "./ig-knowledge";

export type Insight = { acao: string; motivo: string; evidencia: string; confianca: "alta" | "media" | "baixa" };
export type AiReport = {
  resumo: string;
  pontos_fortes: { texto: string; evidencia: string }[];
  melhorias: Insight[];
  stats: ProfileStats;
  benchmark: ReturnType<typeof benchmarkPosition>;
  sources: string[];
  descartados: number;
};

const str = { type: "string" };
const schema = {
  type: "object",
  additionalProperties: false,
  required: ["resumo", "pontos_fortes", "melhorias"],
  properties: {
    resumo: str,
    pontos_fortes: { type: "array", items: { type: "object", additionalProperties: false, required: ["texto", "evidencia"], properties: { texto: str, evidencia: str } } },
    melhorias: { type: "array", items: { type: "object", additionalProperties: false, required: ["acao", "motivo", "evidencia", "confianca"], properties: { acao: str, motivo: str, evidencia: str, confianca: { type: "string", enum: ["alta", "media", "baixa"] } } } },
  },
};

export const analyzeProfile = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => {
    const s = JSON.stringify(d ?? {});
    if (s.length > 60000) throw new Error("Dados muito grandes");
    return d as Record<string, unknown>;
  })
  .handler(async ({ data }): Promise<{ report?: AiReport; error?: string }> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { error: "IA não configurada." };
    const d = data as any;
    const stats = computeStats({ followers: Number(d.followers) || 0, likesHidden: !!d.likesHidden, posts: Array.isArray(d.posts) ? d.posts : [] });
    const benchmark = benchmarkPosition(stats.tier, stats.engagementRate);
    const perfil = { username: d.username, bio: d.bio, category: d.category, isBusiness: !!d.isBusiness, following: d.following, postsCount: d.postsCount, legendas: (d.posts || []).slice(0, 12).map((p: any) => p.caption) };
    const prompt = `Você é um analista sênior de Instagram. Responda em português do Brasil, direto e profissional.
REGRAS OBRIGATÓRIAS:
- Use SOMENTE os FATOS e a BASE DE CONHECIMENTO abaixo. Nunca invente números, tendências, público, gênero ou localização.
- Cada item precisa de "evidencia": cite o número exato dos FATOS que sustenta a afirmação (ex.: "Reels: 2.340 interações médias em 5 posts vs fotos: 980 em 7").
- Se um fato for null ou a amostra de um grupo for < 3 posts, não tire conclusão dele.
- "confianca": alta (amostra >= 8 e diferença clara), media, baixa (amostra pequena ou diferença pequena).
- 2 a 4 pontos_fortes e 3 a 6 melhorias, só os que os dados sustentam. Menos itens é melhor que itens inúteis ou genéricos.
- "resumo": 2–3 frases, cite a posição frente à referência de mercado se existir.
- Se isBusiness for false, inclua a recomendação de migrar para conta Profissional (regra 9).
BASE DE CONHECIMENTO:${KNOWLEDGE}
REFERÊNCIA DE ENGAJAMENTO: ${JSON.stringify(benchmark)}
FATOS (calculados, confiáveis): ${JSON.stringify(stats)}
PERFIL: ${JSON.stringify(perfil)}`;
    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        input: prompt,
        reasoning: { effort: "low" },
        store: false,
        stream: true,
        text: { format: { type: "json_schema", name: "relatorio", strict: true, schema } },
      }),
    });
    if (!res.ok || !res.body) {
      if (res.status === 429) return { error: "Muitas solicitações agora. Tente em instantes." };
      if (res.status === 402) return { error: "Créditos de IA esgotados no momento." };
      return { error: `Falha na IA (${res.status}).` };
    }
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "", text = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() || "";
      for (const l of lines) {
        if (!l.startsWith("data:")) continue;
        try {
          const ev = JSON.parse(l.slice(5).trim());
          if (ev.type === "response.output_text.delta") text += ev.delta;
        } catch { /* ignore */ }
      }
    }
    try {
      const out = JSON.parse(text) as Pick<AiReport, "resumo" | "pontos_fortes" | "melhorias">;
      const allowed = allowedNumbers({ stats, benchmark, BENCHMARKS });
      const ok = (e: string) => !!e?.trim() && evidenceIsGrounded(e, allowed);
      const melhorias = out.melhorias.filter((m) => ok(m.evidencia) || /profissional/i.test(m.acao));
      const pontos = out.pontos_fortes.filter((p) => ok(p.evidencia));
      const descartados = out.melhorias.length - melhorias.length + out.pontos_fortes.length - pontos.length;
      return { report: { resumo: out.resumo, pontos_fortes: pontos, melhorias, stats, benchmark, sources: SOURCES, descartados } };
    }
    catch { return { error: "A IA não retornou um relatório válido." }; }
  });

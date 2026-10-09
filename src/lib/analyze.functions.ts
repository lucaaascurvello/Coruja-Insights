import { createServerFn } from "@tanstack/react-start";

export type AiReport = {
  resumo: string;
  pontos_fortes: string[];
  melhorias: string[];
  publico: string;
  genero: { homens: number; mulheres: number; indefinido: number };
  regioes: { nome: string; percentual: number }[];
  melhor_horario: string;
};

const schema = {
  type: "object",
  additionalProperties: false,
  required: ["resumo", "pontos_fortes", "melhorias", "publico", "genero", "regioes", "melhor_horario"],
  properties: {
    resumo: { type: "string" },
    pontos_fortes: { type: "array", items: { type: "string" } },
    melhorias: { type: "array", items: { type: "string" } },
    publico: { type: "string" },
    genero: {
      type: "object", additionalProperties: false, required: ["homens", "mulheres", "indefinido"],
      properties: { homens: { type: "number" }, mulheres: { type: "number" }, indefinido: { type: "number" } },
    },
    regioes: {
      type: "array",
      items: { type: "object", additionalProperties: false, required: ["nome", "percentual"], properties: { nome: { type: "string" }, percentual: { type: "number" } } },
    },
    melhor_horario: { type: "string" },
  },
};

export const analyzeProfile = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => {
    const s = JSON.stringify(d ?? {});
    if (s.length > 60000) throw new Error("Dados muito grandes");
    return d as Record<string, unknown>;
  })
  .handler(async ({ data }): Promise<{ report?: AiReport; error?: string }> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) return { error: "IA não configurada." };
    const prompt = `Você é um analista sênior de marketing de Instagram. Analise os dados públicos abaixo e responda em português do Brasil, de forma profissional e objetiva.
- "genero": estime % homens/mulheres/indefinido a partir dos nomes em followerNames (amostra). Some 100.
- "regioes": estime estados/regiões prováveis do público (Brasil ou outros países) com base em bio, idioma, legendas e nomes; deixe claro que é estimativa. 3 a 5 itens.
- "melhorias": 4 a 6 dicas práticas e específicas para o perfil.
- "pontos_fortes": 2 a 4 itens.
- "melhor_horario": sugestão baseada nos timestamps (UTC-3) das publicações com mais engajamento.
- Se isBusiness for false, inclua nas melhorias a recomendação de migrar para conta Profissional.
DADOS: ${JSON.stringify(data)}`;
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
    try { return { report: JSON.parse(text) as AiReport }; }
    catch { return { error: "A IA não retornou um relatório válido." }; }
  });

// Base de conhecimento usada pela IA. Referências aproximadas de estudos públicos de mercado.
export const BENCHMARKS: Record<string, { label: string; min: number; max: number }> = {
  nano: { label: "até 10 mil seguidores", min: 2.5, max: 5 },
  micro: { label: "10 mil a 50 mil seguidores", min: 1.5, max: 3 },
  medio: { label: "50 mil a 100 mil seguidores", min: 1, max: 2 },
  macro: { label: "100 mil a 1 milhão de seguidores", min: 0.7, max: 1.5 },
  mega: { label: "mais de 1 milhão de seguidores", min: 0.5, max: 1 },
};

export const SOURCES = [
  "Rival IQ — Social Media Industry Benchmark Report",
  "Socialinsider — Instagram Benchmarks",
  "HypeAuditor — State of Influencer Marketing",
  "Later / Hootsuite — guias de boas práticas do Instagram",
  "Central de Ajuda e Creators do Instagram (Meta)",
];

export function benchmarkPosition(tier: string, er: number | null) {
  const b = BENCHMARKS[tier];
  if (!b || er == null) return null;
  const posicao = er < b.min ? "abaixo" : er > b.max ? "acima" : "dentro";
  return { faixa: b.label, min: b.min, max: b.max, posicao } as const;
}

export const KNOWLEDGE = `
REGRAS DE BOAS PRÁTICAS (aplique só quando a condição for verdadeira nos FATOS):
1. Formato: só recomende priorizar Reels se formats.reels.avgInteractions > formats.fotos.avgInteractions e ambos tiverem >= 3 posts. O inverso vale para fotos/carrosséis.
2. Frequência: abaixo de 2 posts/semana tende a reduzir alcance; 3–5 por semana é a faixa recomendada pelos guias de mercado. Só cite se postsPerWeek existir.
3. Pausas: longestGapDays > 14 ou daysSinceLastPost > 14 indicam irregularidade; recomende calendário editorial.
4. Tendência: trendPct <= -20 = queda relevante; >= 20 = crescimento; entre isso, estável.
5. Conversa: commentLikeRatio < 1 (menos de 1 comentário a cada 100 curtidas) indica pouca conversa; recomende CTA/perguntas na legenda. Acima de 3 é ótimo.
6. Consistência: variation > 100% indica resultados muito irregulares (dependência de posts virais).
7. Legendas: compare withQuestion vs withoutQuestion e withHashtags vs withoutHashtags só se ambos os grupos tiverem >= 3 posts.
8. Horário/dia: só cite bestWeekday/bestTimeSlot se existirem (já exigem >= 3 posts). Lembre que horário de publicação é só um dos fatores.
9. Conta pessoal: sem acesso a Insights (alcance, salvamentos, público por idade/cidade). Recomende conta Profissional — é gratuita e libera esses dados.
10. Bio: deve dizer o que o perfil oferece, para quem, e ter chamada para ação/link.
11. Engajamento público (curtidas+comentários / seguidores) não inclui salvamentos, compartilhamentos nem alcance — são métricas privadas.
12. Amostra: com menos de 8 posts, todas as conclusões têm confiança baixa.
`;

# Análise mais confiável e útil

Objetivo: cada insight do relatório precisa ser verdadeiro (baseado em número real do perfil) e acionável. Nada de "achismo".

## Problemas de hoje
- A IA recebe os dados crus e escreve livremente: pode inventar tendências.
- Gênero e estados são chutes a partir de nomes/bio — pouco confiáveis.
- "Melhor horário" usa poucos posts e não diz quantos.
- Não há referência do que é "bom" ou "ruim" para o tamanho da conta.

## 1. Números calculados antes da IA (fatos, não opinião)
A ferramenta calcula sozinha, no navegador, e só depois envia à IA:
- Engajamento médio, mediana e variação entre posts.
- Comparação Reels x Fotos x Carrossel (média de cada formato e quantos de cada).
- Frequência de postagem (posts/semana nas últimas semanas) e maior intervalo sem postar.
- Tendência: últimos 6 posts vs. 6 anteriores (subiu/caiu X%).
- Dia da semana e faixa de horário com melhor média — só se houver pelo menos 3 posts naquela faixa.
- Legendas: tamanho médio, uso de hashtags, perguntas/CTA, e o engajamento de cada grupo.
- Proporção comentários/curtidas (sinal de conversa real).

## 2. Banco de conhecimento sobre Instagram
Um arquivo fixo de referências que a IA consulta, com:
- Faixas de engajamento esperadas por tamanho de conta (nano, micro, médio, macro, mega), com fonte citada (estudos públicos do mercado, ex.: Hootsuite, Later, Rival IQ, Social Insider).
- Boas práticas por formato (Reels, carrossel, foto), frequência, legendas, hashtags, bio e link.
- Diferenças entre conta pessoal, criador e empresa (o que cada uma libera).
- Cada regra com um "quando aplicar" (ex.: "só sugerir mais Reels se Reels > fotos na média deste perfil").

Assim a IA classifica o perfil ("seu engajamento de 2,1% está acima da média para contas de 50–100 mil") em vez de inventar.

## 3. Regras rígidas para a IA
- Todo insight precisa citar o número que o sustenta ("Reels tiveram 2,3x mais curtidas que fotos em 8 posts").
- Proibido afirmar algo sem dado; se a amostra for pequena, a dica vem marcada "amostra pequena".
- Cada dica vem com: o que fazer, por quê (dado) e nível de confiança (alta/média/baixa).
- Uma segunda verificação automática descarta dicas que citam números que não existem nos dados.

## 4. Remover ou rebaixar o que não é confiável
Opções (decidir):
- Gênero e estados: remover, ou manter com selo "estimativa por nomes — baixa confiança".
- Melhor horário: exibir só com amostra mínima.

## 5. Relatório mais claro
- Seção "Fatos do perfil" (números) separada de "Recomendações" (com confiança e o dado que sustenta).
- Selo de comparação com a média do mercado para a faixa da conta.
- Rodapé com as fontes do banco de conhecimento.

## Observação
Mudanças na ferramenta exigem apagar o favorito da coruja e arrastar de novo depois.

## Detalhes técnicos
- Métricas derivadas em `bookmarklet.ts` (função `computeStats`) enviadas como `stats` junto aos dados.
- Banco de conhecimento em `src/lib/ig-knowledge.ts` (texto/JSON versionado, só no servidor), injetado como instruções no `analyze.functions.ts`.
- Schema novo: `melhorias: { acao, motivo, evidencia, confianca }[]`, `benchmark: { faixa, posicao }`, `fatos[]`.
- Validação pós-resposta: checar se números em `evidencia` batem com `stats`; descartar os que não batem.
- Mesmo modelo e chamada atual (sem troca de modelo).

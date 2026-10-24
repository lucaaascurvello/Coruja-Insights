import { describe, it, expect } from "vitest";
import { computeStats, evidenceIsGrounded, allowedNumbers } from "./stats";
import { benchmarkPosition } from "./ig-knowledge";

const day = 86400;
const mk = (n: number, f: (i: number) => any) =>
  Array.from({ length: n }, (_, i) => ({
    likes: 0,
    comments: 0,
    ts: 1_700_000_000 - i * day,
    ...f(i),
  }));

describe("stats", () => {
  it("engajamento = média de interações / seguidores", () => {
    const s = computeStats({ followers: 1000, posts: mk(4, () => ({ likes: 18, comments: 2 })) });
    expect(s.engagementRate).toBe(2);
  });
  it("melhor dia exige pelo menos 3 posts", () => {
    const s = computeStats({ followers: 1000, posts: mk(2, () => ({ likes: 10 })) });
    expect(s.bestWeekday).toBeNull();
  });
  it("curtidas ocultas não geram métricas", () => {
    const s = computeStats({ followers: 1000, posts: mk(5, () => ({})) });
    expect(s.engagementRate).toBeNull();
  });
  it("micro com 2% está dentro da referência", () => {
    expect(benchmarkPosition("micro", 2)?.posicao).toBe("dentro");
  });
  it("descarta evidência com número inventado", () => {
    const allowed = allowedNumbers({ a: 2340, b: 1.8 });
    expect(evidenceIsGrounded("Reels tiveram 2.340 interações", allowed)).toBe(true);
    expect(evidenceIsGrounded("Reels tiveram 9.999 interações", allowed)).toBe(false);
  });
});

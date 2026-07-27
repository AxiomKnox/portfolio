/** Fuzzy ranking for search suggestions (toolbar). */

export type SuggestKind = "tech" | "status" | "year";
export type SuggestCandidate = { kind: SuggestKind; id: string; label: string; score: number };

/** Score a candidate against a query. Higher is better; null = no match. */
export function fuzzyScore(query: string, candidate: string): number | null {
  const q = query.trim().toLowerCase();
  const c = candidate.toLowerCase();
  if (!q || !c) return null;
  if (c === q) return 1000;
  if (c.startsWith(q)) return 800 + Math.min(99, (q.length / c.length) * 100);
  if (c.includes(q)) return 500 + Math.min(99, (q.length / c.length) * 100);
  let qi = 0;
  for (let i = 0; i < c.length && qi < q.length; i++) {
    if (c[i] === q[qi]) qi++;
  }
  if (qi === q.length) return 100 + Math.min(99, (q.length / c.length) * 100);
  return null;
}

export function rankByFuzzy<T>(items: T[], query: string, labelOf: (item: T) => string): T[] {
  if (!query.trim()) return items;
  return items
    .map((item) => ({ item, score: fuzzyScore(query, labelOf(item)) }))
    .filter((x): x is { item: T; score: number } => x.score != null)
    .sort((a, b) => b.score - a.score || labelOf(a.item).localeCompare(labelOf(b.item)))
    .map((x) => x.item);
}

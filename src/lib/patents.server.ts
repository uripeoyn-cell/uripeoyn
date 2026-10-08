import { extractKeywords } from "@/lib/keywords";

export type PatentHit = {
  title: string;
  number: string;
  applicant: string;
  date: string;
  status: string;
  excerpt: string;
  overlap: string[];
  url: string;
};

export type PatentSearchOk = {
  ok: true;
  keywords: string[];
  hits: PatentHit[];
  libraryUrl: string;
};

type GpPatent = {
  title?: string;
  snippet?: string;
  filing_date?: string;
  grant_date?: string;
  publication_date?: string;
  inventor?: string;
  assignee?: string;
  publication_number?: string;
};

const cache = new Map<string, { at: number; hits: PatentHit[] }>();

function clean(value: string): string {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/&hellip;|…/g, "…")
    .replace(/\s+/g, " ")
    .trim();
}

function statusOf(number: string, grant?: string): string {
  if (/[BY]\d?$/i.test(number) || grant) return "등록";
  if (/U\d?$/i.test(number)) return "실용신안 공개";
  if (/Y\d?$/i.test(number)) return "실용신안 등록";
  return "공개";
}

function clip(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}

function parseHits(data: unknown, keywords: string[]): PatentHit[] {
  const clusters = (data as { results?: { cluster?: { result?: { patent?: GpPatent }[] }[] } })?.results
    ?.cluster;
  if (!clusters) return [];
  const hits: PatentHit[] = [];
  const seen = new Set<string>();
  for (const cluster of clusters) {
    for (const row of cluster.result ?? []) {
      const patent = row.patent;
      const number = patent?.publication_number ?? "";
      if (!number.startsWith("KR") || seen.has(number)) continue;
      seen.add(number);
      const title = clean(patent?.title ?? "") || "제목 없는 문헌";
      const excerpt = clip(clean(patent?.snippet ?? ""), 220);
      const hay = `${title} ${excerpt}`;
      const overlap = keywords.filter((word) => hay.includes(word));
      const date = patent?.grant_date || patent?.publication_date || patent?.filing_date || "";
      hits.push({
        title,
        number,
        applicant: clean(patent?.assignee || patent?.inventor || "") || "출원인 미상",
        date,
        status: statusOf(number, patent?.grant_date),
        excerpt,
        overlap,
        url: `https://patents.google.com/patent/${number}/ko`,
      });
    }
  }
  return hits;
}

async function fetchQuery(query: string, keywords: string[]): Promise<PatentHit[]> {
  const cached = cache.get(query);
  if (cached && Date.now() - cached.at < 60 * 60 * 1000) return cached.hits;

  const endpoint =
    "https://patents.google.com/xhr/query?url=" + encodeURIComponent(`q=${query}&country=KR`);
  const res = await fetch(endpoint, {
    headers: {
      Accept: "application/json",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    },
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(`문헌 조회에 실패했습니다. (${res.status})`);
  const data: unknown = await res.json();
  const hits = parseHits(data, keywords);
  cache.set(query, { at: Date.now(), hits });
  if (cache.size > 40) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].at - b[1].at)[0];
    if (oldest) cache.delete(oldest[0]);
  }
  return hits;
}

export async function searchKrPatents(title: string, body: string): Promise<PatentSearchOk> {
  const keywords = extractKeywords(title, body);
  const specific = [...keywords].sort((a, b) => b.length - a.length || a.localeCompare(b));
  const queries: string[] = [];
  if (specific.length >= 2) queries.push(specific.slice(0, 2).join(" "));
  if (specific.length >= 3) queries.push(`${specific[0]} ${specific[2]}`);
  if (specific[0]) queries.push(specific[0]);
  const shortTitle = title.trim();
  if (queries.length === 0 && shortTitle) queries.push(shortTitle.slice(0, 20));

  const merged = new Map<string, PatentHit>();
  let lastError = "";
  for (const query of queries) {
    try {
      const found = await fetchQuery(query, keywords);
      for (const hit of found) {
        const prev = merged.get(hit.number);
        if (!prev || hit.overlap.length > prev.overlap.length) merged.set(hit.number, hit);
      }
      const good = [...merged.values()].filter((hit) => hit.overlap.length > 0);
      if (good.length >= 3) break;
    } catch (error) {
      lastError = error instanceof Error ? error.message : "문헌 조회에 실패했습니다.";
    }
  }

  if (merged.size === 0 && lastError) {
    throw new Error(lastError);
  }

  const ranked = [...merged.values()]
    .filter((hit) => hit.overlap.length > 0)
    .sort((a, b) => {
      const mass = (hit: PatentHit) => hit.overlap.reduce((sum, word) => sum + word.length, 0);
      return mass(b) - mass(a) || b.overlap.length - a.overlap.length || a.number.localeCompare(b.number);
    });
  const strong = ranked.filter((hit) => hit.overlap.length >= 2);
  const hits = (strong.length >= 2 ? strong : ranked).slice(0, 8);

  const libraryUrl =
    "https://patents.google.com/?q=" +
    encodeURIComponent(queries[0] || shortTitle || title) +
    "&country=KR";

  return { ok: true, keywords, hits, libraryUrl };
}

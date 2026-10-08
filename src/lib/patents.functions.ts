import { createServerFn } from "@tanstack/react-start";

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

export type PatentSearchResult =
  | { ok: true; keywords: string[]; hits: PatentHit[]; libraryUrl: string }
  | { ok: false; error: string; keywords: string[]; libraryUrl: string };

export const searchPatents = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const src = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
    return {
      title: String(src.title ?? "").trim().slice(0, 80),
      body: String(src.body ?? "").trim().slice(0, 1500),
    };
  })
  .handler(async ({ data }): Promise<PatentSearchResult> => {
    if (data.title.length < 2) {
      return { ok: false, error: "제목을 두 글자 이상 적어 주세요.", keywords: [], libraryUrl: "" };
    }
    if (data.body.length < 20) {
      return { ok: false, error: "아이디어 설명을 20자 이상 적어 주세요.", keywords: [], libraryUrl: "" };
    }
    try {
      const { searchKrPatents } = await import("./patents.server");
      return await searchKrPatents(data.title, data.body);
    } catch (error) {
      const message = error instanceof Error ? error.message : "문헌 조회에 실패했습니다.";
      return { ok: false, error: message, keywords: [], libraryUrl: "" };
    }
  });

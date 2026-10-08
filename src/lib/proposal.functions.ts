import { createServerFn } from "@tanstack/react-start";
import { guideDraft, polishDraft, type ProposalInput } from "@/lib/guide-draft";

export type ProposalResult =
  | { ok: true; text: string; chars: number; source: "model" | "guide" }
  | { ok: false; error: string };

const hour = { total: 0, reset: 0 };

function allowModelCall(): boolean {
  const now = Date.now();
  if (now > hour.reset) {
    hour.total = 0;
    hour.reset = now + 60 * 60 * 1000;
  }
  if (hour.total >= 40) return false;
  hour.total += 1;
  return true;
}

function readInput(input: unknown): ProposalInput | string {
  const src = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const pick = (key: string, max: number) => String(src[key] ?? "").trim().slice(0, max);
  const data: ProposalInput = {
    title: pick("title", 60),
    problem: pick("problem", 400),
    solution: pick("solution", 400),
    difference: pick("difference", 200),
    ipStatus: pick("ipStatus", 20) || "모름",
    support: pick("support", 30) || "알아서 골라 주세요",
  };
  if (data.title.length < 2) return "사업 이름을 두 글자 이상 적어 주세요.";
  if (data.problem.length < 8) return "고객의 문제를 조금 더 적어 주세요.";
  if (data.solution.length < 8) return "해결 방법을 조금 더 적어 주세요.";
  return data;
}

async function askModel(data: ProposalInput): Promise<string> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) throw new Error("no-key");
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    signal: AbortSignal.timeout(25000),
    body: JSON.stringify({
      model: "grok-4.5",
      temperature: 0.3,
      max_tokens: 1400,
      messages: [
        {
          role: "system",
          content:
            "너는 한국 정부지원·지식재산 상담용 사업제안서 초안만 쓴다. 여섯 단락 제목은 정확히 1. 사업 한 줄, 2. 고객과 문제, 3. 해결 방법과 차별점, 4. 지식재산 계획, 5. 앞으로 6개월, 6. 지원이 필요한 이유. 공백 포함 950~1080자. 입력에 없는 매출, 시장규모, 고용, 수상, %, 억, 등록 완료를 만들지 마라. 없으면 미정. 광고 문구 금지. 마지막 줄은 반드시 '이 글은 상담용 초안이며 제출본이 아닙니다.'",
        },
        {
          role: "user",
          content: `사업 이름: ${data.title}\n문제: ${data.problem}\n해결: ${data.solution}\n차별점: ${data.difference || "없음"}\n권리 상태: ${data.ipStatus}\n관심 지원: ${data.support}`,
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`status ${res.status}`);
  const body = (await res.json()) as {
    choices?: { message?: { content?: unknown } }[];
  };
  const content = body.choices?.[0]?.message?.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object" && "text" in part) return String((part as { text: unknown }).text ?? "");
        return "";
      })
      .join("");
  }
  return "";
}

export const draftProposal = createServerFn({ method: "POST" })
  .validator((input: unknown) => input)
  .handler(async ({ data }): Promise<ProposalResult> => {
    const parsed = readInput(data);
    if (typeof parsed === "string") return { ok: false, error: parsed };
    try {
      if (!allowModelCall()) {
        const text = guideDraft(parsed);
        return { ok: true, text, chars: text.trim().length, source: "guide" };
      }
      const raw = await askModel(parsed);
      const polished = polishDraft(raw, parsed);
      return { ok: true, text: polished.text, chars: polished.text.trim().length, source: polished.source };
    } catch {
      const text = guideDraft(parsed);
      return { ok: true, text, chars: text.trim().length, source: "guide" };
    }
  });

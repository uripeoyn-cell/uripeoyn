export type ProposalInput = {
  title: string;
  problem: string;
  solution: string;
  difference: string;
  ipStatus: string;
  support: string;
};

export const DRAFT_DISCLAIMER = "이 글은 상담용 초안이며 제출본이 아닙니다.";

const FILLERS = [
  "상담에서는 신청자가 적은 문장만 근거로 삼고, 없는 수상이나 등록 완료는 보태지 않습니다.",
  "정부 과제와 특허 지원사업은 이 앱이 대신 넣지 않습니다. 컨설턴트가 맞는 사업을 고르고, 신청자가 결정합니다.",
  "비슷한 문헌이 있어도 바로 포기하지 않고, 다른 점만 떼어 다시 적을 수 있습니다.",
  "확인되지 않은 매출, 점유율, 고용 인원은 숫자로 쓰지 않고 미정으로 둡니다.",
];

export function countChars(text: string): number {
  return text.trim().length;
}

export function guideDraft(input: ProposalInput): string {
  const difference = input.difference.trim() || "신청서에 다른 점이 없습니다. 상담에서 한 줄로 다시 받습니다.";
  const sections = [
    `1. 사업 한 줄\n사업 이름은 「${input.title}」입니다. 풀려는 문제는 「${input.problem}」입니다. 푸는 방식은 「${input.solution}」입니다.`,
    `2. 고객과 문제\n고객이 겪는 일은 ${input.problem}입니다. 누가 언제 이 일을 만나는지는 상담에서 한 사람으로 좁힙니다. 시장 규모는 확인된 수치가 없어 적지 않습니다.`,
    `3. 해결 방법과 차별점\n제안하는 해결은 ${input.solution}입니다. 다른 점은 ${difference}입니다. 견본, 매출, 점유율은 입력에 없어 미정입니다.`,
    `4. 지식재산 계획\n권리 후보는 특허, 실용신안, 디자인, 상표, 저작권입니다. 기술 그 자체면 특허나 실용신안, 보이는 형태면 디자인, 이름과 로고면 상표, 글·그림·영상·소프트웨어면 저작권을 먼저 가려 봅니다. 지금 기록은 「${input.ipStatus}」입니다. 등록이 끝났다고 쓰지 않습니다.`,
    `5. 앞으로 6개월\n처음에는 「${input.title}」을 한 장으로 고정하고 비슷한 국내 특허를 대조합니다. 다음에는 설명 자료나 시제품을 만듭니다. 그다음 권리 종류를 고르고, 「${input.support}」에 넣을 서류의 초안만 정리합니다. 월별 예산과 인력은 미정입니다.`,
    `6. 지원이 필요한 이유\n필요한 것은 성과 숫자가 아니라, 이 아이디어를 권리와 서류로 정리할 상담입니다. 기대하는 바는 「${input.problem}」을 줄이는 방향을 문서로 고정하는 일입니다. 고용과 매출 목표는 미정입니다. 관심 지원은 「${input.support}」입니다.`,
  ];

  let body = sections.join("\n\n");
  for (const line of FILLERS) {
    if (body.length + DRAFT_DISCLAIMER.length + 2 >= 980) break;
    body = `${body}\n${line}`;
  }

  let text = `${body}\n${DRAFT_DISCLAIMER}`;
  if (text.length > 1100) {
    const room = 1090 - DRAFT_DISCLAIMER.length;
    let cut = body.slice(0, Math.max(0, room));
    const last = Math.max(cut.lastIndexOf("\n"), cut.lastIndexOf(" "));
    if (last > 760) cut = cut.slice(0, last);
    text = `${cut.trim()}\n${DRAFT_DISCLAIMER}`;
  }
  return text.trim();
}

export function polishDraft(modelText: string, input: ProposalInput): { text: string; source: "model" | "guide" } {
  const blob = Object.values(input).join(" ");
  let text = modelText.replace(/\r/g, "").trim();
  text = text
    .split("\n")
    .filter((line) => {
      if (!/억|조|만원|%|퍼센트/.test(line)) return true;
      return line.split(/억|조|만원|%|퍼센트/).every((part) => {
        const nums = part.match(/\d[\d,]*/g) ?? [];
        return nums.every((n) => blob.includes(n.replace(/,/g, "")));
      });
    })
    .join("\n")
    .trim();

  if (!text.includes(DRAFT_DISCLAIMER)) text = `${text}\n${DRAFT_DISCLAIMER}`;
  if (countChars(text) < 860 || countChars(text) > 1200 || !/1\.\s*사업/.test(text)) {
    return { text: guideDraft(input), source: "guide" };
  }
  if (countChars(text) > 1100) {
    const without = text.replace(DRAFT_DISCLAIMER, "").trim();
    const room = 1090 - DRAFT_DISCLAIMER.length;
    let cut = without.slice(0, room);
    const last = Math.max(cut.lastIndexOf("\n"), cut.lastIndexOf(" "));
    if (last > 760) cut = cut.slice(0, last);
    text = `${cut.trim()}\n${DRAFT_DISCLAIMER}`;
  }
  if (countChars(text) < 900) return { text: guideDraft(input), source: "guide" };
  return { text: text.trim(), source: "model" };
}

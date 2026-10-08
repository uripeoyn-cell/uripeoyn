export const APP_NAME = "아이디어바로";

/** 기획에 적힌 수신 번호. 11자리가 아니면 통신사에서 거절될 수 있다. */
export const CONSULTANT_PHONE_RAW = "0106351275";
export const CONSULTANT_PHONE_DISPLAY = "010-6351-275";

export const PREFILL_KEY = "ideabaro-prefill";
export const DONE_KEY = "ideabaro-done";

export type KindId = "patent" | "utility" | "design" | "trademark" | "copyright";

export type KindField = {
  key: string;
  label: string;
  hint: string;
  multiline?: boolean;
};

export type Kind = {
  id: KindId;
  label: string;
  blurb: string;
  note?: string;
  fields: KindField[];
};

export const KINDS: Kind[] = [
  {
    id: "patent",
    label: "특허",
    blurb: "기술 아이디어, 발명",
    fields: [
      { key: "problem", label: "해결하려는 문제", hint: "누가 어디서 막히는지", multiline: true },
      { key: "difference", label: "기존과 다른 점", hint: "이미 있는 방법과 무엇이 다른지", multiline: true },
      { key: "how", label: "어떻게 구현하는지", hint: "원리나 순서를 짧게", multiline: true },
    ],
  },
  {
    id: "utility",
    label: "실용신안",
    blurb: "물건의 형태와 구조",
    fields: [
      { key: "item", label: "어떤 물건인지", hint: "물품 이름" },
      { key: "structure", label: "형태와 구조", hint: "어떻게 쓰면 편한지", multiline: true },
    ],
  },
  {
    id: "design",
    label: "디자인",
    blurb: "보이는 형태",
    fields: [
      { key: "item", label: "어떤 물품인지", hint: "디자인이 붙는 물건" },
      { key: "look", label: "형태, 모양, 색", hint: "보이는 특징. 이미지가 있으면 주소도", multiline: true },
    ],
  },
  {
    id: "trademark",
    label: "상표",
    blurb: "이름과 로고",
    fields: [
      { key: "mark", label: "표장", hint: "이름 또는 로고를 말로", multiline: true },
      { key: "goods", label: "쓸 상품과 업종", hint: "어떤 상품에 쓰는지" },
    ],
  },
  {
    id: "copyright",
    label: "저작권",
    blurb: "글, 그림, 영상, 소프트웨어",
    note: "저작권은 창작한 때에 생깁니다. 이 접수는 등록 상담이며, 한국저작권위원회 등록을 대신하지 않습니다.",
    fields: [
      { key: "workType", label: "창작물 종류", hint: "글, 그림, 음악, 영상, 소프트웨어 등" },
      { key: "when", label: "창작 시점", hint: "대략의 시기" },
      { key: "published", label: "공개 여부", hint: "공개, 비공개, 일부 공개" },
    ],
  },
];

export const IP_STATUS = ["아직 없음", "출원 준비", "출원 중", "등록됨", "모름"] as const;

export const SUPPORT_OPTIONS = [
  "지식재산 비용",
  "지역 지식재산 상담",
  "창업·사업화",
  "기술개발 자금",
  "알아서 골라 주세요",
] as const;

export const DISCLAIMER_SEARCH =
  "이 결과는 국내 공개·등록 특허 문헌의 참고 검색입니다. 등록 가능성, 침해, 신규성을 판단하거나 보장하지 않습니다.";

export const DISCLAIMER_INTAKE =
  "이 접수는 지식재산처 출원이나 정부 과제 신청이 아닙니다. 상담 요청으로 컨설턴트에게 전달됩니다.";

export function kindById(id: string): Kind | undefined {
  return KINDS.find((kind) => kind.id === id);
}

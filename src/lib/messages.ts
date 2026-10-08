import { CONSULTANT_PHONE_DISPLAY, CONSULTANT_PHONE_RAW } from "@/lib/constants";

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function isMobilePhone(value: string): boolean {
  const digits = digitsOnly(value);
  return /^01[016789]\d{7,8}$/.test(digits);
}

export function formatPhone(value: string): string {
  const digits = digitsOnly(value);
  if (digits.length === 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return value.trim();
}

export function seoulStamp(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}`;
}

export function receiptCode(prefix: "A" | "C"): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${n}`;
}

function clip(value: string, max: number): string {
  const text = value.replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

export type SmsDraft = {
  full: string;
  short: string;
  receipt: string;
};

export function buildRightsSms(input: {
  kindLabel: string;
  name: string;
  phone: string;
  email: string;
  title: string;
  body: string;
  extras: { label: string; value: string }[];
}): SmsDraft {
  const receipt = receiptCode("A");
  const at = seoulStamp();
  const phone = formatPhone(input.phone);
  const extraBlock = input.extras
    .filter((item) => item.value.trim())
    .map((item) => `${item.label}: ${clip(item.value, 180)}`)
    .join("\n");
  const full = [
    "[아이디어바로] 권리 신청",
    `구분: ${input.kindLabel}`,
    `이름: ${input.name.trim()}`,
    `전화: ${phone}`,
    input.email.trim() ? `이메일: ${input.email.trim()}` : "",
    `제목: ${clip(input.title, 80)}`,
    extraBlock,
    `요약: ${clip(input.body, 350)}`,
    `접수: ${at}`,
    `접수번호: ${receipt}`,
  ]
    .filter(Boolean)
    .join("\n");

  const short = fitSms(
    [
      "[아이디어바로] 권리 신청",
      input.kindLabel,
      `${input.name.trim()} ${phone}`,
      clip(input.title, 40),
      clip(input.body, 70),
      receipt,
    ].join("\n"),
  );

  return { full, short, receipt };
}

export function buildConsultSms(input: {
  name: string;
  phone: string;
  title: string;
  body: string;
  ipStatus: string;
  interests: string[];
}): SmsDraft {
  const receipt = receiptCode("C");
  const at = seoulStamp();
  const phone = formatPhone(input.phone);
  const interest = input.interests.length > 0 ? input.interests.join(", ") : "미정";
  const full = [
    "[아이디어바로] 컨설팅 신청",
    `이름: ${input.name.trim()}`,
    `전화: ${phone}`,
    `아이디어: ${clip(input.title, 80)}`,
    `권리: ${input.ipStatus}`,
    `관심: ${interest}`,
    `요약: ${clip(input.body, 350)}`,
    `접수: ${at}`,
    `접수번호: ${receipt}`,
  ].join("\n");

  const short = fitSms(
    [
      "[아이디어바로] 컨설팅",
      `${input.name.trim()} ${phone}`,
      clip(input.title, 40),
      input.ipStatus,
      interest,
      clip(input.body, 60),
      receipt,
    ].join("\n"),
  );

  return { full, short, receipt };
}

export function fitSms(body: string): string {
  let text = body.trim();
  while (encodeURIComponent(text).length > 1300 && text.length > 30) {
    text = `${text.slice(0, text.length - 16).trimEnd()}…`;
  }
  return text;
}

export function smsHref(body: string): string {
  return `sms:${CONSULTANT_PHONE_RAW}?body=${encodeURIComponent(body)}`;
}

export function consultantLine(): string {
  return CONSULTANT_PHONE_DISPLAY;
}

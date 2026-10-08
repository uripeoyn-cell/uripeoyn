import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Notice } from "@/components/form-bits";
import { CONSULTANT_PHONE_DISPLAY, DONE_KEY } from "@/lib/constants";
import { smsHref } from "@/lib/messages";
import { ghostBtnClass, primaryBtnClass } from "@/lib/ui";

export const Route = createFileRoute("/done")({
  head: () => ({ meta: [{ title: "접수 · 아이디어바로" }] }),
  component: DonePage,
});

type DonePayload = {
  receipt: string;
  channel: "rights" | "consult";
  kind: string;
  full: string;
  short: string;
};

function DonePage() {
  const [payload, setPayload] = useState<DonePayload | null>(null);
  const [ready, setReady] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    const raw = sessionStorage.getItem(DONE_KEY);
    if (raw) {
      try {
        setPayload(JSON.parse(raw) as DonePayload);
      } catch {
        setPayload(null);
      }
    }
    setReady(true);
  }, []);

  async function send() {
    if (!payload) return;
    setNote("");
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "아이디어바로 접수", text: payload.full });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
      }
    }
    window.location.href = smsHref(payload.short);
  }

  async function copy() {
    if (!payload) return;
    try {
      await navigator.clipboard.writeText(payload.full);
      setNote("내용을 복사했습니다. 문자 앱에 붙여 넣으면 됩니다.");
    } catch {
      setNote("복사에 실패했습니다. 아래 글을 길게 눌러 선택해 주세요.");
    }
  }

  if (!ready) return null;
  if (!payload) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl">접수 내용이 없습니다</h1>
        <Link to="/" className={primaryBtnClass}>
          홈으로
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-sm font-medium text-seal">접수번호 {payload.receipt}</p>
        <h1 className="mt-2 text-3xl">문자를 보낼 차례입니다</h1>
        <p className="mt-2 text-sm text-muted">
          받는 번호 {CONSULTANT_PHONE_DISPLAY}. 통신사 자동 발송은 연결되어 있지 않아, 휴대폰 문자로 한 번 보내 주면
          컨설턴트에게 도착합니다.
        </p>
      </div>
      <Notice>
        {payload.channel === "rights" ? `${payload.kind} 상담` : "지원사업 컨설팅"} 요청입니다. 지식재산처 출원이나 정부
        접수가 끝난 것은 아닙니다.
      </Notice>
      <pre className="overflow-x-auto border border-line bg-card p-4 text-sm leading-relaxed whitespace-pre-wrap text-ink">
        {payload.full}
      </pre>
      <button type="button" className={primaryBtnClass} onClick={() => void send()}>
        컨설턴트에게 문자 보내기
      </button>
      <button type="button" className={ghostBtnClass} onClick={() => void copy()}>
        내용 복사
      </button>
      {note ? <p className="text-sm text-muted">{note}</p> : null}
      <Link to="/" className="text-center text-sm font-medium text-ink underline decoration-line underline-offset-4">
        홈으로
      </Link>
    </div>
  );
}

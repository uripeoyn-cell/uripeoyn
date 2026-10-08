import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Choice, ErrorLine, Field, Notice, TextArea, TextInput } from "@/components/form-bits";
import { IP_STATUS, PREFILL_KEY, SUPPORT_OPTIONS } from "@/lib/constants";
import { draftProposal } from "@/lib/proposal.functions";
import { ghostBtnClass, primaryBtnClass } from "@/lib/ui";

export const Route = createFileRoute("/proposal")({
  head: () => ({ meta: [{ title: "사업제안서 초안 · 아이디어바로" }] }),
  component: ProposalPage,
});

function ProposalPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [difference, setDifference] = useState("");
  const [ipStatus, setIpStatus] = useState<string>(IP_STATUS[0]);
  const [support, setSupport] = useState<string>(SUPPORT_OPTIONS[0]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [text, setText] = useState("");
  const [chars, setChars] = useState(0);
  const [source, setSource] = useState<"model" | "guide" | "">("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const result = await draftProposal({
        data: { title, problem, solution, difference, ipStatus, support },
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setText(result.text);
      setChars(result.chars);
      setSource(result.source);
    } catch {
      setError("초안을 쓰지 못했습니다. 다시 눌러 주세요.");
    } finally {
      setPending(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      setError("복사에 실패했습니다. 글을 길게 눌러 선택해 주세요.");
    }
  }

  function toConsult() {
    sessionStorage.setItem(PREFILL_KEY, JSON.stringify({ title, body: text }));
    void navigate({ to: "/consult" });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl">사업제안서 초안</h1>
        <p className="mt-2 text-sm text-muted">여섯 단락, 약 천 자. 없는 매출과 점유율은 만들지 않습니다.</p>
      </div>
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <Field label="사업 이름">
          <TextInput value={title} maxLength={60} onChange={(event) => setTitle(event.target.value)} />
        </Field>
        <Field label="누구의 어떤 문제인지">
          <TextArea value={problem} maxLength={400} onChange={(event) => setProblem(event.target.value)} />
        </Field>
        <Field label="해결 방법">
          <TextArea value={solution} maxLength={400} onChange={(event) => setSolution(event.target.value)} />
        </Field>
        <Field label="한 줄 차별점" hint="없으면 비워 두세요">
          <TextInput value={difference} maxLength={200} onChange={(event) => setDifference(event.target.value)} />
        </Field>
        <Field label="지금 권리 상태">
          <Choice options={IP_STATUS} value={ipStatus} onChange={setIpStatus} label="권리 상태" />
        </Field>
        <Field label="원하는 지원">
          <Choice options={SUPPORT_OPTIONS} value={support} onChange={setSupport} label="원하는 지원" />
        </Field>
        {error ? <ErrorLine>{error}</ErrorLine> : null}
        <button type="submit" className={primaryBtnClass} disabled={pending}>
          {pending ? "초안을 쓰고 있습니다" : text ? "다시 쓰기" : "초안 쓰기"}
        </button>
      </form>
      {text ? (
        <section className="flex flex-col gap-3 border border-line bg-card p-4">
          <p className="text-sm font-medium text-muted tabular-nums">
            본문 {chars.toLocaleString("ko-KR")}자 · 목표 900~1,100자
            {source === "guide" ? " · 작성 지침으로 맞춤" : ""}
          </p>
          <div className="text-sm leading-relaxed whitespace-pre-wrap">{text}</div>
          <Notice>제출용이 아닙니다. 상담용 초안입니다.</Notice>
          <button type="button" className={ghostBtnClass} onClick={() => void copy()}>
            내용 복사
          </button>
          <button type="button" className={primaryBtnClass} onClick={toConsult}>
            이 초안으로 컨설팅 신청
          </button>
        </section>
      ) : null}
    </div>
  );
}

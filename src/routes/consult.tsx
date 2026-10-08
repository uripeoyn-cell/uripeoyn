import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckRow, Choice, ErrorLine, Field, MultiChoice, Notice, TextArea, TextInput } from "@/components/form-bits";
import { DISCLAIMER_INTAKE, DONE_KEY, IP_STATUS, PREFILL_KEY, SUPPORT_OPTIONS } from "@/lib/constants";
import { buildConsultSms, isMobilePhone } from "@/lib/messages";
import { primaryBtnClass } from "@/lib/ui";

export const Route = createFileRoute("/consult")({
  head: () => ({ meta: [{ title: "지원사업 컨설팅 · 아이디어바로" }] }),
  component: ConsultPage,
});

function ConsultPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [ipStatus, setIpStatus] = useState<string>(IP_STATUS[0]);
  const [interests, setInterests] = useState<string[]>([]);
  const [privacy, setPrivacy] = useState(false);
  const [consult, setConsult] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const raw = sessionStorage.getItem(PREFILL_KEY);
    if (!raw) return;
    sessionStorage.removeItem(PREFILL_KEY);
    try {
      const data = JSON.parse(raw) as { title?: string; body?: string };
      if (data.title) setTitle(data.title);
      if (data.body) setBody(data.body);
    } catch {
      /* 미리 채우기 실패는 무시 */
    }
  }, []);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (name.trim().length < 2) return setError("이름을 적어 주세요.");
    if (!isMobilePhone(phone)) return setError("휴대폰 번호를 확인해 주세요.");
    if (title.trim().length < 2) return setError("아이디어 한 줄을 적어 주세요.");
    if (body.trim().length < 10) return setError("설명을 조금 더 적어 주세요.");
    if (!privacy || !consult) return setError("동의해야 접수됩니다.");
    const sms = buildConsultSms({ name, phone, title, body, ipStatus, interests });
    sessionStorage.setItem(
      DONE_KEY,
      JSON.stringify({
        receipt: sms.receipt,
        channel: "consult",
        kind: "컨설팅",
        full: sms.full,
        short: sms.short,
      }),
    );
    void navigate({ to: "/done" });
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={submit}>
      <div>
        <h1 className="text-3xl">지원사업 컨설팅</h1>
        <p className="mt-2 text-sm text-muted">
          정부 시스템에는 넣지 않습니다. 아이디어, 이름, 전화번호가 컨설턴트에게 한 통으로 갑니다.
        </p>
      </div>
      <Notice>{DISCLAIMER_INTAKE}</Notice>
      <Field label="이름">
        <TextInput value={name} autoComplete="name" onChange={(event) => setName(event.target.value)} />
      </Field>
      <Field label="휴대폰">
        <TextInput
          value={phone}
          inputMode="tel"
          autoComplete="tel"
          placeholder="010-0000-0000"
          onChange={(event) => setPhone(event.target.value)}
        />
      </Field>
      <Field label="아이디어 한 줄">
        <TextInput value={title} maxLength={80} onChange={(event) => setTitle(event.target.value)} />
      </Field>
      <Field label="설명">
        <TextArea value={body} maxLength={1500} onChange={(event) => setBody(event.target.value)} />
      </Field>
      <Field label="권리 상태">
        <Choice options={IP_STATUS} value={ipStatus} onChange={setIpStatus} label="권리 상태" />
      </Field>
      <Field label="관심 방향" hint="여러 개 고를 수 있습니다">
        <MultiChoice options={SUPPORT_OPTIONS} value={interests} onChange={setInterests} label="관심 방향" />
      </Field>
      <CheckRow checked={privacy} onChange={setPrivacy}>
        상담 연락을 위해 이름, 휴대폰 번호, 아이디어를 수집하는 데 동의합니다. 게시판에 올리지 않습니다.
      </CheckRow>
      <CheckRow checked={consult} onChange={setConsult}>
        컨설턴트가 지원사업을 대신 접수하지 않고, 상담으로 고른다는 점을 확인했습니다.
      </CheckRow>
      {error ? <ErrorLine>{error}</ErrorLine> : null}
      <button type="submit" className={primaryBtnClass}>
        접수하고 문자 준비
      </button>
    </form>
  );
}

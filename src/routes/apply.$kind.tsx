import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CheckRow, ErrorLine, Field, Notice, TextArea, TextInput } from "@/components/form-bits";
import { DISCLAIMER_INTAKE, DONE_KEY, kindById } from "@/lib/constants";
import { buildRightsSms, isMobilePhone } from "@/lib/messages";
import { primaryBtnClass } from "@/lib/ui";

export const Route = createFileRoute("/apply/$kind")({
  head: () => ({ meta: [{ title: "권리 신청 · 아이디어바로" }] }),
  component: ApplyKindPage,
});

function ApplyKindPage() {
  const { kind } = Route.useParams();
  const spec = kindById(kind);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [extras, setExtras] = useState<Record<string, string>>({});
  const [privacy, setPrivacy] = useState(false);
  const [consult, setConsult] = useState(false);
  const [error, setError] = useState("");

  if (!spec) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl">없는 신청입니다</h1>
        <Link to="/apply" className="font-semibold underline">
          권리 목록으로
        </Link>
      </div>
    );
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!spec) return;
    if (name.trim().length < 2) return setError("이름을 적어 주세요.");
    if (!isMobilePhone(phone)) return setError("휴대폰 번호를 확인해 주세요.");
    if (email.trim() && !email.includes("@")) return setError("이메일을 확인해 주세요.");
    if (title.trim().length < 2) return setError("제목을 적어 주세요.");
    if (body.trim().length < 10) return setError("설명을 조금 더 적어 주세요.");
    for (const field of spec.fields) {
      if ((extras[field.key] ?? "").trim().length < 2) return setError(`${field.label} 칸을 적어 주세요.`);
    }
    if (!privacy || !consult) return setError("동의해야 접수됩니다.");
    const sms = buildRightsSms({
      kindLabel: spec.label,
      name,
      phone,
      email,
      title,
      body,
      extras: spec.fields.map((field) => ({ label: field.label, value: extras[field.key] ?? "" })),
    });
    sessionStorage.setItem(
      DONE_KEY,
      JSON.stringify({
        receipt: sms.receipt,
        channel: "rights",
        kind: spec.label,
        full: sms.full,
        short: sms.short,
      }),
    );
    void navigate({ to: "/done" });
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={submit}>
      <div>
        <p className="text-sm font-medium text-seal">{spec.label}</p>
        <h1 className="mt-1 text-3xl">{spec.label} 상담 접수</h1>
        <p className="mt-2 text-sm text-muted">{spec.blurb}</p>
      </div>
      <Notice>{DISCLAIMER_INTAKE}</Notice>
      {spec.note ? <Notice>{spec.note}</Notice> : null}
      <Field label="이름">
        <TextInput value={name} autoComplete="name" onChange={(event) => setName(event.target.value)} />
      </Field>
      <Field label="휴대폰" hint="상담 연락에 씁니다">
        <TextInput
          value={phone}
          inputMode="tel"
          autoComplete="tel"
          placeholder="010-0000-0000"
          onChange={(event) => setPhone(event.target.value)}
        />
      </Field>
      <Field label="이메일" hint="선택">
        <TextInput
          value={email}
          type="email"
          autoComplete="email"
          onChange={(event) => setEmail(event.target.value)}
        />
      </Field>
      <Field label="제목">
        <TextInput value={title} maxLength={80} onChange={(event) => setTitle(event.target.value)} />
      </Field>
      <Field label="설명">
        <TextArea value={body} maxLength={1500} onChange={(event) => setBody(event.target.value)} />
      </Field>
      {spec.fields.map((field) => (
        <Field key={field.key} label={field.label} hint={field.hint}>
          {field.multiline ? (
            <TextArea
              value={extras[field.key] ?? ""}
              maxLength={500}
              onChange={(event) => setExtras((prev) => ({ ...prev, [field.key]: event.target.value }))}
            />
          ) : (
            <TextInput
              value={extras[field.key] ?? ""}
              maxLength={120}
              onChange={(event) => setExtras((prev) => ({ ...prev, [field.key]: event.target.value }))}
            />
          )}
        </Field>
      ))}
      <CheckRow checked={privacy} onChange={setPrivacy}>
        상담 연락을 위해 이름, 휴대폰 번호, 신청 내용을 수집하는 데 동의합니다. 컨설턴트에게 전달되며, 다른 신청자에게
        보이지 않습니다. 보유는 접수일부터 1년입니다.
      </CheckRow>
      <CheckRow checked={consult} onChange={setConsult}>
        이 접수가 출원이 아니라 상담 요청이라는 점을 확인했습니다.
      </CheckRow>
      {error ? <ErrorLine>{error}</ErrorLine> : null}
      <button type="submit" className={primaryBtnClass}>
        접수하고 문자 준비
      </button>
    </form>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { ErrorLine, Field, Notice, TextArea, TextInput } from "@/components/form-bits";
import { DISCLAIMER_SEARCH, PREFILL_KEY } from "@/lib/constants";
import { searchPatents, type PatentHit } from "@/lib/patents.functions";
import { ghostBtnClass, primaryBtnClass } from "@/lib/ui";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "비슷한 특허 찾기 · 아이디어바로" }] }),
  component: SearchPage,
});

function SearchPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [hits, setHits] = useState<PatentHit[] | null>(null);
  const [libraryUrl, setLibraryUrl] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const result = await searchPatents({ data: { title, body } });
      setKeywords(result.keywords);
      setLibraryUrl(result.libraryUrl);
      if (!result.ok) {
        setHits(null);
        setError(result.error);
        return;
      }
      setHits(result.hits);
    } catch {
      setHits(null);
      setError("문헌 조회에 실패했습니다. 잠시 뒤 다시 눌러 주세요.");
    } finally {
      setPending(false);
    }
  }

  function toConsult() {
    sessionStorage.setItem(PREFILL_KEY, JSON.stringify({ title, body }));
    void navigate({ to: "/consult" });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl">비슷한 특허가 있는지</h1>
        <p className="mt-2 text-sm text-muted">이름과 전화는 받지 않습니다. 검색만으로는 문자가 가지 않습니다.</p>
      </div>
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <Field label="제목" hint="40자 안쪽">
          <TextInput
            value={title}
            maxLength={40}
            required
            onChange={(event) => setTitle(event.target.value)}
            placeholder="접이식 냉감 포장재"
          />
        </Field>
        <Field label="아이디어" hint="무엇을 어떻게 풀는지. 20자 이상">
          <TextArea
            value={body}
            maxLength={1500}
            required
            onChange={(event) => setBody(event.target.value)}
            placeholder="신선식품 배송 중 온도가 오르는 문제를, 펼치면 냉기가 유지되는 접이식 포장으로 줄입니다."
          />
        </Field>
        {error ? <ErrorLine>{error}</ErrorLine> : null}
        <button type="submit" className={primaryBtnClass} disabled={pending}>
          {pending ? "문헌을 찾고 있습니다" : "문헌 찾기"}
        </button>
      </form>
      <Notice>{DISCLAIMER_SEARCH}</Notice>
      {hits ? <Results hits={hits} keywords={keywords} libraryUrl={libraryUrl} onConsult={toConsult} /> : null}
    </div>
  );
}

function Results({
  hits,
  keywords,
  libraryUrl,
  onConsult,
}: {
  hits: PatentHit[];
  keywords: string[];
  libraryUrl: string;
  onConsult: () => void;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl">{hits.length > 0 ? "비슷한 특허가 있습니다" : "가까운 특허가 잘 안 보입니다"}</h2>
      <p className="text-sm text-muted">
        검색어 {keywords.length > 0 ? keywords.join(", ") : "없음"}. {hits.length}건.
        {hits.length === 0 ? " 없다는 뜻은 새 발명이라는 뜻이 아닙니다." : null}
      </p>
      <ul className="flex flex-col gap-3">
        {hits.map((hit) => (
          <li key={hit.number} className="border border-line bg-card p-4">
            <p className="text-sm font-medium text-seal">
              {hit.status} · <span className="tabular-nums">{hit.number}</span>
            </p>
            <h3 className="mt-1 text-lg">{hit.title}</h3>
            <p className="mt-2 text-sm text-muted">
              {hit.applicant}
              {hit.date ? ` · ${hit.date}` : ""}
            </p>
            {hit.excerpt ? <p className="mt-3 text-sm leading-relaxed">{hit.excerpt}</p> : null}
            <p className="mt-3 text-sm text-muted">
              겹친 말: {hit.overlap.length > 0 ? hit.overlap.join(", ") : "검색어와 표현이 일부 겹칩니다"}
            </p>
            <a
              href={hit.url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-ink underline decoration-line underline-offset-4"
            >
              원문 보기
              <ExternalLink className="size-4" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-3">
        {libraryUrl ? (
          <a href={libraryUrl} target="_blank" rel="noreferrer" className={ghostBtnClass}>
            같은 단어로 더 보기
          </a>
        ) : null}
        <button type="button" className={primaryBtnClass} onClick={onConsult}>
          이 아이디어로 상담 신청
        </button>
      </div>
    </section>
  );
}

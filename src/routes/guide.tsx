import { createFileRoute, Link } from "@tanstack/react-router";
import { CONSULTANT_PHONE_DISPLAY, DISCLAIMER_INTAKE, DISCLAIMER_SEARCH } from "@/lib/constants";

export const Route = createFileRoute("/guide")({
  head: () => ({ meta: [{ title: "안내 · 아이디어바로" }] }),
  component: GuidePage,
});

function GuidePage() {
  return (
    <article className="flex flex-col gap-5 text-sm leading-relaxed">
      <h1 className="text-3xl">안내</h1>
      <section>
        <h2 className="text-xl">검색</h2>
        <p className="mt-2 text-muted">{DISCLAIMER_SEARCH}</p>
      </section>
      <section>
        <h2 className="text-xl">접수</h2>
        <p className="mt-2 text-muted">{DISCLAIMER_INTAKE}</p>
        <p className="mt-2 text-muted">
          권리 신청과 컨설팅 신청은 이름, 휴대폰, 내용을 이 기기에만 잠시 담았다가, 문자 앱으로 {CONSULTANT_PHONE_DISPLAY}{" "}
          에 보내도록 준비합니다. 다른 사람의 접수는 보이지 않습니다.
        </p>
      </section>
      <section>
        <h2 className="text-xl">초안</h2>
        <p className="mt-2 text-muted">
          사업제안서 초안은 사업 한 줄, 고객과 문제, 해결, 지식재산 계획, 6개월, 지원 이유의 여섯 단락입니다. 입력에 없는
          숫자는 쓰지 않습니다.
        </p>
      </section>
      <section>
        <h2 className="text-xl">개인정보</h2>
        <p className="mt-2 text-muted">
          수집 항목은 이름, 휴대폰 번호, 선택 이메일, 신청 내용입니다. 목적은 상담 연락입니다. 보유는 컨설턴트가 문자를
          받은 뒤 1년을 넘기지 않는 것을 원칙으로 합니다. 삭제를 원하면 접수에 쓴 번호로 연락하면 됩니다.
        </p>
      </section>
      <Link to="/" className="font-semibold text-ink underline decoration-line underline-offset-4">
        홈으로
      </Link>
    </article>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { DISCLAIMER_SEARCH } from "@/lib/constants";

export const Route = createFileRoute("/")({
  component: Home,
});

const PATHS = [
  {
    href: "/search",
    index: "01",
    title: "비슷한 특허 찾기",
    text: "아이디어를 올리면 국내 공개·등록 문헌을 바로 보여 줍니다.",
  },
  {
    href: "/apply",
    index: "02",
    title: "권리 신청 접수",
    text: "특허, 실용신안, 디자인, 상표, 저작권. 칸마다 질문이 다릅니다.",
  },
  {
    href: "/consult",
    index: "03",
    title: "지원사업 컨설팅",
    text: "정부·특허 지원은 대신 넣지 않습니다. 이름과 전화, 아이디어를 상담으로 넘깁니다.",
  },
] as const;

function Home() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-sm font-medium text-seal">상담 접수</p>
        <h1 className="mt-2 text-3xl text-ink">아이디어를 올리면, 비슷한 특허부터 봅니다.</h1>
        <img
          src="/meeting.png"
          alt="회의실에서 아이디어를 논의하는 사람들"
          width={1774}
          height={887}
          className="mt-4 w-full"
        />
      </div>
      <ol className="border-y border-line">
        {PATHS.map((path) => (
          <li key={path.href} className="border-b border-line last:border-b-0">
            <Link to={path.href} className="flex items-start gap-4 py-4">
              <span className="pt-1 font-display text-lg text-seal">{path.index}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-lg font-semibold text-ink">{path.title}</span>
                <span className="mt-1 block text-sm text-muted">{path.text}</span>
              </span>
              <ArrowUpRight className="mt-1 size-5 shrink-0 text-muted" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ol>
      <Link to="/proposal" className="flex items-center justify-between gap-3 border border-line bg-card px-4 py-4">
        <span>
          <span className="block font-semibold text-ink">사업제안서 초안</span>
          <span className="mt-1 block text-sm text-muted">작성 지침에 맞춰 900~1,100자.</span>
        </span>
        <ArrowUpRight className="size-5 text-ink" aria-hidden="true" />
      </Link>
      <p className="text-sm text-muted">
        {DISCLAIMER_SEARCH}{" "}
        <Link to="/guide" className="font-medium text-ink underline decoration-line underline-offset-4">
          안내
        </Link>
      </p>
    </div>
  );
}

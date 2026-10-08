import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { KINDS } from "@/lib/constants";

export const Route = createFileRoute("/apply/")({
  head: () => ({ meta: [{ title: "권리 신청 · 아이디어바로" }] }),
  component: ApplyHome,
});

function ApplyHome() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl">어떤 권리로 상담할까요</h1>
        <p className="mt-2 text-sm text-muted">칸마다 질문이 다릅니다. 모르겠으면 특허로 넣고, 상담에서 다시 고릅니다.</p>
      </div>
      <ul className="border-y border-line">
        {KINDS.map((kind) => (
          <li key={kind.id} className="border-b border-line last:border-b-0">
            <Link to="/apply/$kind" params={{ kind: kind.id }} className="flex items-center gap-3 py-4">
              <span className="min-w-0 flex-1">
                <span className="block text-lg font-semibold">{kind.label}</span>
                <span className="mt-1 block text-sm text-muted">{kind.blurb}</span>
              </span>
              <ArrowUpRight className="size-5 shrink-0 text-muted" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

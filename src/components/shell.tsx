import { Link, useRouterState } from "@tanstack/react-router";
import { FilePlus2, Home, PenLine, Phone, Search } from "lucide-react";
import { useLayoutEffect, useRef, type ReactNode } from "react";

const NAV = [
  { to: "/", label: "홈", icon: Home },
  { to: "/search", label: "검색", icon: Search },
  { to: "/apply", label: "신청", icon: FilePlus2 },
  { to: "/consult", label: "상담", icon: Phone },
  { to: "/proposal", label: "초안", icon: PenLine },
] as const;

function Intro() {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const started = (window as Window & { __introAt?: number }).__introAt ?? Date.now();
    const left = 1500 - (Date.now() - started);
    if (left <= 0) {
      el.style.visibility = "hidden";
      el.style.pointerEvents = "none";
      return;
    }
    const hide = window.setTimeout(() => {
      el.style.visibility = "hidden";
      el.style.pointerEvents = "none";
    }, left);
    return () => window.clearTimeout(hide);
  }, []);

  return (
    <div
      ref={ref}
      className="intro-splash fixed inset-0 z-50 flex items-center justify-center bg-white"
      aria-hidden="true"
    >
      <img src="/icon.png" alt="" width={1375} height={1374} className="w-44 max-w-[58vw]" />
    </div>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Intro />
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-xl items-center gap-3 bg-white px-5 py-4">
          <img src="/icon.png" alt="" width={1375} height={1374} className="size-16 shrink-0 bg-white" />
          <div>
            <p className="font-sans text-xl leading-none font-bold text-ink">아이디어바로</p>
            <p className="mt-1 text-sm text-muted">유사 특허 · 권리 접수 · 지원 상담</p>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-xl px-5 pt-6 pb-40">{children}</main>
      <footer className="fixed inset-x-0 bottom-16 z-10 border-t border-line bg-white px-5 py-1.5">
        <div className="mx-auto max-w-xl text-[11px] leading-snug text-muted">
          <p>Copyright © 2026 AI우리편. All rights reserved.</p>
          <p>저작권자 편준범의 사전 서면 동의 없는 무단 복제, 배포 및 상업적 이용을 엄격히 금지합니다.</p>
          <p>
            상담 문의 :{" "}
            <a href="tel:01063512725" className="underline">
              010-6351-2725
            </a>
          </p>
        </div>
      </footer>
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper" aria-label="주요 메뉴">
        <ul className="mx-auto flex max-w-xl">
          {NAV.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname === item.to || pathname.startsWith(`${item.to}/`);
            const Icon = item.icon;
            return (
              <li key={item.to} className="flex-1">
                <Link
                  to={item.to}
                  className={`flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-medium ${active ? "text-seal" : "text-muted"}`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
